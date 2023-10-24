import client from '../db.js';
import { Request, Response } from 'express';
import io, { Socket } from 'socket.io';
import { telegramBot } from '../server.js';

interface IRequest extends Request {
    body: {
        id: number;
        chat_id: string;
        text: string;
        from_client: string;
        message_id?: number;
        chat_type: string;
        messenger_id: number;
    };
}

/* export const ioMessageHandler = async (data) => {
    const newChat = await client.query(
        'INSERT INTO chats (chat_id, text, sended_at, beechat_session, from_client) values ($1, $2, $3, $4, $5) RETURNING *',
        [user_id, text, sended_at, beechat_session, from_client],
    );
}; */

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { chat_id } = req.query;
        const result = await client.query('SELECT * FROM messages WHERE chat_id = $1', [
            Number(chat_id),
        ]);
        const userData = result.rows;
        res.status(200).json(userData);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};

export const poolingMessage = async (req: IRequest, res: Response) => {
    try {
        const { message_id } = req.query;
        const query = `SELECT * FROM messages 
            WHERE id = $1`;
        const values = [message_id];
        const result = await client.query(query, values);
        const userData = result.rows[0];
        res.status(200).json(userData);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};
export const getMessageById = async (req: IRequest, res: Response) => {
    try {
        const { message_id } = req.query;
        const query = `SELECT * FROM messages 
            WHERE id = $1`;
        const values = [message_id];
        const result = await client.query(query, values);
        const userData = result.rows[0];
        res.status(200).json(userData);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};

export const sendMessage = async (req: IRequest, res: Response) => {
    try {
        const { text, chat_id, from_client, chat_type, messenger_id } = req.body;
        console.log(chat_id);

        const newMessage = await client.query(
            `
            WITH inserted_message AS (
                INSERT INTO messages (text, chat_id, from_client) 
                VALUES ($1, $2, $3)
                RETURNING *
            )
            , updated_chats AS (
                UPDATE chats
                SET is_hidden = false
                WHERE id = $2 AND is_hidden != false
                RETURNING *
            )
            SELECT inserted_message.*
            FROM inserted_message
        `,
            [text, chat_id, from_client],
        );
        if (chat_type === 'telegram') {
            //@ts-ignore
            telegramBot.sendMessage(messenger_id.toString(), text, { is_bot_message: true });
        }
        if (from_client) {
            telegramBot.sendMessage(680306494, `Новое сообщение из ${chat_type}`);
        }

        res.status(200).json(newMessage.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};

export const readOneMessage = async (req: IRequest, res: Response) => {
    try {
        const { id } = req.params;
        const queryText = `UPDATE messages
        SET is_readed = true
        WHERE id = $1
        RETURNING *`;
        const values = [id];

        const newMessage = await client.query(queryText, values);
        res.status(200).json(newMessage.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};

export const readManyMessages = async (req: IRequest, res: Response) => {
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
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};
