import { Router } from 'express';
import { getTransfers, getTransfer, createTransfer } from '../controllers/transfers.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getTransfers);
router.post('/', createTransfer);
router.get('/:transferId', getTransfer);

export default router;
