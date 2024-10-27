const { Pool } = require('pg');
const path = require('path');

module.exports = (app) => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'drive40',
        password: '21822',
        port: 5432,
    });

    // Маршрут для регистрации пользователя
    app.post('/register', async (req, res) => {
        const { first_name, surname, middlename, telephone_number } = req.body;

        // Проверка наличия обязательных полей
        if (!first_name || !surname || !middlename || !telephone_number) {
            return res.status(400).send('Имя, фамилия, отчество и номер телефона обязательны для заполнения.');
        }

        try {
            const query = `
                INSERT INTO users (first_name, surname, middlename, telephone_number, user_status)
                VALUES ($1, $2, $3, $4, $5)
            `;

            const values = [
                first_name,
                surname,
                middlename,
                telephone_number,
                'user'
            ];

            await pool.query(query, values);
            res.send('Пользователь успешно зарегистрирован!');
        } catch (error) {
            console.error(error);
            if (error.code === '23505') { 
                return res.status(400).send('Этот номер телефона уже зарегистрирован.');
            }
            res.status(500).send(`Ошибка при регистрации пользователя: ${error.message}`);
        }
    });
}