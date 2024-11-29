// auth.js

// Функция для проверки статуса аутентификации
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();

        if (data.isAuthenticated) {
            document.getElementById('auth-buttons').style.display = 'none';
            document.getElementById('user-cabinet').style.display = 'block';
            setupLogoutButton(); // Настраиваем кнопку выхода
        } else {
            document.getElementById('auth-buttons').style.display = 'block';
            document.getElementById('user-cabinet').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка при проверке статуса аутентификации:', error);
    }
}

// Функция для настройки обработчика события кнопки выхода
function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/logout', { method: 'POST', credentials: 'include' });
                if (response.ok) {
                    window.location.href = '/';
                } else {
                    alert('Ошибка при выходе. Попробуйте еще раз.');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка при выходе. Попробуйте еще раз.');
            }
        });
    }
}

// Вызов функции проверки статуса аутентификации при загрузке страницы
window.onload = checkAuth;