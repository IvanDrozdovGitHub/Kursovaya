const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'drive40',
        password: '21822',
        port: 5432,
    });

    // Настройка middleware для сессий
    app.use(session({
        secret: '21822', // Замените на ваш секретный ключ
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Установите true, если используете HTTPS
    }));

    // Маршрут для регистрации пользователя
    app.post('/register', async (req, res) => {
        const { first_name, surname, middlename, telephone_number, password_user, login_user } = req.body;

        // Валидация входных данных
        if (!first_name || !surname || !middlename || !telephone_number || !password_user || !login_user) {
            return res.status(400).send('Все поля обязательны для заполнения.');
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password_user, saltRounds);

            const query = `
                INSERT INTO users (first_name, surname, middlename, telephone_number, user_status, password_user, login_user)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;

            const values = [
                first_name,
                surname,
                middlename,
                telephone_number,
                'user',
                hashedPassword,
                login_user
            ];

            await pool.query(query, values);
            res.redirect('/');
        } catch (error) {
            console.error(error);
            if (error.code === '23505') { 
                return res.status(400).send('Этот номер телефона или логин уже зарегистрированы.');
            }
            res.status(500).send(`Ошибка при регистрации пользователя: ${error.message}`);
        }
    });

    // Маршрут для входа пользователя
    app.post('/login', async (req, res) => {
        const { login_user, password_user } = req.body;
    
        // Валидация входных данных
        if (!login_user || !password_user) {
            return res.status(400).send('Логин и пароль обязательны для заполнения.');
        }
    
        try {
            // Поиск пользователя по логину
            const query = 'SELECT * FROM users WHERE login_user = $1';
            const result = await pool.query(query, [login_user]);
    
            if (result.rows.length === 0) {
                return res.status(401).send('Неверный логин или пароль.');
            }
    
            const user = result.rows[0];
    
            // Сравнение пароля
            const match = await bcrypt.compare(password_user, user.password_user);
            if (!match) {
                return res.status(401).send('Неверный логин или пароль.');
            }
    
            // Сохранение всей информации о пользователе в сессии
            req.session.user = {
                user_id: user.user_id,
                first_name: user.first_name,
                surname: user.surname,
                middlename: user.middlename,
                telephone_number: user.telephone_number,
                user_status: user.user_status,
                login_user: user.login_user
            };
    
            // Перенаправление на главную страницу или отправка JSON-ответа
            res.redirect('/'); // Или используйте res.json(req.session.user) для отправки данных в формате JSON
        } catch (error) {
            console.error(error);
            res.status(500).send(`Ошибка при входе: ${error.message}`);
        }
    });

    app.post('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.error('Ошибка при уничтожении сессии:', err);
                return res.status(500).send('Ошибка при выходе.');
            }
            res.clearCookie('connect.sid'); // Очистка куки сессии
            res.sendStatus(200); // Возвращаем статус 200 при успешном выходе
        });
    });
    // Пример защищенного маршрута
    app.get('/protected', (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Необходима аутентификация.' }); // Возвращаем JSON с сообщением об ошибке
        }
        
        // Предполагаем, что req.session.user содержит информацию о пользователе
        const userData = {
            login: req.session.user.login_user,
            firstName: req.session.user.first_name,
            surname: req.session.user.surname,
            middlename: req.session.user.middlename,
            telephoneNumber: req.session.user.telephone_number,
            userStatus: req.session.user.user_status
        };
    
        res.json({ message: `Добро пожаловать ${req.session.user.login_user}!`, user: userData }); // Возвращаем JSON с данными пользователя
    });

    app.get('/getCurrentUser', (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Пользователь не аутентифицирован.' });
        }
    
        res.json({
            user_id: req.session.user.user_id,
            first_name: req.session.user.first_name,
            surname: req.session.user.surname,
            telephone_number: req.session.user.telephone_number,
        });
    });
    
}