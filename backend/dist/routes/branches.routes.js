"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branches_controller_js_1 = require("../controllers/branches.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', branches_controller_js_1.getBranches);
router.post('/', branches_controller_js_1.createBranch);
router.put('/:branchId', branches_controller_js_1.updateBranch);
router.delete('/:branchId', branches_controller_js_1.deleteBranch);
exports.default = router;
//# sourceMappingURL=branches.routes.js.map