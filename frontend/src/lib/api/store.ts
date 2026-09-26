import api from './axios';

export interface PaymentMethodConfig {
  cash: boolean;
  transfer: { enabled: boolean; gtb: boolean; firstbank: boolean };
  pos: { enabled: boolean; gtb: boolean; firstbank: boolean };
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  settings: {
    primaryColor: string;
    accentColor: string;
    theme: 'dark' | 'light' | 'gold';
    paymentMethods: PaymentMethodConfig;
  };
  createdAt: string;
}

/**
 * The backend merges settings field by field, so a partial payload is valid
 * here even though the stored `settings` object is complete.
 */
export type UpdateStoreData = Partial<Omit<Store, 'settings'>> & {
  settings?: Partial<Store['settings']>;
};

export const storeApi = {
  get: () =>
    api.get<{ store: Store }>('/api/store').then(res => res.data.store),

  update: (data: UpdateStoreData) =>
    api.put<{ store: Store }>('/api/store', data).then(res => res.data.store),
};
