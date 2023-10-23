import client from '../db.js';
import { Request, Response } from 'express';
import io, { Socket } from 'socket.io';
import { telegramBot } from '../server.js';

interface IMessage {
    userId: number;
    text: string;
    chat_id: string;
    from_client: string;
}

interface IioData {
    beechat_session: string;
    account_id: number;
    text?: string;
    from_client?: boolean;
    fromUrl: string;
}

export const getChat = async (req: Request, res: Response) => {
    try {
        const messenger_id = req.params.id;
        const chat_type = 'beeChat';
        //@ts-ignore
        const result = await client.query(
            `SELECT * FROM chats 
            WHERE messenger_id = $1 AND chat_type = $2`,
            [messenger_id, chat_type],
        );
        console.log('данные чата переданы');
        res.status(200).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500);
        res.status(502).send('ошибка при получении чата');
    }
};

export const getAllChatsWithUnread = async (req: Request, res: Response) => {
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
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};
/* export const getAllChats = async (req: Request, res: Response) => {
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
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка получения чатов');
    }
}; */

export const createChat = async (req: Request, res: Response) => {
    try {
        const { account_id, messenger_id, chat_type, from_url } = req.body;
        const avatarUrl = `imgs/defaultAvatars/${Math.floor(Math.random() * 17) + 1}.png`;

        const query = `INSERT INTO chats 
        (account_id, chat_type, messenger_id, chat_avatar, from_url) 
        values ($1, $2, $3, $4, $5) 
        RETURNING *;`;
        const params = [account_id, chat_type, messenger_id, avatarUrl, from_url];

        const result = await client.query(query, params);
        telegramBot.sendMessage(680306494, `Новый контакт из ${chat_type}`);

        res.status(200).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при создании чата');
    }
};

interface IChatData {
    account_id: number;
    chat_type: string;
    avatarUrl: string;
    messenger_id: number;
}

export const createChat4All = async (params: IChatData) => {
    const { account_id, chat_type, avatarUrl, messenger_id } = params;
    const result = await client.query(
        `INSERT INTO chats 
    (account_id, chat_type, chat_avatar, messenger_id) 
    values ($1, $2, $3) 
    RETURNING *;`,
        [account_id, chat_type, avatarUrl, messenger_id],
    );
    return result;
};

export const deleteChat = async (req: Request, res: Response) => {
    const chat_id = req.params.id;

    try {
        await client.query(
            `
        DELETE FROM messages
        WHERE chat_id=$1`,
            [chat_id],
        );

        const result = await client.query(
            `
        DELETE FROM chats
        WHERE id=$1
        RETURNING *`,
            [chat_id],
        );
        res.status(200).json(result.rows);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(502).send('ошибка при удалении чата');
    }
};
export const hideChat = async (req: Request, res: Response) => {
    const { chat_id } = req.body;

    try {
        const result = await client.query(
            `
        UPDATE chats
        SET is_hidden=$1
        WHERE id = $2
        RETURNING *
        `,
            [true, chat_id],
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(502).send('ошибка при скрытии чата');
    }
};
