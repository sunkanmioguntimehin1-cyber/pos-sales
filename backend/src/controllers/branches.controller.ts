import { Request, Response } from 'express';
import { Branch } from '../models/branch.model.js';

function requireTenantId(req: Request, res: Response): string | null {
  if (req.user?.role === 'superadmin') {
    return req.headers['x-tenant-id'] as string || null;
  }
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    res.status(400).json({ error: 'Tenant ID required' });
    return null;
  }
  return tenantId;
}

export async function getBranches(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const filter = tenantId ? { tenantId } : {};
    const branches = await Branch.find(filter).sort({ isDefault: -1, name: 1 });
    res.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Failed to get branches' });
  }
}

export async function createBranch(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { name, address, phone, isDefault } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (isDefault && tenantId) {
      await Branch.updateMany({ tenantId }, { isDefault: false });
    }

    const branchData: any = {
      name,
      address,
      phone,
      isDefault: isDefault || false,
    };
    if (tenantId) branchData.tenantId = tenantId;

    const branch = new Branch(branchData);
    await branch.save();

    res.status(201).json({ branch });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ error: 'Failed to create branch' });
  }
}

export async function updateBranch(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { branchId } = req.params;
    const updates = req.body;
    delete updates.tenantId;

    if (updates.isDefault && tenantId) {
      await Branch.updateMany({ tenantId }, { isDefault: false });
    }

    const query: any = { _id: branchId };
    if (tenantId) query.tenantId = tenantId;

    const branch = await Branch.findOneAndUpdate(
      query,
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

export async function deleteBranch(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { branchId } = req.params;

    const query: any = { _id: branchId };
    if (tenantId) query.tenantId = tenantId;

    const branch = await Branch.findOne(query);
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
