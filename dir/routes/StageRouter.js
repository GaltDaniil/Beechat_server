import { Router } from 'express';
import { getManyStages } from '../controllers/Stage.controller.js';
const router = Router();
router.post('/many', getManyStages);
export default router;
