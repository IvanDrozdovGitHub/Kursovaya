const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'drive40',
    password: '21822',
    port: 5432,
});

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.user_status === 'admin') { // Проверяем наличие пользователя и его статус
        next(); // Пользователь аутентифицирован и является администратором, продолжаем
    } else {
        res.redirect('/404');
    }
};


module.exports = (app, upload) => {
    // Маршрут для получения деталей автомобиля для редактирования
    app.get('/edit/:vin', isAdmin, async (req, res) => {
        const vin = req.params.vin;

        try {
            const result = await pool.query('SELECT * FROM cars WHERE vin_car = $1', [vin]);
            if (result.rowCount === 0) {
                return res.redirect("/Автомобиль_с_указанным_VIN_не_найден.")
            }

            const car = result.rows[0];
            res.send(`
               <!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/icons/favicon.ico" type="image/x-icon">
    <title>Редактирование автомобиля</title>
    <link rel="stylesheet" href="/css/main.css">
    <script rel="stylesheet" src="/js/scripts/scroll.js"></script>
    <script rel="stylesheet" src="/js/scripts/auth.js"></script>
     <style>
        body {
            background-color: #000000;
            color: white;
            font-family: 'Open Sans', sans-serif;
        }
        .form-container {
            display: flex;
            flex-direction: row;
            padding: 20px;
            gap: 50px;
        }
        .form-column {
            display: flex;
            flex-direction: column; 
            background-color: rgba(128, 128, 128, 0.5);
            border-radius: 10px; 
            padding: 20px; 
        }
        input[type="text"], input[type="file"], select {
            width: 100%; 
            margin-bottom: 10px; 
            border-radius: 5px; 
            border: 1px solid #000000; 
            padding: 10px; 
            background-color: rgba(255, 255, 255, 0.8); 
        }
            input[type="number"], input[type="file"], select {
            width: 100%; 
            margin-bottom: 10px; 
            border-radius: 5px; 
            border: 1px solid #000000; 
            padding: 10px; 
            background-color: rgba(255, 255, 255, 0.8); 
        }
        button {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            background-color: #ffd000; 
            color: white;
            border: none; 
            cursor: pointer; 
        }
        button:hover {
            background-color: #ffb300; 
        }
        @media (max-width: 768px) {
            .form-container {
                flex-direction: column;
                align-items: center; 
            }
        }
    </style>
</head>
<body>
<header class="header">
        <div class="container">
            <div class="header-content">
                <div class="header-content" style="gap: 50px;">
                    <a href="/">
                        <img style="width: 190px;" src="/img/logo.png">
                    </a>
                    <nav class="header-nav">
                        <a class="button-link" href="/catalog">Аренда авто</a>
                        <a class="button-link" href="/download_car">Добавление</a>
                         <a class="button-link" href="/all_car">Список Автомобилей</a>
                    </nav>
                </div>
                <div class="header-login button-link ">
                    <div id="auth-buttons" style="display: none;">
                        <a class="button-link" id="login-button" href="/login">Вход</a>
                        <a class="back-button-link" id="register-button" href="/registration">Регистрация</a>
                    </div>
                    <div id="user-cabinet" style="display: none;">
                        <a class="button-link" href="/profile">Личный кабинет</a>
                        <button class="back-button-link" id="logout-button">Выход</button>
                    </div>
                </div>
            </div>  
        </div>
    </header>

<div class="container">
    <h1>Редактирование автомобиля с VIN ${car.vin_car} ${car.make_car} ${car.model_car} ${car.year_of_manufacture_car}</h1>
    <form action="/update/${car.vin_car}" method="post" enctype="multipart/form-data">
        <div class="form-container">
            <div class="form-column" style="width: 500px;">
                <label for="vin">VIN-код:</label>
                <input type="text" id="vin" name="vin" value="${car.vin_car}" required maxlength="17" pattern="[A-HJ-NPR-Z0-9]{17}" title="Введите корректный VIN-код (17 символов)" />

                <label for="make">Марка:</label>
                <input type="text" id="make" name="make" value="${car.make_car}" required />

                <label for="model">Модель:</label>
                <input type="text" id="model" name="model" value="${car.model_car}" required />

                <label for="year">Год производства:</label>
                <input type="number" id="year" name="year" value="${car.year_of_manufacture_car}" required />

                <label for="engine">Двигатель (объем):</label>
                <input type="text" id="engine" name="engine" value="${car.engine_car}" required />

                <label for="max_power">Максимальная мощность (л.с.):</label>
                <input type="number" id="max_power" name="max_power" value="${car.max_power}" required />

                <label for="max_speed">Максимальная скорость (км/ч):</label>
                <input type="number" id="max_speed" name="max_speed" value="${car.max_speed}" required />
            </div>

            <div class="form-column" style="width: 500px;">
                <label for='drive'>Привод:</label>
                <input type='text' id='drive' name='drive' value='${car.drive_car}' required />

                <label for='mileage'>Пробег:</label>
                <input type='number' id='mileage' name='mileage' value='${car.mileage_car}' required />

                <label for='color'>Цвет:</label>
                <input type='text' id='color' name='color' value='${car.color_car}' required />

                <label for='price_per_day'>Цена за день аренды (руб):</label>
                <input type='number' id='price_per_day' name='price_per_day' value='${car.price_per_day}' required />

                <label for='penalty_per_hour'>Штраф за час (руб):</label>
                <input type='number' id='penalty_per_hour' name='penalty_per_hour' value='${car.penalty_per_hour}' required />

                <label for='pledge'>Залог (руб):</label>
                <input type='number' id='pledge' name='pledge' value='${car.pledge_car}' required />
                
                <!-- Выбор типа кузова -->
                <label for='body_type_car'>Тип кузова:</label>
                <select id='body_type_car' name='body_type_car' required>
                    <option value="" disabled selected>Выберите тип кузова</option>
                    <option value='Легковой' ${car.body_type_car === 'Легковой' ? 'selected' : ''}>Легковой</option>
                    <option value='Внедорожник' ${car.body_type_car === 'Внедорожник' ? 'selected' : ''}>Внедорожник</option>
                    <option value='Минивэн' ${car.body_type_car === 'Минивэн' ? 'selected' : ''}>Минивэн</option>
                    <option value='Электромобиль' ${car.body_type_car === 'Электромобиль' ? 'selected' : ''}>Электромобиль</option>
                    <option value='Специальный автомобиль' ${car.body_type_car === 'Специальный автомобиль' ? 'selected' : ''}>Специальный автомобиль</option>
                </select>

                <!-- Статус -->
                <label for = "status">Статус:</label >
                <select style = "width :240 px;" id = "status", name = "status", required >
                    <!-- Предполагаем, что car.status содержит статус -->
                    <option value = "true"${car.status ? ' selected': ''}>Доступен</option >
                    <option value = "false"${!car.status ? ' selected': ''}>Недоступен</option >
                </select >
            </div >
            <div class="form-column" style="width: 500px;">
                <img src="/image/${vin}" alt="${result.rows[0].make_car} ${result.rows[0].model_car}">
                 <input style = "background-color : black;" type = "file", id = "photo", name = "image", accept=".jpg, .jpeg, .png, .gif" />
            </div>
        </div > 

        <!-- Кнопка отправки -->
        <button type='submit'>Сохранить изменения</button >
        <button href="javascript:void(0);" onclick="window.history.back();">Назад</button>
    </form >
</div>
</body >
</html >
             `);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Ошибка при получении данных о автомобиле: ${error.message}`);
        }
    });

    // Маршрут для обработки обновления деталей автомобиля
    app.post('/update/:vin', upload.single('image'), isAdmin, async (req, res) => {
        const vin = req.params.vin;
        const { make, model, year, engine, max_power, max_speed, drive, mileage, color, price_per_day, penalty_per_hour, pledge } = req.body;
        let photo = req.file ? req.file.buffer : null; // Получаем загруженный файл, если он есть

        try {
            const query = `
                UPDATE cars SET 
                    make_car = $1,
                    model_car = $2,
                    year_of_manufacture_car = $3,
                    engine_car = $4,
                    max_power = $5,
                    max_speed = $6,
                    drive_car = $7,
                    mileage_car = $8,
                    color_car = $9,
                    photo_car = COALESCE($10, photo_car), -- Сохраняем существующее фото, если новое не загружено
                    price_per_day = $11,
                    penalty_per_hour = $12,
                    pledge_car = $13,
                    body_type_car = $14,
                    status_car = $15
                WHERE vin_car = $16
            `;

            const values = [
                make,
                model,
                year,
                engine,
                max_power,
                max_speed,
                drive,
                mileage,
                color,
                photo,
                price_per_day,
                penalty_per_hour,
                pledge,
                req.body.body_type_car, // Добавляем тип кузова
                req.body.status === 'true', // Преобразуем статус из строки в булево значение
                vin
            ];

            await pool.query(query, values);
            res.redirect('/all_car');
        } catch (error) {
            console.error(error);
            res.status(500).send(`Ошибка при обновлении данных автомобиля: ${error.message}`);
        }
    });
};
