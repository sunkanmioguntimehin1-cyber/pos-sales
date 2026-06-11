import api from './axios';

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  settings: {
    primaryColor: string;
    accentColor: string;
    theme: 'dark' | 'light' | 'gold';
  };
  createdAt: string;
}

export const storeApi = {
  get: () =>
    api.get<{ store: Store }>('/api/store').then(res => res.data.store),

  update: (data: Partial<Store>) =>
    api.put<{ store: Store }>('/api/store', data).then(res => res.data.store),
};
