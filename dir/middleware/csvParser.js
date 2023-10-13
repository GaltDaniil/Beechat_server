//@ts-ignore
import csv from 'csv-parser';
import fs from 'fs';
//@ts-ignore
export const csvParser = async (req, res, next) => {
    //@ts-ignore
    const usersData = [];
    console.log('parse');
    const csvFile = req.file;
    //@ts-ignore
    fs.createReadStream(csvFile.path)
        .pipe(csv())
        .on('data', (row) => {
        usersData.push(row);
    })
        .on('end', () => {
        //@ts-ignore//@ts-ignore
        req.usersData = usersData;
        fs.unlink(csvFile.path, (err) => {
            if (err) {
                console.error('Ошибка при удалении файла:', err);
            }
            else {
                console.log('Файл успешно удален:', csvFile.path);
            }
        });
        next();
        //res.status(200).json({ message: 'CSV файл успешно загружен и обработан на сервере.' });
    })
        .on('error', (error) => {
        console.error('Ошибка при парсинге CSV файла:', error);
        res.status(500).json({ error: 'Ошибка при обработке CSV файла.' });
    });
};
