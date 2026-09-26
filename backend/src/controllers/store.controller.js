import { Store } from '../models/store.model.js';
import { respondWithError } from '../utils/respondWithError.js';

export async function getStore(_req, res) {
  try {
    let store = await Store.findOne();
    if (!store) {
      store = await Store.create({ name: 'My Store' });
    }

    res.json({ store });
  } catch (error) {
    respondWithError(res, error, { context: 'Get store error', message: 'Failed to get store' });
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
      // Previously any payment-method changes sent from the settings screen
      // were dropped here, so the toggles appeared to save but never applied.
      if (settings.paymentMethods) {
        const pm = settings.paymentMethods;
        if (typeof pm.cash === 'boolean') store.settings.paymentMethods.cash = pm.cash;
        if (pm.transfer) {
          const t = pm.transfer;
          if (typeof t.enabled === 'boolean') store.settings.paymentMethods.transfer.enabled = t.enabled;
          if (typeof t.gtb === 'boolean') store.settings.paymentMethods.transfer.gtb = t.gtb;
          if (typeof t.firstbank === 'boolean') store.settings.paymentMethods.transfer.firstbank = t.firstbank;
        }
        if (pm.pos) {
          const p = pm.pos;
          if (typeof p.enabled === 'boolean') store.settings.paymentMethods.pos.enabled = p.enabled;
          if (typeof p.gtb === 'boolean') store.settings.paymentMethods.pos.gtb = p.gtb;
          if (typeof p.firstbank === 'boolean') store.settings.paymentMethods.pos.firstbank = p.firstbank;
        }
      }
    }

    await store.save();

    res.json({ store });
  } catch (error) {
    respondWithError(res, error, { context: 'Update store error', message: 'Failed to update store' });
  }
}
