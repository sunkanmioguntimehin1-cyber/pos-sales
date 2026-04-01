import { Request, Response } from 'express';
import { Tenant } from '../models/tenant.model.js';

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

export async function getCurrentStore(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID required' });
      return;
    }

    const store = await Tenant.findById(tenantId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

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
      },
    });
  } catch (error) {
    console.error('Get current store error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
}

export async function getStoreBySubdomain(req: Request, res: Response): Promise<void> {
  try {
    const { subdomain } = req.params;
    
    const store = await Tenant.findOne({ subdomain: subdomain.toLowerCase(), isActive: true });
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.json({
      store: {
        id: store._id,
        name: store.name,
        subdomain: store.subdomain,
        description: store.description,
        logo: store.logo,
        settings: store.settings,
      },
    });
  } catch (error) {
    console.error('Get store by subdomain error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
}

export async function updateStore(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID required' });
      return;
    }

    const { name, description, logo, settings } = req.body;

    const store = await Tenant.findById(tenantId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    if (name) store.name = name;
    if (description !== undefined) store.description = description;
    if (logo !== undefined) store.logo = logo;
    if (settings) {
      store.settings = { ...(store.settings as any), ...settings };
    }

    await store.save();

    res.json({
      store: {
        id: store._id,
        name: store.name,
        subdomain: store.subdomain,
        description: store.description,
        logo: store.logo,
        settings: store.settings,
      },
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
}
