import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';

export async function getStaff(req, res) {
  try {
    const { role, status, search } = req.query;

    const filter = {};

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

    const staffWithoutHash = staff.map(s => ({
      id: s._id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      status: s.status,
      createdAt: s.createdAt,
    }));

    res.json({ staff: staffWithoutHash });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to get staff' });
  }
}

export async function createStaff(req, res) {
  try {
    const { name, email, phone, password, pin, role, status } = req.body;

    if (!name || !role) {
      res.status(400).json({ error: 'Name and role are required' });
      return;
    }

    if (email) {
      const existing = await Staff.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
    }

    const staff = new Staff({
      name,
      email: email?.toLowerCase(),
      phone,
      passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
      pinHash: pin ? await bcrypt.hash(pin, 10) : undefined,
      role,
      status: status || 'active',
    });

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

export async function updateStaff(req, res) {
  try {
    const { staffId } = req.params;
    const { name, email, phone, password, pin, role, status } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    if (name) staff.name = name;
    if (email !== undefined) staff.email = email?.toLowerCase();
    if (phone !== undefined) staff.phone = phone;
    if (role) staff.role = role;
    if (status) staff.status = status;
    if (password) staff.passwordHash = await bcrypt.hash(password, 10);
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

export async function deleteStaff(req, res) {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findByIdAndDelete({ _id: staffId });
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

export async function verifyPin(req, res) {
  try {
    const { staffId, pin } = req.body;

    if (!staffId || !pin) {
      res.status(400).json({ error: 'Staff ID and PIN required' });
      return;
    }

    const staff = await Staff.findOne({ _id: staffId, status: 'active' });
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
