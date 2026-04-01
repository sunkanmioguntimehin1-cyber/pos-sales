"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
const customer_model_js_1 = require("../models/customer.model.js");
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
async function getCustomers(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { tier, search } = req.query;
        const filter = tenantId ? { tenantId } : {};
        if (tier && tier !== 'all') {
            filter.tier = tier;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        const customers = await customer_model_js_1.Customer.find(filter).sort({ totalSpent: -1 });
        res.json({ customers });
    }
    catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to get customers' });
    }
}
async function createCustomer(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { name, email, phone, address, notes } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        const customerData = {
            name,
            email: email?.toLowerCase(),
            phone,
            address,
            notes,
        };
        if (tenantId)
            customerData.tenantId = tenantId;
        const customer = new customer_model_js_1.Customer(customerData);
        await customer.save();
        res.status(201).json({ customer });
    }
    catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
}
async function updateCustomer(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { customerId } = req.params;
        const updates = req.body;
        delete updates.tenantId;
        if (updates.email) {
            updates.email = updates.email.toLowerCase();
        }
        const query = { _id: customerId };
        if (tenantId)
            query.tenantId = tenantId;
        const customer = await customer_model_js_1.Customer.findOneAndUpdate(query, updates, { new: true });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json({ customer });
    }
    catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
}
async function deleteCustomer(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { customerId } = req.params;
        const query = { _id: customerId };
        if (tenantId)
            query.tenantId = tenantId;
        const customer = await customer_model_js_1.Customer.findOneAndDelete(query);
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
}
//# sourceMappingURL=customers.controller.js.map