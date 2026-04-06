// Supabase Authentication Module
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Initialize Supabase Client
const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login with Email and Password
export async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }

        return {
            success: true,
            message: 'Login successful',
            user: data.user,
            session: data.session
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Sign Up with Email and Password
export async function signUpUser(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    account_type: 'bank_holder'
                }
            }
        });

        if (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }

        return {
            success: true,
            message: 'Sign up successful. Please check your email to confirm your account.',
            user: data.user,
            session: data.session
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Sign Out
export async function signOutUser() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }

        return {
            success: true,
            message: 'Sign out successful'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
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
        return {
            success: false,
            message: error.message,
            user: null
        };
    }
}

// Reset Password
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/frontend/resetpassword.html`,
        });

        if (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }

        return {
            success: true,
            message: 'Password reset email sent. Please check your email.'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Update Password
export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }

        return {
            success: true,
            message: 'Password updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Get Session
export async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
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
        return {
            success: false,
            message: error.message,
            session: null
        };
    }
}

// Listen to Auth Changes
export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return subscription;
}

export default supabase;
