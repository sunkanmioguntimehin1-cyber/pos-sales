import { Branch } from '../models/branch.model.js';
import { respondWithError } from '../utils/respondWithError.js';

export async function getBranches(req, res) {
  try {
    const branches = await Branch.find().sort({ isDefault: -1, name: 1 });
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
    const { name, address, phone, status, isDefault } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (isDefault) {
      await Branch.updateMany({}, { isDefault: false });
    }

    const branch = new Branch({
      name,
      address,
      phone,
      status: status === 'inactive' ? 'inactive' : 'active',
      isDefault: isDefault || false,
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
    const { name, address, phone, status, isDefault } = req.body;

    // Pick fields explicitly rather than forwarding the whole body, so a
    // client cannot overwrite `_id` or `createdAt`.
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (status !== undefined) updates.status = status;
    if (isDefault !== undefined) updates.isDefault = isDefault;

    if (updates.isDefault) {
      await Branch.updateMany({ _id: { $ne: branchId } }, { isDefault: false });
    }

    const branch = await Branch.findByIdAndUpdate(
      { _id: branchId },
      updates,
      { new: true, runValidators: true }
    );

    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

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

    if (branch.isDefault) {
      res.status(400).json({ error: 'Cannot delete the default branch' });
      return;
    }

    await Branch.findByIdAndDelete(branchId);

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete branch error', message: 'Failed to delete branch' });
  }
}
