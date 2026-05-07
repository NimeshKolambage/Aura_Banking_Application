const { supabase, supabaseAdmin } = require('../lib/supabase');

/**
 * Helper to send email via Brevo (Sendinblue) API
 */
const sendBrevoEmail = async (to, subject, html) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn('⚠️ BREVO_API_KEY not found in environment. Skipping email.');
        return null;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'Aura Bank', email: 'nimeshkolambage@gmail.com' }, 
                to: [{ email: to }],
                subject: subject,
                htmlContent: html
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send email via Brevo');
        
        console.log(`📧 Email sent successfully via Brevo to ${to} (ID: ${data.messageId})`);
        return data;
    } catch (error) {
        console.error('❌ Brevo email error:', error.message);
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

        if (!supabaseAdmin || !process.env.BREVO_API_KEY) {
            throw new Error('Email configuration missing (SERVICE_ROLE_KEY or BREVO_API_KEY).');
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
                redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/frontend/dashboard.html`
            }
        });

        if (!linkError && linkData && linkData.properties && linkData.properties.action_link) {
            const actionLink = linkData.properties.action_link;
            
            // 3. Send via Brevo
            console.log('📧 Sending verification email via Brevo...');
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

            await sendBrevoEmail(email, 'Verify your Aura Bank account', emailHtml);
        } else {
            throw new Error(linkError?.message || 'Failed to generate verification link');
        }

        console.log('✅ Signup and Email request complete');

        return res.status(201).json({
            success: true,
            message: 'Success! Please check your email and click the link to go to your dashboard.',
            user: user
        });

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

/**
 * Step 1: Request Password Reset (Send OTP)
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        console.log(`🔍 Forgot password requested for: ${email}`);

        // 1. Check if user exists in the profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (profileError || !profile) {


            // For security, don't reveal if user exists, but here the user wants "check email in db"
            // So we can return 404 if not found or just send success anyway.
            // Let's stick to the requirement: "email eka databse eken arn"
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Store OTP in database
        const { error: otpError } = await supabaseAdmin
            .from('password_resets')
            .insert({
                email: email.toLowerCase(),
                otp_code: otpCode,
                expires_at: expiresAt.toISOString()
            });

        if (otpError) {
            console.error('❌ OTP storage error:', otpError.message);
            throw new Error('Failed to generate verification code');
        }

        // 4. Send Email via Brevo
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f766e; text-align: center;">Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Aura Bank account. Use the code below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f1f5f9; color: #0f766e; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                        ${otpCode}
                    </div>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2024 Aura Bank. All rights reserved.</p>
            </div>
        `;

        await sendBrevoEmail(email, 'Your Password Reset Code - Aura Bank', emailHtml);

        return res.status(200).json({
            success: true,
            message: 'Verification code sent to your email'
        });

    } catch (err) {
        console.error('🔥 Forgot password error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};

/**
 * Step 2: Verify OTP
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and code are required' });
        }

        // Check if OTP exists and is valid
        const { data: otpData, error: otpError } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('otp_code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (otpError || !otpData || otpData.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (err) {
        console.error('🔥 Verify OTP error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Step 3: Reset Password
 */
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1. Verify OTP one last time (or I could have passed a token from verifyOTP)
        const { data: otpData, error: otpError } = await supabaseAdmin
            .from('password_resets')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('otp_code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (otpError || !otpData || otpData.length === 0) {
            return res.status(400).json({ success: false, message: 'Verification failed. Please request a new code.' });
        }

        // 2. Get User ID from profiles
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (profileError || !profile) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 3. Update Password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            profile.id,
            { password: newPassword }
        );


        if (updateError) {
            console.error('❌ Password update error:', updateError.message);
            return res.status(400).json({ success: false, message: updateError.message });
        }

        // 4. Delete used OTPs for this email
        await supabaseAdmin
            .from('password_resets')
            .delete()
            .eq('email', email.toLowerCase());

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (err) {
        console.error('🔥 Reset password error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

