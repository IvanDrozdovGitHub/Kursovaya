function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password_user');
    const toggleButton = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = 'Скрыть';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = 'Показать';
    }
}