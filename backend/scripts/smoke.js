#!/usr/bin/env node
/**
 * End-to-end smoke test against a live server over HTTP.
 *
 * The unit tests exercise controllers directly; this proves the wiring —
 * routes, auth middleware, mounting, request parsing — is correct too.
 *
 * Usage: node scripts/smoke.js [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:5099';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'TestPass123';

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${JSON.stringify(detail)}` : ''}`);
  }
}

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, body: json };
}

async function main() {
  console.log(`\nSmoke testing ${BASE}\n`);

  const login = await api('/api/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  if (login.status !== 200) {
    console.error('Login failed. Is the server running with the expected credentials?');
    console.error(login.body);
    process.exit(1);
  }
  const token = login.body.token;
  console.log('  ok   authenticated');

  // --- head office ---------------------------------------------------------
  const branches = await api('/api/branches', { token });
  const headOffice = branches.body.branches?.find((b) => b.type === 'head_office');
  check('head office exists and is first in the list', branches.body.branches?.[0]?.type === 'head_office');
  check('head office is the default', headOffice?.isDefault === true);
  check('exactly one head office', branches.body.branches?.filter((b) => b.type === 'head_office').length === 1);

  // --- product creation books stock into head office -----------------------
  const productRes = await api('/api/products', {
    method: 'POST', token,
    body: { name: 'Smoke Widget', sku: 'SMOKE-1', price: 10, costPrice: 4, stock: 25 },
  });
  check('product created', productRes.status === 201, productRes.body);
  const product = productRes.body.product;

  const breakdown = await api(`/api/products/${product.id}/stock`, { token });
  const headRow = breakdown.body.stockLevels?.find((l) => l.branchId === headOffice.id);
  check('opening stock landed at head office', headRow?.quantity === 25, breakdown.body);
  check('head office row is typed correctly', headRow?.branchType === 'head_office');
  check('product total matches', breakdown.body.total === 25);

  // --- manager round-trips -------------------------------------------------
  const branchRes = await api('/api/branches', {
    method: 'POST', token,
    body: { name: 'Smoke Outlet', address: '1 Test St', phone: '000', manager: 'Ama', status: 'active' },
  });
  check('branch created', branchRes.status === 201, branchRes.body);
  const outlet = branchRes.body.branch;
  check('manager persists', outlet?.manager === 'Ama', outlet);

  const updateRes = await api(`/api/branches/${outlet.id}`, {
    method: 'PUT', token, body: { manager: 'Kofi' },
  });
  check('manager updates', updateRes.body.branch?.manager === 'Kofi', updateRes.body);

  // head office must be protected
  const noDelete = await api(`/api/branches/${headOffice.id}`, { method: 'DELETE', token });
  check('head office cannot be deleted', noDelete.status === 400, noDelete.body);

  const noRetype = await api(`/api/branches/${outlet.id}`, {
    method: 'PUT', token, body: { type: 'head_office' },
  });
  check('a branch cannot be promoted to head office', noRetype.status === 400, noRetype.body);

  // --- transfer ------------------------------------------------------------
  const transferRes = await api('/api/transfers', {
    method: 'POST', token,
    body: { fromBranchId: headOffice.id, toBranchId: outlet.id, items: [{ productId: product.id, quantity: 10 }] },
  });
  check('transfer succeeded', transferRes.status === 201, transferRes.body);

  const afterTransfer = await api(`/api/products/${product.id}/stock`, { token });
  const hq = afterTransfer.body.stockLevels.find((l) => l.branchId === headOffice.id)?.quantity;
  const store = afterTransfer.body.stockLevels.find((l) => l.branchId === outlet.id)?.quantity;
  check('head office is 15 after transfer', hq === 15, afterTransfer.body);
  check('outlet is 10 after transfer', store === 10, afterTransfer.body);
  check('total conserved at 25', afterTransfer.body.total === 25);

  // --- movement log ---------------------------------------------------------
  const movements = await api('/api/products/movements', { token });
  const transferLog = movements.body.movements.filter((m) => m.source === 'transfer');
  const hqOut = transferLog.find((m) => m.branchId.id === headOffice.id);
  const storeIn = transferLog.find((m) => m.branchId.id === outlet.id);
  check('movements endpoint lists the transfer', transferLog.length === 2, movements.body);
  check('out log records the source leaving', hqOut?.quantity === -10, hqOut);
  check('in log records the destination arriving', storeIn?.quantity === 10, storeIn);
  check('transfer log rows share a reference', hqOut?.ref === storeIn?.ref, transferLog);

  const outletLogs = await api(`/api/products/movements?branchId=${outlet.id}`, { token });
  check('movements filter by location', outletLogs.body.movements.length === 1, outletLogs.body);

  const oversell = await api('/api/transfers', {
    method: 'POST', token,
    body: { fromBranchId: headOffice.id, toBranchId: outlet.id, items: [{ productId: product.id, quantity: 9999 }] },
  });
  check('oversized transfer rejected', oversell.status === 400, oversell.body);

  const afterFail = await api(`/api/products/${product.id}/stock`, { token });
  check('failed transfer changed nothing', afterFail.body.total === 25 && afterFail.body.stockLevels.length === 2);

  // --- location-scoped product list ---------------------------------------
  const scoped = await api(`/api/products?branchId=${outlet.id}`, { token });
  const scopedProduct = scoped.body.products.find((p) => p.id === product.id);
  check('branchId scopes the returned stock', scopedProduct?.stock === 10, scopedProduct);
  check('totalStock still reports company-wide', scopedProduct?.totalStock === 25, scopedProduct);

  // --- per-branch stock target ---------------------------------------------
  // The product shipped without an explicit threshold, so the default of 10
  // became the minimum target for its head-office row.
  check('head-office row inherits the default minimum target', headRow?.minQuantity === 10, headRow);

  const setTarget = await api(`/api/products/${product.id}/stock/${outlet.id}`, {
    method: 'PUT', token, body: { minQuantity: 8 },
  });
  check('location target updated', setTarget.status === 200, setTarget.body);
  const targetRow = setTarget.body.stockLevels?.find((l) => l.branchId === outlet.id);
  check('outlet row reports the new target', targetRow?.minQuantity === 8, targetRow);

  const scopedTarget = await api(`/api/products?branchId=${outlet.id}`, { token });
  const scopedTargetProduct = scopedTarget.body.products.find((p) => p.id === product.id);
  check('scoped list swaps in the branch target', scopedTargetProduct?.minQuantity === 8, scopedTargetProduct);

  // --- order draws from the chosen location -------------------------------
  const orderRes = await api('/api/orders', {
    method: 'POST', token,
    body: {
      items: [{ productId: product.id, productName: 'Smoke Widget', quantity: 3, unitPrice: 10, totalPrice: 30 }],
      subtotal: 30, tax: 0, total: 30, paymentMethod: 'Cash',
      branchId: outlet.id, staffId: login.body.user?.id,
    },
  });
  check('order created at the outlet', orderRes.status === 201, orderRes.body);
  const order = orderRes.body.order;

  const afterOrder = await api(`/api/products/${product.id}/stock`, { token });
  check('outlet decremented to 7', afterOrder.body.stockLevels.find((l) => l.branchId === outlet.id)?.quantity === 7);
  check('head office untouched by the sale', afterOrder.body.stockLevels.find((l) => l.branchId === headOffice.id)?.quantity === 15);

  // an order at a location with no stock must be refused
  const bare = await api('/api/products', { method: 'POST', token, body: { name: 'Bare', price: 1, stock: 0 } });
  const bareBranchRes = await api('/api/branches', { method: 'POST', token, body: { name: 'Empty Outlet' } });
  const bareOrder = await api('/api/orders', {
    method: 'POST', token,
    body: {
      items: [{ productId: bare.body.product.id, productName: 'Bare', quantity: 1, unitPrice: 1, totalPrice: 1 }],
      subtotal: 1, tax: 0, total: 1, paymentMethod: 'Cash', branchId: bareBranchRes.body.branch.id,
      staffId: login.body.user?.id,
    },
  });
  check('selling stock the location does not hold is refused', bareOrder.status === 400, bareOrder.body);

  // --- cancel restores stock ----------------------------------------------
  await api(`/api/orders/${order.id}/status`, { method: 'PUT', token, body: { status: 'cancelled' } });
  const afterCancel = await api(`/api/products/${product.id}/stock`, { token });
  check('cancel restored the outlet to 10', afterCancel.body.stockLevels.find((l) => l.branchId === outlet.id)?.quantity === 10);

  const orderMovements = await api(`/api/products/movements?productId=${product.id}`, { token });
  const restock = orderMovements.body.movements.find((m) => m.source === 'order' && m.quantity > 0);
  const saleLog = orderMovements.body.movements.find((m) => m.source === 'order' && m.quantity < 0);
  check('sale logged against the order number', saleLog?.quantity === -3 && /^ORD-/.test(saleLog.ref || ''), saleLog);
  check('cancel credits the returned stock into the log', restock?.quantity === 3, restock);

  // cancelling again must not credit twice
  await api(`/api/orders/${order.id}/status`, { method: 'PUT', token, body: { status: 'cancelled' } });
  const afterDouble = await api(`/api/products/${product.id}/stock`, { token });
  check('repeated cancel does not double-credit', afterDouble.body.stockLevels.find((l) => l.branchId === outlet.id)?.quantity === 10);

  // --- manual adjustment ---------------------------------------------------
  const adjust = await api(`/api/products/${product.id}/stock`, {
    method: 'POST', token, body: { adjustment: 5, type: 'adjust', branchId: outlet.id },
  });
  check('adjustment applied at the named location', adjust.body.product?.stock === 30, adjust.body.product);

  // --- staff are bound to a location ---------------------------------------
  // The POS only lists staff who work at the selected branch, so an
  // unassigned cashier would be unable to ring up a sale anywhere.
  const cashier = await api('/api/staff', {
    method: 'POST', token,
    body: { name: 'Mall Cashier', role: 'cashier', phone: '0244000000', pin: '1234' },
  });
  check('new staff lands at the head office by default', cashier.body.staff?.branchName === 'Head Office', cashier.body);

  const moved = await api(`/api/staff/${cashier.body.staff.id}`, {
    method: 'PUT', token, body: { branchId: outlet.id },
  });
  check('staff can be moved to another branch', moved.body.staff?.branchName === outlet.name, moved.body);

  const atOutlet = await api(`/api/staff?branchId=${outlet.id}`, { token });
  const atOutletNames = (atOutlet.body.staff || []).map((s) => s.name);
  check('outlet roster includes its cashier and the admin',
    atOutletNames.includes('Mall Cashier') && atOutletNames.includes('Admin'),
    atOutletNames);

  // --- roles and permissions -------------------------------------------------
  const roles = await api('/api/roles', { token });
  const roleByKey = new Map((roles.body.roles || []).map((role) => [role.key, role]));
  check('default roles seeded', ['admin', 'manager', 'cashier'].every((key) => roleByKey.has(key)), roles.body);
  check('admin is system and not location-bound',
    roleByKey.get('admin')?.isSystem === true && roleByKey.get('admin')?.locationBound === false, roleByKey.get('admin'));

  const custom = await api('/api/roles', { method: 'POST', token, body: { key: 'smoke', name: 'Smoke Role' } });
  check('custom role created', custom.status === 201, custom.body);

  const duplicate = await api('/api/roles', { method: 'POST', token, body: { key: 'cashier', name: 'Copy' } });
  check('duplicate role key refused', duplicate.status === 409, duplicate.body);

  // A live cashier token proves the middleware enforces the permission
  // catalogue over HTTP, not just in the unit tests.
  const permCashier = await api('/api/staff', {
    method: 'POST', token,
    body: { name: 'Perm Cashier', email: 'perm.cashier@smoke.local', role: 'cashier', password: 'Till4567', pin: '4321' },
  });
  const cashierLogin = await api('/api/auth/login', {
    method: 'POST', body: { email: 'perm.cashier@smoke.local', password: 'Till4567' },
  });
  check('cashier can log in', cashierLogin.status === 200, cashierLogin.body);
  const cashierToken = cashierLogin.body.token;
  const cashierAllowed = await api('/api/products', { token: cashierToken });
  check('cashier can read products', cashierAllowed.status === 200, cashierAllowed.body);
  const cashierDenied = await api('/api/roles', { method: 'POST', token: cashierToken, body: { key: 'x', name: 'X' } });
  check('cashier cannot create roles', cashierDenied.status === 403, cashierDenied.body);

  await api(`/api/roles/${custom.body.role.id}`, { method: 'DELETE', token });

  // --- deleting a location is only safe once it is empty --------------------
  const heldBlock = await api(`/api/branches/${outlet.id}`, { method: 'DELETE', token });
  check('a branch holding stock cannot be deleted', heldBlock.status === 409, heldBlock.body);

  await api(`/api/staff/${cashier.body.staff.id}`, {
    method: 'PUT', token, body: { branchId: headOffice.id },
  });
  await api(`/api/products/${product.id}`, { method: 'DELETE', token });
  const emptyBlock = await api(`/api/branches/${outlet.id}`, { method: 'DELETE', token });
  check('an emptied branch can then be deleted', emptyBlock.status === 200, emptyBlock.body);

  // --- cleanup -------------------------------------------------------------
  const gone = await api(`/api/products/${product.id}/stock`, { token });
  check('deleting a product clears its stock rows', gone.status === 404 || gone.body.stockLevels?.length === 0);

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('\nSmoke test crashed:', error);
  process.exit(1);
});
