import { telegramBot, vk } from '../server.js';
import { ContextDefaultState, MessageContext } from 'vk-io';
import client from '../db.js';

import { io } from '../server.js';
import { avatarUrlSaver } from '../middleware/AvatarLoader.js';
//@ts-ignore
import { Message } from '@androz2091/insta.js';

export const checkAndCreateContactIg = async (message: Message): Promise<number | null> => {
    const account_id = 1;

    const { chatID, author } = message;
    const { id, avatarURL, fullName, username } = author;

    //Ищем в базе пользователя с таким ID
    const alreadyClient = await client.query(`
        SELECT id FROM clients
        WHERE instagram_id=${Number(id)}
    `);
    if (!alreadyClient.rows[0]) {
        //сборка запроса
        const query = `INSERT INTO clients 
            (account_id, name, instagram_id, custom_fields) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id;`;
        const custom_fields = {};
        //@ts-ignore
        if (username) custom_fields.user_name = username;
        //@ts-ignore
        if (fullName) custom_fields.full_name = fullName;
        const params = [account_id, fullName || '', id, custom_fields];

        //Создаем пользователя и берем его id
        const user = await client.query(query, params);
        console.log('клиент из instagram создан');

        //создаем чат
        if (user.rows[0]) {
            const avatarUrl = await avatarUrlSaver(avatarURL, id);
            const client_id = user.rows[0].id;
            const query = `INSERT INTO contacts 
            (messenger_id, messenger_type, account_id, client_id, contact_avatar, instagram_chat_id) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
            const params = [id, 'instagram', account_id, client_id, avatarUrl, chatID];
            const result = await client.query(query, params);
            telegramBot.sendMessage(680306494, `Новое сообщение с сайта в инстаграм`);
            return result.rows[0].id;
        }
    } else {
        //проверяем есть ли ВК чат с этим пользователем
        const client_id = alreadyClient.rows[0].id;
        const isHaveContact = await client.query(
            `
                SELECT * FROM contacts
                WHERE client_id=${client_id} AND messenger_id=${id}
            `,
        );
        //если да - сидим пыхтим
        if (isHaveContact.rows[0]) {
            return isHaveContact.rows[0].id;
        }
        //если нет - создаем новый чат
        else {
            const avatarUrl = await avatarUrlSaver(avatarURL, id);
            const result = await client.query(
                `
            INSERT INTO contacts 
            (messenger_id, messenger_type, account_id, client_id, contact_avatar, instagram_chat_id) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `,
                [id, 'instagram', account_id, client_id, avatarUrl, chatID],
            );
            telegramBot.sendMessage(680306494, `Новое сообщение с сайта в инстаграм`);
            return result.rows[0].id;
        }
    }
    return null;
};

export const sendIgMessage = async (message: Message, contact_id: number) => {
    const { content } = message;
    const from_contact = true;
    const newMessage = await client.query(
        `
        WITH inserted_message AS (
            INSERT INTO messages (contact_id, text, from_contact) 
            VALUES ($1, $2, $3)
            RETURNING *
        )
        , updated_contacts AS (
            UPDATE contacts
            SET is_hidden = false
            WHERE id = $1 AND is_hidden != false
            RETURNING *
        )
        SELECT inserted_message.*
        FROM inserted_message`,
        [contact_id, content, from_contact],
    );

    const messageData = newMessage.rows[0];
    io.emit('sendMessengerMessage', messageData);
    io.emit('update');
};
