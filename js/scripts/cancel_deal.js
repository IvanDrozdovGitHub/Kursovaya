function cancelDeal(dealId) {
    const userConfirmed = confirm('Вы уверены, что хотите принять эту сделку?');

    if (userConfirmed) {
    fetch(`/api/deals/${dealId}/cancel`, {
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
        updateDealStatus(dealId, 'Отменено');
        window.location.href = '/profile';
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
} else {
    window.location.href = '/profile';
}
}

function updateDealStatus(dealId, newStatus) {
    const dealRow = document.querySelector(`#deal-${dealId}`);
    if (dealRow) {
        const statusCell = dealRow.querySelector('.status-cell');
        statusCell.textContent = newStatus;
    }
}
