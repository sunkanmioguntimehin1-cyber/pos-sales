import { Router } from 'express';
import { getTransfers, getTransfer, createTransfer } from '../controllers/transfers.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('stock:view'), getTransfers);
router.post('/', requirePermission('stock:transfer'), createTransfer);
router.get('/:transferId', requirePermission('stock:view'), getTransfer);

export default router;