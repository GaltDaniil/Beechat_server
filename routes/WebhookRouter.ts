import { Router } from 'express';
import { getcourseHook } from '../next/Webhooks.controller.js';

const router = Router();

router.get('/getcourse', getcourseHook);

export default router;
