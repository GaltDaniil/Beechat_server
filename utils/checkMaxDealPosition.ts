import client from '../db.js';

export const maxDealPos = async (pipeline_id: number, stage_id: number): Promise<number | null> => {
    const query = `
        SELECT MAX(deal_position)
        FROM deals
        WHERE stage_id=$1 AND pipeline_id=$2
    `;

    const params = [stage_id, pipeline_id];
    const result = await client.query(query, params);

    return result.rows[0].max;
};
