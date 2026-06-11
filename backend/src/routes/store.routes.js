import { Router } from 'express';
import { getStore, updateStore } from '../controllers/store.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getStore);
router.put('/', authMiddleware, updateStore);

export default router;
