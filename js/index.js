const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '21822',
    port: 5432,
});

const app = express();
app.use(express.static('static'));
app.use('/js', express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://79.174.82.125:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(session({
    secret: '21822',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware для проверки прав доступа
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.user_status === 'admin') {
        next();
    } else {
        res.redirect('/404');
    }
};

app.get('/api/check-AdminOrModer', (req, res) => {
    if (req.session.user && (req.session.user.user_status === 'admin' || req.session.user.user_status === 'moder')){
        return res.json({ isAdminOrModer: true });
    }
    res.json({ isAdminOrModer: false });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        return res.json({ isAuthenticated: true });
    }
    res.json({ isAuthenticated: false });
});


const isModerAndIsAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.user_status === 'admin' || req.session.user.user_status === 'moder')) {
        next();
    } else {
        res.redirect('/404');
    }
};

// Маршруты
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));
app.get('/registration', (req, res) => res.sendFile(path.join(__dirname, '..', 'registration.html')));
app.get('/download_car', isAdmin, (req, res) => res.sendFile(path.join(__dirname, '..', 'download_car.html')));
app.get('/all_car', isModerAndIsAdmin, (req, res) => res.sendFile(path.join(__dirname, '..', 'all_car.html')));
app.get('/deals', isModerAndIsAdmin, (req, res) => res.sendFile(path.join(__dirname, '..', 'deals.html')));
app.get('/catalog', (req, res) => res.sendFile(path.join(__dirname, '..', 'catalog.html')));
app.get('/car', (req, res) => res.sendFile(path.join(__dirname, '..', 'car.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'login.html')));
app.get('/menu_adm', isModerAndIsAdmin, (req, res) => res.sendFile(path.join(__dirname, '..', 'menu_adm.html')));
app.get('/deals_now', isModerAndIsAdmin, (req, res) => res.sendFile(path.join(__dirname, '..', 'deals_now.html')));
app.get('/users', isAdmin, (req, res) => res.sendFile(path.join(__dirname, '..', 'users.html')));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Подключение других модулей
require('./download.js')(app, upload);
require('./registration.js')(app);
require('./catalog.js')(app);
require('./delete.js')(app);
require('./edit.js')(app, upload);
require('./deals.js')(app);
require('./profile.js')(app);
require('./users.js')(app);

// Обработка 404 ошибок
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

// Инициализация базы данных
const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        // Создание таблицы users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                surname VARCHAR(50) NOT NULL,
                middlename VARCHAR(50) NOT NULL,
                telephone_number VARCHAR(20) NOT NULL UNIQUE,
                user_status VARCHAR(50) NOT NULL,
                password_user VARCHAR(255) NOT NULL,
                login_user VARCHAR(255) NOT NULL UNIQUE
            );
        `);

        // Создание таблицы cars
        await client.query(`
            CREATE TABLE IF NOT EXISTS cars (
                VIN_car VARCHAR(17) PRIMARY KEY,
                CHECK (LENGTH(VIN_car) = 17), 
                make_car VARCHAR(50) NOT NULL,
                model_car VARCHAR(50) NOT NULL,
                year_of_manufacture_car VARCHAR(10) NOT NULL,
                engine_car VARCHAR(50) NOT NULL,
                max_power VARCHAR(10) NOT NULL,
                max_speed VARCHAR(10) NOT NULL,
                drive_car VARCHAR(10) NOT NULL,
                mileage_car VARCHAR(10) NOT NULL,
                body_type_car VARCHAR(30),
                color_car VARCHAR(30) NOT NULL,
                photo_car BYTEA,
                price_per_day VARCHAR(30) NOT NULL,
                penalty_per_hour VARCHAR(30) NOT NULL,
                pledge_car VARCHAR(30) NOT NULL,
                status_car BOOLEAN NOT NULL
            );
        `);

        // Создание таблицы deals
        await client.query(`
            CREATE TABLE IF NOT EXISTS deals (
                deal_id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(user_id),
                vin_car VARCHAR(17) REFERENCES cars(VIN_car),
                date_time_start TIMESTAMP NOT NULL,
                date_time_end TIMESTAMP NOT NULL,
                actual_date_time_end TIMESTAMP,
                additional_text VARCHAR(255),
                status_penalty BOOLEAN,
                status_pledge BOOLEAN,
                total_amount INT DEFAULT 0,
                status_deal VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Создание таблицы additional_services
        await client.query(`
            CREATE TABLE IF NOT EXISTS additional_services (
                additional_service_id SERIAL PRIMARY KEY,
                service_name VARCHAR(255) NOT NULL UNIQUE,
                price INT NOT NULL
            );
        `);


        await client.query(`
            CREATE TABLE IF NOT EXISTS deal_services (
                deal_service_id SERIAL PRIMARY KEY,
                deal_id INT,
                additional_service_id INT,
            
                FOREIGN KEY (deal_id) REFERENCES deals(deal_id),
                FOREIGN KEY (additional_service_id) REFERENCES additional_services(additional_service_id)
            );
        `);

        // Вставка начальных данных в additional_services
        // await client.query(`
        //     INSERT INTO additional_services (service_name, price)
        //     VALUES 
        //     ('Детское кресло', 1500),
        //     ('Доставка автомобиля', 7000),
        //     ('Возврат автомобиля', 10000)
        //     ON CONFLICT (service_name) DO NOTHING; -- Предотвращаем дублирование по имени услуги
        // `);

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('123456', 10);

        // // Вставка начального пользователя
        await client.query(`
        INSERT INTO users (first_name, surname, middlename, telephone_number, user_status, password_user, login_user)
        VALUES ('Иван', 'Иванов', 'Иванович', '1234567890', 'admin', $1, 'admin')
        ON CONFLICT (telephone_number) DO NOTHING;
    `, [hashedPassword]);


        console.log('База данных инициализирована успешно');
    } catch (err) {
        console.error('Ошибка инициализации базы данных:', err);
    } finally {
        client.release();
    }
};

// Запуск сервера после инициализации базы данных
const PORT = 3000;
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Сервер запущен: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Ошибка при запуске сервера:', err);
    });
