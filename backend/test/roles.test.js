import { before, after, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { connectTestDB, disconnectTestDB, clearAll, mockRes } from './helpers.js';
import { Role } from '../src/models/role.model.js';
import { Staff } from '../src/models/staff.model.js';
import { DEFAULT_ROLES, ensureRoles, getRoleByKey, getNonLocationBoundRoleKeys } from '../src/services/role.service.js';
import { getRoles, createRole, updateRole, deleteRole } from '../src/controllers/role.controller.js';

const ALL = DEFAULT_ROLES.find((role) => role.key === 'admin').permissions;

describe('role service', () => {
  before(async () => {
    await connectTestDB();
    await ensureRoles();
  });
  after(disconnectTestDB);
  beforeEach(async () => {
    await clearAll();
    await ensureRoles();
  });

  it('seeds the three built-in roles with the right identity and location binding', async () => {
    const admin = await getRoleByKey('admin');
    const manager = await getRoleByKey('manager');
    const cashier = await getRoleByKey('cashier');

    assert.ok(admin.isSystem);
    assert.equal(admin.locationBound, false);
    assert.equal(admin.permissions.length, ALL.length);
    assert.deepEqual(admin.permissions.slice().sort(), ALL.slice().sort());

    assert.equal(manager.isSystem, false);
    assert.equal(manager.locationBound, false);
    assert.ok(manager.permissions.includes('products:manage'));
    assert.ok(!manager.permissions.includes('roles:manage'));

    assert.equal(cashier.isSystem, false);
    assert.equal(cashier.locationBound, true);
    assert.ok(cashier.permissions.includes('pos'));
    assert.ok(!cashier.permissions.includes('products:manage'));
  });

  it('is idempotent and never clobbers an admin-renamed default role', async () => {
    const cashier = await getRoleByKey('cashier');
    await Role.updateOne({ _id: cashier._id }, { $set: { name: 'Till Operator' } });

    assert.equal(await ensureRoles(), 0);

    const after = await getRoleByKey('cashier');
    assert.equal(after.name, 'Till Operator');
  });

  it('reports only location-exempt roles as non-location-bound', async () => {
    await Role.create({ key: 'regional', name: 'Regional Manager', permissions: ['pos'], locationBound: false });

    const keys = await getNonLocationBoundRoleKeys();
    assert.deepEqual(keys.sort(), ['admin', 'manager', 'regional']);
  });
});

describe('role controller', () => {
  before(async () => {
    await connectTestDB();
    await ensureRoles();
  });
  after(disconnectTestDB);
  beforeEach(async () => {
    await clearAll();
    await ensureRoles();
  });

  it('lists roles with member counts', async () => {
    await Staff.create({ name: 'A', role: 'cashier' });
    await Staff.create({ name: 'B', role: 'cashier' });

    const res = mockRes();
    await getRoles({}, res);

    assert.equal(res.statusCode, 200);
    const byKey = new Map(res.body.roles.map((role) => [role.key, role]));
    assert.equal(byKey.get('cashier').memberCount, 2);
    assert.equal(byKey.get('admin').memberCount, 0);
    assert.equal(byKey.get('admin').isSystem, true);
  });

  it('creates a custom role', async () => {
    const res = mockRes();
    await createRole(
      {
        body: {
          key: 'supervisor',
          name: 'Supervisor',
          permissions: ['pos', 'reports:view'],
          locationBound: true,
        },
      },
      res
    );

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.role.key, 'supervisor');
    assert.equal(res.body.role.locationBound, true);
    assert.equal(res.body.role.memberCount, 0);
  });

  it('rejects an unknown permission and a duplicate key', async () => {
    const bad = mockRes();
    await createRole({ body: { key: 'x', name: 'X', permissions: ['pos', 'fly:planes'] } }, bad);
    assert.equal(bad.statusCode, 400);
    assert.match(bad.body.error, /Unknown permission/);

    const duplicate = mockRes();
    await createRole({ body: { key: 'cashier', name: 'Copy', permissions: ['pos'] } }, duplicate);
    assert.equal(duplicate.statusCode, 409);
  });

  it('lets an editable role be renamed and re-permissioned', async () => {
    const res = mockRes();
    await getRoles({}, res);
    const cashier = res.body.roles.find((role) => role.key === 'cashier');

    const updateRes = mockRes();
    await updateRole(
      {
        params: { roleId: cashier.id },
        body: { name: 'Till Operator', permissions: ['pos', 'orders:view'] },
      },
      updateRes
    );

    assert.equal(updateRes.statusCode, 200);
    assert.equal(updateRes.body.role.name, 'Till Operator');
    assert.deepEqual(updateRes.body.role.permissions, ['pos', 'orders:view']);
    assert.equal(updateRes.body.role.isSystem, false);
  });

  it('locks the system admin: no key, permissions or location binding changes', async () => {
    const res = mockRes();
    await getRoles({}, res);
    const admin = res.body.roles.find((role) => role.isSystem);

    const updateRes = mockRes();
    await updateRole(
      {
        params: { roleId: admin.id },
        body: { permissions: ['pos'], locationBound: true },
      },
      updateRes
    );

    assert.equal(updateRes.statusCode, 400);
    assert.match(updateRes.body.error, /system Admin role cannot/);

    // Cosmetic fields (name) remain editable.
    const cosmetic = mockRes();
    await updateRole({ params: { roleId: admin.id }, body: { name: 'Owner' } }, cosmetic);
    assert.equal(cosmetic.statusCode, 200);
    assert.equal(cosmetic.body.role.name, 'Owner');
  });

  it('refuses to delete a system role', async () => {
    const res = mockRes();
    await getRoles({}, res);
    const admin = res.body.roles.find((role) => role.isSystem);

    const del = mockRes();
    await deleteRole({ params: { roleId: admin.id } }, del);
    assert.equal(del.statusCode, 400);
    assert.match(del.body.error, /system role/);
  });

  it('refuses to delete a role still assigned to staff', async () => {
    await Staff.create({ name: 'A', role: 'cashier' });

    const res = mockRes();
    await getRoles({}, res);
    const cashier = res.body.roles.find((role) => role.key === 'cashier');

    const del = mockRes();
    await deleteRole({ params: { roleId: cashier.id } }, del);
    assert.equal(del.statusCode, 409);
    assert.match(del.body.error, /assigned to 1 staff member/);
    assert.ok(await Role.findById(cashier.id), 'role must survive');
  });

  it('deletes an unused custom role', async () => {
    const created = mockRes();
    await createRole({ body: { key: 'temp', name: 'Temp', permissions: ['pos'] } }, created);

    const del = mockRes();
    await deleteRole({ params: { roleId: created.body.role.id } }, del);
    assert.equal(del.statusCode, 200);
    assert.equal(await Role.findById(created.body.role.id), null);
  });
});