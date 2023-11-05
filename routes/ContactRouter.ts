import { Router } from 'express';
import {
    createContact,
    deleteContact,
    getAllContactsWithUnread,
    getContactById,
    hideContact,
    updateContact,
} from '../controllers/Contact.controller.js';

const router = Router();

router.post('/', createContact);
router.get('/all', getAllContactsWithUnread);
router.get('/:id', getContactById);
router.put('/:id', () => {});
router.delete('/:id', deleteContact);
router.patch('/', hideContact);
router.patch('/update', updateContact);

export default router;
