import api from './axios';

export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface PopulatedBranchRef {
  _id: string;
  id: string;
  name: string;
  type: 'head_office' | 'branch';
}

export interface PopulatedStaffRef {
  _id: string;
  id: string;
  name: string;
}

export interface StockTransfer {
  id: string;
  _id?: string;
  fromBranchId: string | PopulatedBranchRef;
  toBranchId: string | PopulatedBranchRef;
  items: TransferItem[];
  status: 'completed' | 'cancelled';
  staffId?: string | PopulatedStaffRef | null;
  notes?: string;
  createdAt: string;
}

export interface CreateTransferData {
  fromBranchId: string;
  toBranchId: string;
  items: { productId: string; productName?: string; quantity: number }[];
  staffId?: string;
  notes?: string;
}

function nameOf(value: string | { name: string } | null | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? undefined : value.name;
}

export function getTransferFromName(transfer: Pick<StockTransfer, 'fromBranchId'>): string | undefined {
  return nameOf(transfer.fromBranchId);
}

export function getTransferToName(transfer: Pick<StockTransfer, 'toBranchId'>): string | undefined {
  return nameOf(transfer.toBranchId);
}

export function getTransferStaffName(transfer: Pick<StockTransfer, 'staffId'>): string | undefined {
  return nameOf(transfer.staffId);
}

/** The other end of a transfer, given which end you are looking at. */
export function getTransferCounterparty(transfer: StockTransfer, branchId: string): string | undefined {
  const from = transfer.fromBranchId as { id?: string; _id?: string };
  const fromId = from?.id ?? from?._id;
  const isOutgoing = fromId === branchId;
  return isOutgoing ? getTransferToName(transfer) : getTransferFromName(transfer);
}

export const transfersApi = {
  getAll: (params?: { branchId?: string; startDate?: string; endDate?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.branchId) searchParams.set('branchId', params.branchId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.limit !== undefined) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return api.get<{ transfers: StockTransfer[] }>(`/api/transfers${query ? `?${query}` : ''}`)
      .then(res => res.data.transfers);
  },

  getById: (transferId: string) =>
    api.get<{ transfer: StockTransfer }>(`/api/transfers/${transferId}`).then(res => res.data.transfer),

  create: (data: CreateTransferData) =>
    api.post<{ transfer: StockTransfer }>('/api/transfers', data).then(res => res.data.transfer),
};
