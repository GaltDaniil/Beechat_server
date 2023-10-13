import TelegramBot from 'node-telegram-bot-api';
import { paramParser } from '../middleware/paramParser.js';
import { telegramBot } from '../server.js';
import client from '../db.js';
import moment from 'moment';
import { saveUserAvatar } from '../middleware/AvatarLoader.js';
import { IChat, IClient } from '../types/index.js';

interface StartCommandType {
    (msg: TelegramBot.Message, match?: RegExpExecArray | null): void;
}

export const startCommandWithParams: StartCommandType = async (msg, match) => {
    console.log('отработал start с параметрами в боте');
    try {
        const telegram_id = msg.chat.id.toString();
        const tg_name = msg.chat.first_name;
        const tg_user_name = msg.chat.username;

        const parsedParams = (await paramParser(match!)) as { chatId?: string; accountId?: string };
        const account_id = Number(parsedParams.accountId);
        console.log('спарсил параметры и получил account_id', account_id);

        const query = `SELECT id
            FROM clients
            WHERE telegram_id=${telegram_id} AND account_id=${account_id}`;

        const isUser = await client.query(query);

        if (isUser.rows[0]) {
            const isClient = isUser.rows[0];
            const isHaveChat = await client.query(
                `
                SELECT * FROM chats
                WHERE clietn_id = $1
            `,
                [isClient.id],
            );
            if (isHaveChat.rows[0]) {
                console.log('пользователь с чатом существует');
            } else {
                console.log('пользователя нет, создаем чат');
                const avatarUrl = await saveUserAvatar(msg.chat.id);
                const client_id = isClient.id;
                const query = `INSERT INTO chats 
            (telegram_id, from_messenger, account_id, client_id, avatar) 
            VALUES ($1, $2, $3, $4, $5);`;
                const params = [telegram_id, 'telegram', account_id, client_id, avatarUrl];
                await client.query(query, params);
            }
        } else {
            const query = `INSERT INTO clients 
            (account_id, telegram_id, custom_fields) 
            VALUES ($1, $2, $3) 
            RETURNING id;`;
            const custom_fields = {
                telegram_id: telegram_id.toString(),
                tg_name: tg_name!.toString(),
                tg_user_name: tg_user_name!.toString(),
            };
            const params = [account_id, telegram_id, custom_fields];

            const user = await client.query(query, params);
            console.log('клиент создан');

            if (user.rows[0]) {
                const avatarUrl = await saveUserAvatar(msg.chat.id);
                const client_id = user.rows[0].id;
                const query = `INSERT INTO chats 
            (telegram_id, from_messenger, account_id, client_id, avatar) 
            VALUES ($1, $2, $3, $4, $5);`;
                const params = [telegram_id, 'telegram', account_id, client_id, avatarUrl];

                await client.query(query, params);
                console.log('чат создан');
            }
            telegramBot.sendMessage(
                msg.chat.id,
                `Здравствуйте, вас приветствует поддержка онлайн школы Linnik Fitness. Какой у вас вопрос?)`,
                //@ts-ignore
                { is_bot_message: true },
            );
        }
    } catch (error) {
        console.log(error);
    }
};

export const startCommand: StartCommandType = async (msg, match) => {
    try {
        console.log('отработал start в боте');
        console.log(match);

        const telegram_id = msg.chat.id.toString();

        const query = `SELECT id
            FROM clients
            WHERE custom_fields @> '{"telegram_id": ${telegram_id}}';`;

        const user = await client.query(query);

        if (!user.rows[0]) {
            const name = msg.chat.first_name;
            const created_at = moment().format('YYYY-MM-DD HH:mm:ss');
            const tg_user_name = msg.chat.username;

            const query = `INSERT INTO clients 
            (name, telegram_id, created_at, custom_fields) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id;`;
            const custom_fields = {
                telegram_id: telegram_id.toString(),
                tg_user_name: tg_user_name!.toString(),
            };
            const params = [name, telegram_id, created_at, custom_fields];

            const data = await client.query(query, params);
            console.log('клиент создан');

            if (data.rows[0]) {
                const avatarUrl = await saveUserAvatar(msg.chat.id);
                const client_id = data.rows[0].id;
                const query = `INSERT INTO chats 
            (telegram_id, from_messenger, account_id, client_id, avatar) 
            VALUES ($1, $2, $3, $4, $5);`;
                const params = [telegram_id, 'telegram', 1, client_id, avatarUrl];

                await client.query(query, params);
                console.log('чат создан');
            }
            telegramBot.sendMessage(
                msg.chat.id,
                `Здравствуйте, вас приветствует поддержка онлайн школы Linnik Fitness. Какой у вас вопрос?)`,
                //@ts-ignore
                { is_bot_message: true },
            );
        }
    } catch (error) {
        console.log(error);
    }
};

export const createChatFromTg = async (
    msg: TelegramBot.Message,
    client_id: number,
): Promise<IChat> => {
    const telegram_id = msg.chat.id.toString();
    const avatarUrl = await saveUserAvatar(msg.chat.id);

    const query = `INSERT INTO chats 
            (telegram_id, from_messenger, account_id, client_id, avatar) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
    const params = [telegram_id, 'telegram', 1, client_id, avatarUrl];

    const newChat = await client.query(query, params);
    telegramBot.sendMessage(680306494, `Новое сообщение с сайта в телеграм`);

    return newChat.rows[0];
};

export const checkClientForAvailability = async (msg: TelegramBot.Message): Promise<IClient> => {
    const telegram_id = msg.chat.id.toString();

    const user = await client.query(
        `
    SELECT * FROM clients
    WHERE telegram_id = $1`,
        [telegram_id],
    );
    return user.rows[0];
};

export const checkChatForAvailability = async (msg: TelegramBot.Message): Promise<IChat> => {
    const telegram_id = msg.chat.id.toString();

    const chat = await client.query(
        `
    SELECT * FROM chats
    WHERE telegram_id = $1`,
        [telegram_id],
    );
    return chat.rows[0];
};
