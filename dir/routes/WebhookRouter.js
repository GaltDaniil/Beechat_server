import { Router } from 'express';
import { getcourseHook } from '../controllers/Webhooks.controller.js';
const router = Router();
router.get('/getcourse', getcourseHook);
export default router;
