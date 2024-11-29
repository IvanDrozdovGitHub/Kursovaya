async function fetchCars() {
    try {
        const response = await fetch('/cars_present');
        
        if (!response.ok) throw new Error('Сеть не в порядке');
        
        const cars = await response.json();
        const carListDiv = document.getElementById('car-list');

        // Отображение автомобилей
        cars.forEach(car => {
            // Проверяем статус автомобиля
            if (car.status_car) { // Если статус доступен
                const carItem = document.createElement('div');
                carItem.className = 'car-item';

                // Форматирование цены с пробелами
                const pricePerDay = Number(car.price_per_day);
                const formattedPrice = isNaN(pricePerDay) ? 'N/A' : pricePerDay.toLocaleString('ru-RU');

                // Оборачиваем карточку автомобиля в ссылку
                carItem.innerHTML = `
                    <a href="/car/${car.vin_car}" style="text-decoration: none; color: inherit;">
                        <div class="car-card">
                            <img src="/image/${car.vin_car}" alt="${car.make_car} ${car.model_car}" class="car-image">
                            <div class="car-details">
                                <h2 class="car-title">${car.make_car} ${car.model_car} <strong>${car.year_of_manufacture_car}</strong></h2>
                                <h2 style="color:#F3BB2EFC;">от <strong class="h2">${formattedPrice} ₽ / сутки</strong></h2>
                            </div>
                        </div>
                    </a>
                `;
                carListDiv.appendChild(carItem);
            }
        });
    } catch (error) {
        res.redirect("/404");
    }
}