"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_js_1 = require("../controllers/customers.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', customers_controller_js_1.getCustomers);
router.post('/', customers_controller_js_1.createCustomer);
router.put('/:customerId', customers_controller_js_1.updateCustomer);
router.delete('/:customerId', customers_controller_js_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customers.routes.js.map