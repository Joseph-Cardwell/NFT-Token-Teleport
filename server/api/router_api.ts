import express from 'express';
import bridgeApiRouter from './oracle_api'
import * as cors from 'cors';

const router = express.Router();

router.use(cors());
router.use('/bridge', bridgeApiRouter);

export default router;
