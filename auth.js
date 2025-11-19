// Authentication JavaScript
// Determine initial form based on URL parameter
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'login';
    switchForm(mode);

    // Add event listeners for password strength
    document.getElementById('registerPassword')?.addEventListener('input', checkPasswordStrength);
    document.getElementById('newPassword')?.addEventListener('input', checkPasswordStrength);
});

// Form Switching
function switchForm(formName) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    // Show selected form
    const form = document.getElementById(formName + 'Form');
    if (form) {
        form.classList.add('active');
    }

    // Hide success box
    const successBox = document.getElementById('successMessage');
    if (successBox) {
        successBox.classList.remove('active');
    }

    // Clear all error messages and form values
    clearAllErrors();
    clearFormValues();
}

// Clear error messages
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.textContent = '';
    });
}

// Clear form values
function clearFormValues() {
    document.querySelectorAll('.auth-form').forEach(form => {
        if (!form.classList.contains('active')) {
            form.querySelectorAll('input').forEach(input => {
                if (input.type !== 'checkbox') {
                    input.value = '';
                }
            });
        }
    });
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.target.closest('.toggle-password').querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Check password strength
function checkPasswordStrength(event) {
    const password = event.target.value;
    const strengthBar = event.target.closest('.password-input').nextElementSibling;

    if (!strengthBar || !strengthBar.classList.contains('password-strength')) return;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    strengthBar.classList.remove('weak', 'fair', 'strong');
    if (strength <= 2) {
        strengthBar.classList.add('weak');
    } else if (strength <= 3) {
        strengthBar.classList.add('fair');
    } else {
        strengthBar.classList.add('strong');
    }
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
}

function setError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorElement = input.closest('.form-group')?.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = input.closest('.form-group')?.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// LOGIN HANDLER
function handleLogin(event) {
    event.preventDefault();
    clearAllErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.querySelector('[name="rememberMe"]').checked;

    // Validation
    if (!email) {
        setError('loginEmail', 'Email is required');
        return;
    }

    if (!validateEmail(email)) {
        setError('loginEmail', 'Please enter a valid email');
        return;
    }

    if (!password) {
        setError('loginPassword', 'Password is required');
        return;
    }

    // Simulate API call
    showToast('Processing login...', 'info');
    
    setTimeout(() => {
        try {
            // Here you would make an API call to /api/auth/login
            // Example: const response = await fetch('/api/auth/login', { ... })
            
            // For demo purposes, we'll simulate a successful login
            const user = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email: email,
                name: email.split('@')[0]
            };

            // Store authentication data
            localStorage.setItem('authToken', 'demo_token_' + Date.now());
            localStorage.setItem('user', JSON.stringify(user));

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('rememberEmail', email);
            }

            showToast('Login successful!', 'success');
            
            // Redirect after 1 second
            setTimeout(() => {
                const redirect = new URLSearchParams(window.location.search).get('redirect');
                if (redirect === 'portal') {
                    const exam = new URLSearchParams(window.location.search).get('exam');
                    window.location.href = `portal.html?exam=${exam || 'dsa'}`;
                } else {
                    window.location.href = 'portal.html';
                }
            }, 1000);
        } catch (error) {
            showToast('Login failed: ' + error.message, 'error');
        }
    }, 1000);
}

// REGISTRATION HANDLER
function handleRegister(event) {
    event.preventDefault();
    clearAllErrors();

    const fullName = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    const agreeTerms = document.querySelector('[name="agreeTerms"]').checked;

    // Validation
    if (!fullName) {
        setError('registerName', 'Full name is required');
        return;
    }

    if (!email) {
        setError('registerEmail', 'Email is required');
        return;
    }

    if (!validateEmail(email)) {
        setError('registerEmail', 'Please enter a valid email');
        return;
    }

    if (!password) {
        setError('registerPassword', 'Password is required');
        return;
    }

    if (!validatePassword(password)) {
        setError('registerPassword', 'Password must be at least 8 characters');
        return;
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
        setError('registerConfirm', 'Passwords do not match');
        return;
    }

    if (!agreeTerms) {
        showToast('You must agree to the terms and conditions', 'error');
        return;
    }

    showToast('Creating account...', 'info');

    setTimeout(() => {
        try {
            // Here you would make an API call to /api/auth/register
            // Example: const response = await fetch('/api/auth/register', { ... })

            // For demo purposes, simulate successful registration
            const user = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email: email,
                name: fullName
            };

            // Store authentication data
            localStorage.setItem('authToken', 'demo_token_' + Date.now());
            localStorage.setItem('user', JSON.stringify(user));

            showSuccessMessage(
                `Account created successfully!`,
                `Welcome ${fullName}! Redirecting to portal...`
            );

            setTimeout(() => {
                window.location.href = 'portal.html';
            }, 2000);
        } catch (error) {
            showToast('Registration failed: ' + error.message, 'error');
        }
    }, 1000);
}

// FORGOT PASSWORD HANDLER
function handleForgotPassword(event) {
    event.preventDefault();
    clearAllErrors();

    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
        setError('forgotEmail', 'Email is required');
        return;
    }

    if (!validateEmail(email)) {
        setError('forgotEmail', 'Please enter a valid email');
        return;
    }

    showToast('Sending reset email...', 'info');

    setTimeout(() => {
        try {
            // Here you would make an API call to /api/auth/forgot-password
            // Example: const response = await fetch('/api/auth/forgot-password', { ... })

            // For demo purposes, show success
            showSuccessMessage(
                'Reset link sent!',
                `Check your email at ${email} for password reset instructions. The link will expire in 1 hour.`
            );

            setTimeout(() => {
                switchForm('login');
            }, 3000);
        } catch (error) {
            showToast('Failed to send reset email: ' + error.message, 'error');
        }
    }, 1000);
}

// RESET PASSWORD HANDLER
function handleResetPassword(event) {
    event.preventDefault();
    clearAllErrors();

    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!newPassword) {
        setError('newPassword', 'Password is required');
        return;
    }

    if (!validatePassword(newPassword)) {
        setError('newPassword', 'Password must be at least 8 characters');
        return;
    }

    if (!validatePasswordMatch(newPassword, confirmNewPassword)) {
        setError('confirmNewPassword', 'Passwords do not match');
        return;
    }

    showToast('Resetting password...', 'info');

    setTimeout(() => {
        try {
            // Here you would make an API call to /api/auth/reset-password
            // Example: const response = await fetch('/api/auth/reset-password', { ... })

            showSuccessMessage(
                'Password reset successful!',
                'Your password has been updated. Sign in with your new password.'
            );

            setTimeout(() => {
                switchForm('login');
            }, 2000);
        } catch (error) {
            showToast('Password reset failed: ' + error.message, 'error');
        }
    }, 1000);
}

// SOCIAL LOGIN HANDLERS
function handleGoogleLogin() {
    showToast('Google login would redirect to Google OAuth', 'info');
    // In production: window.location.href = '/api/auth/google';
}

function handleGithubLogin() {
    showToast('GitHub login would redirect to GitHub OAuth', 'info');
    // In production: window.location.href = '/api/auth/github';
}

// SUCCESS MESSAGE DISPLAY
function showSuccessMessage(title, message) {
    const successBox = document.getElementById('successMessage');
    const successText = document.getElementById('successText');

    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    // Set and show success box
    if (successText) {
        successText.textContent = message;
    }
    if (successBox) {
        successBox.classList.add('active');
    }
}

function handleSuccessRedirect() {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect === 'portal') {
        window.location.href = 'portal.html';
    } else {
        window.location.href = 'landing.html';
    }
}

// TOAST NOTIFICATION
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.className = `toast-notification show ${type}`;

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.classList.remove('show', 'hide');
        }, 300);
    }, 3000);
}

// Pre-fill email from local storage if "Remember me" was checked
window.addEventListener('load', () => {
    if (localStorage.getItem('rememberMe') && localStorage.getItem('rememberEmail')) {
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
            emailInput.value = localStorage.getItem('rememberEmail');
        }
    }
});
