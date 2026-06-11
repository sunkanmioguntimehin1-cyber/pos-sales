import { Customer } from '../models/customer.model.js';

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

    res.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
}

export async function createCustomer(req, res) {
  try {
    const { name, email, phone, address, notes } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const customer = new Customer({
      name,
      email: email?.toLowerCase(),
      phone,
      address,
      notes,
    });

    await customer.save();

    res.status(201).json({ customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}

export async function updateCustomer(req, res) {
  try {
    const { customerId } = req.params;
    const updates = req.body;
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const customer = await Customer.findByIdAndUpdate(
      { _id: customerId },
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
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
}
