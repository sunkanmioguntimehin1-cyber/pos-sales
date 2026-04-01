import { Product as ApiProduct, Customer as ApiCustomer } from '@/lib/api';

export type Product = ApiProduct;
export type Customer = ApiCustomer;

export interface CartItem extends Product {
  qty: number;
}

export interface BranchStock {
  branchId: string;
  branchName: string;
  quantity: number;
  location: string;
}

export type PaymentMethod = 'cash' | 'transfer' | 'pos';
export type BankType = 'gtb' | 'firstbank';
export type POSMachineType = 'gtb_pos' | 'firstbank_pos';

export interface SplitPayment {
  id: string;
  method: PaymentMethod;
  bank?: BankType;
  posMachine?: POSMachineType;
  amount: number;
}

export const BANKS: { id: BankType; name: string }[] = [
  { id: 'gtb', name: 'GTBank' },
  { id: 'firstbank', name: 'FirstBank' },
];

export const POS_MACHINES: { id: POSMachineType; name: string }[] = [
  { id: 'gtb_pos', name: 'GTBank POS' },
  { id: 'firstbank_pos', name: 'FirstBank POS' },
];

export const CATEGORIES = ['All', 'Electronics', 'Cases', 'Accessories', 'Cables'];

export function getBranchInventory(branchId: string) {
  return [];
}
