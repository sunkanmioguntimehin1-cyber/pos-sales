"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.registerSuperadmin = registerSuperadmin;
exports.getMe = getMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const superadmin_model_js_1 = require("../models/superadmin.model.js");
const tenantAdmin_model_js_1 = require("../models/tenantAdmin.model.js");
const staff_model_js_1 = require("../models/staff.model.js");
const jwt_js_1 = require("../utils/jwt.js");
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        let user = await superadmin_model_js_1.Superadmin.findOne({ email: email.toLowerCase() });
        if (user) {
            const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (isValid) {
                const token = (0, jwt_js_1.generateToken)({
                    userId: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: 'superadmin',
                    tenantId: null,
                });
                res.json({
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: 'superadmin',
                        tenantId: null,
                    },
                });
                return;
            }
        }
        user = await tenantAdmin_model_js_1.TenantAdmin.findOne({ email: email.toLowerCase() }).populate('tenantId');
        if (user) {
            const tenantAdmin = user;
            const isValid = await bcryptjs_1.default.compare(password, tenantAdmin.passwordHash);
            if (isValid) {
                const token = (0, jwt_js_1.generateToken)({
                    userId: tenantAdmin._id.toString(),
                    email: tenantAdmin.email,
                    name: tenantAdmin.name,
                    role: 'tenant_admin',
                    tenantId: tenantAdmin.tenantId._id.toString(),
                });
                res.json({
                    token,
                    user: {
                        id: tenantAdmin._id,
                        email: tenantAdmin.email,
                        name: tenantAdmin.name,
                        role: 'tenant_admin',
                        tenantId: tenantAdmin.tenantId,
                        tenant: tenantAdmin.tenantId,
                    },
                });
                return;
            }
        }
        const staffMember = await staff_model_js_1.Staff.findOne({ email: email.toLowerCase() }).populate('tenantId');
        if (staffMember) {
            const isValid = await bcryptjs_1.default.compare(password, staffMember.passwordHash);
            if (isValid) {
                const token = (0, jwt_js_1.generateToken)({
                    userId: staffMember._id.toString(),
                    email: staffMember.email || '',
                    name: staffMember.name,
                    role: 'staff',
                    tenantId: staffMember.tenantId._id.toString(),
                });
                res.json({
                    token,
                    user: {
                        id: staffMember._id,
                        email: staffMember.email,
                        name: staffMember.name,
                        role: 'staff',
                        tenantId: staffMember.tenantId,
                        tenant: staffMember.tenantId,
                    },
                });
                return;
            }
        }
        res.status(401).json({ error: 'Invalid credentials' });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}
async function registerSuperadmin(req, res) {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }
        const existing = await superadmin_model_js_1.Superadmin.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const superadmin = new superadmin_model_js_1.Superadmin({
            email: email.toLowerCase(),
            passwordHash,
            name,
        });
        await superadmin.save();
        const token = (0, jwt_js_1.generateToken)({
            userId: superadmin._id.toString(),
            email: superadmin.email,
            name: superadmin.name,
            role: 'superadmin',
            tenantId: null,
        });
        res.status(201).json({
            token,
            user: {
                id: superadmin._id,
                email: superadmin.email,
                name: superadmin.name,
                role: 'superadmin',
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        res.json({ user: req.user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
}
//# sourceMappingURL=auth.controller.js.map