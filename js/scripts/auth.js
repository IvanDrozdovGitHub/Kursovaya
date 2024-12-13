async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();

        if (data.isAuthenticated) {
            document.getElementById('auth-buttons').style.display = 'none';
            document.getElementById('user-cabinet').style.display = 'block';
            const response2 = await fetch('/api/check-AdminOrModer', { credentials: 'include' });
            const data2 = await response2.json();
            if (data2.isAdminOrModer)
            {
                document.getElementById('adm').style.display = 'block';
            }
            else
            {
                document.getElementById('adm').style.display = 'none';
            }
            setupLogoutButton('logout-button');
        } else {
            document.getElementById('auth-buttons').style.display = 'block';
            document.getElementById('user-cabinet').style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка при проверке статуса аутентификации:', error);
    }
}
function setupLogoutButton(id) { 
    const logoutButton = document.getElementById(id); 
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

window.onload = checkAuth;
