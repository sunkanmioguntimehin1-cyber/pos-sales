import { Request, Response } from 'express';
import { Customer } from '../models/customer.model.js';

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

export async function getCustomers(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { tier, search } = req.query;
    
    const filter: Record<string, unknown> = tenantId ? { tenantId } : {};
    
    if (tier && tier !== 'all') {
      filter.tier = tier;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filter).sort({ totalSpent: -1 });

    res.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
}

export async function createCustomer(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { name, email, phone, address, notes } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const customerData: any = {
      name,
      email: email?.toLowerCase(),
      phone,
      address,
      notes,
    };
    if (tenantId) customerData.tenantId = tenantId;

    const customer = new Customer(customerData);
    await customer.save();

    res.status(201).json({ customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export async function updateCustomer(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { customerId } = req.params;
    const updates = req.body;
    delete updates.tenantId;
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const query: any = { _id: customerId };
    if (tenantId) query.tenantId = tenantId;

    const customer = await Customer.findOneAndUpdate(
      query,
      updates,
      { new: true }
    );

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
}

export async function deleteCustomer(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { customerId } = req.params;

    const query: any = { _id: customerId };
    if (tenantId) query.tenantId = tenantId;

    const customer = await Customer.findOneAndDelete(query);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}
