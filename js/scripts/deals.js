// Fetch deal data and populate the table
async function fetchDeals() {
    try {
        const response = await fetch('/all_deal'); // Adjust this endpoint as needed
        if (!response.ok) {
            throw new Error('Ошибка при получении данных о сделках');
        }
        const deals = await response.json();
        populateDealTable(deals);
    } catch (error) {
        console.error(error);
        alert('Не удалось загрузить данные о сделках.');
    }
}
        async function searchDeals() {
            const searchInput = document.getElementById('search-input');
            const dealId = searchInput.value.trim(); // Получаем значение из поля ввода
        
            if (!dealId) {
                alert('Пожалуйста, введите ID сделки для поиска.');
                return;
            }
        
            try {
                const response = await fetch(`/api/deals/${dealId}`); // Предполагаем, что у вас есть API для получения сделки по ID
                if (!response.ok) {
                    throw new Error('Сделка не найдена или произошла ошибка при запросе.');
                }
        
                const deal = await response.json(); // Получаем данные о сделке в формате JSON
        
                // Заполняем таблицу
                populateDealTable([deal]); // Передаем массив с одной сделкой в функцию заполнения таблицы
            } catch (error) {
                console.error(error);
                alert(error.message);
            }
        }
        
        function populateDealTable(deals) {
const tableBody = document.getElementById('deal-table-body');
tableBody.innerHTML = ''; // Очищаем текущую таблицу

deals.forEach(deal => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${deal.deal_id}</td>
        <td>${deal.user_id}</td>
        <td>${deal.surname}</td>
        <td>${deal.first_name}</td>
        <td>${deal.middlename || 'Не указано'}</td> <!-- Показать "Не указано", если отсутствует -->
        <td>${deal.telephone_number}</td>
        <td><a href="car/${deal.vin_car}">${deal.vin_car}</a></td> <!-- Ссылка на автомобиль -->
        <td>${deal.additional_services.length > 0 ? deal.additional_services.map(service => `${service.service_name} - ${service.price} руб.`).join(', ')     : 'Нет дополнительных услуг'}</td>
        <td>${new Date(deal.date_time_start).toLocaleString()}</td>
        <td>${new Date(deal.date_time_end).toLocaleString()}</td>
        <td>${deal.actual_date_time_end ? new Date(deal.actual_date_time_end).toLocaleString() : 'Не указана'}</td>
        <td>${deal.status_penalty ? 'Да' : 'Нет'}</td>
        <td>${deal.total_amount !== null ? deal.total_amount.toFixed(2) : 'Не указана'}</td> <!-- Форматируем сумму -->
        
        <!-- Кнопка редактирования -->
        <td><button onclick="editDeal(${deal.deal_id})">Редактировать</button></td>`;
    
    tableBody.appendChild(row);
});
}
document.addEventListener('DOMContentLoaded', fetchDeals);