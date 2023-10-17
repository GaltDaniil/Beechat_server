import client from '../db.js';
import { Request, Response } from 'express';
import { maxDealPos } from '../utils/checkMaxDealPosition.js';

export const getcourseHook = async (req: Request, res: Response) => {
    console.log('Отработал GC hook с данными', req.query);
    try {
        const {
            subdomain,
            client_name,
            client_surname,
            client_phone,
            client_email,
            client_url,
            utm_campaign,
            utm_source,
            utm_medium,
            stage_id,
            deal_title,
            deal_price,
            deal_url,
            deal_num,
            deal_status,
            deal_pay_url,
            pipeline_id,
        } = req.query;

        const getAccountId = await client.query(
            `SELECT id 
        FROM clients
        WHERE company_name=$1`,
            [subdomain],
        );

        const custom_fields = {
            client_url,
        };
        let client_id;
        const isAlreadyClient = await client.query(
            `
        SELECT id FROM clients
        WHERE email=$1 OR phone=$2`,
            [client_email, client_phone],
        );
        console.log(isAlreadyClient.rows[0]);

        if (!isAlreadyClient.rows[0]) {
            const insertClientQuery = `
            INSERT INTO clients (name, surname, phone, email, account_id, utm_campaign, utm_source, utm_medium, custom_fields)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
          `;

            const newClient = await client.query(insertClientQuery, [
                client_name,
                client_surname,
                client_phone,
                client_email,
                getAccountId.rows[0].id || 1,
                utm_campaign,
                utm_source,
                utm_medium,
                custom_fields,
            ]);
            client_id = newClient.rows[0].id;
            console.log('пользователь создан');
        } else {
            console.log('пользователь уже существует');
            client_id = isAlreadyClient.rows[0].id;
        }

        let position;
        const maxPos = await maxDealPos(1, 1);

        if (maxPos) {
            position = maxPos + 65536;
        } else {
            position = 65536;
        }

        const deal_custom_fields = {
            deal_url,
            deal_num,
            deal_pay_url,
        };

        const insertDealQuery = `
            INSERT INTO deals (client_id, stage_id, pipeline_id, deal_status, deal_title, deal_price, deal_position, deal_custom_fields)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;

        await client.query(insertDealQuery, [
            client_id,
            Number(stage_id),
            Number(deal_status),
            pipeline_id,
            deal_title,
            Number(deal_price),
            position,
            deal_custom_fields,
        ]);
        console.log('сделка создана');

        res.status(200).send('Webhook обработан успешно');
    } catch (error) {
        console.error('Ошибка обработки webhook:', error);
        res.status(500).send('Ошибка обработки webhook');
    }
};
