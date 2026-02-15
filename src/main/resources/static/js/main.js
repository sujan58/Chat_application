document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const toggleAuth = document.getElementById('toggle-auth');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const emailGroup = document.getElementById('email-group');
    const submitBtn = document.getElementById('submit-btn');
    const toggleText = document.getElementById('toggle-text');
    const errorMessage = document.getElementById('error-message');

    let isLogin = true;

    // Check if already logged in
    if (localStorage.getItem('jwt')) {
        window.location.href = 'chat.html';
    }

    toggleAuth.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            formTitle.textContent = 'Welcome Back!';
            formSubtitle.textContent = "We're so excited to see you again!";
            emailGroup.style.display = 'none';
            document.getElementById('email').required = false;
            submitBtn.textContent = 'Log In';
            toggleText.textContent = 'Need an account?';
            toggleAuth.textContent = 'Register';
        } else {
            formTitle.textContent = 'Create an Account';
            formSubtitle.textContent = "";
            emailGroup.style.display = 'block';
            document.getElementById('email').required = true;
            submitBtn.textContent = 'Continue';
            toggleText.textContent = 'Already have an account?';
            toggleAuth.textContent = 'Log In';
        }
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;

        const url = isLogin ? '/api/auth/login' : '/api/auth/register';
        const body = isLogin ? { username, password } : { username, password, email };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                if (isLogin) {
                    const data = await response.json();
                    localStorage.setItem('jwt', data.jwt);
                    localStorage.setItem('username', data.username);
                    window.location.href = 'chat.html';
                } else {
                    alert('Registration successful! Please log in.');
                    // Switch to login view
                    toggleAuth.click();
                }
            } else {
                const text = await response.text();
                // Try to parse JSON error if possible, else show text
                try {
                    const jsonError = JSON.parse(text);
                    errorMessage.textContent = jsonError.message || 'Authentication failed';
                } catch {
                    errorMessage.textContent = text || 'Authentication failed';
                }
            }
        } catch (error) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            console.error(error);
        }
    });
});
