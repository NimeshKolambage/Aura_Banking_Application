// Aura Bank Authentication System
// Combines both authentication logic and UI management
// This file handles all login/signup functionality

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

let supabase = null;

try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase client initialized successfully');
} catch (error) {
    console.error('✗ Failed to initialize Supabase:', error);
}

// ============================================
// SUPABASE AUTHENTICATION FUNCTIONS
// ============================================

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
        if (password.length < 6) {
            return {
                success: false,
                message: 'Password must be at least 6 characters long',
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
        if (!newPassword || newPassword.length < 6) {
            return {
                success: false,
                message: 'Password must be at least 6 characters long',
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

// ============================================
// UI/DOM HELPER FUNCTIONS
// ============================================

/**
 * Clear error messages from a form
 * @param {HTMLFormElement} form - The form element
 */
export function clearErrors(form) {
    const errorMessages = form.querySelectorAll('.error-message');
    const inputGroups = form.querySelectorAll('.input-group');

    errorMessages.forEach(msg => msg.textContent = '');
    inputGroups.forEach(group => group.classList.remove('error'));
}

/**
 * Show error message on specific input
 * @param {HTMLInputElement} input - The input element
 * @param {string} message - Error message to display
 */
export function showError(input, message) {
    const inputGroup = input.closest('.input-group');
    const errorMessage = inputGroup.nextElementSibling;

    if (inputGroup) inputGroup.classList.add('error');
    if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.textContent = message;
    }
}

/**
 * Initialize login page UI
 * This function sets up all event listeners for the login page
 */
export function initializeLoginUI() {
    console.log('📌 Initializing login UI...');

    // Form toggle functionality
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('main-container');

    console.log('Elements found:', { signUpButton, signInButton, container });

    if (signUpButton && signInButton && container) {
        console.log('✓ Adding form toggle listeners');
        signUpButton.addEventListener('click', () => {
            console.log('Sign up button clicked');
            container.classList.add("right-panel-active");
        });

        signInButton.addEventListener('click', () => {
            console.log('Sign in button clicked');
            container.classList.remove("right-panel-active");
        });
    } else {
        console.warn('⚠ Form toggle buttons not found');
    }

    // Navigate to index.html when back-nav is clicked
    const backNavBtn = document.getElementById('backNav');
    if (backNavBtn) {
        backNavBtn.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    const backNavBtn2 = document.getElementById('backNav2');
    if (backNavBtn2) {
        backNavBtn2.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    // Password visibility toggle
    const togglePasswordButtons = document.querySelectorAll('.toggle-eye');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function () {
            const inputGroup = this.closest('.input-group');
            const passwordInput = inputGroup.querySelector('input[type="password"], input[type="text"]');

            if (passwordInput) {
                const isPasswordVisible = passwordInput.type === 'text';
                passwordInput.type = isPasswordVisible ? 'password' : 'text';

                // Toggle eye icon
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            }
        });
    });

    // Setup form submissions
    setupSignUpForm();
    setupSignInForm();

    // Clear error on input focus
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            const inputGroup = this.closest('.input-group');
            if (inputGroup) {
                inputGroup.classList.remove('error');
            }
        });
    });

    // Check if user is already logged in
    checkAuthStatus();

    console.log('✓ Login UI initialization complete');
}

/**
 * Setup sign up form submission
 */
function setupSignUpForm() {
    const signupForm = document.getElementById('signupForm');
    const container = document.getElementById('main-container');

    if (signupForm) {
        console.log('✓ Sign up form found, adding listener');
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('📝 Sign up form submitted');

            clearErrors(signupForm);

            const fullName = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const submitBtn = signupForm.querySelector('.action-btn');
            const originalText = submitBtn.textContent;

            // Client-side validation
            if (!fullName) {
                showError(document.getElementById('signup-name'), 'Full name is required');
                return;
            }

            if (!email) {
                showError(document.getElementById('signup-email'), 'Email is required');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError(document.getElementById('signup-email'), 'Please enter a valid email address');
                return;
            }

            if (!password) {
                showError(document.getElementById('signup-password'), 'Password is required');
                return;
            }

            if (password.length < 6) {
                showError(document.getElementById('signup-password'), 'Password must be at least 6 characters');
                return;
            }

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating Account...";

            try {
                // Call authentication function
                const response = await handleSignUp(email, password, fullName);

                if (response.success) {
                    alert('Account created successfully! Please check your email to confirm your account.');

                    // Clear form
                    signupForm.reset();

                    // Switch to sign in form
                    container.classList.remove("right-panel-active");
                } else {
                    showError(document.getElementById('signup-email'), response.message);
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An unexpected error occurred: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

/**
 * Setup sign in form submission
 */
function setupSignInForm() {
    const signinForm = document.getElementById('signinForm');

    if (signinForm) {
        console.log('✓ Sign in form found, adding listener');
        signinForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('📝 Sign in form submitted');

            clearErrors(signinForm);

            const email = document.getElementById('signin-email').value.trim();
            const password = document.getElementById('signin-password').value;
            const submitBtn = signinForm.querySelector('.action-btn');
            const originalText = submitBtn.textContent;

            // Client-side validation
            if (!email) {
                showError(document.getElementById('signin-email'), 'Email is required');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError(document.getElementById('signin-email'), 'Please enter a valid email address');
                return;
            }

            if (!password) {
                showError(document.getElementById('signin-password'), 'Password is required');
                return;
            }

            if (password.length < 6) {
                showError(document.getElementById('signin-password'), 'Password must be at least 6 characters');
                return;
            }

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing in...";

            try {
                // Call authentication function
                const response = await handleLogin(email, password);

                if (response.success) {
                    console.log('Login successful:', response.user);

                    // Store user info in sessionStorage
                    sessionStorage.setItem('user_id', response.user.id);
                    sessionStorage.setItem('user_email', response.user.email);
                    sessionStorage.setItem('access_token', response.session.access_token);
                    sessionStorage.setItem('user_full_name', response.user.user_metadata?.full_name || '');

                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showError(document.getElementById('signin-email'), response.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An unexpected error occurred: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

/**
 * Check if user is already logged in
 */
async function checkAuthStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

export default supabase;
