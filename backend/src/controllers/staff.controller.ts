import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';
import { TenantAdmin } from '../models/tenantAdmin.model.js';

export interface CreateStaffBody {
  name: string;
  email?: string;
  phone?: string;
  pin?: string;
  role: 'admin' | 'manager' | 'cashier';
  status?: 'active' | 'inactive';
}

function getTenantId(req: Request): string | null {
  if (req.user?.role === 'superadmin') {
    return req.headers['x-tenant-id'] as string || null;
  }
  return req.headers['x-tenant-id'] as string || null;
}

function requireTenantId(req: Request, res: Response): string | null {
  const tenantId = getTenantId(req);
  if (req.user?.role !== 'superadmin' && !tenantId) {
    res.status(400).json({ error: 'Tenant ID required' });
    return null;
  }
  return tenantId;
}

export async function getStaff(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { role, status, search } = req.query;
    
    const filter: Record<string, unknown> = tenantId ? { tenantId } : {};
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const staff = await Staff.find(filter).sort({ createdAt: -1 });
    
    const staffWithoutPin = staff.map(s => ({
      id: s._id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      status: s.status,
      createdAt: s.createdAt,
    }));

    res.json({ staff: staffWithoutPin });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to get staff' });
  }
}

export async function createStaff(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { name, email, phone, pin, role, status }: CreateStaffBody = req.body;

    if (!name || !role) {
      res.status(400).json({ error: 'Name and role are required' });
      return;
    }

    if (email) {
      const query = { email: email.toLowerCase() };
      if (tenantId) (query as any).tenantId = tenantId;
      const existing = await Staff.findOne(query);
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    const staffData: any = {
      name,
      email: email?.toLowerCase(),
      phone,
      pinHash: pin ? await bcrypt.hash(pin, 10) : undefined,
      role,
      status: status || 'active',
    };
    if (tenantId) staffData.tenantId = tenantId;

    const staff = new Staff(staffData);
    await staff.save();

    res.status(201).json({
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
}

export async function updateStaff(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { staffId } = req.params;
    const { name, email, phone, pin, role, status } = req.body;

    const query: any = { _id: staffId };
    if (tenantId) query.tenantId = tenantId;

    const staff = await Staff.findOne(query);
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    if (name) staff.name = name;
    if (email !== undefined) staff.email = email?.toLowerCase();
    if (phone !== undefined) staff.phone = phone;
    if (role) staff.role = role;
    if (status) staff.status = status;
    if (pin) staff.pinHash = await bcrypt.hash(pin, 10);

    await staff.save();

    res.json({
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
}

export async function deleteStaff(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { staffId } = req.params;

    const query: any = { _id: staffId };
    if (tenantId) query.tenantId = tenantId;

    const staff = await Staff.findOneAndDelete(query);
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
}

export async function verifyPin(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { staffId, pin } = req.body;

    if (!staffId || !pin) {
      res.status(400).json({ error: 'Staff ID and PIN required' });
      return;
    }

    const query: any = { _id: staffId, status: 'active' };
    if (tenantId) query.tenantId = tenantId;

    const staff = await Staff.findOne(query);
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    if (!staff.pinHash) {
      res.status(400).json({ error: 'Staff has no PIN set' });
      return;
    }

    const isValid = await bcrypt.compare(pin, staff.pinHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid PIN' });
      return;
    }

    res.json({
      success: true,
      staff: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
}
