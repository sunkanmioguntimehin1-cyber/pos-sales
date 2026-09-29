import { Branch } from '../models/branch.model.js';
import { ensureHeadOffice } from '../services/stock.service.js';
import { respondWithError } from '../utils/respondWithError.js';

export async function getBranches(req, res) {
  try {
    // Never hand back an empty list: the POS and the transfer form both assume
    // a location exists to sell from / ship out of.
    await ensureHeadOffice();

    // Head office first so the location switcher and the POS default agree.
    const branches = await Branch.find().sort({ type: 1, isDefault: -1, name: 1 });
    res.json({ branches });
  } catch (error) {
    respondWithError(res, error, { context: 'Get branches error', message: 'Failed to get branches' });
  }
}

export async function getBranch(req, res) {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findById(branchId);

    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    res.json({ branch });
  } catch (error) {
    respondWithError(res, error, { context: 'Get branch error', message: 'Failed to get branch' });
  }
}

export async function createBranch(req, res) {
  try {
    const { name, address, phone, status, manager } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Head office is provisioned once by ensureHeadOffice() and is never
    // created through this endpoint, so a client sending type: 'head_office'
    // just gets an ordinary branch. Otherwise the app could end up with two
    // head offices and stock would be booked into an arbitrary one.
    const branch = new Branch({
      name,
      address,
      phone,
      manager,
      status: status === 'inactive' ? 'inactive' : 'active',
      type: 'branch',
    });

    await branch.save();

    res.status(201).json({ branch });
  } catch (error) {
    respondWithError(res, error, { context: 'Create branch error', message: 'Failed to create branch' });
  }
}

export async function updateBranch(req, res) {
  try {
    const { branchId } = req.params;
    const { name, address, phone, status, manager, type } = req.body;

    // Pick fields explicitly rather than forwarding the whole body, so a
    // client cannot overwrite `_id` or `createdAt`.
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (status !== undefined) updates.status = status;
    if (manager !== undefined) updates.manager = manager;

    const current = await Branch.findById(branchId);
    if (!current) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    // `type` is deliberately not mutable: the head office is an invariant, not
    // a preference, and flipping it would orphan every Stock row pointing at
    // the branch.
    if (type !== undefined && type !== null && type !== current.type) {
      res.status(400).json({ error: 'A branch\'s type cannot be changed' });
      return;
    }

    // The head office is the only location new stock can be booked into, so
    // taking it offline would strand unsold inventory.
    if (status === 'inactive' && current.type === 'head_office') {
      res.status(400).json({ error: 'The head office cannot be deactivated' });
      return;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    const branch = await Branch.findByIdAndUpdate(
      { _id: branchId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ branch });
  } catch (error) {
    respondWithError(res, error, { context: 'Update branch error', message: 'Failed to update branch' });
  }
}

export async function deleteBranch(req, res) {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    // Deleting the head office would leave products with nowhere to be booked
    // in, and would orphan every Stock row pointing at it.
    if (branch.type === 'head_office' || branch.isDefault) {
      res.status(400).json({ error: 'Cannot delete the head office' });
      return;
    }

    await Branch.findByIdAndDelete(branchId);

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete branch error', message: 'Failed to delete branch' });
  }
}
