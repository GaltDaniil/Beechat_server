import client from '../db.js';
import { io } from '../server.js';
import { IContact } from '../types/index.js';

export const checkContact = async (messenger_id: number, messenger_type: string) => {
    const alreadyContact = await client.query(`
        SELECT id FROM contact
        WHERE messenger_id=${messenger_id} AND messenger_type=${messenger_type}
        RETURNING *
    `);

    return alreadyContact.rows[0] as IContact | undefined;
};

export const createContact = async (params: IContact) => {
    const contact = await client.query(
        `INSERT INTO contact 
        (account_id, contact_name, contact_avatar, messenger_id, 
        messenger_type, instagram_chat_id, from_url, contact_username, is_hidden) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id;`,
        [
            params.account_id,
            params.contact_name,
            params.contact_avatar,
            params.messenger_id,
            params.messenger_type,
            params.instagram_chat_id || '',
            params.from_url || '',
            params.contact_username || '',
            false,
        ],
    );
    console.log('клиент создан');
    return contact.rows[0] as IContact;
};

export const sendMessage = async (contact_id: number, text: string, from_contact: boolean) => {
    const newMessage = await client.query(
        `
        INSERT INTO messages 
        (contact_id, text, from_contact) values ($1, $2, $3) 
        RETURNING *`,
        [contact_id, text, from_contact],
    );

    const messageData = newMessage.rows[0];
    io.emit('sendMessengerMessage', messageData);
    io.emit('update');
};
