function trueDeal(dealId) {
    const userConfirmed = confirm('Вы уверены, что хотите отменить эту сделку?');

    if (userConfirmed) {
    fetch(`/api/deals/${dealId}/true`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при отмене сделки');
        }
        return response.json();
    })
    .then(data => {
        updateDealStatus(dealId, 'В процессе');
        window.location.href = '/deals_now';
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
} else {
    window.location.href = '/profile';
}
}

function completeDeal(dealId) {
    const userConfirmed = confirm('Вы уверены, что хотите завершить эту сделку?');

    if (userConfirmed) {
    fetch(`/api/deals/${dealId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при отмене сделки');
        }
        return response.json();
    })
    .then(data => {
        // Обновляем статус сделки в таблице
        updateDealStatus(dealId, 'В процессе');
        window.location.href = '/deals_now';
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
} else {
    window.location.href = '/profile';
}
}

function updateDeal(dealId) {
    const actualDate = document.getElementById(`actual-date-${dealId}`).value;
    const penaltyStatus = document.getElementById(`penalty-status-${dealId}`).value;
    const pledgeStatus = document.getElementById(`pledge-status-${dealId}`).value;
    const totalAmount = document.getElementById(`total-amount-${dealId}`).value;
    

    const updatedData = {
        actual_date_time_end: actualDate,
        status_penalty: penaltyStatus === "1",
        status_pledge: pledgeStatus === "1",
        total_amount: parseFloat(totalAmount)
    };

    fetch(`/api/deals/${dealId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка при обновлении сделки');
        }
        return response.json();
    })
    .then(data => {
        alert('Данные успешно обновлены!');
        window.location.href = '/deals_now';
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

function updateDealStatus(dealId, newStatus) {
    const dealRow = document.querySelector(`#deal-${dealId}`);
    if (dealRow) {
        const statusCell = dealRow.querySelector('.status-cell');
        statusCell.textContent = newStatus;
    }
}

async function fetchDeals() {
    try {
        const response = await fetch('/all_deal_now'); 
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
            <td>${new Date(deal.created_at).toLocaleString()}</td>
            <td>${deal.user_id}</td>
            <td>${deal.surname}</td>
            <td>${deal.first_name}</td>
            <td>${deal.middlename || 'Не указано'}</td>
            <td>${deal.telephone_number || 'Не указано'}</td>
            <td><a href="car/${deal.vin_car}">${deal.vin_car}</a></td>
            <td>${deal.additional_services.length > 0 ? 
                deal.additional_services.map(service => `${service.service_name} - ${service.price} руб.`).join(', ') : 
                'Нет дополнительных услуг'}</td>
            <td>${deal.additional_text}</td>
            <td>${new Date(deal.date_time_start).toLocaleString()}</td>
            <td>${new Date(deal.date_time_end).toLocaleString()}</td>
            <td>${deal.actual_date_time_end ? new Date(deal.actual_date_time_end).toLocaleString() : 'Не указана'}</td>
            <td>${deal.status_penalty ? 'Включен в сумму' : 'Нет'}</td>
            <td>${deal.status_pledge ? 'Не возвращен' : 'Возвращен'}</td>
            <td style="color: ${deal.status_deal === 'Отменено' ? 'red' : deal.status_deal === 'В процессе' ? 'orange' : deal.status_deal === 'Выполнен' ? 'green' : 'white'};">${deal.status_deal || 'Не указано'}</td>
            <td>${deal.total_amount !== null ? deal.total_amount.toFixed(2) + ' руб.' : 'Не указана'}</td>
            <td>
                ${deal.status_deal === 'Создана' ? `
                    <a onclick="cancelDeal(${deal.deal_id})" class="save-status-button">Отменить</a>
                    <a onclick="trueDeal(${deal.deal_id})" class="save-status-button">Принять</a>
                ` : deal.status_deal === 'В процессе' ? `
                    <a onclick="trueDeal(${deal.deal_id})" class="save-status-button">Принять</a>
                    <a onclick="completeDeal(${deal.deal_id})" class="save-status-button">Завершить</a>
                    
                    <input type="datetime-local" id="actual-date-${deal.deal_id}" value="${deal.actual_date_time_end ? new Date(deal.actual_date_time_end).toISOString().slice(0, 16) : ''}">
                    <select id="penalty-status-${deal.deal_id}">
                        <option value="0" ${!deal.status_penalty ? 'selected' : ''}>Нет</option>
                        <option value="1" ${deal.status_penalty ? 'selected' : ''}>Включен в сумму</option>
                    </select>
                    <select id="pledge-status-${deal.deal_id}">
                        <option value="0" ${!deal.status_pledge ? 'selected' : ''}>Возвращен</option>
                        <option value="1" ${deal.status_pledge ? 'selected' : ''}>Не возвращен</option>
                    </select>
                    <input type="number" id="total-amount-${deal.deal_id}" value="${deal.total_amount !== null ? deal.total_amount.toFixed(2) : ''}" step="0.01">
                    <button onclick="updateDeal(${deal.deal_id})">Сохранить изменения</button>
                ` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', fetchDeals);