"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadmin_controller_js_1 = require("../controllers/superadmin.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.use(auth_middleware_js_1.requireSuperadmin);
router.post('/stores', superadmin_controller_js_1.createStore);
router.get('/stores', superadmin_controller_js_1.getStores);
router.get('/stores/:storeId', superadmin_controller_js_1.getStore);
router.put('/stores/:storeId', superadmin_controller_js_1.updateStore);
router.delete('/stores/:storeId', superadmin_controller_js_1.deleteStore);
exports.default = router;
//# sourceMappingURL=superadmin.routes.js.map