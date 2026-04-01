import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Superadmin } from '../models/superadmin.model.js';
import { TenantAdmin } from '../models/tenantAdmin.model.js';
import { Staff } from '../models/staff.model.js';
import { generateToken } from '../utils/jwt.js';

export interface LoginBody {
  email: string;
  password: string;
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginBody = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    let user = await Superadmin.findOne({ email: email.toLowerCase() });
    if (user) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid) {
        const token = generateToken({
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: 'superadmin',
          tenantId: null,
        });
        res.json({
          token,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: 'superadmin',
            tenantId: null,
          },
        });
        return;
      }
    }

    user = await TenantAdmin.findOne({ email: email.toLowerCase() }).populate('tenantId');
    if (user) {
      const tenantAdmin = user as any;
      const isValid = await bcrypt.compare(password, tenantAdmin.passwordHash);
      if (isValid) {
        const token = generateToken({
          userId: tenantAdmin._id.toString(),
          email: tenantAdmin.email,
          name: tenantAdmin.name,
          role: 'tenant_admin',
          tenantId: tenantAdmin.tenantId._id.toString(),
        });
        res.json({
          token,
          user: {
            id: tenantAdmin._id,
            email: tenantAdmin.email,
            name: tenantAdmin.name,
            role: 'tenant_admin',
            tenantId: tenantAdmin.tenantId,
            tenant: tenantAdmin.tenantId,
          },
        });
        return;
      }
    }

    const staffMember = await Staff.findOne({ email: email.toLowerCase() }).populate('tenantId');
    if (staffMember) {
      const isValid = await bcrypt.compare(password, (staffMember as any).passwordHash);
      if (isValid) {
        const token = generateToken({
          userId: staffMember._id.toString(),
          email: staffMember.email || '',
          name: staffMember.name,
          role: 'staff',
          tenantId: (staffMember as any).tenantId._id.toString(),
        });
        res.json({
          token,
          user: {
            id: staffMember._id,
            email: staffMember.email,
            name: staffMember.name,
            role: 'staff',
            tenantId: (staffMember as any).tenantId,
            tenant: (staffMember as any).tenantId,
          },
        });
        return;
      }
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function registerSuperadmin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const existing = await Superadmin.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const superadmin = new Superadmin({
      email: email.toLowerCase(),
      passwordHash,
      name,
    });

    await superadmin.save();

    const token = generateToken({
      userId: superadmin._id.toString(),
      email: superadmin.email,
      name: superadmin.name,
      role: 'superadmin',
      tenantId: null,
    });

    res.status(201).json({
      token,
      user: {
        id: superadmin._id,
        email: superadmin.email,
        name: superadmin.name,
        role: 'superadmin',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
}
