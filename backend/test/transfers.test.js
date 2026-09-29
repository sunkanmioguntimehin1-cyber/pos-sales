import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { Staff } from '../src/models/staff.model.js';
import { StockTransfer } from '../src/models/stockTransfer.model.js';
import { ensureHeadOffice, setLocationStock, getLocationStock } from '../src/services/stock.service.js';
import { createTransfer } from '../src/controllers/transfers.controller.js';

async function setup() {
  const headOffice = await ensureHeadOffice();
  const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
  const product = await Product.create({ name: 'Widget', price: 5, stock: 0 });
  await setLocationStock(product._id, headOffice._id, 40);
  return { headOffice, outlet, product };
}

function line(product, quantity) {
  return { productId: String(product._id), productName: 'Widget', quantity };
}

describe('transfers', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('moves stock and records the transfer', async () => {
    const { headOffice, outlet, product } = await setup();
    const staff = await Staff.create({ name: 'Ada', email: 'ada@test.local', role: 'manager' });

    const res = mockRes();
    await createTransfer({
      body: {
        fromBranchId: String(headOffice._id),
        toBranchId: String(outlet._id),
        items: [line(product, 12)],
        staffId: String(staff._id),
      },
      user: { userId: String(staff._id) },
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(await getLocationStock(product._id, headOffice._id), 28);
    assert.equal(await getLocationStock(product._id, outlet._id), 12);
    assert.equal((await Product.findById(product._id)).stock, 40, 'total must be conserved');

    const transfer = await StockTransfer.findById(res.body.transfer._id);
    assert.equal(transfer.status, 'completed');
    assert.equal(transfer.items.length, 1);
    assert.equal(transfer.items[0].quantity, 12);
    assert.equal(String(transfer.staffId), String(staff._id));
    assert.equal(res.body.transfer.staffId.name, 'Ada', 'the response attributes who moved it');
  });

  it('rejects a transfer the source cannot cover, leaving both sides untouched', async () => {
    const { headOffice, outlet, product } = await setup();

    const res = mockRes();
    await createTransfer({
      body: { fromBranchId: String(headOffice._id), toBranchId: String(outlet._id), items: [line(product, 100)] },
      user: {},
    }, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /Insufficient stock/);
    assert.equal(await getLocationStock(product._id, headOffice._id), 40);
    assert.equal(await getLocationStock(product._id, outlet._id), 0);
    assert.equal(await StockTransfer.countDocuments(), 0, 'no record of a transfer that never happened');
  });

  it('validates every line before moving any of them', async () => {
    const { headOffice, outlet, product } = await setup();
    const scarce = await Product.create({ name: 'Scarce', price: 5 });
    await setLocationStock(scarce._id, headOffice._id, 1);

    const res = mockRes();
    await createTransfer({
      body: {
        fromBranchId: String(headOffice._id),
        toBranchId: String(outlet._id),
        items: [line(product, 10), line(scarce, 5)],
      },
      user: {},
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(
      await getLocationStock(product._id, headOffice._id),
      40,
      'the valid line must not move when a later line fails validation'
    );
    assert.equal(await StockTransfer.countDocuments(), 0);
  });

  it('merges duplicate lines for the same product before checking availability', async () => {
    // Two lines of 30 each pass a per-line check against 50, but 60 > 50.
    // Summing first is what stops the transfer getting half-way through.
    const { headOffice, outlet, product } = await setup();
    await setLocationStock(product._id, headOffice._id, 50);

    const res = mockRes();
    await createTransfer({
      body: {
        fromBranchId: String(headOffice._id),
        toBranchId: String(outlet._id),
        items: [line(product, 30), line(product, 30)],
      },
      user: {},
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(await getLocationStock(product._id, headOffice._id), 50);
  });

  it('combines duplicate lines into a single movement when the total does fit', async () => {
    const { headOffice, outlet, product } = await setup();

    const res = mockRes();
    await createTransfer({
      body: {
        fromBranchId: String(headOffice._id),
        toBranchId: String(outlet._id),
        items: [line(product, 10), line(product, 15)],
      },
      user: {},
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(await getLocationStock(product._id, outlet._id), 25);

    const transfer = await StockTransfer.findById(res.body.transfer._id);
    assert.equal(transfer.items.length, 1);
    assert.equal(transfer.items[0].quantity, 25);
  });

  it('rejects a transfer to the same branch', async () => {
    const { headOffice, product } = await setup();

    const res = mockRes();
    await createTransfer({
      body: { fromBranchId: String(headOffice._id), toBranchId: String(headOffice._id), items: [line(product, 1)] },
      user: {},
    }, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /different/);
  });

  it('rejects a missing or unknown branch', async () => {
    const { headOffice, product } = await setup();

    const missing = mockRes();
    await createTransfer({
      body: { toBranchId: String(headOffice._id), items: [line(product, 1)] },
      user: {},
    }, missing);
    assert.equal(missing.statusCode, 400);

    const unknown = mockRes();
    await createTransfer({
      body: {
        fromBranchId: String(headOffice._id),
        toBranchId: '5f9f1b9b9b9b9b9b9b9b9b9b',
        items: [line(product, 1)],
      },
      user: {},
    }, unknown);
    assert.equal(unknown.statusCode, 400);
    assert.match(unknown.body.error, /not found/);
  });

  it('rejects an empty or malformed item list', async () => {
    const { headOffice, outlet, product } = await setup();

    const empty = mockRes();
    await createTransfer({
      body: { fromBranchId: String(headOffice._id), toBranchId: String(outlet._id), items: [] },
      user: {},
    }, empty);
    assert.equal(empty.statusCode, 400);

    const zero = mockRes();
    await createTransfer({
      body: { fromBranchId: String(headOffice._id), toBranchId: String(outlet._id), items: [line(product, 0)] },
      user: {},
    }, zero);
    assert.equal(zero.statusCode, 400);
  });

  it('refuses to move stock into an inactive branch', async () => {
    const { headOffice, outlet, product } = await setup();
    await Branch.updateOne({ _id: outlet._id }, { $set: { status: 'inactive' } });

    const res = mockRes();
    await createTransfer({
      body: { fromBranchId: String(headOffice._id), toBranchId: String(outlet._id), items: [line(product, 5)] },
      user: {},
    }, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /inactive/);
    assert.equal(await getLocationStock(product._id, headOffice._id), 40);
  });

  it('lists transfers touching a given branch in either direction', async () => {
    const { headOffice, outlet, product } = await setup();
    const incoming = await Branch.create({ name: 'Kumasi', type: 'branch' });

    for (const to of [outlet, incoming]) {
      await createTransfer({
        body: { fromBranchId: String(headOffice._id), toBranchId: String(to._id), items: [line(product, 2)] },
        user: {},
      }, mockRes());
    }

    const { getTransfers } = await import('../src/controllers/transfers.controller.js');

    const res = mockRes();
    await getTransfers({ query: { branchId: String(headOffice._id) } }, res);
    assert.equal(res.body.transfers.length, 2, 'head office is on both transfers');

    const filtered = mockRes();
    await getTransfers({ query: { branchId: String(outlet._id) } }, filtered);
    assert.equal(filtered.body.transfers.length, 1);
  });
});
