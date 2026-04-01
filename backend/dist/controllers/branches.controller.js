"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranches = getBranches;
exports.createBranch = createBranch;
exports.updateBranch = updateBranch;
exports.deleteBranch = deleteBranch;
const branch_model_js_1 = require("../models/branch.model.js");
function requireTenantId(req, res) {
    if (req.user?.role === 'superadmin') {
        return req.headers['x-tenant-id'] || null;
    }
    const tenantId = req.headers['x-tenant-id'];
    if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID required' });
        return null;
    }
    return tenantId;
}
async function getBranches(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const filter = tenantId ? { tenantId } : {};
        const branches = await branch_model_js_1.Branch.find(filter).sort({ isDefault: -1, name: 1 });
        res.json({ branches });
    }
    catch (error) {
        console.error('Get branches error:', error);
        res.status(500).json({ error: 'Failed to get branches' });
    }
}
async function createBranch(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { name, address, phone, isDefault } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        if (isDefault && tenantId) {
            await branch_model_js_1.Branch.updateMany({ tenantId }, { isDefault: false });
        }
        const branchData = {
            name,
            address,
            phone,
            isDefault: isDefault || false,
        };
        if (tenantId)
            branchData.tenantId = tenantId;
        const branch = new branch_model_js_1.Branch(branchData);
        await branch.save();
        res.status(201).json({ branch });
    }
    catch (error) {
        console.error('Create branch error:', error);
        res.status(500).json({ error: 'Failed to create branch' });
    }
}
async function updateBranch(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { branchId } = req.params;
        const updates = req.body;
        delete updates.tenantId;
        if (updates.isDefault && tenantId) {
            await branch_model_js_1.Branch.updateMany({ tenantId }, { isDefault: false });
        }
        const query = { _id: branchId };
        if (tenantId)
            query.tenantId = tenantId;
        const branch = await branch_model_js_1.Branch.findOneAndUpdate(query, updates, { new: true });
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        res.json({ branch });
    }
    catch (error) {
        console.error('Update branch error:', error);
        res.status(500).json({ error: 'Failed to update branch' });
    }
}
async function deleteBranch(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { branchId } = req.params;
        const query = { _id: branchId };
        if (tenantId)
            query.tenantId = tenantId;
        const branch = await branch_model_js_1.Branch.findOne(query);
        if (!branch) {
            res.status(404).json({ error: 'Branch not found' });
            return;
        }
        if (branch.isDefault) {
            res.status(400).json({ error: 'Cannot delete the default branch' });
            return;
        }
        await branch_model_js_1.Branch.findByIdAndDelete(branchId);
        res.json({ message: 'Branch deleted successfully' });
    }
    catch (error) {
        console.error('Delete branch error:', error);
        res.status(500).json({ error: 'Failed to delete branch' });
    }
}
//# sourceMappingURL=branches.controller.js.map