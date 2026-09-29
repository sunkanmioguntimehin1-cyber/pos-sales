import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { Stock } from '../src/models/stock.model.js';
import {
  ensureHeadOffice, getLocationStock, setLocationStock, adjustLocationStock,
  syncProductStockTotal, transferStock, backfillHeadOfficeStock, InsufficientStockError,
} from '../src/services/stock.service.js';

async function makeProduct(name = 'Widget', stock = 0) {
  return Product.create({ name, price: 10, stock });
}

describe('stock.service', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  describe('ensureHeadOffice', () => {
    it('creates a head office when the install has no branches', async () => {
      const headOffice = await ensureHeadOffice();

      assert.equal(headOffice.type, 'head_office');
      assert.equal(headOffice.isDefault, true);
      assert.equal(await Branch.countDocuments(), 1);
    });

    it('is idempotent', async () => {
      const first = await ensureHeadOffice();
      const second = await ensureHeadOffice();
      const third = await ensureHeadOffice();

      assert.equal(String(first._id), String(second._id));
      assert.equal(String(second._id), String(third._id));
      assert.equal(await Branch.countDocuments(), 1);
    });

    it('promotes the existing default branch instead of adding a second location', async () => {
      // This is the upgrade path for installs that predate the head office:
      // they already marked a branch default, and creating "Head Office"
      // alongside it would leave their stock booked against the wrong place.
      const legacyDefault = await Branch.create({ name: 'Main Store', isDefault: true });
      await Branch.create({ name: 'Accra Mall', isDefault: false });

      const headOffice = await ensureHeadOffice();

      assert.equal(String(headOffice._id), String(legacyDefault._id));
      assert.equal(headOffice.type, 'head_office');
      assert.equal(await Branch.countDocuments(), 2);
    });

    it('re-asserts isDefault if it was cleared out from under the head office', async () => {
      const headOffice = await ensureHeadOffice();
      await Branch.updateOne({ _id: headOffice._id }, { $set: { isDefault: false } });
      await Branch.create({ name: 'Accra Mall', isDefault: true });

      const repaired = await ensureHeadOffice();

      assert.equal(repaired.isDefault, true);
      const otherDefault = await Branch.findOne({ name: 'Accra Mall' });
      assert.equal(otherDefault.isDefault, false);
    });

    it('is enforced by a unique index, not just by convention', async () => {
      const headOffice = await ensureHeadOffice();

      await assert.rejects(
        () => Branch.create({ name: 'Rogue HQ', type: 'head_office' }),
        (error) => error.code === 11000
      );

      // ...while ordinary branches are unrestricted.
      await Branch.create({ name: 'Kumasi', type: 'branch' });
      await Branch.create({ name: 'Tamale', type: 'branch' });
      assert.equal(await Branch.countDocuments({ type: 'branch' }), 2);
      assert.ok(headOffice);
    });
  });

  describe('setLocationStock / syncProductStockTotal', () => {
    it('books stock into a location and mirrors the total onto the product', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();

      await setLocationStock(product._id, headOffice._id, 25);

      assert.equal(await getLocationStock(product._id, headOffice._id), 25);
      assert.equal((await Product.findById(product._id)).stock, 25);
    });

    it('keeps the total as the sum across locations', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await makeProduct();

      await setLocationStock(product._id, headOffice._id, 30);
      await setLocationStock(product._id, outlet._id, 8);

      assert.equal((await Product.findById(product._id)).stock, 38);
    });

    it('clamps a negative set value to zero', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();

      await setLocationStock(product._id, headOffice._id, -5);

      assert.equal(await getLocationStock(product._id, headOffice._id), 0);
    });

    it('reuses the existing row rather than creating a duplicate', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();

      await setLocationStock(product._id, headOffice._id, 10);
      await setLocationStock(product._id, headOffice._id, 4);

      assert.equal(await Stock.countDocuments({ productId: product._id }), 1);
      assert.equal(await getLocationStock(product._id, headOffice._id), 4);
    });
  });

  describe('adjustLocationStock', () => {
    it('applies a positive delta', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();
      await setLocationStock(product._id, headOffice._id, 10);

      await adjustLocationStock(product._id, headOffice._id, 5);

      assert.equal(await getLocationStock(product._id, headOffice._id), 15);
    });

    it('refuses to oversell and reports what was actually available', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();
      await setLocationStock(product._id, headOffice._id, 3);

      await assert.rejects(
        () => adjustLocationStock(product._id, headOffice._id, -5),
        (error) => {
          assert.ok(error instanceof InsufficientStockError);
          assert.equal(error.available, 3);
          assert.equal(error.requested, 5);
          return true;
        }
      );

      assert.equal(await getLocationStock(product._id, headOffice._id), 3, 'stock must be untouched');
    });

    it('cannot go negative under concurrent decrements', async () => {
      // The guard is `quantity: { $gte: n }` inside the write filter, so
      // MongoDB re-checks it atomically. A read-then-write would let both
      // callers see 8 and each take 5.
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();
      await setLocationStock(product._id, headOffice._id, 8);

      const results = await Promise.allSettled([
        adjustLocationStock(product._id, headOffice._id, -5),
        adjustLocationStock(product._id, headOffice._id, -5),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'exactly one decrement should succeed');
      assert.equal(rejected.length, 1);
      assert.ok(rejected[0].reason instanceof InsufficientStockError);
      assert.equal(await getLocationStock(product._id, headOffice._id), 3);
    });

    it('creates the row when adding stock to a location that had none', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await makeProduct();

      await adjustLocationStock(product._id, outlet._id, 12);

      assert.equal(await getLocationStock(product._id, outlet._id), 12);
    });

    it('treats an unknown location as empty when decrementing', async () => {
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await makeProduct();

      await assert.rejects(
        () => adjustLocationStock(product._id, outlet._id, -1),
        (error) => error instanceof InsufficientStockError && error.available === 0
      );
    });
  });

  describe('transferStock', () => {
    it('moves units between locations and leaves the total unchanged', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await makeProduct();
      await setLocationStock(product._id, headOffice._id, 40);

      await transferStock({
        productId: product._id,
        fromBranchId: headOffice._id,
        toBranchId: outlet._id,
        quantity: 10,
      });

      assert.equal(await getLocationStock(product._id, headOffice._id), 30);
      assert.equal(await getLocationStock(product._id, outlet._id), 10);
      assert.equal((await Product.findById(product._id)).stock, 40);
    });

    it('rejects a transfer larger than the source holds, leaving both sides intact', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await makeProduct();
      await setLocationStock(product._id, headOffice._id, 5);

      await assert.rejects(() => transferStock({
        productId: product._id,
        fromBranchId: headOffice._id,
        toBranchId: outlet._id,
        quantity: 10,
      }), (error) => error instanceof InsufficientStockError);

      assert.equal(await getLocationStock(product._id, headOffice._id), 5);
      assert.equal(await getLocationStock(product._id, outlet._id), 0);
    });

    it('credits the source back when the destination write fails', async () => {
      // This is the compensation path. There is no replica set, so no
      // transaction: the only thing stopping stock from evaporating is
      // unwinding the first write when the second throws.
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct();
      await setLocationStock(product._id, headOffice._id, 20);

      await assert.rejects(() => transferStock({
        productId: product._id,
        fromBranchId: headOffice._id,
        toBranchId: 'not-a-valid-object-id',
        quantity: 7,
      }));

      assert.equal(
        await getLocationStock(product._id, headOffice._id),
        20,
        'source must be restored to its original quantity'
      );
    });

    it('rejects a zero-quantity transfer', async () => {
      const headOffice = await ensureHeadOffice();
      const outlet = await Branch.create({ name: 'Accra Mall', type: 'branch' });
      const product = await makeProduct();

      await assert.rejects(() => transferStock({
        productId: product._id,
        fromBranchId: headOffice._id,
        toBranchId: outlet._id,
        quantity: 0,
      }), /greater than zero/);
    });
  });

  describe('backfillHeadOfficeStock', () => {
    it('seeds a head office row from the product totals', async () => {
      await ensureHeadOffice();
      await makeProduct('A', 12);
      await makeProduct('B', 0);

      const seeded = await backfillHeadOfficeStock();

      assert.equal(seeded, 2);
      const headOffice = await Branch.findOne({ type: 'head_office' });
      const productA = await Product.findOne({ name: 'A' });
      assert.equal(await getLocationStock(productA._id, headOffice._id), 12);
    });

    it('does not clobber stock that has moved since the last boot', async () => {
      const headOffice = await ensureHeadOffice();
      const product = await makeProduct('A', 50);
      await setLocationStock(product._id, headOffice._id, 50);
      await adjustLocationStock(product._id, headOffice._id, -30);

      // Restarting the server must not resurrect the 20 units already sold.
      const seeded = await backfillHeadOfficeStock();

      assert.equal(seeded, 0);
      assert.equal(await getLocationStock(product._id, headOffice._id), 20);
      assert.equal((await Product.findById(product._id)).stock, 20);
    });
  });

  describe('syncProductStockTotal', () => {
    it('reports zero for a product with no stock rows', async () => {
      const product = await makeProduct();

      assert.equal(await syncProductStockTotal(product._id), 0);
    });
  });
});
