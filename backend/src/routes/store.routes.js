import { Router } from 'express';
import { getStore, updateStore } from '../controllers/store.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getStore);
router.put('/', authMiddleware, requirePermission('settings:manage'), updateStore);

export default router;