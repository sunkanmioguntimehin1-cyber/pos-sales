"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = createStore;
exports.getStores = getStores;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.deleteStore = deleteStore;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tenant_model_js_1 = require("../models/tenant.model.js");
const tenantAdmin_model_js_1 = require("../models/tenantAdmin.model.js");
const staff_model_js_1 = require("../models/staff.model.js");
const branch_model_js_1 = require("../models/branch.model.js");
const category_model_js_1 = require("../models/category.model.js");
const email_js_1 = require("../utils/email.js");
async function createStore(req, res) {
    try {
        const { name, subdomain, description, adminName, adminEmail, adminPassword, settings } = req.body;
        if (!name || !subdomain || !adminName || !adminEmail || !adminPassword) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const subdomainLower = subdomain.toLowerCase();
        const existingTenant = await tenant_model_js_1.Tenant.findOne({ subdomain: subdomainLower });
        if (existingTenant) {
            res.status(400).json({ error: 'Subdomain already taken' });
            return;
        }
        const existingAdmin = await tenantAdmin_model_js_1.TenantAdmin.findOne({ email: adminEmail.toLowerCase() });
        if (existingAdmin) {
            res.status(400).json({ error: 'Admin email already registered' });
            return;
        }
        const tenant = new tenant_model_js_1.Tenant({
            name,
            subdomain: subdomainLower,
            description: description || '',
            settings: settings || {
                primaryColor: '#3B82F6',
                accentColor: '#6366F1',
                theme: 'dark',
            },
        });
        await tenant.save();
        const passwordHash = await bcryptjs_1.default.hash(adminPassword, 12);
        const admin = new tenantAdmin_model_js_1.TenantAdmin({
            email: adminEmail.toLowerCase(),
            passwordHash,
            name: adminName,
            tenantId: tenant._id,
        });
        await admin.save();
        const defaultBranch = new branch_model_js_1.Branch({
            name: 'Main Branch',
            isDefault: true,
            tenantId: tenant._id,
        });
        await defaultBranch.save();
        const defaultCategory = new category_model_js_1.Category({
            name: 'General',
            tenantId: tenant._id,
        });
        await defaultCategory.save();
        (0, email_js_1.sendWelcomeEmail)(adminEmail, adminName, name, adminPassword, subdomainLower).catch((emailError) => {
            console.error('Failed to send welcome email:', emailError);
        });
        res.status(201).json({
            store: {
                id: tenant._id,
                name: tenant.name,
                subdomain: tenant.subdomain,
                description: tenant.description,
                settings: tenant.settings,
                isActive: tenant.isActive,
                createdAt: tenant.createdAt,
            },
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
            },
        });
    }
    catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ error: 'Failed to create store' });
    }
}
async function getStores(req, res) {
    try {
        const stores = await tenant_model_js_1.Tenant.find().sort({ createdAt: -1 });
        const storesWithAdmin = await Promise.all(stores.map(async (store) => {
            const admin = await tenantAdmin_model_js_1.TenantAdmin.findOne({ tenantId: store._id });
            const staffCount = await staff_model_js_1.Staff.countDocuments({ tenantId: store._id });
            return {
                id: store._id,
                name: store.name,
                subdomain: store.subdomain,
                description: store.description,
                logo: store.logo,
                isActive: store.isActive,
                settings: store.settings,
                createdAt: store.createdAt,
                admin: admin ? { id: admin._id, name: admin.name, email: admin.email } : null,
                staffCount,
            };
        }));
        res.json({ stores: storesWithAdmin });
    }
    catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Failed to get stores' });
    }
}
async function getStore(req, res) {
    try {
        const { storeId } = req.params;
        const store = await tenant_model_js_1.Tenant.findById(storeId);
        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        const admin = await tenantAdmin_model_js_1.TenantAdmin.findOne({ tenantId: store._id });
        const staffCount = await staff_model_js_1.Staff.countDocuments({ tenantId: store._id });
        const branchCount = await branch_model_js_1.Branch.countDocuments({ tenantId: store._id });
        res.json({
            store: {
                id: store._id,
                name: store.name,
                subdomain: store.subdomain,
                description: store.description,
                logo: store.logo,
                isActive: store.isActive,
                settings: store.settings,
                createdAt: store.createdAt,
                admin: admin ? { id: admin._id, name: admin.name, email: admin.email } : null,
                stats: { staffCount, branchCount },
            },
        });
    }
    catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Failed to get store' });
    }
}
async function updateStore(req, res) {
    try {
        const { storeId } = req.params;
        const { name, description, logo, isActive, settings } = req.body;
        const store = await tenant_model_js_1.Tenant.findById(storeId);
        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        if (name)
            store.name = name;
        if (description !== undefined)
            store.description = description;
        if (logo !== undefined)
            store.logo = logo;
        if (isActive !== undefined)
            store.isActive = isActive;
        if (settings) {
            store.settings = { ...store.settings, ...settings };
        }
        await store.save();
        res.json({ store });
    }
    catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ error: 'Failed to update store' });
    }
}
async function deleteStore(req, res) {
    try {
        const { storeId } = req.params;
        const store = await tenant_model_js_1.Tenant.findById(storeId);
        if (!store) {
            res.status(404).json({ error: 'Store not found' });
            return;
        }
        await tenantAdmin_model_js_1.TenantAdmin.deleteMany({ tenantId: storeId });
        await staff_model_js_1.Staff.deleteMany({ tenantId: storeId });
        await branch_model_js_1.Branch.deleteMany({ tenantId: storeId });
        await category_model_js_1.Category.deleteMany({ tenantId: storeId });
        await tenant_model_js_1.Tenant.findByIdAndDelete(storeId);
        res.json({ message: 'Store deleted successfully' });
    }
    catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
}
//# sourceMappingURL=superadmin.controller.js.map