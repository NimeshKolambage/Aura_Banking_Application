// Aura Bank Login - Direct Implementation
// Supabase initialization
const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

let supabase = null;

console.log('========== LOGIN.JS LOADED ==========');
console.log('Waiting for Supabase library to load...');
console.log('Current window.supabase:', typeof window.supabase);
try {
    console.log('Current global supabase:', typeof supabase);
} catch (e) {
    console.log('Global supabase not yet defined');
}

/**
 * Initialize Supabase with proper async handling
 * Waits up to 5 seconds for the library to be available
 */
async function initSupabaseAsync() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 50 * 100ms = 5000ms = 5 seconds

        const checkAndInit = () => {
            attempts++;

            // Check multiple possible locations for Supabase library
            let supClient = null;

            try {
                // Try window.supabase (standard location)
                if (typeof window !== 'undefined' && window.supabase) {
                    supClient = window.supabase;
                    console.log('Found supabase at window.supabase');
                }
                // Try global supabase variable (safely)
                else if (typeof window !== 'undefined' && window['supabase']) {
                    supClient = window['supabase'];
                    console.log('Found supabase at window[supabase]');
                }
            } catch (e) {
                console.log('Error checking for supabase:', e.message);
            }

            console.log(`Attempt ${attempts}/50: Supabase available: ${!!supClient}`);

            if (supClient && typeof supClient.createClient === 'function') {
                try {
                    console.log('Creating Supabase client with URL:', SUPABASE_URL);
                    supabase = supClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✓ Supabase initialized successfully');
                    console.log('Supabase auth object:', !!supabase.auth);
                    resolve(true);
                } catch (error) {
                    console.error('✗ Failed to create Supabase client:', error.message);
                    console.error('Error:', error);
                    resolve(false);
                }
            } else if (attempts < maxAttempts) {
                // Library not ready yet, try again
                if (attempts % 5 === 0) {
                    console.log(`Still waiting... (${attempts}/50)`);
                }
                setTimeout(checkAndInit, 100);
            } else {
                // Timeout - Supabase not available
                console.error('✗ Supabase library failed to load after 5 seconds');
                console.error('supClient:', supClient);
                resolve(false);
            }
        };

        checkAndInit();
    });
}

// Initialize Supabase immediately
initSupabaseAsync().then(success => {
    if (success) {
        console.log('✓ Supabase ready for use');
    } else {
        console.warn('⚠ Supabase initialization failed - some features may not work');
        console.warn('Debugging: Window keys containing "supabase":',
            Object.keys(window).filter(k => k.toLowerCase().includes('supabase')).slice(0, 10));
        console.warn('Window object sample keys:', Object.keys(window).slice(0, 20));
    }
});

// ============================================
// FORM TOGGLE - THIS MUST WORK
// ============================================
console.log('Login.js loaded, setting up toggles...');

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('main-container');

console.log('Found elements:', { signUpButton: !!signUpButton, signInButton: !!signInButton, container: !!container });

if (signUpButton) {
    signUpButton.onclick = function () {
        console.log('Sign Up clicked');
        if (container) container.classList.add("right-panel-active");
    };
    console.log('✓ Sign up button listener added');
}

if (signInButton) {
    signInButton.onclick = function () {
        console.log('Sign In clicked');
        if (container) container.classList.remove("right-panel-active");
    };
    console.log('✓ Sign in button listener added');
}

// ============================================
// NAVIGATION BUTTONS
// ============================================
const backNavBtn = document.getElementById('backNav');
const backNavBtn2 = document.getElementById('backNav2');

if (backNavBtn) {
    backNavBtn.onclick = function () {
        window.location.href = 'index.html';
    };
}

if (backNavBtn2) {
    backNavBtn2.onclick = function () {
        window.location.href = 'index.html';
    };
}

// ============================================
// PASSWORD TOGGLE
// ============================================
document.querySelectorAll('.toggle-eye').forEach(button => {
    button.onclick = function () {
        const inputGroup = this.closest('.input-group');
        const passwordInput = inputGroup ? inputGroup.querySelector('input[type="password"], input[type="text"]') : null;

        if (passwordInput) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        }
    };
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function clearErrors(form) {
    form.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
    form.querySelectorAll('.input-group').forEach(group => group.classList.remove('error'));
}

function showError(input, message) {
    const inputGroup = input.closest('.input-group');
    const errorMessage = inputGroup ? inputGroup.nextElementSibling : null;

    if (inputGroup) inputGroup.classList.add('error');
    if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.textContent = message;
    }
}

/**
 * Wait for Supabase to be ready
 * Returns true if ready, false if timeout
 */
async function ensureSupabaseReady(timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (supabase) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
}

// ============================================
// SIGN UP FORM
// ============================================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.onsubmit = async function (e) {
        e.preventDefault();
        console.log('Sign up form submitted');

        clearErrors(signupForm);

        const fullName = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const submitBtn = signupForm.querySelector('.action-btn');
        const originalText = submitBtn.textContent;

        // Validate
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
            showError(document.getElementById('signup-email'), 'Invalid email format');
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

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";

        try {
            // Ensure Supabase is initialized and ready
            const isReady = await ensureSupabaseReady(5000);
            if (!isReady || !supabase) {
                alert('System is still loading. Please wait a moment and try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            console.log('Attempting signup with:', { fullName, email });
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: fullName }
                }
            });

            console.log('Signup response:', { data, error });

            if (error) {
                console.error('Signup error:', error.message);
                showError(document.getElementById('signup-email'), error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            if (data && data.user) {
                console.log('✓ Signup successful');
                alert('✓ Account created successfully!\n\nPlease check your email to confirm your account before logging in.');
                signupForm.reset();
                clearErrors(signupForm);

                // Switch to sign in form
                if (container) container.classList.remove("right-panel-active");
            } else {
                console.error('Signup failed: No user data returned');
                alert('Signup failed. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Unexpected signup error:', error);
            alert('An error occurred during signup: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    };
    console.log('✓ Sign up form listener added');
}

// ============================================
// SIGN IN FORM - WITH SUPABASE AUTHENTICATION
// ============================================

/**
 * Enhanced Sign In Handler with Backend Logic
 * Validates input, authenticates with Supabase, stores session
 */
async function handleSignIn(email, password) {
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

        // Ensure Supabase is initialized and ready
        const isReady = await ensureSupabaseReady(5000);
        if (!isReady || !supabase) {
            return {
                success: false,
                message: 'Authentication system is loading. Please try again.',
                code: 'SUPABASE_NOT_READY'
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
                message: formatAuthError(error.message),
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

        if (data.user && data.session) {
            return {
                success: true,
                message: 'Login successful',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    fullName: data.user.user_metadata?.full_name || 'User',
                },
                session: data.session
            };
        }

        return {
            success: false,
            message: 'Login failed. Please try again.',
            code: 'LOGIN_FAILED'
        };

    } catch (error) {
        console.error('Unexpected Login Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred: ' + error.message,
            code: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Format Auth Error Messages - Convert Supabase errors to user-friendly messages
 */
function formatAuthError(errorMessage) {
    if (!errorMessage) return 'An unknown error occurred';

    const errorMap = {
        'Invalid login credentials': 'Email or password is incorrect',
        'Email not confirmed': 'Please confirm your email before logging in',
        'User not found': 'Email or password is incorrect',
        'Invalid password': 'Email or password is incorrect',
    };

    for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.includes(key)) {
            return value;
        }
    }

    return errorMessage;
}

const signinForm = document.getElementById('signinForm');
if (signinForm) {
    signinForm.onsubmit = async function (e) {
        e.preventDefault();
        console.log('Sign in form submitted');

        clearErrors(signinForm);

        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const submitBtn = signinForm.querySelector('.action-btn');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = "Signing in...";

        // Call the enhanced sign in handler
        const result = await handleSignIn(email, password);

        if (result.success) {
            console.log('✓ Login successful:', result.user.email);

            // Store user info in sessionStorage for access across pages
            sessionStorage.setItem('user_id', result.user.id);
            sessionStorage.setItem('user_email', result.user.email);
            sessionStorage.setItem('user_full_name', result.user.fullName);
            sessionStorage.setItem('access_token', result.session.access_token);
            sessionStorage.setItem('refresh_token', result.session.refresh_token);

            console.log('User data stored in sessionStorage');

            // Show success message and redirect
            alert('Login successful! Redirecting to dashboard...');

            setTimeout(() => {
                console.log('Redirecting to dashboard.html');
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            console.error('Login failed:', result.code);

            // Show error message in the appropriate field
            const errorField = result.code === 'VALIDATION_ERROR' ?
                document.getElementById('signin-email') :
                document.getElementById('signin-email');

            showError(errorField, result.message);

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    };
    console.log('✓ Sign in form listener added');
}

// ============================================
// CLEAR ERRORS ON FOCUS
// ============================================
document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]').forEach(input => {
    input.onfocus = function () {
        const inputGroup = this.closest('.input-group');
        if (inputGroup) inputGroup.classList.remove('error');
    };
});

console.log('✓✓✓ ALL EVENT LISTENERS SET UP COMPLETE ✓✓✓');
console.log('========== LOGIN PAGE READY ==========');

