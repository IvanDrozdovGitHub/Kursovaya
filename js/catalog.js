const { Pool } = require('pg');

module.exports = (app) => {

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '21822',
    port: 5432,
});

app.get('/occupied_dates/:vin', async (req, res) => {
    const vin = req.params.vin;
    try {
        const result = await pool.query(`
            SELECT date_time_start, date_time_end FROM deals 
            WHERE vin_car = $1`, [vin]);
         res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при получении занятых дат.');
    }
});
    
app.get('/search_cars', async (req, res) => {
    const query = req.query.query;
    try {
        const result = await pool.query(
            'SELECT * FROM cars WHERE vin_car ILIKE $1 OR make_car ILIKE $1 OR model_car ILIKE $1 ORDER BY make_car ASC;',
            [`%${query}%`]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при выполнении поиска');
    }
});
    

app.get('/cars_present', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cars ORDER BY make_car ASC;');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(404).send(`Ошибка при получении списка автомобилей: ${error.message}`);
    }
});

app.get('/image/:vin', async (req, res) => {
    const vin = req.params.vin;
    try {
        const result = await pool.query('SELECT photo_car FROM cars WHERE VIN_car = $1', [vin]);
        if (result.rows.length === 0) {
            return res.status(404).send('Изображение не найдено.');
        }
        const imageBuffer = result.rows[0].photo_car;
        res.set('Content-Type', 'image/jpeg');
        res.send(imageBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при получении изображения.');
    }
});

app.get('/car/:vin', async (req, res) => {
    const vin = req.params.vin;
    try {
        const result = await pool.query('SELECT * FROM cars WHERE vin_car = $1', [vin]);
        if (result.rows.length === 0) 
        {
            res.status(404).render();
        }
        const pricePerDay = Number(result.rows[0].price_per_day);
        const pledgeCar = Number(result.rows[0].pledge_car)
        const formattedPrice = isNaN(pricePerDay) ? 'N/A' : pricePerDay.toLocaleString('ru-RU');
        const formattedPledge = isNaN(pledgeCar) ? 'N/A' : pledgeCar.toLocaleString('ru-RU');

        res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title> ${result.rows[0].make_car} ${result.rows[0].model_car} - Drive40</title>
            <link rel="icon" href="/icons/favicon.ico" type="image/x-icon">
            <link rel="stylesheet" href="/css/main.css">
            <link rel="stylesheet" href="/css/table.css">
            <link rel="stylesheet" href="/css/catalog.css">
            <link rel="stylesheet" href="/css/catalog_car.css">
            <script rel="stylesheet" src="/js/scripts/scroll.js"></script> 
            <script rel="stylesheet" src="/js/scripts/catalog_deals.js"></script> 
            <script rel="stylesheet" src="/js/scripts/telephone.js"></script>
            <script rel="stylesheet" src="/js/scripts/data.js"></script>
        </head>
        <body>
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <div class="header-content" style="gap: 50px;">
                            <a href="/">
                                <img style="width: 190px;" src="../img/logo.png">
                            </a>
                            <nav class="header-nav">
                                <a class="button-link" href="/catalog">Аренда авто</a>
                                <a class="button-link" href="#contacts">Контакты</a>
                                <a class="button-link" href="#reviews">О нас</a>
                            </nav>
                        </div>
                    <div class="header-login button-link ">
                        <div id="auth-buttons"style="display: none;">
                            <a class="button-link" id="login-button" href="/login">Вход</a>
                            <a class="back-button-link" id="register-button" href="/registration">Регистрация</a>
                        </div>
                        <div id="user-cabinet" style="display: none;">
                            <a class="button-link" href="/profile">Личный кабинет</a>
                            <button class="back-button-link" id="logout-button">Выход</button>
                        </div>
                    </div>
                </div>  
            </div>
        </header>
        <main>
            <div class="container"> 
                <div style="display:flex;">
                    <div style="padding:20px;">
                        <div style="margin: 0px 0px 20px 0px">
                            <a class="back-button-color" href="javascript:void(0);" onclick="window.history.back();">Назад</a>
                        </div>
                        <div>
                            <img style="width:900px;" src="/image/${vin}" alt="${result.rows[0].make_car} ${result.rows[0].model_car}">
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; color:white; padding:60px 20px; width: 100%;">
                        <div class="car-info">
                            <div class="car-make">
                                <h2>${result.rows[0].make_car} ${result.rows[0].model_car}</h2>
                            </div>
                            <div class="car-model">
                                <p>от ${formattedPrice}₽ <span style="font-size: 27px;  font-weight:lighter">/ сутки </span></p>
                            </div>
                        </div>
                        <table class="table-shop" style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th>Пробег</th>
                                <td><p>${result.rows[0].mileage_car} км</p></td>
                            </tr>
                            <tr>
                                <th>Год выпуска</th>
                                <td><p>${result.rows[0].year_of_manufacture_car}</p></td>
                            </tr>
                            <tr>
                                <th>Объем двигателя</th>
                                <td><p>${result.rows[0].engine_car} л</p></td>
                            </tr>
                            <tr>
                                <th>Мощность</th>
                                <td><p>${result.rows[0].max_power} л.с.</p></td>
                            </tr>
                            <tr>
                                <th>Макс. скорость</th>
                                <td><p>${result.rows[0].max_speed} км/ч</p></td>
                            </tr>
                            <tr>
                                <th>Привод</th>
                                <td><p>${result.rows[0].drive_car}</p></td>
                            </tr>
                            <tr>
                                <th>Залог</th>
                                <td><p>${formattedPledge}₽</p></td>
                            </tr>
                        </table>
                        <div class="car-make"style="margin:50px 0px; text-align: center;">
                            <a class="button-link"  href="#contacts"> <h2 class="back-button-color" style="padding:20px 50px;">Связаться</h2> </a>
                        </div>
                    </div>
                </div>  
            </div> 
            
            <div id="deals-form" class="container" style="padding-bottom:100px; color: white;">
            <h2>Создание сделки</h2>
            <form action="/createDeal" method="POST" enctype="application/x-www-form-urlencoded">
                <div class="form-container">
                    <div class="form-column" style="width: 500px;">
                        <div class="form-group">
                            <label for="first_name">Имя:</label>
                            <input type="text" id="first_name" name="first_name" required>
                        </div>
                        <div class="form-group">
                            <label for="surname">Фамилия:</label>
                            <input type="text" id="surname" name="surname" required>
                        </div>
                        <div class="form-group">
                            <label for="telephone_number">Номер телефона:</label>
                            <input type="text" id="telephone_number" name="telephone_number" required>
                        </div>
                    </div> 
                    <div class="form-column" style="width: 500px;">
                        <div class="form-group">
                            <label>Выберите дополнительные услуги:</label>
                            <div>
                                <input type="checkbox" id="service_1" name="additional_services_id[]" value="1" onchange="updateTotal();toggleAdditionalText();">
                                <label for="service_1">Детское кресло - 1 500₽</label>
                            </div>
                            <div>
                                <input type="checkbox" id="service_2" name="additional_services_id[]" value="2" onchange="updateTotal();toggleAdditionalText();">
                                <label for="service_2">Доставка автомобиля - 7 000₽</label>
                            </div>
                            <div>
                                <input type="checkbox" id="service_3" name="additional_services_id[]" value="3" onchange="updateTotal();toggleAdditionalText();">
                                <label for="service_3">Возврат автомобиля - 10 000₽</label>
                            </div>
                        </div>
                        <textarea id="additional_text" name="additional_text" style="display:none;" rows="4"></textarea>
                    </div>
                    <div class="form-column" style="width: 500px;">
                        <!-- Скрытое поле для ID пользователя -->
                        <input type="hidden" id="user_id" name="user_id" value=""> 

                        <!-- Скрытое поле для VIN автомобиля -->
                        <input type="hidden" id="vin_car" name="vin_car" value="${vin}"> 
                    
                        <div class="form-group">
                            <label for="date_time_start">Дата и время начала:</label>
                            <input type="datetime-local" id="date_time_start" name="date_time_start" required>
                        </div>
                        <div class="form-group">
                            <label for="date_time_end">Дата и время окончания:</label>
                            <input type="datetime-local" id="date_time_end" name="date_time_end" required>
                        </div>
                        <div id="days_count">Количество дней: 0 дн.</div>

                        <h2>Итоговая сумма (с учётом залога): <span id="total_amount" value="total_amount">0₽</span></h3>

                        <button type="submit">Создать сделку</button>
                    </div>
                </div>
            </form>
        </div>

        <script>
            const pledgeAmount = ${result.rows[0].pledge_car};
            const pricePerDay = ${result.rows[0].price_per_day};

            function updateTotal() {
                    const servicePrices = {
                        '1': 1500, // Цена для услуги 1
                        '2': 7000, // Цена для услуги 2
                        '3': 10000 // Цена для услуги 3
                    };
                let additionalServicesTotal = 0;
                const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
                checkboxes.forEach((checkbox) => {
                    const servicePrice = servicePrices[checkbox.value];
                    if (servicePrice) {
                        additionalServicesTotal += servicePrice;
                    }
                });

                const startDate = document.getElementById('date_time_start').value;
                const endDate = document.getElementById('date_time_end').value;
                let daysCount = 0;

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const timeDifference = end - start;
                    daysCount = Math.ceil(timeDifference / (1000 * 3600 * 24));
                }
                const total = pledgeAmount + (pricePerDay * daysCount) + additionalServicesTotal;

                document.getElementById('total_amount').innerText = total + '₽';
            }

            document.querySelectorAll('input[type=checkbox]').forEach((checkbox) => {
                checkbox.addEventListener('change', updateTotal);
            });

            document.getElementById('date_time_start').addEventListener('change', updateTotal);
            document.getElementById('date_time_end').addEventListener('change', updateTotal);

            updateTotal();
        </script>
            
            <div class="main">
                <div id="reviews" class="container">
                    <span class="text-reviews-z" href="#">ОТЗЫВЫ НАШИХ КЛИЕНТОВ</span>
                    <div class="text-position container-text">
                        <div style="margin:50px;justify-content:center;width:500px;height:600px;overflow:hidden;position:relative;"><iframe style="width:100%;height:100%;border:1px solid #e6e6e6;border-radius:8px;box-sizing:border-box" src="https://yandex.ru/maps-reviews-widget/207372973242?comments"></iframe><a href="https://yandex.ru/maps/org/moskovskiy_gosudarstvenny_tekhnicheskiy_universitet_imeni_n_e_baumana_kampus/207372973242/" target="_blank" style="box-sizing:border-box;text-decoration:none;color:#b3b3b3;font-size:10px;font-family:YS Text,sans-serif;padding:0 20px;position:absolute;bottom:8px;width:100%;text-align:center;left:0;overflow:hidden;text-overflow:ellipsis;display:block;max-height:14px;white-space:nowrap;padding:0 16px;box-sizing:border-box">Московский государственный технический университет имени Н. Э. Баумана, кампус на карте Калуги — Яндекс Карты</a></div>
                        <div class="text-content" style="margin-top:40px; max-height: 600px;">
                            <p style="padding: 10px;">Пожалуйста, поделитесь своим опытом взаимодействия с нашим персоналом, качеством предоставляемой информации об автомобилях в аренду, ценовой политикой и общим впечатлением от посещения нашего автосалона.                    </p>
                            <p style="padding: 10px;">Мы будем благодарны за любые отзывы: положительные, если вы остались довольны, и конструктивные, если у вас есть предложения по улучшению. Вы можете оставить отзыв на картах, через наш официальный веб-сайт по кнопке «Оставить отзыв», в социальных сетях или на той площадке, где узнали о нашей услуге аренды автомобилей.</p>
                            <p style="padding: 10px;">Мы обязательно изучим каждый отзыв и примем меры в соответствии с вашими комментариями. Спасибо за вашу поддержку и интерес к нашей услуге! Мы ценим ваше мнение и будем рады видеть вас снова.</p>                    
                            <p style="padding: 10px;">С уважением, команда аренды автомобилей DRIVE 40.</p>
                        </div>
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
            
        </main>
        </body>
        </html>
        `)
    } 
    catch (error) 
    {
        console.error(error);
        res.redirect("/404");
    }
});
}

