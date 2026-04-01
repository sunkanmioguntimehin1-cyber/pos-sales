"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTenantAccess = exports.tenantMiddleware = exports.requireTenantAccess = exports.requireSuperadmin = exports.requireRole = exports.authMiddleware = void 0;
var auth_middleware_js_1 = require("./auth.middleware.js");
Object.defineProperty(exports, "authMiddleware", { enumerable: true, get: function () { return auth_middleware_js_1.authMiddleware; } });
Object.defineProperty(exports, "requireRole", { enumerable: true, get: function () { return auth_middleware_js_1.requireRole; } });
Object.defineProperty(exports, "requireSuperadmin", { enumerable: true, get: function () { return auth_middleware_js_1.requireSuperadmin; } });
Object.defineProperty(exports, "requireTenantAccess", { enumerable: true, get: function () { return auth_middleware_js_1.requireTenantAccess; } });
var tenant_middleware_js_1 = require("./tenant.middleware.js");
Object.defineProperty(exports, "tenantMiddleware", { enumerable: true, get: function () { return tenant_middleware_js_1.tenantMiddleware; } });
Object.defineProperty(exports, "validateTenantAccess", { enumerable: true, get: function () { return tenant_middleware_js_1.validateTenantAccess; } });
//# sourceMappingURL=index.js.map