export interface InventoryItem {
  id: string;
  productCode: string;
  name: string;
  /** Category name resolved from the product's populated `categoryId`. */
  category: string;
  /**
   * Quantity at the location the screen is scoped to — or the company-wide
   * total when no single location is selected.
   */
  onHand: number;
  /** Company-wide total, always the same regardless of the selected location. */
  totalStock: number;
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
 * Stock movements between locations are recorded on the Transfers screen, not
 * as an adjustment. Leaving it here would silently subtract from head office
 * without the units ever arriving anywhere.
 */
export const ADJUSTMENT_TYPE_OPTIONS: { value: Exclude<StockAdjustmentType, 'transfer'>; label: string }[] = [
  { value: 'receive', label: 'Add stock (receive)' },
  { value: 'damage', label: 'Remove stock (damage)' },
  { value: 'correction', label: 'Count correction' },
];

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
