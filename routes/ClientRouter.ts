import { Router } from 'express';
import multer from 'multer';

import * as clientsController from '../controllers/Client.controller.js';
import { csvParser } from '../middleware/csvParser.js';

const upload = multer({ dest: 'uploads/' });

const router = Router();

//@ts-ignore
router.get('/', clientsController.getAllClients);
router.get('/:id', clientsController.getClient);
router.post('/create-from-chat', clientsController.createClientFromChat);
router.post('/create', clientsController.createClient);
router.post('/update', clientsController.updateClient);
router.delete('/delete', clientsController.deleteClient);

router.post('/importcsv', upload.single('csvFile'), csvParser, clientsController.uploadCsv);
//router.get('/exportcsv', clientsController.createClient);

export default router;
