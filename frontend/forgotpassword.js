// Forgot Password Form Logic
const API_BASE_URL = 'http://localhost:3001/api/auth';

document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const codeForm = document.getElementById('codeForm');
    const resetForm = document.getElementById('resetForm');
    const successMessage = document.getElementById('successMessage');
    
    const emailInput = document.getElementById('emailInput');
    const codeInputs = document.querySelectorAll('.code-input');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const resendBtn = document.getElementById('resendBtn');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    let currentStep = 1;
    let userEmail = '';
    let verificationCode = '';
    let resendTimer = null;
    let timerCount = 60;

    // Real-time error clearing on input
    emailInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            document.getElementById('emailError').textContent = '';
        }
    });

    codeInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (Array.from(codeInputs).some(inp => inp.value !== '')) {
                document.getElementById('codeError').textContent = '';
            }
        });
    });

    newPasswordInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            document.getElementById('passwordError').textContent = '';
        }
        validatePasswordRequirements(this.value);
    });

    confirmPasswordInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            document.getElementById('confirmError').textContent = '';
        }
        validatePasswordMatch();
    });

    // Step 1: Email Verification
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const emailError = document.getElementById('emailError');
        const submitBtn = emailForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Clear previous error
        emailError.textContent = '';
        
        // Validate email not empty
        if (!email) {
            showError('emailError', 'Email is required');
            emailInput.focus();
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            emailInput.focus();
            return;
        }
        
        userEmail = email;
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Move to Step 2
                goToStep(2);
                startResendTimer();
            } else {
                showError('emailError', data.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('emailError', 'Connection error. Please try again later.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Step 2: Code Verification
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Move to next input
            if (this.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    codeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const codeError = document.getElementById('codeError');
        const submitBtn = codeForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        codeError.textContent = '';
        
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        // Check if any field is empty
        if (code.length !== 6) {
            showError('codeError', 'Please enter the 6-digit code');
            codeInputs[0].focus();
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verifying...';
            
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, code })
            });
            
            const data = await response.json();
            
            if (data.success) {
                verificationCode = code; // Store for final step
                clearInterval(resendTimer);
                goToStep(3);
            } else {
                showError('codeError', data.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('codeError', 'Connection error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Resend Code
    resendBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Clear code inputs
        codeInputs.forEach(input => input.value = '');
        codeInputs[0].focus();
        
        try {
            resendBtn.disabled = true;
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });
            
            const data = await response.json();
            if (data.success) {
                if (resendTimer) clearInterval(resendTimer);
                startResendTimer();
                showError('codeError', 'A new code has been sent to ' + userEmail);
            } else {
                showError('codeError', data.message || 'Failed to resend code');
                resendBtn.disabled = false;
            }
        } catch (error) {
            showError('codeError', 'Connection error');
            resendBtn.disabled = false;
        }
    });

    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const passwordError = document.getElementById('passwordError');
        const confirmError = document.getElementById('confirmError');
        const submitBtn = resetForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Clear errors
        passwordError.textContent = '';
        confirmError.textContent = '';
        
        // Validate new password not empty
        if (!newPassword) {
            showError('passwordError', 'New password is required');
            newPasswordInput.focus();
            return;
        }
        
        // Validate password strength
        if (!isStrongPassword(newPassword)) {
            showError('passwordError', 'Password does not meet all requirements');
            newPasswordInput.focus();
            return;
        }
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            showError('confirmError', 'Passwords do not match');
            confirmPasswordInput.focus();
            return;
        }
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';
            
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: userEmail, 
                    code: verificationCode, 
                    newPassword: newPassword 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                goToStep(4);
            } else {
                showError('passwordError', data.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('passwordError', 'Connection error. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Toggle Password Visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Helper Functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isStrongPassword(password) {
        const hasLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasLength && hasUpperCase && hasNumber && hasSpecialChar;
    }

    function validatePasswordRequirements(password) {
        const req1 = document.getElementById('req1');
        const req2 = document.getElementById('req2');
        const req3 = document.getElementById('req3');
        const req4 = document.getElementById('req4');
        
        // Length requirement
        if (password.length >= 8) {
            req1.classList.add('valid');
        } else {
            req1.classList.remove('valid');
        }
        
        // Uppercase requirement
        if (/[A-Z]/.test(password)) {
            req2.classList.add('valid');
        } else {
            req2.classList.remove('valid');
        }
        
        // Number requirement
        if (/[0-9]/.test(password)) {
            req3.classList.add('valid');
        } else {
            req3.classList.remove('valid');
        }
        
        // Special character requirement
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            req4.classList.add('valid');
        } else {
            req4.classList.remove('valid');
        }
    }

    function validatePasswordMatch() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const confirmError = document.getElementById('confirmError');
        
        if (confirmPassword !== '' && newPassword !== confirmPassword) {
            showError('confirmError', 'Passwords do not match');
        } else {
            confirmError.textContent = '';
        }
    }

    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
    }

    function goToStep(step) {
        currentStep = step;
        
        // Hide all forms
        document.querySelectorAll('.form-step').forEach(form => {
            form.classList.remove('active');
        });
        
        // Update progress steps
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });
        
        // Show current form/message
        if (step === 1) {
            emailForm.classList.add('active');
        } else if (step === 2) {
            codeForm.classList.add('active');
            codeInputs[0].focus();
        } else if (step === 3) {
            resetForm.classList.add('active');
            newPasswordInput.focus();
        } else if (step === 4) {
            successMessage.classList.add('active');
        }
    }

    function startResendTimer() {
        timerCount = 60;
        resendBtn.disabled = true;
        const timer = document.getElementById('timer');
        
        resendTimer = setInterval(() => {
            timerCount--;
            if (timerCount > 0) {
                timer.textContent = `Resend in ${timerCount}s`;
            } else {
                clearInterval(resendTimer);
                resendBtn.disabled = false;
                timer.textContent = '';
            }
        }, 1000);
        
        timer.textContent = `Resend in ${timerCount}s`;
    }
});

