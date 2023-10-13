import client from '../db.js';
export const getPipelines = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await client.query(`
        SELECT * FROM pipelines
        WHERE account_id=${id}`);
        res.status(200).json(result.rows);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении воронок по id аккаунта');
    }
};
export const createPipeline = async (req, res) => {
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
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при получении сделки');
    }
};
