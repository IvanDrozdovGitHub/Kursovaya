const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '21822',
    port: 5432,
});

app.use(session({
    secret: '21822',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.post('/register', async (req, res) => {
    const { first_name, surname, middlename, telephone_number, password_user, confirm_password_user, login_user } = req.body;

    if (!first_name || !surname || !middlename || !telephone_number || !password_user || !confirm_password_user || !login_user) {
        return res.status(400).send('Все поля обязательны для заполнения.');
    }

    if (password_user !== confirm_password_user) {
        return res.status(400).send('Пароли не совпадают.');
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


app.post('/login', async (req, res) => {
    const { login_user, password_user } = req.body;

    if (!login_user || !password_user) {
        return res.redirect('/?error=Логин и пароль обязательны для заполнения.');
    }

    try {
        const query = 'SELECT * FROM users WHERE login_user = $1';
        const result = await pool.query(query, [login_user]);

        if (result.rows.length === 0) {
            return res.redirect('/?error=Неверный логин или пароль.');
        }

        const user = result.rows[0];

        if (user.user_status === 'blocked') {
            return res.redirect('/?error=Пользователь заблокирован');
        }

        const match = await bcrypt.compare(password_user, user.password_user);
        if (!match) {
            req.session.firstPasswordAttempt = password_user;
            return res.redirect('/login');
        }

        req.session.user = {
            user_id: user.user_id,
            first_name: user.first_name,
            surname: user.surname,
            middlename: user.middlename,
            telephone_number: user.telephone_number,
            user_status: user.user_status,
            login_user: user.login_user,
            password_user: user.password_user
        };

        res.redirect('/');
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
        res.clearCookie('connect.sid');
        res.sendStatus(200);
    });
});

app.get('/protected', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Необходима аутентификация.' });
    }

    const userData = {
        login: req.session.user.login_user,
        firstName: req.session.user.first_name,
        surname: req.session.user.surname,
        middlename: req.session.user.middlename,
        telephoneNumber: req.session.user.telephone_number,
        userStatus: req.session.user.user_status,
        PasswordUser: req.session.user.password_user
    };

    res.json({ user: userData });
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