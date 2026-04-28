// Generate a Supabase verification link (admin API) and send it through Resend.
// Requires a secure server context. Do not expose keys in frontend code.
//
// Usage (PowerShell):
//   $env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
//   $env:RESEND_API_KEY="re_xxx"
//   node backend/send-supabase-verification-email.js user@example.com "User Name"

try {
    await import('dotenv/config');
} catch {
    // dotenv is optional; env vars may already be provided by host.
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REDIRECT_TO = process.env.EMAIL_REDIRECT_TO || "http://127.0.0.1:5502/frontend/email-verification.html";

const email = process.argv[2];
const fullName = process.argv[3] || "Customer";
const linkType = process.argv[4] || "signup";

if (typeof fetch !== "function") {
    console.error("This script requires Node.js 18+ (global fetch). Please upgrade Node.");
    process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error("Missing env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY");
    process.exit(1);
}

if (!email) {
    console.error("Usage: node backend/send-supabase-verification-email.js <email> [full-name] [link-type]");
    console.error("link-type: signup | magiclink | recovery | invite");
    process.exit(1);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function parseResponseSafely(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

async function generateVerificationLink() {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json"
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
        throw new Error("Supabase did not return properties.action_link");
    }

    return actionLink;
}

async function sendMail(actionLink) {
    const safeName = escapeHtml(fullName);
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

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "Aura Bank <onboarding@resend.dev>",
            to: [email],
            subject: "Verify your Aura Bank email",
            html
        })
    });

    const payload = await parseResponseSafely(response);

    if (!response.ok) {
        throw new Error(`Resend send error: ${JSON.stringify(payload)}`);
    }

    return payload;
}

async function main() {
    const actionLink = await generateVerificationLink();
    const sent = await sendMail(actionLink);
    console.log("Verification email sent:", sent);
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
