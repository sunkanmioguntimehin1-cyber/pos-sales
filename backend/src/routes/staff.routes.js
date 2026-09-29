import { Router } from 'express';
import { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff, verifyPin } from '../controllers/staff.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('staff:view'), getStaff);
router.post('/', requirePermission('staff:manage'), createStaff);
router.post('/verify-pin', requirePermission('pos'), verifyPin);
router.get('/:staffId', requirePermission('staff:view'), getStaffMember);
router.put('/:staffId', requirePermission('staff:manage'), updateStaff);
router.delete('/:staffId', requirePermission('staff:manage'), deleteStaff);

export default router;