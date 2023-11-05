import client from '../db.js';
import { Request, Response } from 'express';
import { tgBot } from '../messengers/tg/index.js';

interface IMessage {
    userId: number;
    text: string;
    contact_id: string;
    from_contact: string;
}

interface IContactData {
    account_id: number;
    messenger_type: string;
    avatarUrl: string;
    messenger_id: number;
}

// REST API

export const getContactById = async (req: Request, res: Response) => {
    try {
        const contact_id = req.params.id;
        //@ts-ignore
        const result = await client.query(
            `SELECT * FROM contacts 
            WHERE id = $1`,
            [contact_id],
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

export const getAllContactsWithUnread = async (req: Request, res: Response) => {
    try {
        const query = `
    SELECT
        contacts.*,
        m.text AS last_message,
        m.created_at last_message_created_at,
        m.from_contact last_message_from_contact,
        (
            SELECT COUNT(*)
            FROM messages
            WHERE contact_id = contacts.id AND is_readed = false AND from_contact = true
        ) AS unread_messages_count
    FROM
        contacts
    LEFT JOIN LATERAL (
        SELECT
            m.text,
            m.created_at,
            m.from_contact
        FROM
            messages m
        WHERE
            m.contact_id = contacts.id
        ORDER BY
            m.created_at DESC
        LIMIT 1
        ) AS m ON true
    ORDER BY
        last_message_created_at DESC;
    `;
        //@ts-ignore
        const result = await client.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};

export const createContact = async (req: Request, res: Response) => {
    try {
        const { account_id, messenger_id, messenger_type, from_url } = req.body;
        const avatarUrl = `imgs/defaultAvatars/${Math.floor(Math.random() * 17) + 1}.png`;
        console.log(from_url);
        const query = `INSERT INTO contacts 
        (account_id, messenger_type, messenger_id, contact_avatar, from_url, is_hidden) 
        values ($1, $2, $3, $4, $5, $6) 
        RETURNING *;`;
        const params = [account_id, messenger_type, messenger_id, avatarUrl, from_url, false];

        const result = await client.query(query, params);
        tgBot.sendMessage(680306494, `Новый контакт из ${messenger_type}`);

        res.status(200).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка при создании чата');
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    const contact_id = req.params.id;

    try {
        await client.query(
            `
        DELETE FROM messages
        WHERE contact_id=$1`,
            [contact_id],
        );

        const result = await client.query(
            `
        DELETE FROM contacts
        WHERE id=$1
        RETURNING *`,
            [contact_id],
        );
        res.status(200).json(result.rows);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(502).send('ошибка при удалении чата');
    }
};

export const hideContact = async (req: Request, res: Response) => {
    const { contact_id } = req.body;

    try {
        const result = await client.query(
            `
        UPDATE contacts
        SET is_hidden=$1
        WHERE id = $2
        RETURNING *
        `,
            [true, contact_id],
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(502).send('ошибка при скрытии чата');
    }
};

export const updateContact = async (req: Request, res: Response) => {
    try {
        const { contact_id, contact_name, contact_phone, description } = req.body;
        //@ts-ignore
        await client.query(
            `UPDATE contacts 
            SET contact_name=$1, contact_phone=$2, description=$3
            WHERE id=$4
            `,
            [contact_name, contact_phone, description, contact_id],
        );
        res.status(200).send('клиент создан');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка запроса на сервере');
    }
};

// MESSENGER API

export const isContactAvailable = async (messenger_id: number) => {
    try {
        const contact = await client.query(
            `
        SELECT * FROM contacts
        WHERE messenger_id = $1`,
            [messenger_id],
        );
        return contact.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    }
};

export const createContact4All = async (params: IContactData) => {
    const { account_id, messenger_type, avatarUrl, messenger_id } = params;
    const result = await client.query(
        `INSERT INTO contacts 
    (account_id, messenger_type, contact_avatar, messenger_id) 
    values ($1, $2, $3) 
    RETURNING *;`,
        [account_id, messenger_type, avatarUrl, messenger_id],
    );
    return result;
};
