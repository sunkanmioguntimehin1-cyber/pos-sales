"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaff = getStaff;
exports.createStaff = createStaff;
exports.updateStaff = updateStaff;
exports.deleteStaff = deleteStaff;
exports.verifyPin = verifyPin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const staff_model_js_1 = require("../models/staff.model.js");
function getTenantId(req) {
    if (req.user?.role === 'superadmin') {
        return req.headers['x-tenant-id'] || null;
    }
    return req.headers['x-tenant-id'] || null;
}
function requireTenantId(req, res) {
    const tenantId = getTenantId(req);
    if (req.user?.role !== 'superadmin' && !tenantId) {
        res.status(400).json({ error: 'Tenant ID required' });
        return null;
    }
    return tenantId;
}
async function getStaff(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { role, status, search } = req.query;
        const filter = tenantId ? { tenantId } : {};
        if (role && role !== 'all') {
            filter.role = role;
        }
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const staff = await staff_model_js_1.Staff.find(filter).sort({ createdAt: -1 });
        const staffWithoutPin = staff.map(s => ({
            id: s._id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            role: s.role,
            status: s.status,
            createdAt: s.createdAt,
        }));
        res.json({ staff: staffWithoutPin });
    }
    catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ error: 'Failed to get staff' });
    }
}
async function createStaff(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { name, email, phone, pin, role, status } = req.body;
        if (!name || !role) {
            res.status(400).json({ error: 'Name and role are required' });
            return;
        }
        if (email) {
            const query = { email: email.toLowerCase() };
            if (tenantId)
                query.tenantId = tenantId;
            const existing = await staff_model_js_1.Staff.findOne(query);
            if (existing) {
                res.status(400).json({ error: 'Email already in use' });
                return;
            }
        }
        const staffData = {
            name,
            email: email?.toLowerCase(),
            phone,
            pinHash: pin ? await bcryptjs_1.default.hash(pin, 10) : undefined,
            role,
            status: status || 'active',
        };
        if (tenantId)
            staffData.tenantId = tenantId;
        const staff = new staff_model_js_1.Staff(staffData);
        await staff.save();
        res.status(201).json({
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                status: staff.status,
                createdAt: staff.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ error: 'Failed to create staff' });
    }
}
async function updateStaff(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { staffId } = req.params;
        const { name, email, phone, pin, role, status } = req.body;
        const query = { _id: staffId };
        if (tenantId)
            query.tenantId = tenantId;
        const staff = await staff_model_js_1.Staff.findOne(query);
        if (!staff) {
            res.status(404).json({ error: 'Staff not found' });
            return;
        }
        if (name)
            staff.name = name;
        if (email !== undefined)
            staff.email = email?.toLowerCase();
        if (phone !== undefined)
            staff.phone = phone;
        if (role)
            staff.role = role;
        if (status)
            staff.status = status;
        if (pin)
            staff.pinHash = await bcryptjs_1.default.hash(pin, 10);
        await staff.save();
        res.json({
            staff: {
                id: staff._id,
                name: staff.name,
                email: staff.email,
                phone: staff.phone,
                role: staff.role,
                status: staff.status,
                createdAt: staff.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({ error: 'Failed to update staff' });
    }
}
async function deleteStaff(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { staffId } = req.params;
        const query = { _id: staffId };
        if (tenantId)
            query.tenantId = tenantId;
        const staff = await staff_model_js_1.Staff.findOneAndDelete(query);
        if (!staff) {
            res.status(404).json({ error: 'Staff not found' });
            return;
        }
        res.json({ message: 'Staff deleted successfully' });
    }
    catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: 'Failed to delete staff' });
    }
}
async function verifyPin(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { staffId, pin } = req.body;
        if (!staffId || !pin) {
            res.status(400).json({ error: 'Staff ID and PIN required' });
            return;
        }
        const query = { _id: staffId, status: 'active' };
        if (tenantId)
            query.tenantId = tenantId;
        const staff = await staff_model_js_1.Staff.findOne(query);
        if (!staff) {
            res.status(404).json({ error: 'Staff not found' });
            return;
        }
        if (!staff.pinHash) {
            res.status(400).json({ error: 'Staff has no PIN set' });
            return;
        }
        const isValid = await bcryptjs_1.default.compare(pin, staff.pinHash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid PIN' });
            return;
        }
        res.json({
            success: true,
            staff: {
                id: staff._id,
                name: staff.name,
                role: staff.role,
            },
        });
    }
    catch (error) {
        console.error('Verify PIN error:', error);
        res.status(500).json({ error: 'Failed to verify PIN' });
    }
}
//# sourceMappingURL=staff.controller.js.map