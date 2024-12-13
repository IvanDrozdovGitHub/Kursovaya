async function fetchUsers() {
    try {
        const response = await fetch('/users_present_status');
        if (!response.ok) {
            throw new Error('Ошибка при получении данных о пользователях');
        }
        const users = await response.json();
        populateTable(users);
    } catch (error) {
        console.error(error);
        alert('Не удалось загрузить данные о пользователях.');
    }
}

function populateTable(users) {
    const tableBody = document.getElementById('user-table-body');
    tableBody.innerHTML = ''; 
    users.forEach(user => { 
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="/user/${user.user_id}">${user.user_id}</a></td>
            <td>${user.surname}</td>
            <td>${user.first_name}</td>
            <td>${user.middlename}</td>
            <td>${user.telephone_number}</td>
            <td>${user.user_status}</td>
            <td>${user.login_user}</td>
            <!-- Кнопка редактирования -->
            <td><button onclick="editUser('${user.user_id}')">Редактировать</button></td>`;
        
        tableBody.appendChild(row);
    });
}

async function searchUsers() {
    const query = document.getElementById('search-input').value.trim();
    try {
        const response = await fetch(`/search_users?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Ошибка при поиске пользователей');
        }
        
        const users = await response.json();
        populateTable(users);
    } catch (error) {
        console.error(error);
        alert('Не удалось выполнить поиск пользователей.');
    }
}

let currentUserId;

function editUser(userId) {
    currentUserId = userId;
    document.getElementById('status-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('status-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save-status-button').addEventListener('click', async () => {
        const newStatus = document.getElementById('user-status').value;

        try {
            const response = await fetch(`/update_user_status/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении статуса пользователя');
            }

            await response.json();
            fetchUsers();
            closeModal();
        } catch (error) {
            console.error(error);
            alert('Не удалось изменить статус пользователя.');
        }
    });

    fetchUsers();
});

