import { vk } from '../server.js';
import { ContextDefaultState, MessageContext } from 'vk-io';
import client from '../db.js';
import { vkParamParser } from '../middleware/vkParamParser.js';
import { io } from '../server.js';

export const checkAndCreateChat = async (
    context: MessageContext<ContextDefaultState>,
): Promise<number | null> => {
    console.log(context);
    let account_id, from_url;
    if (context.referralValue) {
        const parsedParams = (await vkParamParser(context.referralValue)) as {
            account_id?: string;
            from_url?: string;
        };
        account_id = parsedParams.account_id;
        from_url = parsedParams.from_url || '';
        console.log(account_id, from_url);
    }

    //Пока временно устанавливаем id LinnikFitness

    const vkData = await vk.api.users.get({
        user_ids: [context.senderId],
        fields: ['photo_200_orig'],
    });
    const { id, photo_200_orig, first_name, last_name } = vkData[0];

    //Ищем в базе пользователя с таким ID
    const alreadyClient = await client.query(`
        SELECT id FROM clients
        WHERE vk_id=${Number(id)}
    `);
    if (!alreadyClient.rows[0]) {
        //сборка запроса
        const query = `INSERT INTO clients 
            (account_id, name, surname, vk_id, custom_fields) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id;`;
        const custom_fields = {};
        //@ts-ignore
        if (first_name) custom_fields.first_name = first_name;
        //@ts-ignore
        if (last_name) custom_fields.last_name = last_name;
        const params = [account_id, first_name || '', last_name || '', id, custom_fields];

        //Создаем пользователя и берем его id
        const user = await client.query(query, params);
        console.log('клиент создан');

        //создаем чат
        if (user.rows[0]) {
            const avatarUrl = photo_200_orig || '';
            const client_id = user.rows[0].id;
            const query = `INSERT INTO chats 
            (messenger_id, chat_type, account_id, client_id, chat_avatar, from_url) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
            const params = [id, 'vk', account_id, client_id, avatarUrl, from_url];
            const result = await client.query(query, params);
            console.log('чат создан');
            return result.rows[0].id;
        }
    } else {
        //проверяем есть ли ВК чат с этим пользователем
        const client_id = alreadyClient.rows[0].id;
        const isHaveChat = await client.query(
            `
                SELECT * FROM chats
                WHERE client_id=${client_id} AND messenger_id=${id}
            `,
        );
        //если да - сидим пыхтим
        if (isHaveChat.rows[0]) {
            return isHaveChat.rows[0].id;
        }
        //если нет - создаем новый чат
        else {
            const result = await client.query(
                `
            INSERT INTO chats 
            (messenger_id, chat_type, account_id, client_id, chat_avatar, from_url) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `,
                [id, 'vk', account_id, client_id, photo_200_orig, from_url],
            );
            return result.rows[0].id;
        }
    }
    return null;
};

export const sendVkMessage = async (
    context: MessageContext<ContextDefaultState>,
    chat_id: number,
) => {
    const { text } = context;
    const newMessage = await client.query(
        `
        INSERT INTO messages 
        (chat_id, text, from_client) values ($1, $2, $3) 
        RETURNING *`,
        [chat_id, text, true],
    );

    const messageData = newMessage.rows[0];
    io.emit('sendMessengerMessage', messageData);
    io.emit('update');
};
