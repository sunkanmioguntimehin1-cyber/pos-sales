"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_js_1 = require("../controllers/products.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
router.get('/', products_controller_js_1.getProducts);
router.post('/', products_controller_js_1.createProduct);
router.put('/:productId', products_controller_js_1.updateProduct);
router.delete('/:productId', products_controller_js_1.deleteProduct);
router.post('/:productId/stock', products_controller_js_1.adjustStock);
router.get('/categories', products_controller_js_1.getCategories);
router.post('/categories', products_controller_js_1.createCategory);
router.put('/categories/:categoryId', products_controller_js_1.updateCategory);
router.delete('/categories/:categoryId', products_controller_js_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=products.routes.js.map