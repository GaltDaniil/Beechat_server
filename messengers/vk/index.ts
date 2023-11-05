import { VK } from 'vk-io';
import {
    checkContact,
    createContact,
    sendMessage,
} from '../../controllers/Messenger.controller.js';
import { urlParser } from '../../middleware/urlParser.js';
import { avatarUrlSaver } from '../../middleware/AvatarLoader.js';

const { VK_TOKEN } = process.env;

export const vk = new VK({
    token: VK_TOKEN!,
});

export const startVkBot = () => {
    vk.updates.on('group_join', (context) => {
        console.log('group_join', context);
    });

    vk.updates.on('message_new', async (context) => {
        let account_id;
        let contact_id;
        let from_url;

        const vkData = await vk.api.users.get({
            user_ids: [context.senderId],
            fields: ['photo_200_orig', 'nickname'],
        });
        const { id, photo_200_orig, first_name, last_name, nickname } = vkData[0];

        const messenger_id = id;
        const messenger_type = 'vk';
        const text = context.text;

        if (context.referralValue) {
            const parsedParams = await urlParser(context.referralValue);
            account_id = parsedParams.account_id || 1;
            from_url = parsedParams.from_url || '';
        }
        const result = await checkContact(messenger_id, messenger_type);

        if (result) {
            contact_id = result.id!;
        } else {
            const contact_name = first_name + ' ' + last_name || '';
            const contact_username = nickname || '';
            const contact_avatar = await avatarUrlSaver(messenger_id, photo_200_orig);
            const params = {
                account_id: 1,
                contact_name,
                contact_avatar,
                messenger_id,
                messenger_type,
                contact_username,
            };
            const result = await createContact(params);
            contact_id = result.id!;
        }
        await sendMessage(contact_id, text!, true);
    });

    vk.updates.on('message', async (context) => {
        if (context.isGroup == true) return;
        let contact_id;
        const messenger_id = context.senderId;
        const messenger_type = 'vk';
        const text = context.text;
        const result = await checkContact(messenger_id, messenger_type);
        if (result) {
            await sendMessage(result.id!, text!, false);
        }
    });

    vk.updates.start().catch(console.error);
};
