import { Router } from 'express';
import { getRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/role.controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// The role list backs the staff form's dropdown (staff:view) and the Roles &
// Permissions screen (roles:manage), so view is the looser of the two.
router.get('/', requirePermission('staff:view'), getRoles);
router.post('/', requirePermission('roles:manage'), createRole);
router.get('/:roleId', requirePermission('staff:view'), getRole);
router.put('/:roleId', requirePermission('roles:manage'), updateRole);
router.delete('/:roleId', requirePermission('roles:manage'), deleteRole);

export default router;