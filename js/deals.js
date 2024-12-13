const { Pool } = require('pg');
const path = require('path');

const isModerAndIsAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.user_status === 'admin' || req.session.user.user_status === 'moder')) {
        next();
    } else {
        res.redirect('/404');
    }
};

module.exports = (app, upload) => {
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'drive40',
    password: '21822',
    port: 5432,
});

app.get('/getDealsByUser/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const query = `
        SELECT 
            d.deal_id,
            d.created_at,
            d.user_id,
            d.vin_car,
            u.surname,
            u.first_name,
            u.middlename, 
            u.telephone_number,
            COALESCE(json_agg(json_build_object('service_name', ads.service_name, 'price', ads.price)) 
                    FILTER (WHERE ads.service_name IS NOT NULL), '[]') AS additional_services,
            d.additional_text,
            d.date_time_start,
            d.date_time_end,
            d.actual_date_time_end,
            d.status_penalty,
            d.status_pledge,
            d.total_amount,
            d.status_deal
        FROM 
            deals d
        JOIN 
            users u ON d.user_id = u.user_id
        JOIN 
            cars c ON d.vin_car = c.vin_car
        LEFT JOIN 
            deal_services ds ON d.deal_id = ds.deal_id
        LEFT JOIN 
            additional_services ads ON ds.additional_service_id = ads.additional_service_id
            d.deal_id = $1
        GROUP BY 
            d.deal_id,
            d.created_at,
            u.user_id, 
            u.first_name, 	
            u.surname, 
            u.middlename,
            u.telephone_number, 
            c.vin_car,
            d.date_time_start,
            d.date_time_end,
            d.actual_date_time_end,
            d.status_penalty,
            d.status_pledge,
            d.total_amount,
            d.status_deal
        ORDER BY d.deal_id DESC;
            `;
        const result = await pool.query(query, [userId]);
        if (result.rows.length === 0) {
            return res.status(404).send('Сделки не найдены для данного пользователя.');
        }
        console.log(result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка при получении данных по сделкам: ${error.message}`);
    }
});

app.post('/createDeal', async (req, res) => {
    const {
        first_name,
        surname,
        telephone_number,
        additional_services_id,
        user_id,
        vin_car,
        date_time_start,
        date_time_end,
        additional_text
    } = req.body;
    if (!user_id || !vin_car || !date_time_start || !date_time_end) {
        console.log('Ошибка: Все значения должны быть заполнены');
        return res.status(400).send('Все значения должны быть заполнены');
    }
    
    try {
        console.log('Получение залога и цены за день для автомобиля с VIN:', vin_car);

        const carQuery = `
        SELECT pledge_car, price_per_day FROM cars WHERE vin_car = $1;
        `;
        const carResult = await pool.query(carQuery, [vin_car]);
        
        if (carResult.rows.length === 0) {
            console.log('Ошибка: Автомобиль не найден.');
            return res.status(404).send('Автомобиль не найден.');
        }
    
        const { pledge_car, price_per_day } = carResult.rows[0];
        console.log(`Залог: ${pledge_car}, Цена за день: ${price_per_day}`);

        const startDate = new Date(date_time_start);
        const endDate = new Date(date_time_end);
        const timeDifference = endDate - startDate;
        const daysCount = Math.ceil(timeDifference / (1000 * 3600 * 24));
        console.log(`Количество дней аренды: ${daysCount}`);

        let additionalServicesTotal = 0;
    
        if (Array.isArray(additional_services_id)) {
            const servicePrices = {
                '1': 1500,
                '2': 7000,
                '3': 10000
            };
    
            additionalServicesTotal = additional_services_id.reduce((total, serviceId) => {
                const servicePrice = servicePrices[serviceId] || 0;
                console.log(`Добавление стоимости услуги ID ${serviceId}: ${servicePrice}`);
                return total + servicePrice;
            }, 0);
            console.log(`Общая сумма дополнительных услуг: ${additionalServicesTotal}`);
        }

        const total_amount = Number(pledge_car) + (Number(price_per_day) * Number(daysCount)) + Number(additionalServicesTotal);
        console.log(`Общая сумма сделки: ${total_amount}`);
    
        const dealQuery = `
            INSERT INTO deals (user_id, vin_car, date_time_start, date_time_end, actual_date_time_end, status_penalty, status_pledge,total_amount, status_deal, additional_text)
            VALUES ($1, $2, $3, $4, NULL, FALSE, TRUE, $5, 'Создана', $6) RETURNING deal_id;
        `;
            
        const dealValues = [user_id, vin_car, date_time_start, date_time_end, total_amount, additional_text];
        console.log('Создание сделки с параметрами:', dealValues);
        const dealResult = await pool.query(dealQuery, dealValues);
        const dealId = dealResult.rows[0].deal_id;
        console.log(`Сделка успешно создана с ID: ${dealId}`);

        if (Array.isArray(additional_services_id)) {
            const servicePromises = additional_services_id.map(serviceId => {
                const serviceQuery = `
                    INSERT INTO deal_services (deal_id, additional_service_id)
                    VALUES ($1, $2);
                `;
                console.log(`Добавление услуги ID ${serviceId} к сделке ID ${dealId}`);
                return pool.query(serviceQuery, [dealId, serviceId]);
            });
            
            await Promise.all(servicePromises);
            console.log(`Все дополнительные услуги успешно добавлены к сделке ID ${dealId}`);
        }
            res.redirect('/profile')
        } catch (error) {
            console.error('Ошибка при создании сделки:', error.message);
            res.status(500).send(`Ошибка при создании сделки: ${error.message}`);
        }
    });

    app.get('/all_deal_now',isModerAndIsAdmin, async (req, res) => {
        try {
            const query = `
            SELECT 
                d.deal_id,
                d.created_at,
                d.user_id,
                d.vin_car,
                u.surname,
                u.first_name,
                u.middlename, 
                u.telephone_number,
                COALESCE(json_agg(json_build_object('service_name', ads.service_name, 'price', ads.price)) 
                        FILTER (WHERE ads.service_name IS NOT NULL), '[]') AS additional_services,
                d.additional_text,
                d.date_time_start,
                d.date_time_end,
                d.actual_date_time_end,
                d.status_penalty,
                d.status_pledge,
                d.total_amount,
                d.status_deal
            FROM 
                deals d
            JOIN 
                users u ON d.user_id = u.user_id
            JOIN 
                cars c ON d.vin_car = c.vin_car
            LEFT JOIN 
                deal_services ds ON d.deal_id = ds.deal_id
            LEFT JOIN 
                additional_services ads ON ds.additional_service_id = ads.additional_service_id
            WHERE 
                d.status_deal IN ('Создана', 'В процессе')
            GROUP BY 
                d.deal_id,
                d.created_at,
                u.user_id, 
                u.first_name, 	
                u.surname, 
                u.middlename,
                u.telephone_number, 
                c.vin_car,
                d.date_time_start,
                d.date_time_end,
                d.actual_date_time_end,
                d.status_penalty,
                d.status_pledge,
                d.total_amount,
                d.status_deal
                ORDER BY d.deal_id DESC;
            `;
            
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return res.status(404).send('Сделки не найдены.');
        }
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка при получении данных о сделках: ${error.message}`);
    }
});

app.get('/all_deal',isModerAndIsAdmin, async (req, res) => {
    try {
        const query = `
        SELECT 
            d.deal_id,
            d.created_at,
            d.user_id,
            d.vin_car,
            u.surname,
            u.first_name,
            u.middlename, 
            u.telephone_number,
            COALESCE(json_agg(json_build_object('service_name', ads.service_name, 'price', ads.price)) 
                    FILTER (WHERE ads.service_name IS NOT NULL), '[]') AS additional_services,
            d.additional_text,
            d.date_time_start,
            d.date_time_end,
            d.actual_date_time_end,
            d.status_penalty,
            d.status_pledge,
            d.total_amount,
            d.status_deal
        FROM 
            deals d
        JOIN 
            users u ON d.user_id = u.user_id
        JOIN 
            cars c ON d.vin_car = c.vin_car
        LEFT JOIN 
            deal_services ds ON d.deal_id = ds.deal_id
        LEFT JOIN 
            additional_services ads ON ds.additional_service_id = ads.additional_service_id
        /*WHERE 
            d.deal_id = $1*/ -- Замените на актуальный идентификатор сделки для тестирования
        GROUP BY 
            d.deal_id,
            d.created_at,
            u.user_id, 
            u.first_name, 	
            u.surname, 
            u.middlename,
            u.telephone_number, 
            c.vin_car,
            d.date_time_start,
            d.date_time_end,
            d.actual_date_time_end,
            d.status_penalty,
            d.status_pledge,
            d.total_amount,
            d.status_deal
            ORDER BY d.deal_id DESC;
        `;
        
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).send('Сделки не найдены.');
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка при получении данных о сделках: ${error.message}`);
    }
});

app.get('/dealsByUser', isModerAndIsAdmin, async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ message: 'Запрос не может быть пустым' });
    }

    try {

        const userResult = await pool.query(
            'SELECT user_id FROM users WHERE surname ILIKE $1 OR first_name ILIKE $1 OR middlename ILIKE $1 OR login_user ILIKE $1 OR telephone_number ILIKE $1',
            [`%${query}%`]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        const userIds = userResult.rows.map(user => user.user_id);

        const dealQuery = `
        SELECT 
            d.deal_id,
            d.created_at,
            d.user_id,
            u.surname,
            u.first_name,
            u.middlename, 
            u.telephone_number,
            d.vin_car,
            COALESCE(json_agg(json_build_object('service_name', ads.service_name, 'price', ads.price)) 
                    FILTER (WHERE ads.service_name IS NOT NULL), '[]') AS additional_services,
            d.additional_text,
            d.date_time_start,
            d.date_time_end,
            d.actual_date_time_end,
            d.status_penalty,
            d.total_amount,
            d.status_deal
        FROM 
            deals d
        JOIN 
            users u ON d.user_id = u.user_id
        JOIN 
            cars c ON d.vin_car = c.vin_car
        LEFT JOIN 
            deal_services ds ON d.deal_id = ds.deal_id
        LEFT JOIN 
            additional_services ads ON ds.additional_service_id = ads.additional_service_id
        WHERE 
            d.user_id = ANY($1::int[]) -- Используем массив для фильтрации по нескольким user_id
        GROUP BY 
            d.deal_id,
            d.created_at, 
            u.user_id, 
            u.first_name, 	
            u.surname, 
            u.middlename,
            u.telephone_number, 
            c.vin_car,
            d.date_time_start,
            d.date_time_end,
            d.actual_date_time_end,
            d.status_penalty,
            d.total_amount;
        `;

        const dealsResult = await pool.query(dealQuery, [userIds]);

        if (dealsResult.rows.length === 0) {
            return res.status(404).send('Сделки не найдены для данного пользователя.');
        }

        res.json(dealsResult.rows); 
    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка при получении данных о сделках: ${error.message}`);
    }
});
}