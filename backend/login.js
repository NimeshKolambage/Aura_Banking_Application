// Aura Bank Login - Fixed Version
const SUPABASE_URL = 'https://zndmjjeirwbmsptgrwhb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_edTDcROSO8DdrMfO6WsGAg_Uo9-J1OY';

let supabase = null;

console.log('========== LOGIN.JS LOADED ==========');

async function initSupabaseAsync() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;

        const checkAndInit = () => {
            attempts++;
            let supClient = null;

            try {
                if (typeof window !== 'undefined' && window.supabase) {
                    supClient = window.supabase;
                } else if (typeof window !== 'undefined' && window['supabase']) {
                    supClient = window['supabase'];
                }
            } catch (e) {
                console.log('Error checking for supabase:', e.message);
            }

            if (supClient && typeof supClient.createClient === 'function') {
                try {
                    supabase = supClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                    console.log('✓ Supabase initialized successfully');
                    resolve(true);
                } catch (error) {
                    console.error('✗ Failed to create Supabase client:', error.message);
                    resolve(false);
                }
            } else if (attempts < maxAttempts) {
                setTimeout(checkAndInit, 100);
            } else {
                console.error('✗ Supabase library failed to load after 5 seconds');
                resolve(false);
            }
        };

        checkAndInit();
    });
}

initSupabaseAsync().then(success => {
    if (!success) console.warn('⚠ Supabase initialization failed');
});

// ============================================
// FORM TOGGLE
// ============================================
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('main-container');

if (signUpButton) signUpButton.onclick = () => container?.classList.add('right-panel-active');
if (signInButton) signInButton.onclick = () => container?.classList.remove('right-panel-active');

// ============================================
// NAVIGATION BUTTONS
// ============================================
const backNavBtn = document.getElementById('backNav');
const backNavBtn2 = document.getElementById('backNav2');
if (backNavBtn) backNavBtn.onclick = () => window.location.href = 'index.html';
if (backNavBtn2) backNavBtn2.onclick = () => window.location.href = 'index.html';

// ============================================
// PASSWORD TOGGLE
// ============================================
document.querySelectorAll('.toggle-eye').forEach(button => {
    button.onclick = function () {
        const inputGroup = this.closest('.input-group');
        const passwordInput = inputGroup?.querySelector('input[type="password"], input[type="text"]');
        if (passwordInput) {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
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
    const inputGroup = input?.closest('.input-group');
    const errorMessage = inputGroup?.nextElementSibling;
    if (inputGroup) inputGroup.classList.add('error');
    if (errorMessage?.classList.contains('error-message')) {
        errorMessage.textContent = message;
    }
}

async function ensureSupabaseReady(timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (supabase) return true;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
}

// ============================================
// SIGN UP FORM — FIXED
// ============================================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.onsubmit = async function (e) {
        e.preventDefault();
        clearErrors(signupForm);

        const fullName    = document.getElementById('signup-name')?.value.trim();
        const email       = document.getElementById('signup-email')?.value.trim();
        const phone       = document.getElementById('signup-phone')?.value.trim();
        const password    = document.getElementById('signup-password')?.value;
        const confirmPass = document.getElementById('signup-confirm-password')?.value;
        const submitBtn   = signupForm.querySelector('.action-btn');
        const originalText = submitBtn.textContent;

        // --- Validation ---
        if (!fullName || fullName.length < 2) {
            showError(document.getElementById('signup-name'), 'Full name must be at least 2 characters');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showError(document.getElementById('signup-email'), 'Please enter a valid email address');
            return;
        }
        if (!phone || phone.replace(/\D/g, '').length < 9) {
            showError(document.getElementById('signup-phone'), 'Please enter a valid phone number');
            return;
        }
        if (!password || password.length < 8) {
            showError(document.getElementById('signup-password'), 'Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPass) {
            showError(document.getElementById('signup-confirm-password'), 'Passwords do not match');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        try {
            const isReady = await ensureSupabaseReady(5000);
            if (!isReady || !supabase) {
                alert('System is still loading. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            // FIX 1: Add emailRedirectTo so confirmation email has correct link
            const { data, error } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password: password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login.html`,
                    data: {
                        full_name: fullName,
                        phone_number: phone,
                        account_type: 'bank_holder'
                    }
                }
            });

            if (error) {
                console.error('Signup error:', error.message);
                // FIX 2: User already exists — don't expose it, give friendly message
                if (error.message.toLowerCase().includes('already registered') ||
                    error.message.toLowerCase().includes('already exists')) {
                    showError(document.getElementById('signup-email'), 'This email is already registered. Please sign in.');
                } else {
                    showError(document.getElementById('signup-email'), error.message);
                }
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            if (data?.user) {
                console.log('✓ Signup successful, user id:', data.user.id);
                // FIX 3: No client-side DB inserts here.
                // The database trigger (handle_new_auth_user) automatically creates
                // the profile + bank account when auth.users gets a new row.
                // Trying to insert from client side fails because there's no session
                // yet (email not confirmed = no RLS permission).

                signupForm.reset();
                clearErrors(signupForm);
                container?.classList.remove('right-panel-active');

                // Show proper success message
                alert(
                    '✓ Account created!\n\n' +
                    'A confirmation email has been sent to: ' + email + '\n\n' +
                    'Please check your inbox (and spam folder) and click the link to activate your account before signing in.'
                );
            } else {
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
}

// ============================================
// SIGN IN FORM
// ============================================
function formatAuthError(errorMessage) {
    if (!errorMessage) return 'An unknown error occurred';
    const errorMap = {
        'Invalid login credentials': 'Email or password is incorrect',
        'Email not confirmed': 'Please confirm your email before logging in. Check your inbox.',
        'User not found': 'Email or password is incorrect',
        'Invalid password': 'Email or password is incorrect',
    };
    for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage.includes(key)) return value;
    }
    return errorMessage;
}

async function handleSignIn(email, password) {
    try {
        if (!email || !password) return { success: false, message: 'Email and password are required' };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return { success: false, message: 'Invalid email format' };

        if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters' };

        const isReady = await ensureSupabaseReady(5000);
        if (!isReady || !supabase) return { success: false, message: 'Authentication system loading. Please try again.' };

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password: password,
        });

        if (error) {
            return { success: false, message: formatAuthError(error.message) };
        }

        if (data.user && !data.user.email_confirmed_at) {
            return { success: false, message: 'Please confirm your email before logging in. Check your inbox.' };
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

        return { success: false, message: 'Login failed. Please try again.' };

    } catch (error) {
        console.error('Unexpected Login Error:', error);
        return { success: false, message: 'An unexpected error occurred: ' + error.message };
    }
}

const signinForm = document.getElementById('signinForm');
if (signinForm) {
    signinForm.onsubmit = async function (e) {
        e.preventDefault();
        clearErrors(signinForm);

        const email    = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const submitBtn = signinForm.querySelector('.action-btn');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        const result = await handleSignIn(email, password);

        if (result.success) {
            console.log('✓ Login successful:', result.user.email);
            sessionStorage.setItem('user_id', result.user.id);
            sessionStorage.setItem('user_email', result.user.email);
            sessionStorage.setItem('user_full_name', result.user.fullName);
            sessionStorage.setItem('access_token', result.session.access_token);
            sessionStorage.setItem('refresh_token', result.session.refresh_token);

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 300);
        } else {
            showError(document.getElementById('signin-email'), result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    };
}

// Clear errors on focus
document.querySelectorAll('input').forEach(input => {
    input.onfocus = function () {
        this.closest('.input-group')?.classList.remove('error');
    };
});

console.log('✓ Login page ready');