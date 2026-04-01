"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = tenantMiddleware;
exports.validateTenantAccess = validateTenantAccess;
const tenant_model_js_1 = require("../models/tenant.model.js");
async function tenantMiddleware(req, res, next) {
    const host = req.headers.host || '';
    const subdomain = extractSubdomain(host);
    if (subdomain) {
        try {
            const tenant = await tenant_model_js_1.Tenant.findOne({ subdomain, isActive: true });
            if (!tenant) {
                res.status(404).json({ error: 'Store not found', subdomain });
                return;
            }
            req.tenantId = tenant._id.toString();
        }
        catch (error) {
            res.status(500).json({ error: 'Error resolving tenant' });
            return;
        }
    }
    next();
}
function extractSubdomain(host) {
    const localhostDomains = ['localhost', '127.0.0.1'];
    if (localhostDomains.some(d => host.includes(d))) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
            return subdomain;
        }
        return null;
    }
    const parts = host.split('.');
    if (parts.length >= 3) {
        return parts[0];
    }
    return null;
}
async function validateTenantAccess(req, res, next) {
    const tenantId = req.headers['x-tenant-id'];
    // Superadmins can access without tenant ID (for managing stores)
    if (req.user?.role === 'superadmin') {
        if (tenantId) {
            req.tenantId = tenantId;
        }
        return next();
    }
    if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID required' });
        return;
    }
    if (req.user && req.user.tenantId !== tenantId) {
        res.status(403).json({ error: 'Access denied to this store' });
        return;
    }
    try {
        const tenant = await tenant_model_js_1.Tenant.findById(tenantId);
        if (!tenant) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        if (!tenant.isActive) {
            res.status(403).json({ error: 'Store is inactive' });
            return;
        }
        req.tenantId = tenantId;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Error validating tenant' });
    }
}
//# sourceMappingURL=tenant.middleware.js.map