import client from '../db.js';
import { Request, Response } from 'express';

export const getStages = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await client.query(`
        SELECT * FROM stages
        WHERE pipeline_id=${id}`);
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении стадий по id воронки');
    }
};

export const getManyStages = async (req: Request, res: Response) => {
    try {
        const { pipeline_ids } = req.body;
        console.log(req.body);
        const result = await client.query(
            `
        SELECT * FROM stages
        WHERE pipeline_id =ANY($1)`,
            [pipeline_ids],
        );
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении стадий по id воронки');
    }
};

// НЕ ГОТОВО ЕЩЕ

export const createStage = async (req: Request, res: Response) => {
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
