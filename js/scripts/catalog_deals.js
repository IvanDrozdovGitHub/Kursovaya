async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const status = await fetch('/protected', { credentials: 'include' });
        const data = await response.json();
        const data2 = await status.json();

        if (data.isAuthenticated) {
            document.getElementById('auth-buttons').style.display = 'none';
            document.getElementById('user-cabinet').style.display = 'block';
            document.getElementById('user-cabinet').style.display = 'block';
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

function toggleAdditionalText() {
    const checkboxes = document.querySelectorAll('input[name="additional_services_id[]"]');
    const additionalText = document.getElementById('additional_text');

    const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    additionalText.style.display = isChecked ? 'block' : 'none';

    let text = "";

    if (document.getElementById('service_2').checked) {
        text += "Адрес доставки:\n";
    }
    
    if (document.getElementById('service_3').checked) {
        text += "\nАдрес возврата:\n";
    }

    additionalText.value = text;
}

async function fillAutoFields() {
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        
        if (!response.ok) throw new Error('Ошибка при проверке аутентификации.');

        const data = await response.json();

        if (data.isAuthenticated) {
            const userResponse = await fetch('/getCurrentUser');
            
            if (!userResponse.ok) throw new Error('Ошибка при получении данных пользователя.');

            const user = await userResponse.json();

            document.getElementById('user_id').value = user.user_id; 
            document.getElementById('first_name').value = user.first_name; 
            document.getElementById('surname').value = user.surname; 
            document.getElementById('telephone_number').value = user.telephone_number; 
        }
    } catch (error) {

    }
}

async function checkDealsAuth() {
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        
        if (!response.ok) throw new Error('Ошибка при проверке аутентификации.');

        const data = await response.json();

        if (data.isAuthenticated) {
            document.getElementById('deals-form').style.display = 'block';
        } else {
            document.getElementById('deals-form').style.display = 'none';
        }
    } catch (error) {

    }
}

async function searchCars() {
    const query = document.getElementById('search-input').value.trim();
    
    try {
        const response = await fetch(`/search_cars?query=${encodeURIComponent(query)}`); // Adjust this endpoint as needed
        if (!response.ok) {
            throw new Error('Ошибка при поиске автомобилей');
        }
        
        const cars = await response.json();
        populateTable(cars);
    } catch (error) {
        console.error(error);
        alert('Не удалось выполнить поиск автомобилей.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await fillAutoFields();
    await checkDealsAuth(); 
    await searchCars()
});