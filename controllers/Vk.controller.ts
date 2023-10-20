import { vk } from '../vkBot/vk.js';
import { ContextDefaultState, MessageContext } from 'vk-io';

import { paramParser } from '../middleware/paramParser.js';
import { telegramBot } from '../server.js';
import client from '../db.js';
import moment from 'moment';
import { saveUserAvatar } from '../middleware/AvatarLoader.js';
import { IChat, IClient } from '../types/index.js';

export const checkAndCreateChat = async (context: MessageContext<ContextDefaultState>) => {
    console.log('получил новое сообщение', context);

    //Пока временно устанавливаем id LinnikFitness
    const account_id = 1;

    const userData = await vk.api.users.get({
        user_ids: [context.senderId],
        fields: ['photo_200_orig', 'city'],
    });
    const { id, photo_200_orig, first_name, last_name } = userData[0];
    console.log(userData[0]);

    //Ищем в базе пользователя с таким ID
    const alreadyClient = await client.query(`
        SELECT id FROM clients
        WHERE vk_id=${Number(id)}
    `);
    if (!alreadyClient.rows[0]) {
        //сборка запроса
        const query = `INSERT INTO clients 
            (account_id, vk_id, custom_fields) 
            VALUES ($1, $2, $3) 
            RETURNING id;`;
        const custom_fields = {};
        //@ts-ignore
        if (first_name) custom_fields.first_name = first_name;
        //@ts-ignore
        if (last_name) custom_fields.last_name = last_name;
        const params = [account_id, id, custom_fields];

        //Создаем пользователя и берем его id
        const user = await client.query(query, params);
        console.log('клиент создан');

        //создаем чат
        if (user.rows[0]) {
            const avatarUrl = photo_200_orig || '';
            const client_id = user.rows[0].id;
            const query = `INSERT INTO chats 
            (messenger_id, chat_type, account_id, client_id, chat_avatar) 
            VALUES ($1, $2, $3, $4, $5);`;
            const params = [id, 'telegram', account_id, client_id, avatarUrl];
            await client.query(query, params);
            console.log('чат создан');
        }
    } else {
        //проверяем есть ли ВК чат с этим пользователем
        const client_id = alreadyClient.rows[0].id;
        const isHaveChat = await client.query(
            `
                SELECT * FROM chats
                WHERE client_id=${client_id} AND vk_id=${id}
            `,
        );
        //если да - сидим пыхтим
        if (isHaveChat.rows[0]) {
            console.log('пользователь с чатом существует');
        }
        //если нет - создаем новый чат
        else {
            const query = `INSERT INTO chats 
            (vk_id, chat_type, account_id, client_id, avatar) 
            VALUES ($1, $2, $3, $4, $5);`;
            const params = [id, 'telegram', account_id, client_id, photo_200_orig];
            await client.query(query, params);
        }
    }
    console.log('Получено новое сообщение в Сообщество');
};
