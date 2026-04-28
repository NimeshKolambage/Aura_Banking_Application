// Signup Backend Module - signup.js (FIXED)
// DB trigger (handle_new_auth_user) creates profile + account automatically.
// Client-side inserts removed — they fail due to RLS when email not yet confirmed.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Validate signup form data
 */
function validateSignupData(fullName, email, phoneNumber, password, confirmPassword) {
    if (!fullName || fullName.trim().length < 2) {
        return { valid: false, message: 'Full name must be at least 2 characters', field: 'fullName' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { valid: false, message: 'Please enter a valid email address', field: 'email' };
    }

    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 9) {
        return { valid: false, message: 'Please enter a valid phone number', field: 'phone' };
    }

    if (!password || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long', field: 'password' };
    }

    if (password !== confirmPassword) {
        return { valid: false, message: 'Passwords do not match', field: 'confirmPassword' };
    }

    return { valid: true };
}

/**
 * Complete signup process
 *
 * FIXED: Removed createUserProfile() and createBankAccount() calls.
 * The database trigger `handle_new_auth_user` (in database-schema.sql)
 * automatically creates profiles + accounts for every new auth.users row.
 *
 * WHY the old code broke:
 *   - supabase.auth.signUp() with email confirmation enabled returns a user
 *     but NO session (user must click confirmation link first).
 *   - With no session, RLS policies block any INSERT into profiles/accounts.
 *   - Result: inserts silently fail or throw a 403 error.
 *
 * The trigger runs server-side with SECURITY DEFINER so it bypasses RLS.
 */
export async function completeSignup(fullName, email, phoneNumber, password, confirmPassword) {
    try {
        // Step 1: Validate input
        const validation = validateSignupData(fullName, email, phoneNumber, password, confirmPassword);
        if (!validation.valid) {
            return {
                success: false,
                message: validation.message,
                field: validation.field,
                step: 'validation'
            };
        }

        // Step 2: Create Supabase auth user
        // FIX: Added emailRedirectTo so confirmation link redirects correctly.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/login.html`,
                data: {
                    full_name: fullName,
                    phone_number: phoneNumber,
                    account_type: 'bank_holder'
                }
            }
        });

        if (authError) {
            console.error('Auth error:', authError);
            return {
                success: false,
                message: authError.message,
                field: 'email',
                step: 'auth_creation'
            };
        }

        // FIX: After signUp with email confirmation, session is null and data.user
        // might be a "fake" user object (Supabase returns one even for duplicates
        // when email enumeration protection is on). Check identities to detect duplicates.
        const user = authData.user;

        if (user && user.identities && user.identities.length === 0) {
            // Email already registered (Supabase hides this for security,
            // but identities array is empty for existing users)
            return {
                success: false,
                message: 'This email is already registered. Please try logging in.',
                field: 'email',
                step: 'email_check'
            };
        }

        // Step 3: Done — DB trigger handles profile + account creation.
        // No client-side DB inserts needed or allowed here.
        console.log('✓ Auth user created, DB trigger will handle profile + account:', user?.id);

        return {
            success: true,
            message: 'Account created! Please check your email to verify your account before logging in.',
            user: user,
            step: 'complete'
        };

    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            message: error.message || 'An unexpected error occurred during signup',
            step: 'error'
        };
    }
}

/**
 * Verify email with OTP token (called from email-verification.html)
 */
export async function verifyEmailToken(token) {
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
        });

        if (error) {
            return { success: false, message: error.message };
        }

        return {
            success: true,
            message: 'Email verified successfully',
            user: data.user
        };
    } catch (error) {
        console.error('Email verification error:', error);
        return { success: false, message: error.message || 'Email verification failed' };
    }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email) {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email.toLowerCase(),
            options: {
                emailRedirectTo: `${window.location.origin}/login.html`
            }
        });

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
        console.error('Resend email error:', error);
        return { success: false, message: error.message || 'Failed to resend verification email' };
    }
}

/**
 * Get user profile (only callable after email confirmed + logged in)
 */
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return { success: false, message: error.message, profile: null };
        }

        return { success: true, profile: data };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { success: false, message: error.message, profile: null };
    }
}

/**
 * Update user profile (only callable after email confirmed + logged in)
 */
export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select();

        if (error) {
            return { success: false, message: error.message, profile: null };
        }

        return { success: true, profile: data[0] };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: error.message, profile: null };
    }
}

/**
 * Get user bank accounts (only callable after email confirmed + logged in)
 */
export async function getUserAccounts(userId) {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            return { success: false, message: error.message, accounts: [] };
        }

        return { success: true, accounts: data || [] };
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return { success: false, message: error.message, accounts: [] };
    }
}

export default {
    completeSignup,
    verifyEmailToken,
    resendVerificationEmail,
    getUserProfile,
    updateUserProfile,
    getUserAccounts
};