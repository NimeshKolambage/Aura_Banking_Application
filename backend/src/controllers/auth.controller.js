const { supabase, supabaseAdmin } = require('../lib/supabase');

/**
 * Helper to send email via Resend API
 */
const sendResendEmail = async (to, subject, html) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not found in environment. Skipping email.');
        return null;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Aura Bank <onboarding@resend.dev>', // Update with your verified domain
                to: [to],
                subject: subject,
                html: html
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send email via Resend');
        
        console.log(`📧 Email sent successfully to ${to} (ID: ${data.id})`);
        return data;
    } catch (error) {
        console.error('❌ Resend email error:', error.message);
        throw error;
    }
};
exports.signup = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, and password are required'
            });
        }

        console.log(`📝 Attempting signup for: ${email}`);

        if (!supabaseAdmin || !process.env.RESEND_API_KEY) {
            throw new Error('Email configuration missing (SERVICE_ROLE_KEY or RESEND_API_KEY).');
        }

        // 1. Create the user (not confirmed yet)
        console.log('🔄 Creating user via Supabase Admin...');
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: false, 
            user_metadata: {
                full_name: fullName,
                phone_number: phoneNumber
            }
        });

        if (adminError) {
            console.error('❌ Admin creation error:', adminError.message);
            return res.status(400).json({
                success: false,
                message: adminError.message
            });
        }

        const user = adminData.user;

        // 2. Generate the verification link (Redirects STRAIGHT to dashboard)
        console.log('🔗 Generating verification link for Dashboard redirect...');
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: email,
            options: {
                // This will take the user straight to the dashboard after they click the email link
                redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/frontend/dashboard.html`
            }
        });

        if (!linkError && linkData && linkData.properties && linkData.properties.action_link) {
            const actionLink = linkData.properties.action_link;
            
            // 3. Send via Resend
            console.log('📧 Sending verification email via Resend...');
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f766e; text-align: center;">Welcome to Aura Bank</h2>
                    <p>Hi ${fullName},</p>
                    <p>Almost there! Please verify your email to access your dashboard:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${actionLink}" style="background-color: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify & Go to Dashboard</a>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This link will log you in automatically.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2024 Aura Bank. All rights reserved.</p>
                </div>
            `;

            await sendResendEmail(email, 'Verify your Aura Bank account', emailHtml);
        } else {
            throw new Error(linkError?.message || 'Failed to generate verification link');
        }

        console.log('✅ Signup and Email request complete');

        return res.status(201).json({
            success: true,
            message: 'Success! Please check your email and click the link to go to your dashboard.',
            user: user
        });

    } catch (err) {
        console.error('🔥 Unexpected signup error:', err);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred'
        });
    }
};

/**
 * Handle user login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        console.log(`🔐 Attempting login for: ${email}`);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('❌ Login error:', error.message);
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        console.log('✅ Login successful');

        // Send tokens and user info
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            session: data.session,
            user: data.user
        });

    } catch (err) {
        console.error('🔥 Unexpected login error:', err);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred'
        });
    }
};

/**
 * Handle logout
 */
exports.logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred'
        });
    }
};
