const express = require('express');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const cors = require('cors'); // Не забудьте импортировать cors
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'drive40',
    password: '21822',
    port: 5432,
});

const app = express();
app.use(express.static('static'));
app.use('/js', express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка CORS
app.use(cors({
    origin: "http://localhost:3000", // ваш клиентский адрес
    methods: ["GET", "POST"],
    credentials: true // Позволяет отправлять куки
}));

// Настройка сессий
app.use(session({
    secret: '21822', // Замените на ваш секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Установите true, если используете HTTPS
}));

// Эндпоинт для проверки аутентификации
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) { // Проверяем наличие информации о пользователе в сессии
        return res.json({ isAuthenticated: true });
    }
    res.json({ isAuthenticated: false });
});


const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.user_status === 'admin') { // Проверяем наличие пользователя и его статус
        next(); // Пользователь аутентифицирован и является администратором, продолжаем
    } else {
        res.redirect('/404');// 403 Forbidden
    }
};

const isModer = (req, res, next) => {
    if (req.session.user && req.session.user.user_status === 'moder') { // Проверяем наличие пользователя и его статус
        next(); // Пользователь аутентифицирован и является администратором, продолжаем
    } else {
        res.redirect('/404'); // 403 Forbidden
    }
};

// Маршруты для HTML страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'registration.html'));
});

app.get('/download_car', isAdmin,(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'download_car.html'));
});

app.get('/all_car',isAdmin,(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'all_car.html'));
});

app.get('/deals', isAdmin || isModer,(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'deals.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'catalog.html'));
});

app.get('/car', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'car.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Настройка multer для загрузки файлов в память
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Импорт маршрутов
require('./download.js')(app, upload); 
require('./registration.js')(app); 
require('./catalog.js')(app);
require('./delete.js')(app);
require('./edit.js')(app, upload);
require('./deals.js')(app);
// Обработка 404 ошибок
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});