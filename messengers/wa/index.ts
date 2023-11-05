import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';

export const waBot = new Client({});

waBot.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});
waBot.on('ready', () => {
    console.log('WhatsApp Web is run!');
});
waBot.on('message', (msg) => {
    console.log(msg);

    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});
waBot.initialize();
