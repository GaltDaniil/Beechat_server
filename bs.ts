import express from 'express';
import Bot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import cors from 'cors';

const app = express();

dotenv.config();

const TG_BS_TOKEN = process.env.TELEGRAM_BS_TOKEN;
const PORT = process.env.PORT;

export const telegramBot = new Bot(TG_BS_TOKEN!, {
    polling: true,
});

app.use(express.json());
app.use(cors());

telegramBot.on('callback_query', (query) => {
    if (query.data === '') {
    }
});

telegramBot.on('polling_error', (error) => {
    console.log('Error: [polling_error]', error);
});

app.listen(PORT, () => {
    console.log(`server is ok on PORT ${PORT}`);
});
