import { Store } from '../models/store.model.js';

export async function getStore(_req, res) {
  try {
    let store = await Store.findOne();
    if (!store) {
      store = await Store.create({ name: 'My Store' });
    }

    res.json({ store });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
}

export async function updateStore(req, res) {
  try {
    const { name, description, logo, settings } = req.body;

    let store = await Store.findOne();
    if (!store) {
      store = await Store.create({ name: 'My Store' });
    }

    if (name !== undefined) store.name = name;
    if (description !== undefined) store.description = description;
    if (logo !== undefined) store.logo = logo;
    if (settings) {
      if (settings.primaryColor) store.settings.primaryColor = settings.primaryColor;
      if (settings.accentColor) store.settings.accentColor = settings.accentColor;
      if (settings.theme) store.settings.theme = settings.theme;
    }

    await store.save();

    res.json({ store });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
}
