// Local API server to send Supabase verification email through Resend.
// Start: node backend/send-verification-api.js
// Endpoint: POST http://127.0.0.1:3001/api/send-verification-email

try {
    require('dotenv').config();
} catch {
    // dotenv is optional.
}

const http = require('node:http');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REDIRECT_TO = process.env.EMAIL_REDIRECT_TO || 'http://127.0.0.1:5502/frontend/email-verification.html';
const PORT = Number(process.env.EMAIL_API_PORT || 3001);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error('Missing env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY');
    process.exit(1);
}

if (typeof fetch !== 'function') {
    console.error('This script requires Node.js 18+ (global fetch). Please upgrade Node.');
    process.exit(1);
}

function json(res, status, payload) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
}

function serviceHeaders(extra = {}) {
    return {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...extra
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function parseResponseSafely(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

async function generateVerificationLink(email, linkType) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: linkType,
            email,
            options: {
                redirectTo: REDIRECT_TO
            }
        })
    });

    const payload = await parseResponseSafely(response);
    if (!response.ok) {
        throw new Error(`Supabase generate_link error: ${JSON.stringify(payload)}`);
    }

    const actionLink = payload?.properties?.action_link;
    if (!actionLink) {
        throw new Error('Supabase did not return properties.action_link');
    }

    return actionLink;
}

async function sendMail(email, fullName, actionLink) {
    const safeName = escapeHtml(fullName || 'Customer');
    const safeLink = escapeHtml(actionLink);

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;">
            <h2>Welcome to Aura Bank</h2>
            <p>Hi ${safeName},</p>
            <p>Please verify your email address to activate your account.</p>
            <p><a href="${safeLink}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
            <p>If the button does not work, open this link:</p>
            <p>${safeLink}</p>
        </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'Aura Bank <onboarding@resend.dev>',
            to: [email],
            subject: 'Verify your Aura Bank email',
            html
        })
    });

    const payload = await parseResponseSafely(response);
    if (!response.ok) {
        throw new Error(`Resend send error: ${JSON.stringify(payload)}`);
    }

    return payload;
}

async function syncSignupData({ userId, email, fullName, phoneNumber, emailVerified }) {
    if (!userId || !email) {
        throw new Error('userId and email are required');
    }

    const profilePayload = {
        id: userId,
        email,
        full_name: fullName || email.split('@')[0],
        phone_number: phoneNumber || null,
        account_type: 'bank_holder',
        account_status: 'active',
        email_verified: !!emailVerified,
        updated_at: new Date().toISOString()
    };

    const profileResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: serviceHeaders({
            Prefer: 'resolution=merge-duplicates,return=representation'
        }),
        body: JSON.stringify(profilePayload)
    });

    const profileResult = await parseResponseSafely(profileResp);
    if (!profileResp.ok) {
        throw new Error(`Profile sync failed: ${JSON.stringify(profileResult)}`);
    }

    const accountCheckResp = await fetch(
        `${SUPABASE_URL}/rest/v1/accounts?user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`,
        {
            method: 'GET',
            headers: serviceHeaders()
        }
    );

    const accountCheck = await parseResponseSafely(accountCheckResp);
    if (!accountCheckResp.ok) {
        throw new Error(`Account check failed: ${JSON.stringify(accountCheck)}`);
    }

    if (Array.isArray(accountCheck) && accountCheck.length > 0) {
        return { profile: profileResult, accountCreated: false };
    }

    let attempts = 0;
    while (attempts < 5) {
        attempts += 1;
        const accountNumber = '9000' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');

        const accountResp = await fetch(`${SUPABASE_URL}/rest/v1/accounts`, {
            method: 'POST',
            headers: serviceHeaders({ Prefer: 'return=representation' }),
            body: JSON.stringify({
                user_id: userId,
                account_number: accountNumber,
                account_holder_name: fullName || email.split('@')[0],
                account_type: 'savings',
                balance: 0,
                currency: 'USD',
                status: 'active',
                is_primary: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        const accountResult = await parseResponseSafely(accountResp);
        if (accountResp.ok) {
            return { profile: profileResult, accountCreated: true, account: accountResult };
        }

        const duplicate = String(accountResult?.message || accountResult?.hint || '').toLowerCase().includes('duplicate');
        if (!duplicate) {
            throw new Error(`Account create failed: ${JSON.stringify(accountResult)}`);
        }
    }

    throw new Error('Account create failed after retries');
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        return json(res, 204, {});
    }

    if (req.method === 'POST' && req.url === '/api/send-verification-email') {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 1_000_000) {
                req.destroy();
            }
        });

        req.on('end', async () => {
            try {
                const body = JSON.parse(raw || '{}');
                const email = String(body.email || '').trim().toLowerCase();
                const fullName = String(body.fullName || 'Customer').trim();
                const linkType = String(body.linkType || 'signup').trim();

                if (!email) {
                    return json(res, 400, { success: false, message: 'email is required' });
                }

                const actionLink = await generateVerificationLink(email, linkType);
                const sent = await sendMail(email, fullName, actionLink);

                return json(res, 200, { success: true, message: 'Verification email sent', data: sent });
            } catch (error) {
                return json(res, 500, { success: false, message: error.message });
            }
        });

        return;
    }

    if (req.method === 'POST' && req.url === '/api/sync-signup-data') {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
            if (raw.length > 1_000_000) {
                req.destroy();
            }
        });

        req.on('end', async () => {
            try {
                const body = JSON.parse(raw || '{}');
                const result = await syncSignupData({
                    userId: String(body.userId || '').trim(),
                    email: String(body.email || '').trim().toLowerCase(),
                    fullName: String(body.fullName || '').trim(),
                    phoneNumber: String(body.phoneNumber || '').trim(),
                    emailVerified: !!body.emailVerified
                });
                return json(res, 200, { success: true, data: result });
            } catch (error) {
                return json(res, 500, { success: false, message: error.message });
            }
        });

        return;
    }

    return json(res, 404, { success: false, message: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Email API server running at http://127.0.0.1:${PORT}`);
});
