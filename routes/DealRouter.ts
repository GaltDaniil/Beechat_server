import { Router } from 'express';
import { getManyDeals, updateOneDeal } from '../controllers/Deal.controller.js';

const router = Router();

router.post('/many', getManyDeals);
router.post('/update', updateOneDeal);
router.get('/create', () => {});

export default router;
