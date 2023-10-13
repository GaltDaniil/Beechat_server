import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import router from './routes/routes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
//import events from 'events';
import cors from 'cors';
import { checkChatForAvailability, createChatFromTg, startCommand, } from './controllers/Tg.controller.js';
import client from './db.js';
dotenv.config();
const { TELEGRAM_TOKEN, PORT } = process.env;
//export const emitter = new events.EventEmitter();
export const telegramBot = new TelegramBot(TELEGRAM_TOKEN, {
    polling: true,
});
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:3000',
            'http://localhost:8008',
            'http://95.163.243.156:8008',
            'http://localhost:443',
            'https://beechat.ru:443',
            'https://beechat.ru:8008',
            'https://beechat.ru',
        ],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use('/imgs/', express.static('./imgs/'));
const chatStatus = {};
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        chatStatus[data.chat_id] = chatStatus[data.chat_id] || {};
        chatStatus[data.chat_id][socket.id] = true;
        io.emit('chatStatus', chatStatus);
        const roomsInfo = io.sockets.adapter.rooms;
        roomsInfo.forEach((participants, room) => {
            if (room !== data.chat_id) {
                socket.leave(room);
            }
        });
        socket.join(data.chat_id);
        console.log('Current rooms and participants:', roomsInfo);
    });
    socket.on('sendMessage', (data) => {
        console.log('новое сообщение', data);
        //emitter.emit('update');
        io.emit('update');
        socket.to(data.chat_id).emit('newMessage', data);
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (const chatId in chatStatus) {
            if (chatStatus[chatId][socket.id]) {
                delete chatStatus[chatId][socket.id];
                io.emit('chatStatus', chatStatus);
                break;
            }
        }
    });
});
//telegramBot.onText(/\/start(.+)/, startCommandWithParams);
telegramBot.onText(/\/start$/, startCommand);
telegramBot.on('message', async (msg) => {
    const telegram_id = msg.chat.id.toString();
    const sended_at = new Date();
    const from_client = true;
    let chat_id;
    const isHaveChat = await checkChatForAvailability(msg);
    if (!isHaveChat) {
        const user = await client.query(`
        SELECT * FROM clients
        WHERE telegram_id = $1`, [telegram_id]);
        const client_id = user.rows[0].id;
        const newChat = await createChatFromTg(msg, client_id);
        chat_id = newChat.id;
    }
    else {
        chat_id = isHaveChat.id;
    }
    const newMessage = await client.query(`
        INSERT INTO messages 
        (chat_id, text, sended_at, from_client) values ($1, $2, $3, $4) 
        RETURNING *`, [chat_id, msg.text, sended_at, from_client]);
    const messageData = newMessage.rows[0];
    io.emit('sendTgMessage', messageData);
    io.emit('update');
});
httpServer.listen(PORT, () => {
    console.log(`server for chat is ok on PORT ${PORT}`);
});
