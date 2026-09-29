import mongoose from 'mongoose';
import { Stock } from '../models/stock.model.js';
import { Product } from '../models/product.model.js';
import { Branch } from '../models/branch.model.js';
import { Staff } from '../models/staff.model.js';

/**
 * Thrown when a decrement would take a location below zero. Distinct from a
 * generic error so callers can decide between clamping (the manual stock
 * screen's historical behaviour) and rejecting (a sale must not oversell).
 */
export class InsufficientStockError extends Error {
  constructor(productId, branchId, requested, available) {
    super(`Insufficient stock at this location: ${available} available, ${requested} requested`);
    this.name = 'InsufficientStockError';
    this.productId = productId;
    this.branchId = branchId;
    this.requested = requested;
    this.available = available;
  }
}

function toObjectId(value) {
  return value instanceof mongoose.Types.ObjectId ? value : new mongoose.Types.ObjectId(String(value));
}

/**
 * Guarantees the app has exactly one head office and returns it.
 *
 * Idempotent and self-healing, because three different things depend on it
 * being true: the POS falls back to it, product creation books stock into it,
 * and the branch list must never be empty. Safe to call on every request.
 */
export async function ensureHeadOffice() {
  const existing = await Branch.findOne({ type: 'head_office' });
  if (existing) {
    // isDefault is legacy state; keep it pointing at the head office so any
    // client still keying off it agrees with the new `type`.
    if (!existing.isDefault) {
      await Branch.updateMany({}, { isDefault: false });
      return Branch.findOneAndUpdate(
        { _id: existing._id },
        { $set: { isDefault: true } },
        { new: true }
      );
    }
    return existing;
  }

  // Installations that predate the head office already have a branch they
  // marked as default. Promote that one rather than creating a second
  // location beside it, which would strand their existing stock.
  const existingDefault = await Branch.findOne({ isDefault: true }).sort({ createdAt: 1 });
  if (existingDefault) {
    return Branch.findOneAndUpdate(
      { _id: existingDefault._id },
      { $set: { type: 'head_office', isDefault: true } },
      { new: true }
    );
  }

  try {
    return await Branch.create({
      name: 'Head Office',
      status: 'active',
      type: 'head_office',
      isDefault: true,
    });
  } catch (error) {
    // A partial unique index on `type: 'head_office'` means two concurrent
    // callers racing here can both lose: the winner's document is correct, so
    // just read it back rather than surfacing a duplicate-key error.
    if (error?.code === 11000) {
      const raced = await Branch.findOne({ type: 'head_office' });
      if (raced) return raced;
    }
    throw error;
  }
}

export async function getHeadOfficeId() {
  return (await ensureHeadOffice())._id;
}

/** Quantity held at one location. Absent row means zero, not missing data. */
export async function getLocationStock(productId, branchId) {
  const row = await Stock.findOne({ productId: toObjectId(productId), branchId: toObjectId(branchId) })
    .select('quantity')
    .lean();
  return row?.quantity ?? 0;
}

/** Every location holding this product, populated with branch name and type. */
export async function getProductStockLevels(productId) {
  return Stock.find({ productId: toObjectId(productId) })
    .populate('branchId', 'name type status')
    .sort({ 'branchId.type': 1, quantity: -1 })
    .lean();
}

/**
 * Recomputes Product.stock as the total held across all locations.
 *
 * Product.stock is a denormalised convenience field: the dashboard, product
 * list and inventory screen all read it, and rewriting them to aggregate over
 * Stock on every read would tax the hottest queries for no gain. Every write
 * path must go through this service, or the total silently drifts.
 */
export async function syncProductStockTotal(productId) {
  const [row] = await Stock.aggregate([
    { $match: { productId: toObjectId(productId) } },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);

  const total = row?.total ?? 0;
  await Product.updateOne({ _id: toObjectId(productId) }, { $set: { stock: total } });
  return total;
}

/** Sets the absolute quantity held at one location. */
export async function setLocationStock(productId, branchId, quantity, { minQuantity } = {}) {
  const safeQuantity = Math.max(0, Number(quantity) || 0);

  const set = { quantity: safeQuantity };
  const setOnInsert = {};

  // An explicit target is a decision applied now; otherwise a fresh row
  // inherits the product's default threshold ($setOnInsert means an existing
  // row's target is never touched — minQuantity is a decision, not a side
  // effect of setting stock). Both operators must not name the same path.
  if (minQuantity !== undefined) {
    set.minQuantity = Math.max(0, Number(minQuantity) || 0);
  } else {
    setOnInsert.minQuantity = await defaultTarget(productId);
  }

  await Stock.findOneAndUpdate(
    { productId: toObjectId(productId), branchId: toObjectId(branchId) },
    { $set: set, $setOnInsert: setOnInsert },
    { upsert: true, new: true }
  );

  return syncProductStockTotal(productId);
}

/** The default minimum target for a product: its stored threshold, or 0. */
async function defaultTarget(productId) {
  const product = await Product.findById(toObjectId(productId)).select('lowStockThreshold').lean();
  return product?.lowStockThreshold ?? 0;
}

/**
 * Applies a signed delta at one location.
 *
 * Decrements use a conditional update whose `quantity: { $gte: n }` guard is
 * re-evaluated by MongoDB as part of the write. A read-then-write would let
 * two concurrent sales each see enough stock and both succeed; this cannot.
 */
export async function adjustLocationStock(productId, branchId, delta, { allowNegative = false } = {}) {
  const change = Number(delta) || 0;
  if (change === 0) return getLocationStock(productId, branchId);

  const filter = { productId: toObjectId(productId), branchId: toObjectId(branchId) };
  const existing = await Stock.findOne(filter).select('quantity').lean();

  if (!existing) {
    if (change < 0 && !allowNegative) {
      throw new InsufficientStockError(productId, branchId, Math.abs(change), 0);
    }
    // The whole row is new (first time a transfer touches this shelf here), so
    // it also inherits the product's default minimum target.
    await Stock.create({
      ...filter,
      quantity: Math.max(0, change),
      minQuantity: await defaultTarget(productId),
    });
    return syncProductStockTotal(productId);
  }

  if (change < 0 && !allowNegative) {
    const updated = await Stock.findOneAndUpdate(
      { ...filter, quantity: { $gte: Math.abs(change) } },
      { $inc: { quantity: change } },
      { new: true }
    );
    if (!updated) {
      // The guard rejected the write, so somebody else moved the stock first.
      const current = await getLocationStock(productId, branchId);
      throw new InsufficientStockError(productId, branchId, Math.abs(change), current);
    }
    await syncProductStockTotal(productId);
    return updated.quantity;
  }

  // Additive path. No validator here: mongoose runs `min` against the update
  // document rather than the post-$inc value, so it would check the wrong
  // number. The allowNegative branch is clamped explicitly instead.
  const updated = await Stock.findOneAndUpdate(
    filter,
    { $inc: { quantity: change } },
    { new: true }
  );

  if (updated.quantity < 0) {
    await Stock.updateOne({ _id: updated._id }, { $set: { quantity: 0 } });
    await syncProductStockTotal(productId);
    return 0;
  }

  await syncProductStockTotal(productId);
  return updated.quantity;
}

/**
 * Moves quantity of a product between two locations.
 *
 * NOT atomic. The single-node MongoMemoryServer used by the in-memory dev
 * fallback has no replica set, so `startTransaction()` throws and there is no
 * way to get a real multi-document guarantee without dropping that fallback.
 * Instead the second write is wrapped in compensation: if the destination
 * increment fails, the source is credited back.
 *
 * A process crash between the two writes still leaks stock. Closing that needs
 * a replica set (Atlas has one), at which point this can be replaced with a
 * real transaction.
 */
export async function transferStock({ productId, fromBranchId, toBranchId, quantity }) {
  const amount = Math.abs(Number(quantity) || 0);
  if (amount === 0) {
    throw new Error('Transfer quantity must be greater than zero');
  }

  await adjustLocationStock(productId, fromBranchId, -amount);

  try {
    await adjustLocationStock(productId, toBranchId, amount);
  } catch (error) {
    // Put the units back where they came from before surfacing the failure.
    await adjustLocationStock(productId, fromBranchId, amount);
    throw error;
  }
}

/**
 * Seeds a head-office stock row for every product that has none.
 *
 * Runs on every boot. Uses $setOnInsert so a restart is a no-op and can never
 * clobber a quantity that has since been sold, transferred or adjusted.
 */
export async function backfillHeadOfficeStock() {
  const headOffice = await ensureHeadOffice();
  const products = await Product.find({}, { _id: 1, stock: 1, lowStockThreshold: 1 }).lean();
  if (products.length === 0) return 0;

  const result = await Stock.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { productId: product._id, branchId: headOffice._id },
        update: {
          $setOnInsert: {
            quantity: product.stock || 0,
            minQuantity: product.lowStockThreshold || 0,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  return result.upsertedCount ?? 0;
}

/**
 * Gives every per-location row a minimum target when it has none.
 *
 * Rows created before this feature have no `minQuantity`, and without this the
 * Inventory screen would read 0 and flag every shelf Critical. Each row gets
 * its product's threshold — the same default a brand-new row now inherits — so
 * behaviour is unchanged until someone sets a target for that specific shelf.
 * Idempotent and safe on every boot.
 */
export async function backfillBranchTargets() {
  const rows = await Stock.find({ minQuantity: { $exists: false } }, { productId: 1 }).lean();
  if (rows.length === 0) return 0;

  const products = await Product.find(
    { _id: { $in: [...new Set(rows.map((row) => row.productId))] } },
    { _id: 1, lowStockThreshold: 1 }
  ).lean();
  const byProduct = new Map(products.map((product) => [String(product._id), product.lowStockThreshold || 0]));

  const result = await Stock.bulkWrite(
    rows.map((row) => ({
      updateOne: {
        filter: { _id: row._id },
        update: { $set: { minQuantity: byProduct.get(String(row.productId)) ?? 0 } },
      },
    })),
    { ordered: false }
  );

  return result.modifiedCount ?? 0;
}

/**
 * Files every staff member who has no location at the head office.
 *
 * The upgrade path for installs that predate branch assignment: those staff
 * records have no `branchId`, and without this they would match no POS at all
 * once the cashier list is filtered by location. Idempotent — it only touches
 * records where the field is genuinely missing, so it is safe on every boot.
 */
export async function backfillStaffBranch() {
  const headOffice = await ensureHeadOffice();

  const result = await Staff.updateMany(
    { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
    { $set: { branchId: headOffice._id } }
  );

  return result.modifiedCount ?? 0;
}
