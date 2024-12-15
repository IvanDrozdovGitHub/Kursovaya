const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '21822',
    port: 5432,
});

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.user_status === 'admin') {
        next();
    } else {
        res.status(403).send('Доступ запрещен');
    }
};

module.exports = (app) => {
app.delete('/delete/:vin', isAdmin, async (req, res) => {
    const vin = req.params.vin;

    if (!vin) {
        return res.redirect('/VIN_не_указан.');
    }

    try {
        const query = 'DELETE FROM cars WHERE vin_car = $1';
        const result = await pool.query(query, [vin]);

        if (result.rowCount === 0) {
            return res.status(404).send('Автомобиль с указанным VIN не найден.');
        }
        res.redirect("/all_car");

    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка при удалении автомобиля из базы данных: ${error.message}`);
    }
});
};
