// Authentication Guard - Protects pages and routes
// Include this in pages that require authentication

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check if user is authenticated
 * If not, redirect to login page
 */
export async function requireAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            // User is not authenticated, redirect to login
            window.location.href = 'login.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return false;
    }
}

/**
 * Get current user info
 */
export async function getCurrentUserInfo() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || 'User',
            emailConfirmed: user.email_confirmed_at !== null,
            createdAt: user.created_at,
            lastSignInAt: user.last_sign_in_at
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

/**
 * Display user info in navbar or header
 */
export async function displayUserInfo(elementId = 'userDisplay') {
    const user = await getCurrentUserInfo();
    const element = document.getElementById(elementId);

    if (user && element) {
        element.innerHTML = `
            <span class="user-email">${user.email}</span>
            <span class="user-name">${user.fullName}</span>
        `;
    }
}
/**
 * Logout and redirect to login page
 */
export async function logoutUser() {
    try {
        // Clear all storage to prevent session conflicts
        sessionStorage.clear();
        localStorage.clear();

        // Sign out from Supabase
        await supabase.auth.signOut();

        // Redirect to login
        window.location.replace('login.html');
        return true;
    } catch (error) {
        console.error('Unexpected logout error:', error);
        return false;
    }
}

/**
 * Setup session timeout (auto logout after inactivity)
 * @param {number} timeoutMinutes - Timeout in minutes (default: 30)
 */
export function setupInactivityTimeout(timeoutMinutes = 30) {
    let timeoutId;

    function resetTimeout() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            console.warn('Session expired due to inactivity');
            logoutUser();
        }, timeoutMinutes * 60 * 1000);
    }

    // Reset timeout on user activity
    document.addEventListener('click', resetTimeout);
    document.addEventListener('keypress', resetTimeout);
    document.addEventListener('scroll', resetTimeout);

    // Initial setup
    resetTimeout();

    return () => {
        // Cleanup function
        document.removeEventListener('click', resetTimeout);
        document.removeEventListener('keypress', resetTimeout);
        document.removeEventListener('scroll', resetTimeout);
        clearTimeout(timeoutId);
    };
}

/**
 * Check if email is verified
 */
export async function isEmailVerified() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        return user.email_confirmed_at !== null;
    } catch (error) {
        console.error('Error checking email verification:', error);
        return false;
    }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'No user found'
            };
        }

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email,
        });

        if (error) {
            return {
                success: false,
                message: error.message
            };
        }

        return {
            success: true,
            message: 'Verification email resent. Please check your email.'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

export default supabase;
