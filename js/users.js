const { Pool } = require('pg');

module.exports = (app) => {

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '21822',
    port: 5432,
});

app.get('/users_present_status', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, surname, first_name, middlename, telephone_number, user_status, login_user FROM users ORDER by user_status ASC;');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(404).send(`Ошибка при получении списка автомобилей: ${error.message}`);
    }
});

app.get('/users_present', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, surname, first_name, middlename, telephone_number, user_status, login_user FROM users ORDER BY surname ASC;');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка при получении списка пользователей: ${error.message}`);
    }
});

app.get('/search_users', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.redirect('/users');
    }
    
    try {
        const result = await pool.query(
            'SELECT user_id, surname, first_name, middlename, telephone_number, user_status, login_user FROM users WHERE telephone_number ILIKE $1',
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при выполнении поиска пользователей');
    }
});

app.put('/update_user_status/:id', async (req, res) => {
    const userId = req.params.id;
    const { user_status } = req.body;

    const validStatuses = ['admin', 'moder', 'user', 'blocked'];

    if (!validStatuses.includes(user_status)) {
        return res.status(400).json({ message: 'Недопустимый статус пользователя' });
    }

    try {
        await pool.query(
            'UPDATE users SET user_status = $1 WHERE user_id = $2',
            [user_status, userId]
        );
        res.json({ message: 'Статус пользователя обновлен' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при обновлении статуса пользователя');
    }
});
}