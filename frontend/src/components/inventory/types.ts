export interface InventoryItem {
  id: string;
  productCode: string;
  name: string;
  /** Category name resolved from the product's populated `categoryId`. */
  category: string;
  onHand: number;
  reserved: number;
  available: number;
  reorder: number;
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

export type StockAdjustmentType = 'receive' | 'damage' | 'correction' | 'transfer';

export interface StockAdjustmentFormData {
  productCode: string;
  type: StockAdjustmentType | '';
  quantity: string;
  note: string;
}

/**
 * Mirrors the product schema. The old form had colour/size/location/reserved
 * fields with no backing columns, so they were dropped rather than silently
 * discarded on save.
 */
export interface InventoryFormData {
  productCodeType: 'auto' | 'manual';
  productCode: string;
  name: string;
  price: string;
  costPrice: string;
  onHand: string;
  reorder: string;
}

export const emptyInventoryFormData: InventoryFormData = {
  productCodeType: 'auto',
  productCode: '',
  name: '',
  price: '',
  costPrice: '0',
  onHand: '',
  reorder: '',
};
