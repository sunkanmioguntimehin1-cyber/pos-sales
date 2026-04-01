import { Router } from 'express';
import { getCurrentStore, getStoreBySubdomain, updateStore } from '../controllers/stores.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authMiddleware, getCurrentStore);
router.get('/:subdomain', authMiddleware, getStoreBySubdomain);
router.put('/me', authMiddleware, updateStore);

export default router;
