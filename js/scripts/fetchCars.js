async function fetchCars() {
    try {
        const response = await fetch('/cars_present');
        
        if (!response.ok) throw new Error('Сеть не в порядке');
        
        const cars = await response.json();
        const carListDiv = document.getElementById('car-list');

        cars.forEach(car => {
            if (car.status_car) { 
                const carItem = document.createElement('div');
                carItem.className = 'car-item';

                const pricePerDay = Number(car.price_per_day);
                const formattedPrice = isNaN(pricePerDay) ? 'N/A' : pricePerDay.toLocaleString('ru-RU');

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

async function fetchAndFilterCars() {
    try {
        const query = document.getElementById('search-query').value;

        const response = await fetch(`/search_cars?query=${encodeURIComponent(query)}`);

        if (!response.ok) throw new Error('Сеть не в порядке');

        const cars = await response.json();
        const carListDiv = document.getElementById('car-list');
        carListDiv.innerHTML = '';

        cars.forEach(car => {
            if (car.status_car) {
                const pricePerDay = Number(car.price_per_day);
                const formattedPrice = isNaN(pricePerDay) ? 'N/A' : pricePerDay.toLocaleString('ru-RU');

                const carItem = document.createElement('div');
                carItem.className = 'car-item';
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
        console.error(error);
        res.redirect("/404");
    }
}
