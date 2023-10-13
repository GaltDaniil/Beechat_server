import client from '../db.js';
import { Request, Response } from 'express';

interface IBody {
    client_ids?: number[];
    name: string;
    surname?: string;
    email?: string;
    phone?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_source?: string;
    utm_content?: string;
    utm_term?: string;
    updatedData?: Record<string, any>;
}

export const createClientFromChat = async (req: Request, res: Response) => {
    try {
        const { account_id, chat_id, from_messenger, name, phone, description } = req.body;

        const custom_fields = { chat_description: description };
        //@ts-ignore
        const client_id = await client.query(
            'INSERT INTO clients (account_id, from_messenger, name, phone, custom_fields) values ($1, $2, $3, $4, $5) RETURNING id',
            [account_id, from_messenger, name, phone, custom_fields],
        );
        await client.query('UPDATE chats SET client_id = $1 WHERE id = $2', [
            client_id.rows[0].id,
            chat_id,
        ]);
        res.status(200).send('клиент создан');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(502).send('ошибка запроса на сервере');
    }
};

export const createClient = async (req: Request, res: Response) => {
    try {
        const data = req.body as IBody;

        const name = data.name || null;
        const surname = data.surname || null;
        const email = data.email || null;
        const phone = data.phone || null;

        //@ts-ignore
        const newPerson = await client.query(
            'INSERT INTO users (name, surname, email, phone) values ($1, $2, $3, $4) RETURNING *',
            [name, surname, email, phone],
        );
        console.log(newPerson);
        res.status(200).json({ newPerson });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error creating data.');
    }
};

export const getClient = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        //@ts-ignore
        await client.query('SELECT * FROM clients WHERE client_id = $1', [id], (error, results) => {
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                const userData = results.rows[0];
                res.status(200).json({ userData });
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Ошибка запроса на сервере' });
    }
};

export const getAllClients = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        await client.query('SELECT * FROM clients', (error, results) => {
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                const userData = results.rows; // полученные данные
                console.log('Clients data sended');
                res.status(200).json(userData);
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('ошибка запроса на сервере');
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const data = req.body as IBody;
        console.log(data);
        const client_ids = data.client_ids!;
        const updatedData = data.updatedData!;

        const updateColumns: string[] = [];
        const updateValues: any[] = [];
        const queryParams: any[] = [...client_ids];
        console.log(queryParams);

        Object.keys(updatedData).forEach((key) => {
            updateColumns.push(`${key} = $${updateValues.length + 2}`); // +2 для учета userId и позиции параметров
            // ['name = $2', 'email = $3']
            updateValues.push(updatedData[key]);
            //['John', 'sdfwef@mail.com']
        });

        const updateQuery = `
        UPDATE clients
        SET ${updateColumns.join(', ')}
        WHERE client_id = $1
        RETURNING *;
    `;

        const { rows } = await client.query(updateQuery, queryParams.concat(updateValues));
        res.status(200).json(rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error uploading data.');
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const data = req.body as IBody;
        const client_id = data.client_ids!;

        const queryParams = [...client_id];
        const deleteQuery = `
        DELETE FROM clients
        WHERE client_id IN (${queryParams.map((_, index) => `$${index + 1}`).join(', ')})
        RETURNING *;
    `;

        const { rows } = await client.query(deleteQuery, queryParams);
        res.status(200).json({ message: `Пользователи удалены` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Error deleting data.');
    }
};

export const uploadCsv = async (req: Request, res: Response) => {
    //@ts-ignore
    if (req.usersData) {
        try {
            await client.query('BEGIN');
            //@ts-ignore
            for (const user of req.usersData) {
                const customFields = {};
                let name,
                    surname,
                    email,
                    phone,
                    utm_campaign,
                    utm_medium,
                    utm_source,
                    utm_content,
                    utm_term,
                    custom_fields;

                for (const key in user) {
                    if (
                        key == 'name' ||
                        key == 'Name' ||
                        key == 'first_name' ||
                        key == 'First_name' ||
                        key == 'firstName' ||
                        key == 'FirstName' ||
                        key == 'имя' ||
                        key == 'Имя'
                    ) {
                        name = user[key];
                    } else if (
                        key == 'surname' ||
                        key == 'Surname' ||
                        key == 'lastName' ||
                        key == 'LastName' ||
                        key == 'last_name' ||
                        key == 'Last_name' ||
                        key == 'Фамилия' ||
                        key == 'фамилия'
                    ) {
                        surname = user[key];
                    } else if (
                        key == 'email' ||
                        key == 'e_mail' ||
                        key == 'e-mail' ||
                        key == 'Email' ||
                        key == 'E_mail' ||
                        key == 'E-mail' ||
                        key == 'почта' ||
                        key == 'Почта'
                    ) {
                        email = user[key];
                    } else if (
                        key == 'phone' ||
                        key == 'Phone' ||
                        key == 'телефон' ||
                        key == 'Телефон' ||
                        key == 'Мобильный'
                    ) {
                        phone = user[key];
                    } else if (key == 'utm_campaign' || key == 'utmCampaign') {
                        utm_campaign = user[key];
                    } else if (key == 'utm_medium' || key == 'utmMedium') {
                        utm_medium = user[key];
                    } else if (key == 'utm_source' || key == 'utmSource') {
                        utm_source = user[key];
                    } else if (key == 'utm_content' || key == 'utmContent') {
                        utm_content = user[key];
                    } else if (key == 'utm_term' || key == 'utmTerm') {
                        utm_term = user[key];
                    } else {
                        //@ts-ignore
                        customFields[key] = user[key];
                    }
                }

                const insertFields = {
                    name,
                    surname,
                    email,
                    phone,
                    utm_campaign,
                    utm_medium,
                    utm_source,
                    utm_content,
                    utm_term,
                    custom_fields,
                };

                if (surname) insertFields.surname = surname;
                if (phone) insertFields.phone = phone;
                if (utm_source) insertFields.utm_source = utm_source;
                if (utm_medium) insertFields.utm_medium = utm_medium;
                if (utm_campaign) insertFields.utm_campaign = utm_campaign;
                if (utm_content) insertFields.utm_content = utm_content;
                if (utm_term) insertFields.utm_term = utm_term;

                if (Object.keys(customFields).length > 0) {
                    //@ts-ignore
                    insertFields.custom_fields = customFields;
                }
                const insertQuery =
                    'INSERT INTO clients (name, surname, email, phone, utm_campaign, utm_medium, utm_source,  custom_fields) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)';
                await client.query(insertQuery, [
                    name,
                    surname || null,
                    email || null,
                    phone || null,
                    utm_campaign || null,
                    utm_medium || null,
                    utm_source || null,
                    JSON.stringify(customFields) || null,
                ]);
            }
            await client.query('COMMIT');
            res.status(200).send('Data uploaded successfully.');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).send('Error uploading data.');
        }
    } else {
        console.log('файл не получен');
    }
};
