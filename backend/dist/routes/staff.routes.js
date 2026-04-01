"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const staff_controller_js_1 = require("../controllers/staff.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', staff_controller_js_1.getStaff);
router.post('/', staff_controller_js_1.createStaff);
router.post('/verify-pin', staff_controller_js_1.verifyPin);
router.put('/:staffId', staff_controller_js_1.updateStaff);
router.delete('/:staffId', staff_controller_js_1.deleteStaff);
exports.default = router;
//# sourceMappingURL=staff.routes.js.map