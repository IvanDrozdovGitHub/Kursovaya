const { Pool } = require('pg');

module.exports = (app) => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'drive40',
        password: '21822',
        port: 5432,
    });

    app.get('/cars', async (req, res) => {
        try {
            const result = await pool.query('SELECT vin_car, make_car, model_car, year_of_manufacture_car, price_per_day, status_car FROM cars');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Ошибка при получении списка автомобилей: ${error.message}`);
        }
    });
// Маршрут для получения деталей автомобиля по vin-коду
app.get('/car/:vin', async (req, res) => {
    const vin = req.params.vin; // Получаем vin из параметров URL

    try {
        const result = await pool.query('SELECT * FROM cars WHERE vin_car = $1', [vin]);

        if (result.rows.length === 0) {
            return res.status(404).send('Автомобиль не найден.');
        }

        // Рендерим HTML-страницу с данными автомобиля
        res.send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Drive 40 | ${result.rows[0].make_car} ${result.rows[0].model_car}</title>
                <link rel="stylesheet" href="/css/main.css">
                <link rel="stylesheet" href="/css/catalog.css">
            </head>
            <body>
            <header class="header">
        <div class="container">
            <div class="header-content">
                <a href="/">
                    <img style="width: 190px;" src="https://jetcar24.ru/wp-content/uploads/2022/11/logo.svg" alt="">
                </a>
                <nav class="header-nav">
                    <a class="button-link" href="">Аренда авто</a>
                    <a class="button-link" href="#contacts">Контакты</a>
                    <a class="button-link" href="#reviews">О нас</a>
                </nav>
                <div class="header-login button-link ">
                    <a class="button-link" href="#">Вход</a>
                    <a class="back-button-link"href="/registration">Регистрация</a>
                </div>
            </div>  
        </div>
    </header>
                <h1>${result.rows[0].make_car} ${result.rows[0].model_car}</h1>
                <img src="/image/${vin}" alt="${result.rows[0].make_car} ${result.rows[0].model_car}" style="width: 100%; height: auto;">
                <p>Год выпуска: ${result.rows[0].year_of_manufacture_car}</p>
                <p>Цена за день: ${result.rows[0].price_per_day} руб.</p>
                <p>Статус: ${result.rows[0].status_car ? 'Доступен' : 'Недоступен'}</p>

    <a href="javascript:void(0);" onclick="window.history.back();">Назад к каталогу</a>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при получении данных автомобиля.');
    }
});
}