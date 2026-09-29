import api from './axios';

export type StockMovementType = 'sale' | 'receive' | 'damage' | 'correction' | 'transfer';

/** A populated branch/name ref as the backend attaches it to log rows. */
export interface PopulatedNameRef {
  _id: string;
  id: string;
  name: string;
}

export interface StockMovement {
  id: string;
  _id?: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  /** Signed: positive units entered `branchId`, negative left it. */
  quantity: number;
  /** The single location this row refers to. */
  branchId: PopulatedNameRef;
  /** Present only on transfer rows, so the UI can render "HQ → Accra Mall". */
  fromBranchId?: PopulatedNameRef;
  toBranchId?: PopulatedNameRef;
  source: 'transfer' | 'order' | 'adjust' | 'create';
  ref?: string;
  staffName?: string;
  note?: string;
  createdAt: string;
}

export interface StockMovementFilters {
  productId?: string;
  branchId?: string;
  type?: StockMovementType | 'all';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const stockMovementsApi = {
  getAll: (filters?: StockMovementFilters) => {
    const searchParams = new URLSearchParams();
    if (filters?.productId) searchParams.set('productId', filters.productId);
    if (filters?.branchId) searchParams.set('branchId', filters.branchId);
    if (filters?.type) searchParams.set('type', filters.type);
    if (filters?.startDate) searchParams.set('startDate', filters.startDate);
    if (filters?.endDate) searchParams.set('endDate', filters.endDate);
    if (filters?.limit !== undefined) searchParams.set('limit', String(filters.limit));
    const query = searchParams.toString();
    return api.get<{ movements: StockMovement[] }>(`/api/products/movements${query ? `?${query}` : ''}`)
      .then(res => res.data.movements);
  },
};