import client from '../db.js';
import { Request, Response } from 'express';

export const getDeals = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await client.query(`
        SELECT * FROM deals
        WHERE stage_id=${id}`);
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении сделки');
    }
};

export const getManyDeals = async (req: Request, res: Response) => {
    try {
        const { stage_ids } = req.body;
        console.log(req.body);
        const result = await client.query(
            `
        SELECT deals.*, 
            clients.avatar AS client_avatar, 
            clients.name AS client_name, 
            clients.surname AS client_surname, 
            clients.email AS client_email, 
            clients.phone AS client_phone, 
            clients.custom_fields AS client_custom_fields 
        FROM deals
        JOIN clients ON deals.client_id = clients.id
        WHERE stage_id = ANY($1)`,
            [stage_ids],
        );
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении сделки');
    }
};
export const updateOneDeal = async (req: Request, res: Response) => {
    try {
        const { id, stage_id, deal_order } = req.body;
        let result;
        if (stage_id && deal_order) {
            // Если предоставлены и stage_id, и order
            result = await client.query(
                `
                UPDATE deals
                SET stage_id = $2, deal_order = $3
                WHERE id = $1`,
                [id, stage_id, deal_order],
            );
        } else if (stage_id) {
            // Если предоставлен только stage_id
            result = await client.query(
                `
                UPDATE deals
                SET stage_id = $2
                WHERE id = $1`,
                [id, stage_id],
            );
        } else if (deal_order) {
            // Если предоставлен только order
            console.log('Прошел запрос на смену ордера');
            console.log(deal_order);
            result = await client.query(
                `
                UPDATE deals
                SET deal_order = $2
                WHERE id = $1`,
                [id, deal_order],
            );
        } else {
            res.status(400).send('Не предоставлены данные для обновления.');
            return;
        }

        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка обновлении сделки');
    }
};

export const createDealFromGetcourse = async (req: Request, res: Response) => {
    try {
        const { product_title, deal_cost } = req.params;

        res.status(200).json();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении сделки');
    }
};

export const createDeal = async (req: Request, res: Response) => {
    try {
        const { title, price, clientId, stageId } = req.body;
        const query = `
        INSERT INTO deals
        (deal_title, deal_price, client_id, stage_id)
        values ($1, $2, $3, $4)
        `;
        const params = [title, price, clientId, stageId];
        await client.query(query, params);

        res.status(200).json();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении сделки');
    }
};

/* deal_number;
product_title;
product_description;
deal_cost;
deal_status;
deal_created_at;
deal_finished_at; */
