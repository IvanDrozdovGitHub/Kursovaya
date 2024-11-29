const { Pool } = require('pg');
const path = require('path');

module.exports = (app, upload) => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'drive40',
        password: '21822',
        port: 5432,
    });

    app.post('/upload', upload.single('image'), async (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).send('Нет файла для загрузки.');
        }

        try {
            const { originalname, buffer } = file;
            const query = `
                INSERT INTO cars (vin_car, make_car, model_car, year_of_manufacture_car,
                                  engine_car, max_power, max_speed, drive_car,
                                  mileage_car, color_car, photo_car,
                                  price_per_day, penalty_per_hour,
                                  pledge_car, status_car, body_type_car)
                VALUES ($1, $2, $3, $4, $5, $6,
                        $7, $8, $9, $10,
                        $11, $12, $13, $14, $15, $16)
            `;

            const values = [
                req.body.vin,
                req.body.make,
                req.body.model,
                req.body.year,
                req.body.engine,
                req.body.max_power,
                req.body.max_speed,
                req.body.drive,
                req.body.mileage,
                req.body.color,
                buffer,
                req.body.price_per_day,
                req.body.penalty_per_hour,
                req.body.pledge,
                req.body.status === 'true', // Преобразование строки в булевое значение
                req.body.body_type_car // Добавлено значение для типа кузова
            ];

            await pool.query(query, values);
            res.redirect('/all_car');
        } catch (error) {
            console.error(error);
            res.status(500).send(`Ошибка при сохранении файла в базе данных: ${error.message}`);
        }
    });

    // Маршрут для получения изображения по VIN-коду
    app.get('/image/:vin', async (req, res) => {
        const vin = req.params.vin;

        try {
            const result = await pool.query('SELECT photo_car FROM cars WHERE VIN_car = $1', [vin]);

            if (result.rows.length === 0) {
                return res.status(404).send('Изображение не найдено.');
            }

            const imageBuffer = result.rows[0].photo_car;
            res.set('Content-Type', 'image/jpeg');
            res.send(imageBuffer);
        } catch (error) {
            console.error(error);
            res.status(500).send('Ошибка при получении изображения.');
        }
    });
}