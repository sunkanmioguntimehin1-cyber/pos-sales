import bcrypt from 'bcryptjs';
import { Staff } from '../models/staff.model.js';
import { respondWithError } from '../utils/respondWithError.js';

/** Strip the password/PIN hashes before sending a staff record to a client. */
function toPublicStaff(s) {
  return {
    id: String(s._id),
    name: s.name,
    email: s.email,
    phone: s.phone,
    role: s.role,
    status: s.status,
    createdAt: s.createdAt,
  };
}

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

    res.json({ staff: staff.map(toPublicStaff) });
  } catch (error) {
    respondWithError(res, error, { context: 'Get staff error', message: 'Failed to get staff' });
  }
}

export async function getStaffMember(req, res) {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }

    res.json({ staff: toPublicStaff(staff) });
  } catch (error) {
    respondWithError(res, error, { context: 'Get staff member error', message: 'Failed to get staff' });
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

    res.status(201).json({ staff: toPublicStaff(staff) });
  } catch (error) {
    respondWithError(res, error, { context: 'Create staff error', message: 'Failed to create staff' });
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

    res.json({ staff: toPublicStaff(staff) });
  } catch (error) {
    respondWithError(res, error, { context: 'Update staff error', message: 'Failed to update staff' });
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
    respondWithError(res, error, { context: 'Delete staff error', message: 'Failed to delete staff' });
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
    respondWithError(res, error, { context: 'Verify PIN error', message: 'Failed to verify PIN' });
  }
}
