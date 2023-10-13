import client from '../db.js';
import { telegramBot } from '../server.js';
/* export const ioMessageHandler = async (data) => {
    const newChat = await client.query(
        'INSERT INTO chats (chat_id, text, sended_at, beechat_session, from_client) values ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, text, sended_at, beechat_session, from_client],
    );
}; */
export const getMessages = async (req, res) => {
    try {
        const { chat_id } = req.query;
        const result = await client.query('SELECT * FROM messages WHERE chat_id = $1', [
            Number(chat_id),
        ]);
        const userData = result.rows;
        res.status(200).json(userData);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};
export const poolingMessage = async (req, res) => {
    try {
        const { message_id } = req.query;
        const query = `SELECT * FROM messages 
            WHERE id = $1`;
        const values = [message_id];
        const result = await client.query(query, values);
        const userData = result.rows[0];
        res.status(200).json(userData);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};
export const getMessageById = async (req, res) => {
    try {
        const { message_id } = req.query;
        const query = `SELECT * FROM messages 
            WHERE id = $1`;
        const values = [message_id];
        const result = await client.query(query, values);
        const userData = result.rows[0];
        res.status(200).json(userData);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};
export const sendMessage = async (req, res) => {
    try {
        const { text, chat_id, from_client, telegram_id } = req.body;
        console.log(chat_id);
        const queryText = `INSERT INTO 
        messages (text, chat_id, from_client) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
        const values = [text, chat_id, from_client];
        const newMessage = await client.query(queryText, values);
        console.log('telegram_id ', telegram_id);
        if (telegram_id) {
            //@ts-ignore
            telegramBot.sendMessage(telegram_id, text, { is_bot_message: true });
        }
        res.status(200).json(newMessage.rows[0]);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};
export const readOneMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const queryText = `UPDATE messages
        SET is_readed = true
        WHERE id = $1
        RETURNING *`;
        const values = [id];
        const newMessage = await client.query(queryText, values);
        res.status(200).json(newMessage.rows[0]);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};
export const readManyMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const queryText = `
            UPDATE messages
            SET is_readed = true
            WHERE chat_id = $1
            RETURNING *`;
        const values = [id];
        const newMessage = await client.query(queryText, values);
        res.status(200).json(newMessage.rows);
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};
