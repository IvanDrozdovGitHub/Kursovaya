const { Pool } = require('pg');
const path = require('path');

module.exports = (app, upload) => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'drive40',
        password: '21822',
        port: 5432,
    });

    app.post('/createDeal', async (req, res) => {
        const {
            first_name,
            surname,
            telephone_number,
            additional_services_id, // Это теперь массив
            user_id,
            vin_car,
            date_time_start,
            date_time_end,
        } = req.body;
    
        // Валидация входных данных
        if (!user_id || !vin_car || !date_time_start || !date_time_end) {
            return res.status(400).send('Все значения должны быть заполнены');
        }
    
        try {
            // Создание сделки
            const dealQuery = `
               INSERT INTO deals (user_id, vin_car, date_time_start, date_time_end, actual_date_time_end, status_penalty, total_amount)
VALUES ($1, $2, $3, $4, NULL, FALSE, NULL) RETURNING deal_id;
            `;
            
            const dealValues = [user_id, vin_car, date_time_start, date_time_end];
            
            const dealResult = await pool.query(dealQuery, dealValues);
            
            const dealId = dealResult.rows[0].deal_id;
    
            // Обработка дополнительных услуг
            if (Array.isArray(additional_services_id)) {
                const servicePromises = additional_services_id.map(serviceId => {
                    const serviceQuery = `
                        INSERT INTO deal_services (deal_id, additional_service_id)
                        VALUES ($1, $2);
                    `;
                    return pool.query(serviceQuery, [dealId, serviceId]);
                });
                
                await Promise.all(servicePromises); // Ждем завершения всех запросов на добавление услуг
            }
    
            res.status(201).send('Сделка успешно создана.'); // Успешный ответ с кодом 201
        } catch (error) {
            console.error(error);
            res.status(500).send(`Ошибка при создании сделки: ${error.message}`);
        }
    });
}