import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import router from './routes/routes.js';

import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

import cors from 'cors';
import { startInstagramBot } from './messengers/ig/index.js';
import { startTelegramBot } from './messengers/tg/index.js';
import { startVkBot } from './messengers/vk/index.js';

dotenv.config();
const { PORT } = process.env;

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
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

type IOnlineUsers = {
    [key: string]: any;
};

const chatStatus: IOnlineUsers = {};

io.on('connection', (socket: Socket) => {
    socket.on('join', (data) => {
        chatStatus[data.contact_id] = chatStatus[data.contact_id] || {};
        chatStatus[data.contact_id][socket.id] = true;

        io.emit('chatStatus', chatStatus);

        const roomsInfo = io.sockets.adapter.rooms;

        roomsInfo.forEach((participants, room) => {
            if (room !== data.contact_id) {
                socket.leave(room);
            }
        });

        socket.join(data.contact_id);
        console.log('Current rooms and participants:', roomsInfo);
    });

    socket.on('sendMessage', (data) => {
        socket.to(data.contact_id).emit('newMessage', data);
        io.emit('update');
    });

    socket.on('disconnect', () => {
        //console.log(`User disconnected: ${socket.id}`);
        for (const contactId in chatStatus) {
            if (chatStatus[contactId][socket.id]) {
                delete chatStatus[contactId][socket.id];
                io.emit('chatStatus', chatStatus);
                break;
            }
        }
    });
});

startTelegramBot();
startVkBot();
startInstagramBot();

httpServer.listen(PORT, () => {
    console.log(`server for chat is ok on PORT ${PORT}`);
});
