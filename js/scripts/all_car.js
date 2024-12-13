async function fetchCars() {
    try {
        const response = await fetch('/cars_present'); 
        if (!response.ok) {
            throw new Error('Ошибка при получении данных о автомобилях');
        }
        const cars = await response.json();
        populateTable(cars);
    } catch (error) {
        console.error(error);
        alert('Не удалось загрузить данные о автомобилях.');
    }
}

function populateTable(cars) {
    const tableBody = document.getElementById('car-table-body');
    tableBody.innerHTML = ''; 

    cars.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
           <td><a href="/car/${car.vin_car}">${car.vin_car}</a></td>
            <td>${car.make_car}</td>
            <td>${car.model_car}</td>
            <td>${car.year_of_manufacture_car}</td>
            <td>${car.engine_car}</td>
            <td>${car.max_power}</td>
            <td>${car.max_speed}</td>
            <td>${car.drive_car}</td>
            <td>${car.mileage_car}</td>
            <td>${car.color_car}</td>
            <td><img src="/image/${car.vin_car}" alt="${car.make_car} ${car.model_car}" class="car-image"></td>
            <td>${car.price_per_day}</td>
            <td>${car.penalty_per_hour}</td>
            <td>${car.pledge_car}</td>
            <td>${car.status_car ? 'Доступен' : 'Недоступен'}</td>
            <td>${car.body_type_car}</td>

            <!-- Edit button -->
            <td><button onclick="editCar('${car.vin_car}')">Редактировать</button></td>

            <!-- Delete button -->
            <td><button onclick="deleteCar('${car.vin_car}')">Удалить</button></td>`;
        
        tableBody.appendChild(row);
    });
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

async function deleteCar(vin) {
    if (confirm(`Вы уверены, что хотите удалить автомобиль с VIN ${vin}?`)) {
        try {
            const response = await fetch(`/delete/${vin}`, {
                method: 'DELETE'
            });
            fetchCars(); 
        } catch (error) {
            console.error(error);
            alert('Не удалось удалить автомобиль.');
        }
    }
}

function editCar(vin) {
    window.location.href = `/edit/${vin}`; 
}

document.addEventListener('DOMContentLoaded', fetchCars);