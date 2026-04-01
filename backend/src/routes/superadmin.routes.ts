import { Router } from 'express';
import { createStore, getStores, getStore, updateStore, deleteStore } from '../controllers/superadmin.controller.js';
import { authMiddleware, requireSuperadmin } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireSuperadmin);

router.post('/stores', createStore);
router.get('/stores', getStores);
router.get('/stores/:storeId', getStore);
router.put('/stores/:storeId', updateStore);
router.delete('/stores/:storeId', deleteStore);

export default router;
