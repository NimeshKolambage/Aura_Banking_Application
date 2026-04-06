const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('main-container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Navigate to mainui.html when back-nav is clicked
const backNavBtn = document.getElementById('backNav');
if (backNavBtn) {
    backNavBtn.addEventListener('click', function() {
        window.location.href = 'mainui.html';
    });
}

const backNavBtn2 = document.getElementById('backNav2');
if (backNavBtn2) {
    backNavBtn2.addEventListener('click', function() {
        window.location.href = 'mainui.html';
    });
}

// Password visibility toggle
const togglePasswordButtons = document.querySelectorAll('.toggle-eye');
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
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

// Form validation
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const inputs = this.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        
        inputs.forEach(input => {
            const inputGroup = input.closest('.input-group');
            const errorMessage = inputGroup.nextElementSibling;
            
            if (!input.value.trim()) {
                inputGroup.classList.add('error');
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.textContent = input.placeholder || 'This field is required';
                }
                isValid = false;
            } else {
                inputGroup.classList.remove('error');
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.textContent = '';
                }
            }
        });
        
        if (isValid) {
            console.log('Form submitted successfully');
            // Add your form submission logic here
        }
    });
});

// Clear error on input focus
const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        const inputGroup = this.closest('.input-group');
        inputGroup.classList.remove('error');
    });
});

