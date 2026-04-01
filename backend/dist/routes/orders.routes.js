"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_js_1 = require("../controllers/orders.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', orders_controller_js_1.getOrders);
router.post('/', orders_controller_js_1.createOrder);
router.get('/:orderId', orders_controller_js_1.getOrder);
router.put('/:orderId/status', orders_controller_js_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.routes.js.map