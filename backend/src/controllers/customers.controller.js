import { Customer } from '../models/customer.model.js';
import { Order } from '../models/order.model.js';
import { respondWithError } from '../utils/respondWithError.js';

/**
 * Builds a `customerId -> [branchName]` map from the orders each customer has
 * placed. A customer has no branch of their own, so the branch(es) they bought
 * from can only be derived from their orders.
 */
async function getBranchesByCustomer(customerIds) {
  if (!customerIds.length) return new Map();

  const rows = await Order.aggregate([
    { $match: { customerId: { $in: customerIds }, branchId: { $ne: null } } },
    { $group: { _id: { customerId: '$customerId', branchId: '$branchId' } } },
    {
      $lookup: {
        from: 'branches',
        localField: '_id.branchId',
        foreignField: '_id',
        as: 'branch',
      },
    },
    { $unwind: '$branch' },
  ]);

  const map = new Map();
  for (const row of rows) {
    const customerId = String(row._id.customerId);
    const names = map.get(customerId) || [];
    if (row.branch?.name && !names.includes(row.branch.name)) {
      names.push(row.branch.name);
    }
    map.set(customerId, names);
  }
  return map;
}

export async function getCustomers(req, res) {
  try {
    const { tier, search } = req.query;
    
    const filter = {};
    
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
    const branchesByCustomer = await getBranchesByCustomer(customers.map((c) => c._id));

    const withBranches = customers.map((customer) => ({
      ...customer.toObject({ virtuals: true }),
      branches: branchesByCustomer.get(String(customer._id)) || [],
    }));

    res.json({ customers: withBranches });
  } catch (error) {
    respondWithError(res, error, { context: 'Get customers error', message: 'Failed to get customers' });
  }
}

export async function getCustomer(req, res) {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const branches = (await getBranchesByCustomer([customer._id])).get(String(customer._id)) || [];

    res.json({ customer: { ...customer.toObject({ virtuals: true }), branches } });
  } catch (error) {
    respondWithError(res, error, { context: 'Get customer error', message: 'Failed to get customer' });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, email, phone, address, notes, weddingAnniversary, proposalAnniversary } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const customer = new Customer({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      notes,
      weddingAnniversary: weddingAnniversary || undefined,
      proposalAnniversary: proposalAnniversary || undefined,
    });

    await customer.save();

    res.status(201).json({ customer: { ...customer.toObject(), branches: [] } });
  } catch (error) {
    respondWithError(res, error, { context: 'Create customer error', message: 'Failed to create customer' });
  }
}

export async function updateCustomer(req, res) {
  try {
    const { customerId } = req.params;
    const updates = { ...req.body };

    if (updates.email !== undefined) {
      if (!String(updates.email).trim()) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      updates.email = String(updates.email).toLowerCase();
    }

    if (updates.weddingAnniversary === '') updates.weddingAnniversary = undefined;
    if (updates.proposalAnniversary === '') updates.proposalAnniversary = undefined;

    const customer = await Customer.findByIdAndUpdate(
      { _id: customerId },
      updates,
      { new: true }
    );

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const branches = (await getBranchesByCustomer([customer._id])).get(String(customer._id)) || [];

    res.json({ customer: { ...customer.toObject(), branches } });
  } catch (error) {
    respondWithError(res, error, { context: 'Update customer error', message: 'Failed to update customer' });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findByIdAndDelete({ _id: customerId });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete customer error', message: 'Failed to delete customer' });
  }
}
