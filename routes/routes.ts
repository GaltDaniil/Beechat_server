import { Router } from 'express';

import ContactRouter from './ContactRouter.js';
import MessageRouter from './MessageRouter.js';
import AccountRouter from './AccountRouter.js';
import PipelineRouter from './PipelineRouter.js';
import StageRouter from './StageRouter.js';

const router = Router();

router.use('/contacts', ContactRouter);
router.use('/messages', MessageRouter);
router.use('/accounts', AccountRouter);
router.use('/pipelines', PipelineRouter);
router.use('/stages', StageRouter);
/* router.use('/get-messages', async (req, res) => {
    emitter.once('update', (data: any) => {
        console.log('сработал emmiter');
        try {
            if (data) {
                console.log('сработал c data');
                res.status(200).json(data);
            } else {
                console.log('сработал без data');
                res.status(200).json({ status: true });
            }
        } catch (error) {
            res.status(400);
            console.log(error);
        }
    });
}); */

export default router;
