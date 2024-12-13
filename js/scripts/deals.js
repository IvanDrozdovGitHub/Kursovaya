async function fetchDeals() {
    try {
        const response = await fetch('/all_deal'); 
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


function populateDealTable(deals) {
    const tableBody = document.getElementById('deal-table-body');
    tableBody.innerHTML = ''; 

    deals.forEach(deal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${deal.deal_id}</td>
            <td>${new Date(deal.created_at).toLocaleString()}</td> <!-- Форматируем дату создания -->
            <td>${deal.user_id}</td>
            <td>${deal.surname}</td>
            <td>${deal.first_name}</td>
            <td>${deal.middlename || 'Не указано'}</td> <!-- Показать "Не указано", если отсутствует -->
            <td>${deal.telephone_number || 'Не указано'}</td> <!-- Показать "Не указано", если отсутствует -->
            <td><a href="car/${deal.vin_car}">${deal.vin_car}</a></td> <!-- Ссылка на автомобиль -->
            <td>${deal.additional_services.length > 0 ? 
                deal.additional_services.map(service => `${service.service_name} - ${service.price} руб.`).join(', ') : 
                'Нет дополнительных услуг'}</td>
            <td>${deal.additional_text}</td>
            <td>${new Date(deal.date_time_start).toLocaleString()}</td>
            <td>${new Date(deal.date_time_end).toLocaleString()}</td>
            <td>${deal.actual_date_time_end ? new Date(deal.actual_date_time_end).toLocaleString() : 'Не указана'}</td>
            <td>${deal.status_penalty ? 'Включен в сумму' : 'Нет'}</td>
            <td>${deal.status_pledge ? 'Не возвращен' : 'Возвращен'}</td>
            <td style="color: ${deal.status_deal === 'Отменено' ? 'red' : deal.status_deal === 'В процессе' ? 'orange' : deal.status_deal === 'Завершено' ? 'green' : 'white'};">${deal.status_deal || 'Не указано'}</td>
            <td>${deal.total_amount !== null ? deal.total_amount.toFixed(2) + ' руб.' : 'Не указана'}</td>`;
        
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', fetchDeals);