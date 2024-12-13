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

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(session({
    secret: '21822',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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


const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.user_status === 'admin') {
        next();
    } else {
        res.redirect('/404');
    }
};

const isModerAndIsAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.user_status === 'admin' || req.session.user.user_status === 'moder')) {
        next();
    } else {
        res.redirect('/404');
    }
};


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'registration.html'));
});

app.get('/download_car', isAdmin,(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'download_car.html'));
});

app.get('/all_car',isModerAndIsAdmin,(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'all_car.html'));
});

app.get('/deals', isModerAndIsAdmin,(req, res) => {
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

app.get('/menu_adm',isModerAndIsAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'menu_adm.html'));
});

app.get('/deals_now',isModerAndIsAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'deals_now.html'));
});

app.get('/users', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'users.html'));
});
  
const storage = multer.memoryStorage();
const upload = multer({ storage });

require('./download.js')(app, upload); 
require('./registration.js')(app); 
require('./catalog.js')(app);
require('./delete.js')(app);
require('./edit.js')(app, upload);
require('./deals.js')(app);
require('./profile.js')(app);
require('./users.js')(app);

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', '404.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});