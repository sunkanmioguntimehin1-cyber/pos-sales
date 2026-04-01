import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Tenant } from '../models/tenant.model.js';
import { TenantAdmin } from '../models/tenantAdmin.model.js';
import { Staff } from '../models/staff.model.js';
import { Branch } from '../models/branch.model.js';
import { Category } from '../models/category.model.js';
import { sendWelcomeEmail } from '../utils/email.js';

export interface CreateStoreBody {
  name: string;
  subdomain: string;
  description?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  settings?: {
    primaryColor?: string;
    accentColor?: string;
    theme?: 'dark' | 'light' | 'gold';
  };
}

export async function createStore(req: Request, res: Response): Promise<void> {
  try {
    const { name, subdomain, description, adminName, adminEmail, adminPassword, settings }: CreateStoreBody = req.body;

    if (!name || !subdomain || !adminName || !adminEmail || !adminPassword) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const subdomainLower = subdomain.toLowerCase();
    const existingTenant = await Tenant.findOne({ subdomain: subdomainLower });
    if (existingTenant) {
      res.status(400).json({ error: 'Subdomain already taken' });
      return;
    }

    const existingAdmin = await TenantAdmin.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      res.status(400).json({ error: 'Admin email already registered' });
      return;
    }

    const tenant = new Tenant({
      name,
      subdomain: subdomainLower,
      description: description || '',
      settings: settings || {
        primaryColor: '#3B82F6',
        accentColor: '#6366F1',
        theme: 'dark',
      },
    });

    await tenant.save();

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = new TenantAdmin({
      email: adminEmail.toLowerCase(),
      passwordHash,
      name: adminName,
      tenantId: tenant._id,
    });

    await admin.save();

    const defaultBranch = new Branch({
      name: 'Main Branch',
      isDefault: true,
      tenantId: tenant._id,
    });
    await defaultBranch.save();

    const defaultCategory = new Category({
      name: 'General',
      tenantId: tenant._id,
    });
    await defaultCategory.save();

    sendWelcomeEmail(
      adminEmail,
      adminName,
      name,
      adminPassword,
      subdomainLower
    ).catch((emailError) => {
      console.error('Failed to send welcome email:', emailError);
    });

    res.status(201).json({
      store: {
        id: tenant._id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        description: tenant.description,
        settings: tenant.settings,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
      },
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
}

export async function getStores(req: Request, res: Response): Promise<void> {
  try {
    const stores = await Tenant.find().sort({ createdAt: -1 });
    
    const storesWithAdmin = await Promise.all(
      stores.map(async (store) => {
        const admin = await TenantAdmin.findOne({ tenantId: store._id });
        const staffCount = await Staff.countDocuments({ tenantId: store._id });
        return {
          id: store._id,
          name: store.name,
          subdomain: store.subdomain,
          description: store.description,
          logo: store.logo,
          isActive: store.isActive,
          settings: store.settings,
          createdAt: store.createdAt,
          admin: admin ? { id: admin._id, name: admin.name, email: admin.email } : null,
          staffCount,
        };
      })
    );

    res.json({ stores: storesWithAdmin });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
}

export async function getStore(req: Request, res: Response): Promise<void> {
  try {
    const { storeId } = req.params;
    
    const store = await Tenant.findById(storeId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    const admin = await TenantAdmin.findOne({ tenantId: store._id });
    const staffCount = await Staff.countDocuments({ tenantId: store._id });
    const branchCount = await Branch.countDocuments({ tenantId: store._id });

    res.json({
      store: {
        id: store._id,
        name: store.name,
        subdomain: store.subdomain,
        description: store.description,
        logo: store.logo,
        isActive: store.isActive,
        settings: store.settings,
        createdAt: store.createdAt,
        admin: admin ? { id: admin._id, name: admin.name, email: admin.email } : null,
        stats: { staffCount, branchCount },
      },
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
}

export async function updateStore(req: Request, res: Response): Promise<void> {
  try {
    const { storeId } = req.params;
    const { name, description, logo, isActive, settings } = req.body;

    const store = await Tenant.findById(storeId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    if (name) store.name = name;
    if (description !== undefined) store.description = description;
    if (logo !== undefined) store.logo = logo;
    if (isActive !== undefined) store.isActive = isActive;
    if (settings) {
      store.settings = { ...store.settings, ...settings } as typeof store.settings;
    }

    await store.save();

    res.json({ store });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
}

export async function deleteStore(req: Request, res: Response): Promise<void> {
  try {
    const { storeId } = req.params;

    const store = await Tenant.findById(storeId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    await TenantAdmin.deleteMany({ tenantId: storeId });
    await Staff.deleteMany({ tenantId: storeId });
    await Branch.deleteMany({ tenantId: storeId });
    await Category.deleteMany({ tenantId: storeId });
    await Tenant.findByIdAndDelete(storeId);

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ error: 'Failed to delete store' });
  }
}
