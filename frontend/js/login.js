const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const showButton = document.getElementById('showButton');
const errorMessage = document.getElementById('errorMessage');

const API_BASE_URL = "http://localhost:4445";

showButton.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    showButton.classList.toggle('zmdi-eye-off', type === 'text');
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        errorMessage.textContent = 'Please enter both username and password.';
        return;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
        if (response.data.data?.accessToken) {
            window.localStorage.setItem('accessToken', response.data.data.accessToken);
            window.location.href = '/';
        } else {
            errorMessage.textContent = response.data.data?.message || 'Login failed';
        }
    } catch (err) {
        console.error(err);
        errorMessage.textContent = err.response?.data?.data?.message || err.response?.data?.message || 'Server error. Try again later.';
    }
});
