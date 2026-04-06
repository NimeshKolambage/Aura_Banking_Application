// Forgot Password Form Logic

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
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const emailError = document.getElementById('emailError');
        
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
        
        // Simulate sending code (in real app, send to backend)
        console.log('Sending verification code to:', email);
        
        // Move to Step 2
        goToStep(2);
        startResendTimer();
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
            
            // Check if all filled
            if (areAllCodesFilled()) {
                // Auto-submit or enable button
                codeForm.querySelector('button[type="submit"]').disabled = false;
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    codeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const codeError = document.getElementById('codeError');
        codeError.textContent = '';
        
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        // Check if any field is empty
        const emptyFields = Array.from(codeInputs).some(input => input.value === '');
        if (emptyFields) {
            showError('codeError', 'All 6 digits are required');
            codeInputs[0].focus();
            return;
        }
        
        if (code.length !== 6) {
            showError('codeError', 'Please enter a valid 6-digit code');
            codeInputs[0].focus();
            return;
        }
        
        // Simulate code verification (in real app, verify with backend)
        console.log('Verifying code:', code);
        
        // Move to Step 3
        clearInterval(resendTimer);
        goToStep(3);
    });

    // Resend Code
    resendBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear code inputs
        codeInputs.forEach(input => input.value = '');
        codeInputs[0].focus();
        
        // Simulate resending code
        console.log('Resending verification code to:', userEmail);
        
        // Reset timer
        if (resendTimer) clearInterval(resendTimer);
        startResendTimer();
        
        showError('codeError', 'Verification code sent to ' + userEmail);
    });

    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const passwordError = document.getElementById('passwordError');
        const confirmError = document.getElementById('confirmError');
        
        // Clear errors
        passwordError.textContent = '';
        confirmError.textContent = '';
        
        // Validate new password not empty
        if (!newPassword) {
            showError('passwordError', 'New password is required');
            newPasswordInput.focus();
            return;
        }
        
        // Validate confirm password not empty
        if (!confirmPassword) {
            showError('confirmError', 'Please confirm your password');
            confirmPasswordInput.focus();
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
        
        // Simulate password reset (in real app, send to backend)
        console.log('Resetting password for:', userEmail);
        
        // Show success message
        goToStep(4);
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

    function areAllCodesFilled() {
        return Array.from(codeInputs).every(input => input.value !== '');
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
