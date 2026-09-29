import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Branch } from '../src/models/branch.model.js';
import { Product } from '../src/models/product.model.js';
import { Staff } from '../src/models/staff.model.js';
import { Stock } from '../src/models/stock.model.js';
import { setLocationStock, backfillStaffBranch } from '../src/services/stock.service.js';
import { getStaff, createStaff, updateStaff } from '../src/controllers/staff.controller.js';
import { deleteBranch } from '../src/controllers/branches.controller.js';

async function seedBranches() {
  const headOffice = await Branch.create({ name: 'Head Office', type: 'head_office', isDefault: true });
  const outlet = await Branch.create({ name: 'Accra Mall' });
  return { headOffice, outlet };
}

function findById(staff, id) {
  return staff.find((member) => member.id === id);
}

describe('staff branch assignment', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('files a new staff member at the head office when no branch is named', async () => {
    const { headOffice } = await seedBranches();
    const res = mockRes();

    await createStaff({ body: { name: 'Ama', role: 'cashier' } }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.staff.branchId, String(headOffice._id));
    assert.equal(res.body.staff.branchName, 'Head Office');
  });

  it('rejects a branch that does not exist rather than filing at head office', async () => {
    await seedBranches();
    const res = mockRes();

    // Silently falling back would put someone at a store they do not work at,
    // and the UI would show a location nobody chose.
    await createStaff(
      { body: { name: 'Ama', role: 'cashier', branchId: '64b7f1f1f1f1f1f1f1f1f1f1' } },
      res
    );

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /not found/);
  });

  it('moves an existing staff member between locations on update', async () => {
    const { headOffice, outlet } = await seedBranches();
    const res = mockRes();

    await createStaff({ body: { name: 'Ama', role: 'cashier' } }, res);
    const created = res.body.staff;

    const updateRes = mockRes();
    await updateStaff({ params: { staffId: created.id }, body: { branchId: String(outlet._id) } }, updateRes);

    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.staff.branchId, String(outlet._id));
    assert.equal(updateRes.body.staff.branchName, 'Accra Mall');
    // Untouched by the update.
    assert.equal(updateRes.body.staff.name, 'Ama');
    // Persisted, not just echoed back by populate().
    const saved = await Staff.findById(created.id).lean();
    assert.equal(String(saved.branchId), String(outlet._id));
    assert.notEqual(String(saved.branchId), String(headOffice._id));
  });

  it('keeps the current branch when an update omits branchId', async () => {
    const { outlet } = await seedBranches();
    const res = mockRes();

    await createStaff({ body: { name: 'Ama', role: 'cashier', branchId: String(outlet._id) } }, res);
    const created = res.body.staff;

    // An edit that only renames someone must not re-file them at head office.
    const updateRes = mockRes();
    await updateStaff({ params: { staffId: created.id }, body: { name: 'Ama Serwaa' } }, updateRes);

    assert.equal(updateRes.body.staff.branchId, String(outlet._id));
  });
});

describe('getStaff ?branchId', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('returns only that location\'s staff, plus admins', async () => {
    const { headOffice, outlet } = await seedBranches();
    const headOfficeCashier = await Staff.create({ name: 'HQ Cashier', role: 'cashier', branchId: headOffice._id });
    const outletCashier = await Staff.create({ name: 'Mall Cashier', role: 'cashier', branchId: outlet._id });
    await Staff.create({ name: 'Boss', role: 'admin', branchId: headOffice._id });

    const res = mockRes();
    await getStaff({ query: { branchId: String(outlet._id) } }, res);

    assert.equal(res.statusCode, 200);
    const names = res.body.staff.map((member) => member.name).sort();
    // The admin is based at head office but is not location-bound, so they can
    // still open the till at the mall. The other cashier cannot.
    assert.deepEqual(names, ['Boss', 'Mall Cashier']);
    assert.ok(findById(res.body.staff, String(outletCashier._id)));
    assert.equal(findById(res.body.staff, String(headOfficeCashier._id)), undefined);
  });

  it('includes the branch name so the UI can label each row', async () => {
    const { outlet } = await seedBranches();
    await Staff.create({ name: 'Mall Cashier', role: 'cashier', branchId: outlet._id });

    const res = mockRes();
    await getStaff({ query: { branchId: String(outlet._id) } }, res);

    const [member] = res.body.staff;
    assert.equal(member.branchName, 'Accra Mall');
    assert.equal(member.branchType, 'branch');
  });

  it('combines a location filter with a search instead of one replacing the other', async () => {
    const { headOffice, outlet } = await seedBranches();
    await Staff.create({ name: 'Ama', role: 'cashier', branchId: outlet._id });
    await Staff.create({ name: 'Ama Boateng', role: 'cashier', branchId: headOffice._id });
    await Staff.create({ name: 'Kwame', role: 'cashier', branchId: outlet._id });

    const res = mockRes();
    // Both filters are `$or` queries. If they collided, one would silently
    // replace the other and the till would show staff from the wrong location
    // or staff whose name does not match.
    await getStaff({ query: { branchId: String(outlet._id), search: 'Ama' } }, res);

    const names = res.body.staff.map((member) => member.name);
    assert.deepEqual(names, ['Ama']);
  });

  it('returns everyone when branchId is the "all" sentinel or absent', async () => {
    const { headOffice, outlet } = await seedBranches();
    await Staff.create({ name: 'HQ Cashier', role: 'cashier', branchId: headOffice._id });
    await Staff.create({ name: 'Mall Cashier', role: 'cashier', branchId: outlet._id });

    const allRes = mockRes();
    await getStaff({ query: { branchId: 'all' } }, allRes);
    assert.equal(allRes.body.staff.length, 2);

    const noneRes = mockRes();
    await getStaff({ query: {} }, noneRes);
    assert.equal(noneRes.body.staff.length, 2);
  });
});

describe('backfillStaffBranch', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('files staff that predate branch assignment at the head office', async () => {
    const { headOffice } = await seedBranches();
    // Exactly the shape an install upgraded from the pre-branch schema has:
    // documents with no branchId key at all.
    await Staff.collection.insertMany([
      { name: 'Legacy Cashier', role: 'cashier', status: 'active' },
      { name: 'Legacy Manager', role: 'manager', status: 'active' },
    ]);

    const changed = await backfillStaffBranch();

    assert.equal(changed, 2);
    const migrated = await Staff.find().lean();
    for (const member of migrated) {
      assert.equal(String(member.branchId), String(headOffice._id));
    }
  });

  it('leaves an existing assignment alone and is safe to run twice', async () => {
    const { outlet } = await seedBranches();
    await Staff.create({ name: 'Mall Cashier', role: 'cashier', branchId: outlet._id });

    assert.equal(await backfillStaffBranch(), 0);
    assert.equal(await backfillStaffBranch(), 0);

    const [member] = await Staff.find().lean();
    assert.equal(String(member.branchId), String(outlet._id));
  });
});

describe('deleteBranch guards', () => {
  before(connectTestDB);
  after(disconnectTestDB);
  beforeEach(clearAll);

  it('refuses to delete a branch that still holds stock', async () => {
    const { headOffice, outlet } = await seedBranches();
    const product = await Product.create({ name: 'Widget', price: 10, stock: 0 });
    await setLocationStock(product._id, headOffice._id, 20);
    await setLocationStock(product._id, outlet._id, 5);

    const res = mockRes();
    await deleteBranch({ params: { branchId: String(outlet._id) } }, res);

    // Deleting would orphan the Stock row: nothing could reach those units
    // again, yet syncProductStockTotal would keep counting them.
    assert.equal(res.statusCode, 409);
    assert.match(res.body.error, /Accra Mall still has stock in 1 product/);
    assert.ok(await Branch.findById(outlet._id), 'branch must survive');
    assert.equal(await Stock.countDocuments({ branchId: outlet._id }), 1);
  });

  it('refuses to delete a branch that still has staff assigned', async () => {
    const { outlet } = await seedBranches();
    await Staff.create({ name: 'Mall Cashier', role: 'cashier', branchId: outlet._id });

    const res = mockRes();
    await deleteBranch({ params: { branchId: String(outlet._id) } }, res);

    assert.equal(res.statusCode, 409);
    assert.match(res.body.error, /1 staff member assigned/);
    assert.ok(await Branch.findById(outlet._id), 'branch must survive');
  });

  it('reports both blockers at once rather than one per retry', async () => {
    const { outlet } = await seedBranches();
    const product = await Product.create({ name: 'Widget', price: 10, stock: 0 });
    await setLocationStock(product._id, outlet._id, 5);
    await Staff.create({ name: 'A', role: 'cashier', branchId: outlet._id });
    await Staff.create({ name: 'B', role: 'cashier', branchId: outlet._id });

    const res = mockRes();
    await deleteBranch({ params: { branchId: String(outlet._id) } }, res);

    assert.equal(res.statusCode, 409);
    assert.match(res.body.error, /stock in 1 product and 2 staff members assigned/);
  });

  it('deletes an empty branch', async () => {
    const { outlet } = await seedBranches();

    const res = mockRes();
    await deleteBranch({ params: { branchId: String(outlet._id) } }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(await Branch.findById(outlet._id), null);
  });

  it('still protects the head office even when it is empty', async () => {
    const { headOffice } = await seedBranches();

    const res = mockRes();
    await deleteBranch({ params: { branchId: String(headOffice._id) } }, res);

    assert.equal(res.statusCode, 400);
    assert.ok(await Branch.findById(headOffice._id), 'head office must survive');
  });
});
