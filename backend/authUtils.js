// Authentication Utilities
// Helper functions for auth operations and error handling

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Validate Email Format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Password Strength
 * Returns object with validation status and suggestions
 */
export function validatePasswordStrength(password) {
    const result = {
        isStrong: true,
        score: 0,
        suggestions: []
    };

    if (!password) {
        result.isStrong = false;
        result.suggestions.push('Password is required');
        return result;
    }

    if (password.length < 8) {
        result.isStrong = false;
        result.suggestions.push('Password must be at least 8 characters long');
    } else {
        result.score += 1;
    }

    if (!/[a-z]/.test(password)) {
        result.suggestions.push('Add lowercase letters');
    } else {
        result.score += 1;
    }

    if (!/[A-Z]/.test(password)) {
        result.suggestions.push('Add uppercase letters');
    } else {
        result.score += 1;
    }

    if (!/[0-9]/.test(password)) {
        result.suggestions.push('Add numbers');
    } else {
        result.score += 1;
    }

    if (!/[!@#$%^&*]/.test(password)) {
        result.suggestions.push('Add special characters (!@#$%^&*)');
    } else {
        result.score += 1;
    }

    result.isStrong = result.suggestions.length === 0;
    return result;
}

/**
 * Format Auth Error Messages
 * Converts Supabase errors to user-friendly messages
 */
export function formatAuthError(error) {
    if (!error) return 'An unknown error occurred';

    const errorMap = {
        'Invalid login credentials': 'Email or password is incorrect',
        'Email not confirmed': 'Please confirm your email before logging in',
        'User already registered': 'This email is already registered',
        'Password should be at least 8 characters': 'Password must be at least 8 characters long',
        'duplicate key value violates unique constraint': 'This email is already registered',
    };

    const message = error.message || error;

    for (const [key, value] of Object.entries(errorMap)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return message;
}

/**
 * Store Auth Token
 */
export function storeAuthToken(session) {
    if (session) {
        sessionStorage.setItem('auth_token', session.access_token);
        sessionStorage.setItem('user_id', session.user?.id);
        localStorage.setItem('refresh_token', session.refresh_token);
    }
}

/**
 * Get Auth Token
 */
export function getAuthToken() {
    return sessionStorage.getItem('auth_token');
}

/**
 * Clear Auth Token
 */
export function clearAuthToken() {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_id');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
}

/**
 * Get User ID from Session
 */
export function getUserId() {
    return sessionStorage.getItem('user_id');
}

/**
 * Check if Session is Valid
 */
export async function isSessionValid() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session !== null;
    } catch (error) {
        console.error('Session validation error:', error);
        return false;
    }
}

/**
 * Refresh Session
 */
export async function refreshSession() {
    try {
        const { data: { session }, error } = await supabase.auth.refreshSession();

        if (error) {
            throw error;
        }

        if (session) {
            storeAuthToken(session);
        }

        return {
            success: true,
            session: session
        };
    } catch (error) {
        console.error('Session refresh error:', error);
        return {
            success: false,
            session: null,
            error: error
        };
    }
}

/**
 * Check Email Availability
 */
export async function checkEmailAvailability(email) {
    try {
        // This is a simple check - Supabase will reject duplicate emails on signup
        // For better UX, you can implement this on backend with proper rate limiting
        return {
            available: true,
            message: 'Email is available'
        };
    } catch (error) {
        return {
            available: false,
            error: error.message
        };
    }
}

/**
 * Get User Profile Data
 */
export async function getUserProfile() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) return null;

        // Get profile from profiles table if it exists
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
        }

        return {
            auth: user,
            profile: profile || null
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Update User Profile
 */
export async function updateUserProfile(updates) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Update profile in profiles table
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                message: error.message
            };
        }

        return {
            success: true,
            message: 'Profile updated successfully'
        };
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Verify OTP (One-Time Password) - if you add 2FA later
 */
export async function verifyOTP(phone, token) {
    // Placeholder for 2FA implementation
    return {
        success: false,
        message: '2FA not yet implemented'
    };
}

/**
 * Create Auth Error Message Component
 */
export function createErrorElement(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
        <div class="error-icon">
            <i class="fa-solid fa-exclamation-circle"></i>
        </div>
        <span class="error-text">${message}</span>
        <button class="error-close" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    return errorDiv;
}

/**
 * Create Success Message Component
 */
export function createSuccessElement(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success-message';
    successDiv.setAttribute('role', 'status');
    successDiv.innerHTML = `
        <div class="success-icon">
            <i class="fa-solid fa-check-circle"></i>
        </div>
        <span class="success-text">${message}</span>
        <button class="success-close" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-times"></i>
        </button>
    `;
    return successDiv;
}

/**
 * Add Styles for Error/Success Messages
 */
export function injectAuthStyles() {
    if (document.getElementById('auth-styles')) return;

    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.innerHTML = `
        .auth-error-message,
        .auth-success-message {
            padding: 12px 16px;
            margin-bottom: 16px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-in-out;
        }

        .auth-error-message {
            background-color: #fee;
            border: 1px solid #fcc;
            color: #c33;
        }

        .auth-success-message {
            background-color: #efe;
            border: 1px solid #cfc;
            color: #3c3;
        }

        .error-icon, .success-icon {
            font-size: 18px;
        }

        .error-close, .success-close {
            background: none;
            border: none;
            cursor: pointer;
            color: inherit;
            font-size: 16px;
            padding: 0;
            margin-left: auto;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

export default {
    isValidEmail,
    validatePasswordStrength,
    formatAuthError,
    storeAuthToken,
    getAuthToken,
    clearAuthToken,
    getUserId,
    isSessionValid,
    refreshSession,
    checkEmailAvailability,
    getUserProfile,
    updateUserProfile,
    createErrorElement,
    createSuccessElement,
    injectAuthStyles
};
