import { Router } from 'express';
import { getPipelines } from '../controllers/Pipeline.controller.js';

const router = Router();

router.get('/:id', getPipelines);

export default router;
