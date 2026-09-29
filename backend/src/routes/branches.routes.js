import { Router } from 'express';
import { getBranches, getBranch, createBranch, updateBranch, deleteBranch } from '../controllers/branches.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission('branches:view'), getBranches);
router.post('/', requirePermission('branches:manage'), createBranch);
router.get('/:branchId', requirePermission('branches:view'), getBranch);
router.put('/:branchId', requirePermission('branches:manage'), updateBranch);
router.delete('/:branchId', requirePermission('branches:manage'), deleteBranch);

export default router;