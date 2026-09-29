import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { Staff } from '../src/models/staff.model.js';
import { StockTransfer } from '../src/models/stockTransfer.model.js';
import { StockLog } from '../src/models/stockLog.model.js';
import { ensureHeadOffice, setLocationStock } from '../src/services/stock.service.js';
import {
  recordMovements, getMovements, backfillTransferLogs, transferRef,
} from '../src/services/stockLog.service.js';
import { createProduct, adjustStock } from '../src/controllers/products.controller.js';
import { createTransfer } from '../src/controllers/transfers.controller.js';
import { createOrder, updateOrderStatus } from '../src/controllers/orders.controller.js';

async function setup() {
  const headOffice = await ensureHeadOffice();
  const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
  const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
  await setLocationStock(product._id, headOffice._id, 40);
  const staff = await Staff.create({ name: 'Ada', email: 'ada@test.local', role: 'manager' });
  return { headOffice, outlet, product, staff };
}

describe('stock movement log', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('records and reads back a movement with resolved names', async () => {
    const { headOffice, product, staff } = await setup();

    await recordMovements([{
      productId: product._id,
      branchId: headOffice._id,
      type: 'receive',
      quantity: 40,
      source: 'create',
      sourceId: product._id,
      ref: 'OPEN-1',
      staffId: staff._id,
    }]);

    const res = await getMovements({ productId: String(product._id) });
    assert.equal(res.length, 1);
    assert.equal(res[0].productName, 'Widget');
    assert.equal(res[0].type, 'receive');
    assert.equal(res[0].quantity, 40);
    assert.equal(res[0].staffName, 'Ada');
    assert.equal(String(res[0].branchId._id), String(headOffice._id));
  });

  it('filters movements by location, type and product', async () => {
    const { headOffice, outlet, product } = await setup();
    const other = await Product.create({ name: 'Gadget', price: 9 });

    await recordMovements([
      { productId: product._id, branchId: headOffice._id, type: 'receive', quantity: 10, source: 'create', sourceId: product._id },
      { productId: product._id, branchId: outlet._id, type: 'receive', quantity: 5, source: 'adjust', sourceId: product._id },
      { productId: other._id, branchId: headOffice._id, type: 'receive', quantity: 3, source: 'create', sourceId: other._id },
      { productId: product._id, branchId: outlet._id, type: 'damage', quantity: -5, source: 'adjust', sourceId: product._id },
    ]);

    assert.equal((await getMovements({ branchId: String(outlet._id) })).length, 2);
    assert.equal((await getMovements({ productId: String(product._id) })).length, 3);
    assert.equal((await getMovements({ productId: String(product._id), type: 'damage' })).length, 1);
    assert.equal((await getMovements({})).length, 4);
  });

  it('writing a transfer logs one entry per direction, sharing a ref', async () => {
    const { headOffice, outlet, product, staff } = await setup();

    const res = mockRes();
    await createTransfer({
      body: {
        fromBranchId: String(headOffice._id),
        toBranchId: String(outlet._id),
        items: [{ productId: String(product._id), productName: 'Widget', quantity: 12 }],
        staffId: String(staff._id),
      },
      user: { userId: String(staff._id) },
    }, res);

    assert.equal(res.statusCode, 201);

    const logs = await StockLog.find({ source: 'transfer', sourceId: res.body.transfer._id }).sort({ quantity: 1 });
    assert.equal(logs.length, 2);
    const [out, inbound] = logs;
    assert.equal(out.quantity, -12);
    assert.equal(inbound.quantity, 12);
    assert.equal(String(out.branchId), String(headOffice._id));
    assert.equal(String(inbound.branchId), String(outlet._id));
    assert.equal(out.ref, inbound.ref);
    assert.equal(out.ref, transferRef(res.body.transfer._id));
    assert.equal(out.staffName, 'Ada');
  });

  it('creating a product books its opening stock into the log', async () => {
    const res = mockRes();
    await createProduct({ body: { name: 'Sprocket', price: 3, stock: 25 }, user: {} }, res);

    assert.equal(res.statusCode, 201);
    const log = await StockLog.findOne({ source: 'create', sourceId: res.body.product._id });
    assert.ok(log, 'opening stock should be logged');
    assert.equal(log.quantity, 25);
    assert.equal(log.type, 'receive');
    assert.equal(log.productName, 'Sprocket');
  });

  it('logs the delta actually applied by a count correction', async () => {
    const { headOffice, product } = await setup();
    // Correct the shelf from 40 to 30 → a -10 movement, not "-30".
    const res = mockRes();
    await adjustStock({
      params: { productId: String(product._id) },
      body: { adjustment: 30, type: 'set', branchId: String(headOffice._id) },
      user: {},
    }, res);

    assert.equal(res.statusCode, 200);
    const log = await StockLog.findOne({ source: 'adjust', sourceId: product._id, type: 'correction' });
    assert.ok(log);
    assert.equal(log.quantity, -10);
  });

  it('logs a clamped write-off as the full removal, not the requested amount', async () => {
    const { headOffice, product } = await setup();
    // Request -100 against a shelf of 40: the backend clamps to 0, so the
    // ledger must record -40 — writing -100 would imply units that never left.
    const res = mockRes();
    await adjustStock({
      params: { productId: String(product._id) },
      body: { adjustment: -100, branchId: String(headOffice._id) },
      user: {},
    }, res);

    assert.equal(res.statusCode, 200);
    const log = await StockLog.findOne({ source: 'adjust', sourceId: product._id, type: 'damage' });
    assert.ok(log);
    assert.equal(log.quantity, -40);
  });

  it('logs a sale line per order and a restock on refund', async () => {
    const { headOffice, product, staff } = await setup();

    const create = mockRes();
    await createOrder({
      body: {
        items: [{ productId: String(product._id), productName: 'Widget', quantity: 3, unitPrice: 5, totalPrice: 15 }],
        subtotal: 15, tax: 0, total: 15,
        branchId: String(headOffice._id),
        staffId: String(staff._id),
      },
      user: { userId: String(staff._id) },
    }, create);

    assert.equal(create.statusCode, 201);
    const orderId = create.body.order._id;

    const sales = await StockLog.find({ source: 'order', sourceId: orderId, type: 'sale' });
    assert.equal(sales.length, 1);
    assert.equal(sales[0].quantity, -3);
    assert.equal(sales[0].ref, create.body.order.orderNumber);
    assert.equal(sales[0].staffName, 'Ada');

    const refunded = mockRes();
    await updateOrderStatus({ params: { orderId: String(orderId) }, body: { status: 'refunded' }, user: {} }, refunded);
    assert.equal(refunded.statusCode, 200);

    const restock = await StockLog.findOne({ source: 'order', sourceId: orderId, type: 'receive' });
    assert.ok(restock);
    assert.equal(restock.quantity, 3);
    assert.equal(restock.note, 'Restocked from completed order');
  });

  it('backfills the log from transfers recorded before the feature existed', async () => {
    const { headOffice, outlet, product, staff } = await setup();

    const transfer = await StockTransfer.create({
      fromBranchId: headOffice._id,
      toBranchId: outlet._id,
      items: [{ productId: product._id, productName: 'Widget', quantity: 7 }],
      staffId: staff._id,
    });

    assert.equal(await StockLog.countDocuments(), 0, 'old transfers have no log yet');

    const seeded = await backfillTransferLogs();
    assert.equal(seeded, 2);

    const rerun = await backfillTransferLogs();
    assert.equal(rerun, 0, 're-running must not double-log');
    assert.equal(await StockLog.countDocuments(), 2);

    const logs = await StockLog.find({ sourceId: transfer._id }).sort({ quantity: 1 });
    assert.equal(logs.length, 2);
    assert.equal(logs[0].quantity, -7);
    assert.equal(logs[1].quantity, 7);
    assert.equal(logs[0].productName, 'Widget');
    assert.equal(logs[0].staffName, 'Ada');
  });

  it('skips logging a zero-quantity adjustment', async () => {
    const { headOffice, product } = await setup();
    await setLocationStock(product._id, headOffice._id, 10);

    const res = mockRes();
    await adjustStock({
      params: { productId: String(product._id) },
      body: { adjustment: 10, type: 'set', branchId: String(headOffice._id) },
      user: {},
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(await StockLog.countDocuments({ source: 'adjust' }), 0);
  });
});