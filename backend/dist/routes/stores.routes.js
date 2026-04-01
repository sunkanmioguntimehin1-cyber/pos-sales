"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stores_controller_js_1 = require("../controllers/stores.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get('/me', auth_middleware_js_1.authMiddleware, stores_controller_js_1.getCurrentStore);
router.get('/:subdomain', auth_middleware_js_1.authMiddleware, stores_controller_js_1.getStoreBySubdomain);
router.put('/me', auth_middleware_js_1.authMiddleware, stores_controller_js_1.updateStore);
exports.default = router;
//# sourceMappingURL=stores.routes.js.map