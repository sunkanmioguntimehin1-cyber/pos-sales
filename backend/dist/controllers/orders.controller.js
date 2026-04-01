"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = getOrders;
exports.createOrder = createOrder;
exports.getOrder = getOrder;
exports.updateOrderStatus = updateOrderStatus;
const order_model_js_1 = require("../models/order.model.js");
const product_model_js_1 = require("../models/product.model.js");
const customer_model_js_1 = require("../models/customer.model.js");
function generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${dateStr}-${random}`;
}
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
async function getOrders(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { status, startDate, endDate } = req.query;
        const filter = tenantId ? { tenantId } : {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }
        const orders = await order_model_js_1.Order.find(filter)
            .populate('staffId', 'name')
            .populate('customerId', 'name')
            .populate('branchId', 'name')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ orders });
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
}
async function createOrder(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { items, subtotal, tax, total, paymentMethod, customerId, branchId, notes } = req.body;
        if (!items || items.length === 0) {
            res.status(400).json({ error: 'Order must have at least one item' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        let staffId = req.user.userId;
        if (req.user.role === 'tenant_admin' && tenantId) {
            const Staff = (await import('../models/staff.model.js')).Staff;
            const adminAsStaff = await Staff.findOne({ tenantId, role: 'admin' });
            if (adminAsStaff) {
                staffId = adminAsStaff._id.toString();
            }
        }
        for (const item of items) {
            const query = { _id: item.productId };
            if (tenantId)
                query.tenantId = tenantId;
            await product_model_js_1.Product.findOneAndUpdate(query, { $inc: { stock: -item.quantity } });
        }
        if (customerId && tenantId) {
            await customer_model_js_1.Customer.findOneAndUpdate({ _id: customerId, tenantId }, {
                $inc: { visitCount: 1, totalSpent: total },
                $set: { lastVisit: new Date() },
            });
        }
        const orderData = {
            orderNumber: generateOrderNumber(),
            items,
            subtotal,
            tax,
            total,
            paymentMethod,
            customerId,
            staffId,
            branchId,
            notes,
        };
        if (tenantId)
            orderData.tenantId = tenantId;
        const order = new order_model_js_1.Order(orderData);
        await order.save();
        await order.populate([
            { path: 'staffId', select: 'name' },
            { path: 'customerId', select: 'name' },
            { path: 'branchId', select: 'name' },
        ]);
        res.status(201).json({ order });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
}
async function getOrder(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { orderId } = req.params;
        const query = { _id: orderId };
        if (tenantId)
            query.tenantId = tenantId;
        const order = await order_model_js_1.Order.findOne(query)
            .populate('staffId', 'name')
            .populate('customerId', 'name email')
            .populate('branchId', 'name');
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json({ order });
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
}
async function updateOrderStatus(req, res) {
    try {
        const tenantId = requireTenantId(req, res);
        if (tenantId === undefined)
            return;
        const { orderId } = req.params;
        const { status } = req.body;
        if (!['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const query = { _id: orderId };
        if (tenantId)
            query.tenantId = tenantId;
        const order = await order_model_js_1.Order.findOneAndUpdate(query, { status }, { new: true }).populate('staffId', 'name');
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json({ order });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
}
//# sourceMappingURL=orders.controller.js.map