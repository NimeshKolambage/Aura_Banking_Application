// Backend Authentication Handler
// This file handles authentication logic and database operations

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Login Handler
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - Login response with user data or error
 */
export async function handleLogin(email, password) {
    try {
        // Validate input
        if (!email || !password) {
            return {
                success: false,
                message: 'Email and password are required',
                code: 'VALIDATION_ERROR'
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Invalid email format',
                code: 'INVALID_EMAIL'
            };
        }

        // Validate password strength
        if (password.length < 6) {
            return {
                success: false,
                message: 'Password must be at least 6 characters long',
                code: 'WEAK_PASSWORD'
            };
        }

        // Attempt sign in
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: password,
        });

        if (error) {
            console.error('Supabase Login Error:', error);
            return {
                success: false,
                message: error.message,
                code: 'AUTH_ERROR'
            };
        }

        // Check if email is confirmed
        if (data.user && !data.user.email_confirmed_at) {
            return {
                success: false,
                message: 'Please confirm your email before logging in',
                code: 'EMAIL_NOT_CONFIRMED'
            };
        }

        return {
            success: true,
            message: 'Login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata,
            },
            session: data.session
        };

    } catch (error) {
        console.error('Unexpected Login Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during login',
            code: 'UNEXPECTED_ERROR',
            error: error.message
        };
    }
}

/**
 * Sign Up Handler
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name
 * @returns {Object} - Sign up response
 */
export async function handleSignUp(email, password, fullName) {
    try {
        // Validate input
        if (!email || !password || !fullName) {
            return {
                success: false,
                message: 'Email, password, and full name are required',
                code: 'VALIDATION_ERROR'
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Invalid email format',
                code: 'INVALID_EMAIL'
            };
        }

        // Validate password strength
        if (password.length < 8) {
            return {
                success: false,
                message: 'Password must be at least 8 characters long',
                code: 'WEAK_PASSWORD'
            };
        }

        // Sign up user
        const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    account_type: 'bank_holder',
                    created_at: new Date().toISOString(),
                }
            }
        });

        if (error) {
            console.error('Supabase Sign Up Error:', error);
            return {
                success: false,
                message: error.message,
                code: 'SIGNUP_ERROR'
            };
        }

        return {
            success: true,
            message: 'Sign up successful. Please check your email to confirm your account.',
            user: data.user
        };

    } catch (error) {
        console.error('Unexpected Sign Up Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during sign up',
            code: 'UNEXPECTED_ERROR',
            error: error.message
        };
    }
}

/**
 * Logout Handler
 * @returns {Object} - Logout response
 */
export async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Supabase Logout Error:', error);
            return {
                success: false,
                message: error.message,
                code: 'LOGOUT_ERROR'
            };
        }

        return {
            success: true,
            message: 'Logout successful'
        };

    } catch (error) {
        console.error('Unexpected Logout Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during logout',
            code: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Get Current User
 * @returns {Object} - Current user data
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Error fetching current user:', error);
            return {
                success: false,
                message: error.message,
                user: null
            };
        }

        return {
            success: true,
            user: user
        };

    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            success: false,
            message: error.message,
            user: null
        };
    }
}

/**
 * Reset Password Handler
 * @param {string} email - User email
 * @returns {Object} - Reset password response
 */
export async function handlePasswordReset(email) {
    try {
        if (!email) {
            return {
                success: false,
                message: 'Email is required',
                code: 'VALIDATION_ERROR'
            };
        }

        // Get the reset redirect URL (configure based on your app)
        const resetRedirect = `${window.location.origin}/frontend/resetpassword.html`;

        const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
            redirectTo: resetRedirect,
        });

        if (error) {
            console.error('Reset Password Error:', error);
            return {
                success: false,
                message: error.message,
                code: 'RESET_ERROR'
            };
        }

        return {
            success: true,
            message: 'Password reset email has been sent. Please check your email.'
        };

    } catch (error) {
        console.error('Unexpected Reset Password Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred',
            code: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Update Password Handler
 * @param {string} newPassword - New password
 * @returns {Object} - Update password response
 */
export async function handleUpdatePassword(newPassword) {
    try {
        if (!newPassword || newPassword.length < 8) {
            return {
                success: false,
                message: 'Password must be at least 8 characters long',
                code: 'WEAK_PASSWORD'
            };
        }

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Update Password Error:', error);
            return {
                success: false,
                message: error.message,
                code: 'UPDATE_ERROR'
            };
        }

        return {
            success: true,
            message: 'Password updated successfully'
        };

    } catch (error) {
        console.error('Unexpected Update Password Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred',
            code: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Get Session
 * @returns {Object} - Current session
 */
export async function getSessionData() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Error fetching session:', error);
            return {
                success: false,
                message: error.message,
                session: null
            };
        }

        return {
            success: true,
            session: session
        };

    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            success: false,
            message: error.message,
            session: null
        };
    }
}

/**
 * Setup Auth State Change Listener
 * @param {Function} callback - Callback function
 * @returns {Object} - Subscription object to unsubscribe
 */
export function setupAuthListener(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return subscription;
}

export default supabase;
