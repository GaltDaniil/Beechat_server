import { Router } from 'express';
import {
    getMessageById,
    getMessages,
    poolingMessage,
    readManyMessages,
    readOneMessage,
    sendMessage,
} from '../controllers/Message.controller.js';

const router = Router();

router.post('/', sendMessage);
router.get('/', getMessages);
router.get('/:id', getMessageById);
router.get('/pool-messages', poolingMessage);
router.put('/:id', readOneMessage);
router.put('/many/:id', readManyMessages);
router.delete('/:id', () => {});

export default router;
