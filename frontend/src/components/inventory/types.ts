export interface InventoryItem {
  id: string;
  productCode: string;
  name: string;
  color: string;
  size: string;
  onHand: number;
  reserved: number;
  available: number;
  reorder: number;
  location: string;
  updated: string;
  status: 'ok' | 'low' | 'critical' | 'out';
}

export interface StockLog {
  id: string;
  time: string;
  type: 'sale' | 'receive' | 'adjust';
  product: string;
  qty: number;
  ref: string;
  user: string;
}

export interface StockAdjustmentFormData {
  productCode: string;
  type: string;
  quantity: string;
  note: string;
}

export interface InventoryFormData {
  productCodeType: 'auto' | 'manual';
  productCode: string;
  name: string;
  color: string;
  size: string;
  onHand: string;
  reserved: string;
  reorder: string;
  location: string;
}

export const emptyInventoryFormData: InventoryFormData = {
  productCodeType: 'auto',
  productCode: '',
  name: '',
  color: '',
  size: '',
  onHand: '',
  reserved: '0',
  reorder: '',
  location: '',
};
