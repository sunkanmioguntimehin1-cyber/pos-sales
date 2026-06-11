import { Branch } from '../models/branch.model.js';

export async function getBranches(req, res) {
  try {
    const branches = await Branch.find().sort({ isDefault: -1, name: 1 });
    res.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Failed to get branches' });
  }
}

export async function createBranch(req, res) {
  try {
    const { name, address, phone, isDefault } = req.body;

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
      isDefault: isDefault || false,
    });

    await branch.save();

    res.status(201).json({ branch });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
}

export async function updateBranch(req, res) {
  try {
    const { branchId } = req.params;
    const updates = req.body;

    if (updates.isDefault) {
      await Branch.updateMany({}, { isDefault: false });
    }

    const branch = await Branch.findByIdAndUpdate(
      { _id: branchId },
      updates,
      { new: true }
    );

    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    res.json({ branch });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ error: 'Failed to update branch' });
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
    console.error('Delete branch error:', error);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
}
