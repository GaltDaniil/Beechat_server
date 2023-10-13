import client from '../db.js';
import { telegramBot } from '../server.js';
export const getChat = async (req, res) => {
    try {
        const chat_id = req.params.id;
        //@ts-ignore
        const result = await client.query(`SELECT * FROM chats 
            WHERE id = $1`, [chat_id]);
        console.log('данные чата переданы');
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500);
        res.status(502).send('ошибка при получении чата');
    }
};
export const getAllChatsWithUnread = async (req, res) => {
    try {
        const query = `
    SELECT
        chats.*,
        m.text AS last_message,
        m.sended_at last_message_sended_at,
        (
            SELECT COUNT(*)
            FROM messages
            WHERE chat_id = chats.id AND is_readed = false AND from_client = true
        ) AS unread_messages_count,
        clients.name AS client_name, 
        clients.phone AS client_phone, 
        clients.email AS client_email,
        clients.avatar AS avatar,
        clients.custom_fields AS client_custom_fields
    FROM
        chats
    LEFT JOIN
        clients ON chats.client_id = clients.id
    LEFT JOIN LATERAL (
        SELECT
            m.text,
            m.sended_at
        FROM
            messages m
        WHERE
            m.chat_id = chats.id
        ORDER BY
            m.sended_at DESC
        LIMIT 1
        ) AS m ON true
    ORDER BY
        last_message_sended_at DESC;
    `;
        //@ts-ignore
        const result = await client.query(query);
        res.status(200).json(result.rows);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};
export const getAllChats = async (req, res) => {
    try {
        const query3 = `
    SELECT
        chats.*,
        m.text AS last_message,
        m.sended_at last_message_sended_at,
        clients.name AS client_name, 
        clients.phone AS client_phone, 
        clients.email AS client_email, 
        clients.avatar AS client_avatar,
        clients.custom_fields AS client_custom_fields 
    FROM
        chats
    LEFT JOIN
        clients ON chats.client_id = clients.id
    LEFT JOIN LATERAL (
        SELECT
            m.text,
            m.sended_at
        FROM
            messages m
        WHERE
            m.chat_id = chats.id
        ORDER BY
            m.sended_at DESC
        LIMIT 1
        ) AS m ON true
    ORDER BY
        last_message_sended_at DESC;
    `;
        //@ts-ignore
        const result = await client.query(query3);
        res.status(200).json(result.rows);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка получения чатов');
    }
};
export const createChat = async (req, res) => {
    try {
        const { account_id, from_messenger } = req.body;
        console.log(account_id);
        const created_at = new Date();
        const avatarUrl = `imgs/defaultAvatars/${Math.floor(Math.random() * 17) + 1}.png`;
        const query = `INSERT INTO chats 
        (account_id, from_messenger, avatar) 
        values ($1, $2, $3) 
        RETURNING *;`;
        const params = [account_id, from_messenger, avatarUrl];
        const result = await client.query(query, params);
        telegramBot.sendMessage(680306494, `Новое сообщение с сайта`);
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при создании чата');
    }
};
export const deleteChat = async (req, res) => {
    const chat_id = req.params.id;
    try {
        await client.query(`
        DELETE FROM messages
        WHERE chat_id=$1`, [chat_id]);
        const result = await client.query(`
        DELETE FROM chats
        WHERE id=$1
        RETURNING *`, [chat_id]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(502).send('ошибка при удалении чата');
    }
};
