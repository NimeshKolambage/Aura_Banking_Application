// Authentication Configuration
// Central configuration for Supabase credentials and settings

export const SUPABASE_CONFIG = {
    // Supabase Connection Details
    url: 'https://zndmjjeirwbmsptgrwhb.supabase.co',
    anonKey: 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY',

    // API Settings
    apiVersion: 'v1',

    // Authentication Settings
    auth: {
        enableEmailAuth: true,
        enableMagicLink: false,
        enableSocialProviders: false,
        passwordMinLength: 8,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
        autoRefreshToken: true,
        persistSession: true,
    },

    // Database Tables (to be created in Supabase)
    tables: {
        users: 'users',
        profiles: 'profiles',
        accounts: 'accounts',
        transactions: 'transactions',
    },

    // Redirect URLs
    redirects: {
        login: 'login.html',
        dashboard: 'dashboard.html',
        signup: 'signup.html',
        resetPassword: 'resetpassword.html',
        emailVerification: 'email-verification.html',
    },

    // Feature Flags
    features: {
        enableTwoFactor: false,
        enableBiometric: false,
        enableTransactionLimits: true,
        requireEmailVerification: true,
    },

    // Security Settings
    security: {
        enableCSRF: true,
        enableRateLimit: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        requireStrongPassword: true,
    }
};

// Export individual configs for easy access
export const AUTH_CONFIG = SUPABASE_CONFIG.auth;
export const REDIRECTS = SUPABASE_CONFIG.redirects;
export const FEATURES = SUPABASE_CONFIG.features;
export const SECURITY = SUPABASE_CONFIG.security;

export default SUPABASE_CONFIG;
