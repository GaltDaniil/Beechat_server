import client from '../db.js';
import { Request, Response } from 'express';
import { vk } from '../messengers/vk/index.js';
import { ig } from '../messengers/ig/index.js';
import { tgBot } from '../messengers/tg/index.js';
//@ts-ignore

interface IRequest extends Request {
    body: {
        id: number;
        contact_id: string;
        text: string;
        from_contact: string;
        message_id?: number;
        messenger_type: string;
        messenger_id: number;
        instagram_chat_id: string;
    };
}

// REST API

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { contact_id } = req.query;
        const result = await client.query('SELECT * FROM messages WHERE contact_id = $1', [
            Number(contact_id),
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
        const { text, contact_id, from_contact, messenger_type, messenger_id, instagram_chat_id } =
            req.body;
        console.log(contact_id);

        const newMessage = await client.query(
            `
            WITH inserted_message AS (
                INSERT INTO messages (text, contact_id, from_contact) 
                VALUES ($1, $2, $3)
                RETURNING *
            )
            , updated_contacts AS (
                UPDATE contacts
                SET is_hidden = false
                WHERE id = $2 AND is_hidden != false
                RETURNING *
            )
            SELECT inserted_message.*
            FROM inserted_message
        `,
            [text, contact_id, from_contact],
        );
        if (messenger_type === 'telegram' && !from_contact) {
            //@ts-ignore
            tgBot.sendMessage(messenger_id.toString(), text, { is_bot_message: true });
        } else if (messenger_type === 'vk' && !from_contact) {
            const randomId = Math.floor(Math.random() * 1000000);
            vk.api.messages.send({ user_id: messenger_id, message: text, random_id: randomId });
        } else if (messenger_type === 'instagram' && !from_contact) {
            await ig.fetchChat(instagram_chat_id).then((contact: any) => {
                contact.sendMessage(text);
            });
        }
        if (from_contact) {
            tgBot.sendMessage(680306494, `Новое сообщение из ${messenger_type}`);
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
            WHERE contact_id = $1
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

// MESSENGER API

export const newMessage = async (contact_id: number, text: string, from_contact: boolean) => {
    try {
        const message = await client.query(
            `
            INSERT INTO messages 
            (contact_id, text, from_contact) values ($1, $2, $3) 
            RETURNING *`,
            [contact_id, text, from_contact],
        );
        return message.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};
