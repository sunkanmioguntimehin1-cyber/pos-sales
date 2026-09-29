import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { Stock } from '../src/models/stock.model.js';
import { setLocationStock, backfillBranchTargets } from '../src/services/stock.service.js';
import { createProduct, getProducts, setProductStockTarget } from '../src/controllers/products.controller.js';

async function seedBranches() {
  const headOffice = await Branch.create({ name: 'Head Office', type: 'head_office', isDefault: true });
  const outlet = await Branch.create({ name: 'Accra Mall' });
  return { headOffice, outlet };
}

async function seedProduct({ name = 'Phone Case', price = 10, stock = 5, lowStockThreshold = 12 } = {}) {
  const res = mockRes();
  await createProduct({ body: { name, price, stock, lowStockThreshold } }, res);
  assert.equal(res.statusCode, 201);
  return res.body.product;
}

describe('per-branch stock targets', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('gives a newly created product a head-office row seeded with its threshold as the default target', async () => {
    const { headOffice } = await seedBranches();
    const product = await seedProduct({ stock: 5, lowStockThreshold: 12 });

    const row = await Stock.findOne({ productId: product._id, branchId: headOffice._id }).lean();
    assert.equal(row.quantity, 5);
    assert.equal(row.minQuantity, 12);
  });

  it('defaults a fresh branch row to the product threshold when no target is given', async () => {
    const { headOffice, outlet } = await seedBranches();
    const product = await seedProduct({ lowStockThreshold: 20 });

    // A world where the outlet never existed when the product shipped.
    await Stock.deleteMany({});
    await setLocationStock(product._id, outlet._id, 3);

    const row = await Stock.findOne({ productId: product._id, branchId: outlet._id }).lean();
    assert.equal(row.minQuantity, 20);
  });

  it('keeps an existing row target untouched when only the quantity changes', async () => {
    const { headOffice } = await seedBranches();
    const product = await seedProduct({ lowStockThreshold: 12 });

    // Two moves that should only affect quantity, not the shelf decision.
    await setLocationStock(product._id, headOffice._id, 40);
    await setLocationStock(product._id, headOffice._id, 30);

    const row = await Stock.findOne({ productId: product._id, branchId: headOffice._id }).lean();
    assert.equal(row.quantity, 30);
    assert.equal(row.minQuantity, 12);
  });

  it('lets a caller set an explicit target at creation time', async () => {
    const { outlet } = await seedBranches();
    const { _id: productId } = await Product.create({ name: 'Case', price: 10, lowStockThreshold: 12 });

    await setLocationStock(productId, outlet._id, 0, { minQuantity: 5 });

    const row = await Stock.findOne({ productId, branchId: outlet._id }).lean();
    assert.equal(row.minQuantity, 5);
  });

  it('sets a target through the API, upserting a row for a branch that holds no stock', async () => {
    const { headOffice, outlet } = await seedBranches();
    const product = await seedProduct();

    // The outlet has no stock row yet — the API should still be able to plan a
    // shelf for it.
    assert.equal(await Stock.countDocuments({ productId: product._id, branchId: outlet._id }), 0);

    const res = mockRes();
    await setProductStockTarget(
      { params: { productId: product._id, branchId: String(outlet._id) }, body: { minQuantity: 4 } },
      res
    );

    assert.equal(res.statusCode, 200);
    const row = res.body.stockLevels.find((level) => level.branchName === 'Accra Mall');
    assert.ok(row, 'breakdown lists the outlet');
    assert.equal(row.minQuantity, 4);
    assert.equal(row.quantity, 0);

    const saved = await Stock.findOne({ productId: product._id, branchId: outlet._id }).lean();
    assert.equal(saved.minQuantity, 4);
    assert.equal(saved.quantity, 0);
  });

  it('clamps invalid targets to zero and requires the field', async () => {
    const { headOffice } = await seedBranches();
    const product = await seedProduct();

    const negative = mockRes();
    await setProductStockTarget(
      { params: { productId: product._id, branchId: String(headOffice._id) }, body: { minQuantity: -3 } },
      negative
    );
    assert.equal(negative.statusCode, 200);
    assert.equal(negative.body.stockLevels[0].minQuantity, 0);

    const missing = mockRes();
    await setProductStockTarget(
      { params: { productId: product._id, branchId: String(headOffice._id) }, body: {} },
      missing
    );
    assert.equal(missing.statusCode, 400);
  });

  it('404s on a product or branch that does not exist', async () => {
    const { outlet, headOffice } = await seedBranches();
    const product = await seedProduct();

    const noProduct = mockRes();
    await setProductStockTarget(
      { params: { productId: '64b7f1f1f1f1f1f1f1f1f1f1', branchId: String(outlet._id) }, body: { minQuantity: 4 } },
      noProduct
    );
    assert.equal(noProduct.statusCode, 404);

    const noBranch = mockRes();
    await setProductStockTarget(
      { params: { productId: product._id, branchId: '64b7f1f1f1f1f1f1f1f1f1f1' }, body: { minQuantity: 4 } },
      noBranch
    );
    assert.equal(noBranch.statusCode, 404);
  });

  it('backfills rows that predate this feature with the product default, idempotently', async () => {
    await seedBranches();
    await seedProduct({ name: 'Phone Case', lowStockThreshold: 9 });
    await seedProduct({ name: 'Tempered Glass', lowStockThreshold: 4 });

    // Simulate old rows: created before minQuantity existed, so the field is
    // absent (not 0 — 0 is a legitimate "never restock automatically" choice).
    await Stock.updateMany({}, { $unset: { minQuantity: 1 } });

    const changed = await backfillBranchTargets();
    assert.equal(changed, 2);

    const rows = await Stock.find().sort({ minQuantity: 1 }).lean();
    assert.deepEqual(rows.map((row) => row.minQuantity), [4, 9]);
    assert.equal(await backfillBranchTargets(), 0, 'idempotent');
  });

  it('exposes the branch-specific target on scoped GET /products and the product default company-wide', async () => {
    const { headOffice, outlet } = await seedBranches();
    const product = await seedProduct({ lowStockThreshold: 12 });
    await setProductStockTarget(
      { params: { productId: product._id, branchId: String(outlet._id) }, body: { minQuantity: 6 } },
      mockRes()
    );

    const scoped = mockRes();
    await getProducts({ query: { branchId: String(outlet._id) } }, scoped);
    assert.equal(scoped.statusCode, 200);
    assert.equal(scoped.body.products[0].minQuantity, 6);

    const everywhere = mockRes();
    await getProducts({ query: {} }, everywhere);
    assert.equal(everywhere.body.products[0].minQuantity, 12);
  });
});