"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
exports.requireSuperadmin = requireSuperadmin;
exports.requireTenantAccess = requireTenantAccess;
const jwt_js_1 = require("../utils/jwt.js");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const user = (0, jwt_js_1.verifyToken)(token);
    if (!user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    req.user = user;
    next();
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
}
function requireSuperadmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    if (req.user.role !== 'superadmin') {
        res.status(403).json({ error: 'Superadmin access required' });
        return;
    }
    next();
}
function requireTenantAccess(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const tenantId = req.headers['x-tenant-id'];
    if (req.user.role === 'superadmin') {
        next();
        return;
    }
    if (tenantId && req.user.tenantId !== tenantId) {
        res.status(403).json({ error: 'Access denied to this tenant' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map