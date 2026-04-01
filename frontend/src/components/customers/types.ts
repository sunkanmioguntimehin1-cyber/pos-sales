export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  visits: number;
  spent: number;
  lastVisit: string;
}

export interface PurchaseHistory {
  id: string;
  date: string;
  time: string;
  orderId: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  branch: string;
}

export interface PurchaseItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
