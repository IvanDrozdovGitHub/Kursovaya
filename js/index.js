const express = require('express');
const multer = require('multer');
const path = require('path');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'registration.html'));
});

app.get('/download_car', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'download_car.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'catalog.html'));
});

app.get('/car', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'car.html'));
});


const storage = multer.memoryStorage();
const upload = multer({ storage });

const greet = require('./download.js')(app, upload); 

const greet2 = require('./registration.js')(app); 

const greet3 = require('./catalog.js')(app); 

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
