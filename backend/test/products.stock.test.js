import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { setLocationStock } from '../src/services/stock.service.js';
import { getProducts } from '../src/controllers/products.controller.js';

async function seed() {
  const headOffice = await Branch.create({ name: 'Head Office', type: 'head_office', isDefault: true });
  const outlet = await Branch.create({ name: 'Accra Mall' });
  const product = await Product.create({ name: 'Widget', price: 10, stock: 0 });

  await setLocationStock(product._id, headOffice._id, 20);
  await setLocationStock(product._id, outlet._id, 5);

  return { headOffice, outlet, product };
}

describe('getProducts ?branchId', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('scopes stock to the requested location but keeps the company-wide total', async () => {
    const { outlet, product } = await seed();
    const res = mockRes();

    await getProducts({ query: { branchId: String(outlet._id) } }, res);

    assert.equal(res.statusCode, 200);
    const [found] = res.body.products;
    assert.equal(String(found._id), String(product._id));
    // 5 on the outlet's shelf, 20 back at head office.
    assert.equal(found.stock, 5);
    assert.equal(found.totalStock, 25);
  });

  it('leaves stock unscoped when branchId is absent', async () => {
    await seed();
    const res = mockRes();

    await getProducts({ query: {} }, res);

    assert.equal(res.statusCode, 200);
    const [found] = res.body.products;
    assert.equal(found.stock, 25);
    assert.equal(found.totalStock, 25);
  });

  it('rejects a non-ObjectId branchId as a client error, not a 500', async () => {
    await seed();
    const res = mockRes();

    // The Inventory screen's "All locations" option is a truthy sentinel. It
    // used to reach this endpoint as ?branchId=all, which surfaced as an
    // opaque "Invalid value for _id: all". That is the frontend's bug, but
    // pinning the status here keeps it a 400 rather than a silent success or
    // a server fault. Note `category=all` is a real, handled sentinel; this
    // one is not, because branches have a real id space.
    await getProducts({ query: { branchId: 'all' } }, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /Invalid value/);
  });

  it('404s a well-formed but unknown branchId', async () => {
    await seed();
    const res = mockRes();

    await getProducts({ query: { branchId: '0123456789abcdef01234567' } }, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.error, 'Branch not found');
  });
});
