"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./config/db.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const superadmin_routes_js_1 = __importDefault(require("./routes/superadmin.routes.js"));
const stores_routes_js_1 = __importDefault(require("./routes/stores.routes.js"));
const staff_routes_js_1 = __importDefault(require("./routes/staff.routes.js"));
const products_routes_js_1 = __importDefault(require("./routes/products.routes.js"));
const orders_routes_js_1 = __importDefault(require("./routes/orders.routes.js"));
const branches_routes_js_1 = __importDefault(require("./routes/branches.routes.js"));
const customers_routes_js_1 = __importDefault(require("./routes/customers.routes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/superadmin', superadmin_routes_js_1.default);
app.use('/api/stores', stores_routes_js_1.default);
app.use('/api/staff', staff_routes_js_1.default);
app.use('/api/products', products_routes_js_1.default);
app.use('/api/orders', orders_routes_js_1.default);
app.use('/api/branches', branches_routes_js_1.default);
app.use('/api/customers', customers_routes_js_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
async function startServer() {
    await (0, db_js_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 API docs: http://localhost:${PORT}/api/health`);
    });
}
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map