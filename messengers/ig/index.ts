//@ts-ignore
import * as Insta from '@androz2091/insta.js';
//@ts-ignore
import type { Message, Client } from '@androz2091/insta.js';
import {
    checkContact,
    createContact,
    sendMessage,
} from '../../controllers/Messenger.controller.js';
import { avatarUrlSaver } from '../../middleware/AvatarLoader.js';

const { IG_USERNAME, IG_PASSWORD } = process.env;
export const ig: Client = new Insta.Client();

const messageHandler = async (message: Message) => {
    if (message.type === 'reel_share') return;
    if (message.text.length <= 1) return;

    const messenger_id = message.author.id;
    const messenger_type = 'instagram';
    const result = await checkContact(messenger_id, messenger_type);
    const text: string = message.text;

    let contact_id: number;

    if (result) {
        contact_id = result.id!;
    } else {
        const contact_name: string = message.author.fullName;
        const contact_username: string = message.author.username;
        const instagram_chat_id: string = message.chatID;
        const contact_avatar = await avatarUrlSaver(message.author.id, message.author.avatarURL);

        const params = {
            account_id: 1,
            contact_name,
            contact_avatar,
            messenger_id,
            messenger_type,
            instagram_chat_id,
            contact_username,
        };
        const result = await createContact(params);
        contact_id = result.id!;
    }

    let from_contact = true;
    if (message.author.id === ig.user.id) {
        from_contact = false;
    }
    await sendMessage(contact_id, text, from_contact);
};

export const startInstagramBot = () => {
    ig.on('connected', async () => {
        console.log(`Logged in as ${ig.user.username}`);
    });

    ig.on('messageCreate', messageHandler);

    ig.login(IG_USERNAME, IG_PASSWORD);
};
