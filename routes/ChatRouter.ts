import { Router } from 'express';
import {
    createChat,
    deleteChat,
    getAllChats,
    getAllChatsWithUnread,
    getChat,
} from '../controllers/Chat.controller.js';

const router = Router();

router.post('/', createChat);
router.get('/', getAllChats);
router.get('/all', getAllChatsWithUnread);
router.get('/:id', getChat);
router.put('/:id', () => {});
router.delete('/:id', deleteChat);

export default router;
