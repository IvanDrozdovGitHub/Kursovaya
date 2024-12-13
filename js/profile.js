const path = require('path');
const session = require('express-session');
const { Pool } = require('pg');

module.exports = (app) => {
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'drive40',
    password: '21822',
    port: 5432,
});

app.use(session({
    secret: '21822',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

    app.get('/profile_deals2', async (req, res) => {
        const userId = req.session.user.user_id;
    
        if (!userId) {
            return res.status(401).json({ message: 'Пользователь не авторизован.' });
        }
    
        try {
            const dealsResult = await pool.query('SELECT * FROM deals WHERE user_id = $1', [userId]);
            const deals = dealsResult.rows;

            res.json({
                deals: deals
            });
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });
    
app.get('/profile', async (req, res) => {
    const userId = req.session.user.user_id;
    if (!userId) {
        return res.status(401).json({ message: 'Пользователь не авторизован.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).render('404', { message: 'Пользователь не найден.' });
        }

        const user = result.rows[0];

        const dealsResult = await pool.query('SELECT * FROM deals WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
        const deals = dealsResult.rows;

        const totalDealsResult = await pool.query('SELECT COUNT(*) FROM deals WHERE user_id = $1', [userId]);
        const totalDealsCount = parseInt(totalDealsResult.rows[0].count, 10);

        res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${user.first_name} ${user.surname}</title>
            <link rel="icon" href="/icons/favicon.ico" type="image/x-icon">
            <link rel="stylesheet" href="/css/main.css">
            <link rel="stylesheet" href="/css/table.css">
            <link rel="stylesheet" href="/css/catalog.css">
            <link rel="stylesheet" href="/css/catalog_car.css">
            <link rel="stylesheet" href="/css/profile.css">
            <script src="/js/scripts/auth.js"></script>
            <script src="/js/scripts/cancel_deal.js"></script>
        </head>
        <body>
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <div class="header-content" style="gap: 50px;">
                        <a href="/">
                            <img style="width: 190px;" src="/img/logo.png">
                        </a>
                        <nav class="header-nav">
                            <a class="button-link" href="/catalog">Аренда авто</a>
                            <a class="button-link" href="#contacts">Контакты</a>
                            <a class="button-link" href="#reviews">О нас</a>

                        </nav>
                    </div>
                    <div class="header-login button-link ">
                        <div id="auth-buttons" style="display: none;">
                            <a class="button-link" id="login-button" href="/login">Вход</a>
                            <a class="back-button-link" id="register-button" href="/registration">Регистрация</a>
                        </div>
                        <div id="user-cabinet" style="display: none;">
                            <a id="adm" style="display: none;" class="button-link" href="/menu_adm">Меню</a>
                            <a class="button-link" href="/profile">Личный кабинет</a>
                            <button class="back-button-link" id="logout-button">Выход</button>
                        </div>
                    </div>
                </div>  
            </div>
        </header>

        <div class="container"> 
            <div style="display:flex; padding:40px;">
                <div style="color:white; padding:20px; width: 40%;">
                    <h2>Информация о пользователе</h2>
                    <table class="table-shop" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th>Имя</th>
                            <td>${user.first_name}</td>
                        </tr>
                        <tr>
                            <th>Фамилия</th>
                            <td>${user.surname}</td>
                        </tr>
                        <tr>
                            <th>Отчество</th>
                            <td>${user.middlename || 'Не указано'}</td>
                        </tr>
                        <tr>
                            <th>Телефон</th>
                            <td>${user.telephone_number}</td>
                        </tr>
                    </table>

                    <!-- Edit Profile Link -->
                    <div style="margin-top: 20px; text-align: center;">
                        <a class="button-link" href="/editProfile/${userId}">
                            <h2 class="back-button-color" style="padding:20px 50px;">Редактировать профиль</h2>
                        </a>
                    </div>
                </div>

                <!-- Deals Table -->
                <div style="color:white; padding:20px; width: 60%;">
                    <h2 style="color:white;">История заказов</h2>
                    ${deals.length > 0 ? `
                    <table class="table-shop" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th>История заказов</th>
                                <th>Автомобиль</th>
                                <th>Дата начала</th>
                                <th>Дата окончания</th>
                                <th>Статус</th>
                                <th>Итоговая сумма</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="deal-table-body">
                            ${deals.map(deal => `
                                <tr>
                                    <td>${deal.deal_id}</td>
                                    <td><a href="/car/${deal.vin_car}">${deal.vin_car}</a></td>
                                    <td>${new Date(deal.date_time_start).toLocaleString()}</td>
                                    <td>${new Date(deal.date_time_end).toLocaleString()}</td>
                                    <td style="color: ${deal.status_deal === 'Отменено' ? 'red' : deal.status_deal === 'В процессе' ? 'orange' : deal.status_deal === 'Завершено' ? 'green' : 'white'};">${deal.status_deal || 'Не указано'}</td>
                                    <td>${deal.total_amount !== null ? deal.total_amount.toFixed(2) + ' руб.' : 'Не указана'}</td>
                                    <td>${deal.status_deal === 'Создана' ? `<a onclick="cancelDeal(${deal.deal_id})" class="save-status-button">Отменить</a>` : ''}</td> 
                                </tr>`).join('')}
                        </tbody>
                    </table>` : `
                    <p>У вас нет активных заказов.</p>`}

                    <!-- Pagination Controls -->
                    ${totalDealsCount > limit ? `
                    <div class="pagination" style="padding:10px;">
                        ${page > 1 ? `<a class="back-button-color" href="/profile?page=${page - 1}">Предыдущая</a>` : ''}
                        ${page * limit < totalDealsCount ? `<a class="back-button-color" href="/profile?page=${page + 1}">Следующая</a>` : ''}
                    </div>` : ''}
                </div>
            </div>  
        </div>

        <div id="contacts" class="back-image-footer" style="padding-top:100px;">
            <div class="container" style="padding-top: 0px;height: 400px">
                <div style="display: flex; flex-direction: column; gap:10px">
                    <span class="footer-text">КОНТАКТЫ</span>
                    <span class="footer-text2">Звоните по телефону</span>
                    <span class="footer-text3" style="padding-top: 10px;padding-bottom: 40px;">8 (800) 234-48-42</span>
                    <span style="color: #ffffff; font-family: Inter; font-size: 24px; margin-top: 250px;">г. Калуга, ул. Университетский Городок, 1/2, Калуга</span>
                    <span class="footer-text4">Мы работаем с 10:00 до 21:00</span>
                </div>
            </div>
        </div>

        <div style="position:relative;overflow:hidden;"><a href="https://yandex.ru/maps/org/moskovskiy_gosudarstvenny_tekhnicheskiy_universitet_imeni_n_e_baumana_kampus/207372973242/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:0px;">Московский государственный технический университет имени Н. Э. Баумана, кампус</a><a href="https://yandex.ru/maps/6/kaluga/category/university/184106140/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:14px;">ВУЗ в Калуге</a><iframe src="https://yandex.ru/map-widget/v1/?ll=36.305923%2C54.485975&mode=poi&poi%5Bpoint%5D=36.304176%2C54.486322&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D207372973242&z=16.89" width="100%" height="300" frameborder="1" allowfullscreen="true" style="position:relative;"></iframe></div>
    </body>
    </html>`);
    } catch (error) {
        console.error(error);
        res.redirect("/404");
    }
});
};