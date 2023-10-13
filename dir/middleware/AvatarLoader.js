import axios from 'axios';
import { telegramBot } from '../server.js';
import fs from 'fs';
export const saveUserAvatar = async (userId) => {
    try {
        const userProfilePhotos = await telegramBot.getUserProfilePhotos(userId, { limit: 1 }); // Получаем первую фотографию
        if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
            // Получаем URL фотографии
            const photo = userProfilePhotos.photos[0][0];
            const photoUrl = photo ? await telegramBot.getFileLink(photo.file_id) : null;
            if (photoUrl) {
                const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(response.data, 'binary');
                const filename = `avatar_${userId}.jpg`;
                const filePath = `./imgs/userAvatars/${filename}`;
                fs.writeFileSync(filePath, imageBuffer);
                console.log(`Аватар пользователя ${userId} сохранен на сервере в ${filePath}.`);
                return filePath.slice(2);
            }
        }
    }
    catch (error) {
        console.error('Ошибка при сохранении аватара:', error);
    }
};
