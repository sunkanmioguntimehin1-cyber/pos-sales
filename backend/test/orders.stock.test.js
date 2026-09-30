import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { Staff } from '../src/models/staff.model.js';
import { Customer } from '../src/models/customer.model.js';
import { Order } from '../src/models/order.model.js';
import { Stock } from '../src/models/stock.model.js';
import { createOrder, updateOrderStatus, getOrders } from '../src/controllers/orders.controller.js';
import { getLocationStock, setLocationStock, ensureHeadOffice } from '../src/services/stock.service.js';

/** A completed order is the only thing that has ever deducted stock. */
async function seedOrder({ branchId, items, total = 100, customerId } = {}) {
  const staff = await Staff.create({ name: 'Ada', email: 'ada@test.local', role: 'cashier' });

  return Order.create({
    orderNumber: `ORD-TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    items,
    subtotal: total,
    tax: 0,
    total,
    status: 'completed',
    staffId: staff._id,
    branchId,
    customerId,
  });
}

describe('orders: per-location stock and refunds', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  describe('createOrder', () => {
    it('draws stock from the named location, not the business-wide total', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const staff = await Staff.create({ name: 'Ada', role: 'cashier' });

      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 40);
      await setLocationStock(product._id, outlet._id, 2);

      const res = mockRes();
      await createOrder({
        body: {
          items: [{ productId: String(product._id), productName: 'Widget', quantity: 2, unitPrice: 5, totalPrice: 10 }],
          subtotal: 10, tax: 0, total: 10, branchId: String(outlet._id), staffId: String(staff._id),
        },
        user: { userId: String(staff._id) },
      }, res);

      assert.equal(res.statusCode, 201);
      assert.equal(await getLocationStock(product._id, outlet._id), 0);
      assert.equal(await getLocationStock(product._id, headOffice._id), 40, 'head office must be untouched');
      assert.equal((await Product.findById(product._id)).stock, 40);
    });

    it('records the source location on each order line', async () => {
      const headOffice = await ensureHeadOffice();
      const staff = await Staff.create({ name: 'Ada', role: 'cashier' });
      const product = await Product.create({ name: 'Widget', price: 5 });
      await setLocationStock(product._id, headOffice._id, 10);

      const res = mockRes();
      await createOrder({
        body: {
          items: [{ productId: String(product._id), productName: 'Widget', quantity: 3, unitPrice: 5, totalPrice: 15 }],
          subtotal: 15, tax: 0, total: 15, branchId: String(headOffice._id), staffId: String(staff._id),
        },
        user: { userId: String(staff._id) },
      }, res);

      const order = await Order.findById(res.body.order._id);
      assert.equal(String(order.items[0].locationId), String(headOffice._id));
      assert.equal(String(order.branchId), String(headOffice._id));
    });

    it('rejects a sale the chosen location cannot cover, without touching stock', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const staff = await Staff.create({ name: 'Ada', role: 'cashier' });
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 50);

      const res = mockRes();
      await createOrder({
        body: {
          items: [{ productId: String(product._id), productName: 'Widget', quantity: 1, unitPrice: 5, totalPrice: 5 }],
          subtotal: 5, tax: 0, total: 5, branchId: String(outlet._id), staffId: String(staff._id),
        },
        user: { userId: String(staff._id) },
      }, res);

      assert.equal(res.statusCode, 400);
      assert.match(res.body.error, /Insufficient stock/);
      assert.match(res.body.error, /Accra Mall/, 'the error should name the location');
      assert.equal(await getLocationStock(product._id, headOffice._id), 50);
      assert.equal(await Order.countDocuments(), 0);
    });

    it('falls back to head office when no location is given', async () => {
      const headOffice = await ensureHeadOffice();
      const staff = await Staff.create({ name: 'Ada', role: 'cashier' });
      const product = await Product.create({ name: 'Widget', price: 5 });
      await setLocationStock(product._id, headOffice._id, 10);

      const res = mockRes();
      await createOrder({
        body: {
          items: [{ productId: String(product._id), productName: 'Widget', quantity: 4, unitPrice: 5, totalPrice: 20 }],
          subtotal: 20, tax: 0, total: 20, staffId: String(staff._id),
        },
        user: { userId: String(staff._id) },
      }, res);

      assert.equal(res.statusCode, 201);
      assert.equal(await getLocationStock(product._id, headOffice._id), 6);
    });
  });

  describe('updateOrderStatus: stock restoration', () => {
    it('puts stock back when an order is cancelled', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 10);
      await setLocationStock(product._id, headOffice._id, 6);

      const order = await seedOrder({
        branchId: headOffice._id,
        items: [{ productId: product._id, productName: 'Widget', quantity: 4, unitPrice: 5, totalPrice: 20, locationId: headOffice._id }],
      });

      const res = mockRes();
      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'cancelled' } }, res);

      assert.equal(res.statusCode, 200);
      assert.equal(await getLocationStock(product._id, headOffice._id), 10);
      assert.equal((await Product.findById(product._id)).stock, 10);
    });

    it('restores to the location the line was drawn from, not the header branch', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, outlet._id, 10);
      await setLocationStock(product._id, outlet._id, 7);

      const order = await seedOrder({
        branchId: headOffice._id, // header says head office...
        items: [{ productId: product._id, productName: 'Widget', quantity: 3, unitPrice: 5, totalPrice: 15, locationId: outlet._id }], // ...but the line came from the outlet
      });

      const res = mockRes();
      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'refunded' } }, res);

      assert.equal(await getLocationStock(product._id, outlet._id), 10);
      assert.equal(
        await getLocationStock(product._id, headOffice._id),
        0,
        'head office was never debited, so it must not be credited'
      );
    });

    it('is idempotent: cancelling twice only ever credits once', async () => {
      // The original bug was a blind findByIdAndUpdate with no knowledge of the
      // previous status, so every repeat of the request credited the stock
      // back again.
      const headOffice = await ensureHeadOffice();
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 10);
      await setLocationStock(product._id, headOffice._id, 6);

      const order = await seedOrder({
        branchId: headOffice._id,
        items: [{ productId: product._id, productName: 'Widget', quantity: 4, unitPrice: 5, totalPrice: 20, locationId: headOffice._id }],
      });

      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'cancelled' } }, mockRes());
      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'cancelled' } }, mockRes());
      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'cancelled' } }, mockRes());

      assert.equal(await getLocationStock(product._id, headOffice._id), 10, 'stock must not be credited repeatedly');
    });

    it('does not credit again when an order is reopened from cancelled', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 10);
      await setLocationStock(product._id, headOffice._id, 6);

      const order = await seedOrder({
        branchId: headOffice._id,
        items: [{ productId: product._id, productName: 'Widget', quantity: 4, unitPrice: 5, totalPrice: 20, locationId: headOffice._id }],
      });

      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'cancelled' } }, mockRes());
      assert.equal(await getLocationStock(product._id, headOffice._id), 10);

      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'completed' } }, mockRes());
      assert.equal(await getLocationStock(product._id, headOffice._id), 10, 'reopening must not deduct or credit');
    });

    it('reverses the customer totals on cancel', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 10);
      await setLocationStock(product._id, headOffice._id, 6);

      const customer = await Customer.create({ name: 'Kojo', visitCount: 3, totalSpent: 450 });
      const order = await seedOrder({
        branchId: headOffice._id,
        total: 120,
        customerId: customer._id,
        items: [{ productId: product._id, productName: 'Widget', quantity: 4, unitPrice: 5, totalPrice: 20, locationId: headOffice._id }],
      });

      const res = mockRes();
      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'cancelled' } }, res);

      const updated = await Customer.findById(customer._id);
      assert.equal(updated.visitCount, 2);
      assert.equal(updated.totalSpent, 330);
    });

    it('leaves stock alone when moving between non-restocking statuses', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
      await setLocationStock(product._id, headOffice._id, 10);
      await setLocationStock(product._id, headOffice._id, 7);

      const order = await seedOrder({
        branchId: headOffice._id,
        items: [{ productId: product._id, productName: 'Widget', quantity: 3, unitPrice: 5, totalPrice: 15, locationId: headOffice._id }],
      });

      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'pending' } }, mockRes());

      assert.equal(await getLocationStock(product._id, headOffice._id), 7);
    });

    it('rejects an unknown status', async () => {
      const headOffice = await ensureHeadOffice();
      const order = await seedOrder({ branchId: headOffice._id, items: [] });

      const res = mockRes();
      await updateOrderStatus({ params: { orderId: String(order._id) }, body: { status: 'voided' } }, res);

      assert.equal(res.statusCode, 400);
    });

    it('returns 404 for a missing order', async () => {
      const res = mockRes();
      await updateOrderStatus({ params: { orderId: '5f9f1b9b9b9b9b9b9b9b9b9b' }, body: { status: 'cancelled' } }, res);
      assert.equal(res.statusCode, 404);
    });

    it('returns 400 for a malformed order id', async () => {
      const res = mockRes();
      await updateOrderStatus({ params: { orderId: 'not-an-id' }, body: { status: 'cancelled' } }, res);
      assert.equal(res.statusCode, 400);
    });
  });

  describe('getOrders: branch history', () => {
    it('filters sales down to the named location', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await Product.create({ name: 'Widget', price: 5 });

      const item = [{ productId: product._id, productName: 'Widget', quantity: 1, unitPrice: 5, totalPrice: 5 }];
      const inStore = await seedOrder({ branchId: outlet._id, items: item });
      await seedOrder({ branchId: headOffice._id, items: item });

      const res = mockRes();
      await getOrders({ query: { branchId: String(outlet._id) } }, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.orders.length, 1);
      assert.equal(String(res.body.orders[0]._id), String(inStore._id));
    });

    it('treats branchId=all as an unfiltered list, not an ObjectId to cast', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await Product.create({ name: 'Widget', price: 5 });
      const item = [{ productId: product._id, productName: 'Widget', quantity: 1, unitPrice: 5, totalPrice: 5 }];
      await seedOrder({ branchId: outlet._id, items: item });
      await seedOrder({ branchId: headOffice._id, items: item });

      const res = mockRes();
      await getOrders({ query: { branchId: 'all' } }, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.orders.length, 2);
    });
  });

  describe('deleting a product', () => {
    it('leaves no orphaned stock rows behind', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await Product.create({ name: 'Widget', price: 5 });
      await setLocationStock(product._id, headOffice._id, 7);

      const { deleteProduct } = await import('../src/controllers/products.controller.js');
      const res = mockRes();
      await deleteProduct({ params: { productId: String(product._id) } }, res);

      assert.equal(res.statusCode, 200);
      assert.equal(await Stock.countDocuments({ productId: product._id }), 0);
    });
  });
});
