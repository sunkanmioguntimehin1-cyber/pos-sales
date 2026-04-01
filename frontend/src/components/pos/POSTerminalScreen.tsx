'use client';
import { useState, useCallback, useMemo } from 'react';
import {
  IconSearch, IconScan, IconTrash, IconPlus, IconMinus,
  IconPrinter, IconCheck, IconX, IconInfo, IconUser, IconChevronDown,
  IconXCircle, IconRefresh, IconCreditCard,
} from '@/components/ui/Icons';
import { SidePanel } from '@/components/ui/SidePanel';
import { ProductInfoPanel } from './ProductInfoPanel';
import { AddCustomerModal } from './AddCustomerModal';
import { StaffSelectionModal } from './StaffSelectionModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Product, CartItem, Customer, CATEGORIES,
  getBranchInventory, SplitPayment, PaymentMethod, BANKS, POS_MACHINES, BankType, POSMachineType
} from './types';
import { Staff } from '@/components/staff/types';
import { useProducts, useCustomers, useStaff } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';

type PayView = 'methods' | 'cash' | 'transfer' | 'pos' | 'split' | 'success';

const tierBadge: Record<string, string> = {
  platinum: 'bg-violet-500/15 text-violet-400',
  gold: 'bg-amber-500/15 text-amber-400',
  silver: 'bg-slate-500/15 text-slate-400',
  bronze: 'bg-orange-500/15 text-orange-400',
};

const methodIcons: Record<string, string> = {
  cash: '💵',
  transfer: '🏦',
  pos: '💳',
};

const bankLabels: Record<BankType, string> = {
  gtb: 'GTBank',
  firstbank: 'FirstBank',
};

const posLabels: Record<POSMachineType, string> = {
  gtb_pos: 'GTBank POS',
  firstbank_pos: 'FirstBank POS',
};

export function POSTerminalScreen() {
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({ isActive: true });
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomers();
  const { data: staffList = [], isLoading: isLoadingStaff } = useStaff({ status: 'active' });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [payView, setPayView] = useState<PayView>('methods');
  const [cashInput, setCashInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  // Transfer/POS selection
  const [selectedBank, setSelectedBank] = useState<BankType | null>(null);
  const [selectedPOS, setSelectedPOS] = useState<POSMachineType | null>(null);
  
  // Split payment
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  const [splitCashInput, setSplitCashInput] = useState('');
  const [splitPaymentType, setSplitPaymentType] = useState<'cash' | 'transfer' | 'pos'>('cash');

  // Staff & Receipt
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [completedSaleData, setCompletedSaleData] = useState<{
    paymentMethod: string;
    staffName: string;
  } | null>(null);

  const filtered = products.filter((p: Product) =>
    (activeCat === 'All' || p.category?.name === activeCat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredCustomers = customers.filter((c: Customer) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.email?.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (c.phone?.includes(customerSearch))
  );

  const addItem = useCallback((p: Product) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      return ex ? prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...p, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0));
  }, []);

  const removeItem = useCallback((id: string) => setCart(prev => prev.filter(c => c.id !== id)), []);
  
  const clearCart = useCallback(() => {
    setCart([]);
    setPayView('methods');
    setCashInput('');
    setSelectedCustomer(null);
    setSplitPayments([]);
    setSelectedBank(null);
    setSelectedPOS(null);
    setSplitCashInput('');
    setSplitPaymentType('cash');
    setSelectedStaff(null);
    setCompletedSaleData(null);
    setIsReceiptModalOpen(false);
  }, []);

  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const cashNum = parseFloat(cashInput || '0');
  const change = cashNum - total;
  
  const splitTotalPaid = useMemo(() => splitPayments.reduce((sum, p) => sum + p.amount, 0), [splitPayments]);
  const splitRemaining = total - splitTotalPaid;

  const handleNumPad = (val: string) => {
    if (val === 'DEL') { setCashInput(p => p.slice(0, -1)); return; }
    if (val === '.' && cashInput.includes('.')) return;
    if (cashInput.length >= 8) return;
    setCashInput(p => p + val);
  };

  const handleSplitNumPad = (val: string) => {
    if (val === 'DEL') { setSplitCashInput(p => p.slice(0, -1)); return; }
    if (val === '.' && splitCashInput.includes('.')) return;
    if (splitCashInput.length >= 8) return;
    setSplitCashInput(p => p + val);
  };

  const processPayment = () => {
    setIsStaffModalOpen(true);
  };

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    
    let methodStr = '';
    if (payView === 'cash') {
      methodStr = 'Cash';
    } else if (payView === 'transfer' && selectedBank) {
      methodStr = `Transfer (${bankLabels[selectedBank]})`;
    } else if (payView === 'pos' && selectedPOS) {
      methodStr = `POS (${posLabels[selectedPOS]})`;
    } else if (payView === 'split') {
      methodStr = splitPayments.map(p => {
        if (p.method === 'cash') return 'Cash';
        if (p.method === 'transfer' && p.bank) return `Transfer (${bankLabels[p.bank]})`;
        if (p.method === 'pos' && p.posMachine) return `POS (${posLabels[p.posMachine]})`;
        return p.method;
      }).join(' + ');
    }

    setCompletedSaleData({
      paymentMethod: methodStr,
      staffName: staff.name,
    });

    setPayView('success');
    setTimeout(() => {
      setIsReceiptModalOpen(true);
    }, 500);
  };

  const handleReceiptClose = () => {
    setIsReceiptModalOpen(false);
    clearCart();
    setPayView('methods');
  };

  const handleProductInfo = (product: Product) => {
    setSelectedProduct(product);
    setIsProductPanelOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setIsCustomerDropdownOpen(false);
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleAddCustomer = () => {
    setIsAddCustomerOpen(false);
  };

  const goBack = () => {
    setPayView('methods');
    setCashInput('');
    setSelectedBank(null);
    setSelectedPOS(null);
    setSplitCashInput('');
    setSplitPaymentType('cash');
  };

  const addSplitPayment = (method: PaymentMethod, amount: number, bank?: BankType, posMachine?: POSMachineType) => {
    const newPayment: SplitPayment = {
      id: Date.now().toString(),
      method,
      amount,
      bank,
      posMachine,
    };
    setSplitPayments(prev => [...prev, newPayment]);
    setSplitCashInput('');
  };

  const removeSplitPayment = (id: string) => {
    setSplitPayments(prev => prev.filter(p => p.id !== id));
  };

  const canComplete = useMemo(() => {
    if (payView === 'cash') return cashNum >= total;
    if (payView === 'transfer') return selectedBank !== null;
    if (payView === 'pos') return selectedPOS !== null;
    if (payView === 'split') return splitRemaining <= 0;
    return false;
  }, [payView, cashNum, total, selectedBank, selectedPOS, splitRemaining]);

  return (
    <div className="flex gap-4 h-[calc(100vh-96px)] min-h-0">
      {/* ── Catalog ── */}
      <div className="flex-1 flex flex-col gap-2.5 min-w-0">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <IconSearch size={14} />
            </span>
            <input
              className="w-full h-9 pl-8 pr-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1.5 h-9 px-3.5 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 hover:bg-[#252D3D] rounded-lg text-[13px] font-semibold transition-all flex-shrink-0">
            <IconScan size={14} /> Scan
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeCat === cat
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                  : 'bg-[#1E2535] border-white/[0.07] text-slate-500 hover:border-white/[0.12] hover:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(145px,1fr))] gap-2.5 content-start pr-0.5">
          {filtered.map(p => {
            const inCart = cart.find(c => c.id === p.id);
            return (
              <div key={p.id} className="relative bg-[#1E2535] border border-white/[0.07] rounded-xl p-3 text-left transition-all hover:border-blue-500 hover:bg-[#252D3D] hover:-translate-y-px">
                <button
                  onClick={() => addItem(p)}
                  className="w-full text-left"
                >
                  {inCart && (
                    <div className="absolute top-2 right-2 w-[19px] h-[19px] rounded-full bg-blue-500 text-white text-[9px] font-extrabold flex items-center justify-center z-10">
                      {inCart.qty}
                    </div>
                  )}
                  <div className="text-[26px] mb-1.5 leading-none">📦</div>
                  <div className="text-[11px] font-bold text-slate-100 mb-0.5 leading-snug">{p.name}</div>
                  <div className="font-mono text-[10px] text-slate-500 mb-1.5">{p.sku}</div>
                  <div className="text-[15px] font-extrabold text-blue-400 tabular-nums">${p.price.toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{p.category?.name}</div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleProductInfo(p); }}
                  className="absolute top-2 left-2 w-6 h-6 rounded-md bg-[#161B27]/80 border border-white/[0.12] text-slate-400 hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center transition-all opacity-0 hover:opacity-100"
                  title="View Product Info"
                >
                  <IconInfo size={12} />
                </button>
              </div>
            );
          })}
          {!filtered.length && (
            <div className="col-span-full text-center py-10 text-slate-500 text-xs">No products found</div>
          )}
        </div>
      </div>

      {/* ── Cart panel ── */}
      <div className="w-[380px] flex flex-col bg-[#161B27] border border-white/[0.07] rounded-2xl overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="px-3.5 py-3 border-b border-white/[0.07] flex items-center justify-between flex-shrink-0">
          <div>
            <div className="font-extrabold text-[13px] text-slate-100">Current Sale</div>
            <div className="text-[10px] text-slate-500 mt-px">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</div>
          </div>
          <div className="flex gap-1.5">
            {payView !== 'methods' && payView !== 'success' && (
              <button onClick={goBack} className="h-7 px-2.5 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-md text-[11px] font-semibold transition-all">
                ← Back
              </button>
            )}
            {cart.length > 0 && payView === 'methods' && (
              <button onClick={clearCart} className="h-7 px-2.5 flex items-center gap-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-md text-[11px] font-semibold transition-all">
                <IconTrash size={11} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Customer Selection */}
        <div className="px-3 py-2 border-b border-white/[0.07] bg-[#1E2535] flex-shrink-0">
          {selectedCustomer ? (
            <div className="flex items-center gap-2 p-2 bg-[#161B27] border border-white/[0.12] rounded-lg">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white">
                {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-100 truncate">{selectedCustomer.name}</div>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${tierBadge[selectedCustomer.tier]}`}>
                    ★ {selectedCustomer.tier}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRemoveCustomer}
                className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
              >
                <IconXCircle size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                className="w-full h-8 px-2.5 bg-[#161B27] border border-white/[0.12] rounded-lg text-[11px] text-slate-500 flex items-center justify-between hover:border-white/[0.2] transition-all"
              >
                <span className="flex items-center gap-2">
                  <IconUser size={12} />
                  Add customer to sale
                </span>
                <IconChevronDown size={12} />
              </button>
              {isCustomerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E2535] border border-white/[0.12] rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-white/[0.07]">
                    <input
                      className="w-full h-8 px-2.5 bg-[#161B27] border border-white/[0.12] rounded-md text-[11px] text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500"
                      placeholder="Search..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setIsAddCustomerOpen(true); setIsCustomerDropdownOpen(false); }}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-emerald-500/10 transition-colors text-left border-b border-white/[0.07]"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                        <IconPlus size={12} />
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-400">Add New Customer</div>
                    </button>
                    {filteredCustomers.length === 0 ? (
                      <div className="px-3 py-4 text-center text-[11px] text-slate-500">No customers found</div>
                    ) : (
                      filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/[0.05] transition-colors text-left"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[9px] font-extrabold text-white flex-shrink-0">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-slate-100 truncate">{customer.name}</div>
                            <div className="text-[9px] text-slate-500 truncate">{customer.phone}</div>
                          </div>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold flex-shrink-0 ${tierBadge[customer.tier]}`}>
                            ★ {customer.tier}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUCCESS */}
        {payView === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5 p-6 text-center">
            <div className="w-17 h-17 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
              <IconCheck size={32} />
            </div>
            <div className="text-xl font-extrabold text-emerald-400">Payment Successful!</div>
            <div className="text-[30px] font-extrabold text-slate-100 tabular-nums">${total.toFixed(2)}</div>
            {selectedCustomer && (
              <div className="text-[12px] text-slate-400">
                Purchase recorded for <span className="text-slate-200 font-semibold">{selectedCustomer.name}</span>
              </div>
            )}
          </div>
        )}

        {/* PAYMENT METHODS */}
        {payView === 'methods' && (
          <>
            <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
              {cart.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-slate-500 py-10 text-center">
                  <div className="text-[36px]">🛒</div>
                  <div className="text-[13px] font-semibold">Cart is empty</div>
                  <div className="text-xs">Tap a product to add it</div>
                </div>
              )}
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-2.5 p-2.5 bg-[#1E2535] border border-white/[0.07] hover:border-white/[0.12] rounded-lg transition-all">
                  <button
                    onClick={() => handleProductInfo(item)}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex-shrink-0"
                    title="View Product Info"
                  >
                    <IconInfo size={13} />
                  </button>
                  <div className="text-[20px] flex-shrink-0">📦</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">{item.name}</div>
                    <div className="font-mono text-[10px] text-slate-500 mt-px">{item.sku} · ${item.price.toFixed(2)} ea</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md border border-white/[0.12] bg-[#252D3D] text-slate-400 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-400 flex items-center justify-center transition-all active:scale-90">
                      <IconMinus size={10} />
                    </button>
                    <span className="text-[13px] font-extrabold text-slate-100 min-w-[18px] text-center tabular-nums">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md border border-white/[0.12] bg-[#252D3D] text-slate-400 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-400 flex items-center justify-center transition-all active:scale-90">
                      <IconPlus size={10} />
                    </button>
                  </div>
                  <div className="text-[13px] font-extrabold text-slate-100 min-w-[50px] text-right tabular-nums">${(item.price * item.qty).toFixed(2)}</div>
                  <button onClick={() => removeItem(item.id)} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-red-400 transition-all flex-shrink-0">
                    <IconX size={11} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 border-t border-white/[0.07] bg-[#1E2535] flex-shrink-0">
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Tax (8.25%)</span><span className="tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/[0.07] my-1" />
                <div className="flex justify-between text-lg font-extrabold text-slate-100">
                  <span>Total</span><span className="tabular-nums">${total.toFixed(2)}</span>
                </div>
                {selectedCustomer && (
                  <div className="flex justify-between text-[10px] text-violet-400 mt-1">
                    <span>Customer linked</span><span>{selectedCustomer.tier} member</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  disabled={cart.length === 0}
                  onClick={() => setPayView('cash')}
                  className="h-12 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:bg-[#2E3748] hover:border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                >
                  <span className="text-lg">💵</span>
                  <span className="text-[10px] font-bold text-slate-300">Cash</span>
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => setPayView('transfer')}
                  className="h-12 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:bg-[#2E3748] hover:border-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                >
                  <span className="text-lg">🏦</span>
                  <span className="text-[10px] font-bold text-slate-300">Transfer</span>
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => setPayView('pos')}
                  className="h-12 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:bg-[#2E3748] hover:border-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                >
                  <span className="text-lg">💳</span>
                  <span className="text-[10px] font-bold text-slate-300">POS Machine</span>
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => setPayView('split')}
                  className="h-12 flex flex-col items-center justify-center gap-1 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                >
                    <span className="text-lg"><IconRefresh size={16} className="text-blue-400" /></span>
                  <span className="text-[10px] font-bold text-blue-400">Split Payment</span>
                </button>
              </div>
              <button disabled={cart.length === 0} className="w-full h-9 flex items-center justify-center gap-1.5 bg-transparent border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold transition-all">
                <IconPrinter size={12} /> Print Receipt
              </button>
            </div>
          </>
        )}

        {/* CASH PAYMENT */}
        {payView === 'cash' && (
          <div className="flex-1 flex flex-col p-3.5 gap-2.5 overflow-y-auto">
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Amount Due</div>
              <div className="text-[30px] font-extrabold text-slate-100 tabular-nums">${total.toFixed(2)}</div>
            </div>
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5">Cash Received</div>
              <div className="text-[26px] font-extrabold text-emerald-400 tabular-nums min-h-[34px]">${cashInput || '0'}</div>
            </div>
            {cashNum > 0 && (
              <div className={`rounded-xl p-2.5 text-center border ${change >= 0 ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-red-500/15 border-red-500/30'}`}>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {change >= 0 ? 'Change Due' : 'Insufficient'}
                </div>
                <div className={`text-[22px] font-extrabold tabular-nums ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${Math.abs(change).toFixed(2)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-1.5">
              {['20', '50', '100'].map(v => (
                <button key={v} onClick={() => setCashInput(v)} className="h-9 bg-[#1E2535] border border-white/[0.12] text-slate-300 hover:bg-[#252D3D] hover:text-slate-100 rounded-lg text-[13px] font-semibold transition-all">
                  ${v}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['1','2','3','4','5','6','7','8','9','.','0','DEL'].map(k => (
                <button
                  key={k}
                  onClick={() => handleNumPad(k)}
                  className={`h-11 rounded-xl text-[18px] font-bold transition-all active:scale-90 ${
                    k === 'DEL'
                      ? 'bg-red-500/10 border border-red-500/25 text-red-400 text-xs'
                      : 'bg-[#1E2535] border border-white/[0.07] text-slate-100 hover:bg-[#252D3D] hover:border-white/[0.12]'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <button
              disabled={!canComplete}
              onClick={processPayment}
              className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
            >
              <IconCheck size={15} /> Complete Sale
            </button>
          </div>
        )}

        {/* TRANSFER PAYMENT */}
        {payView === 'transfer' && (
          <div className="flex-1 flex flex-col p-3.5 gap-4">
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Amount Due</div>
              <div className="text-[30px] font-extrabold text-slate-100 tabular-nums">${total.toFixed(2)}</div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select Bank</div>
              <div className="grid grid-cols-2 gap-2">
                {BANKS.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`h-16 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all ${
                      selectedBank === bank.id
                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-400'
                        : 'bg-[#1E2535] border-white/[0.12] text-slate-300 hover:border-white/[0.2]'
                    }`}
                  >
                    <span className="text-2xl">🏦</span>
                    <span className="text-[11px] font-bold">{bankLabels[bank.id]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#1E2535] border-2 border-dashed border-white/[0.12] rounded-xl p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
                <IconRefresh size={24} />
              </div>
              <div className="text-[13px] font-bold text-slate-100">
                {selectedBank ? `${bankLabels[selectedBank]} Transfer` : 'Select a Bank'}
              </div>
              <div className="text-xs text-slate-500">
                {selectedBank ? 'Show this amount to customer for transfer' : 'Choose a bank above'}
              </div>
            </div>

            <button
              disabled={!canComplete}
              onClick={processPayment}
              className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
            >
              <IconCheck size={15} /> Complete Sale
            </button>
          </div>
        )}

        {/* POS MACHINE PAYMENT */}
        {payView === 'pos' && (
          <div className="flex-1 flex flex-col p-3.5 gap-4">
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Amount Due</div>
              <div className="text-[30px] font-extrabold text-slate-100 tabular-nums">${total.toFixed(2)}</div>
            </div>
            
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Select POS Machine</div>
              <div className="grid grid-cols-2 gap-2">
                {POS_MACHINES.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPOS(pos.id)}
                    className={`h-16 flex flex-col items-center justify-center gap-2 rounded-xl border transition-all ${
                      selectedPOS === pos.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                        : 'bg-[#1E2535] border-white/[0.12] text-slate-300 hover:border-white/[0.2]'
                    }`}
                  >
                    <span className="text-2xl">💳</span>
                    <span className="text-[11px] font-bold">{posLabels[pos.id]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#1E2535] border-2 border-dashed border-white/[0.12] rounded-xl p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
                <IconCreditCard size={24} />
              </div>
              <div className="text-[13px] font-bold text-slate-100">
                {selectedPOS ? posLabels[selectedPOS] : 'Select POS Machine'}
              </div>
              <div className="text-xs text-slate-500">
                {selectedPOS ? 'Ready to process card payment' : 'Choose a POS machine above'}
              </div>
            </div>

            <button
              disabled={!canComplete}
              onClick={processPayment}
              className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
            >
              <IconCheck size={15} /> Complete Sale
            </button>
          </div>
        )}

        {/* SPLIT PAYMENT */}
        {payView === 'split' && (
          <div className="flex-1 flex flex-col p-3.5 gap-3 overflow-y-auto">
            <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Due</span>
                <span className="text-[18px] font-extrabold text-slate-100 tabular-nums">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Paid</span>
                <span className="text-[14px] font-extrabold text-emerald-400 tabular-nums">${splitTotalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Remaining</span>
                <span className={`text-[16px] font-extrabold tabular-nums ${splitRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ${Math.abs(splitRemaining).toFixed(2)}
                </span>
              </div>
            </div>

            {splitPayments.length > 0 && (
              <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-white/[0.07]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payments</span>
                </div>
                {splitPayments.map(payment => (
                  <div key={payment.id} className="px-3 py-2.5 flex items-center justify-between border-b border-white/[0.07] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{methodIcons[payment.method]}</span>
                      <div>
                        <div className="text-[12px] font-semibold text-slate-100 capitalize">{payment.method}</div>
                        <div className="text-[10px] text-slate-500">
                          {payment.method === 'transfer' && payment.bank && bankLabels[payment.bank]}
                          {payment.method === 'pos' && payment.posMachine && posLabels[payment.posMachine]}
                          {payment.method === 'cash' && 'Cash'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-extrabold text-emerald-400">${payment.amount.toFixed(2)}</span>
                      <button
                        onClick={() => removeSplitPayment(payment.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-red-400 transition-all"
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {splitRemaining > 0 && (
              <>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Add Payment Method</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setSplitPaymentType('cash')}
                      className={`h-12 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border transition-all ${
                        splitPaymentType === 'cash' ? 'border-emerald-500/50' : 'border-white/[0.12] hover:border-emerald-500/30'
                      } rounded-lg`}
                    >
                      <span className="text-lg">💵</span>
                      <span className="text-[9px] font-bold text-slate-300">Cash</span>
                    </button>
                    <button
                      onClick={() => setSplitPaymentType('transfer')}
                      className={`h-12 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border transition-all ${
                        splitPaymentType === 'transfer' ? 'border-blue-500/50' : 'border-white/[0.12] hover:border-blue-500/30'
                      } rounded-lg`}
                    >
                      <span className="text-lg">🏦</span>
                      <span className="text-[9px] font-bold text-slate-300">Transfer</span>
                    </button>
                    <button
                      onClick={() => setSplitPaymentType('pos')}
                      className={`h-12 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border transition-all ${
                        splitPaymentType === 'pos' ? 'border-amber-500/50' : 'border-white/[0.12] hover:border-amber-500/30'
                      } rounded-lg`}
                    >
                      <span className="text-lg">💳</span>
                      <span className="text-[9px] font-bold text-slate-300">POS</span>
                    </button>
                  </div>
                </div>

                {splitPaymentType === 'cash' && (
                  <>
                    <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 text-center">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5">Enter Cash Amount</div>
                      <div className="text-[22px] font-extrabold text-emerald-400 tabular-nums min-h-[28px]">${splitCashInput || '0'}</div>
                    </div>

                    <div className="grid grid-cols-4 gap-1">
                      {['1','2','3','4','5','6','7','8','9','.','0','DEL'].map(k => (
                        <button
                          key={k}
                          onClick={() => handleSplitNumPad(k)}
                          className={`h-10 rounded-lg text-[16px] font-bold transition-all active:scale-95 ${
                            k === 'DEL'
                              ? 'bg-red-500/10 border border-red-500/25 text-red-400 text-xs'
                              : 'bg-[#1E2535] border border-white/[0.07] text-slate-100 hover:bg-[#252D3D]'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const amount = parseFloat(splitCashInput) || 0;
                        if (amount > 0 && amount <= splitRemaining) {
                          addSplitPayment('cash', amount);
                        } else if (amount > splitRemaining) {
                          addSplitPayment('cash', splitRemaining);
                        }
                      }}
                      disabled={!splitCashInput || parseFloat(splitCashInput) <= 0}
                      className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
                    >
                      Add Cash Payment
                    </button>
                  </>
                )}

                {splitPaymentType === 'transfer' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addSplitPayment('transfer', splitRemaining, 'gtb')}
                      className="h-16 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:border-blue-500/50 rounded-xl transition-all"
                    >
                      <span className="text-2xl">🏦</span>
                      <span className="text-[11px] font-bold text-slate-200">GTBank</span>
                      <span className="text-[10px] font-bold text-blue-400">${splitRemaining.toFixed(2)}</span>
                    </button>
                    <button
                      onClick={() => addSplitPayment('transfer', splitRemaining, 'firstbank')}
                      className="h-16 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:border-blue-500/50 rounded-xl transition-all"
                    >
                      <span className="text-2xl">🏦</span>
                      <span className="text-[11px] font-bold text-slate-200">FirstBank</span>
                      <span className="text-[10px] font-bold text-blue-400">${splitRemaining.toFixed(2)}</span>
                    </button>
                  </div>
                )}

                {splitPaymentType === 'pos' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addSplitPayment('pos', splitRemaining, undefined, 'gtb_pos')}
                      className="h-16 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:border-amber-500/50 rounded-xl transition-all"
                    >
                      <span className="text-2xl">💳</span>
                      <span className="text-[11px] font-bold text-slate-200">GTBank POS</span>
                      <span className="text-[10px] font-bold text-amber-400">${splitRemaining.toFixed(2)}</span>
                    </button>
                    <button
                      onClick={() => addSplitPayment('pos', splitRemaining, undefined, 'firstbank_pos')}
                      className="h-16 flex flex-col items-center justify-center gap-1 bg-[#252D3D] border border-white/[0.12] hover:border-amber-500/50 rounded-xl transition-all"
                    >
                      <span className="text-2xl">💳</span>
                      <span className="text-[11px] font-bold text-slate-200">FirstBank POS</span>
                      <span className="text-[10px] font-bold text-amber-400">${splitRemaining.toFixed(2)}</span>
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              disabled={!canComplete}
              onClick={processPayment}
              className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all"
            >
              <IconCheck size={15} /> Complete Sale
            </button>
          </div>
        )}
      </div>

      {/* Product Info Panel */}
      <ProductInfoPanel
        isOpen={isProductPanelOpen}
        onClose={() => setIsProductPanelOpen(false)}
        product={selectedProduct}
        branchInventory={selectedProduct ? getBranchInventory(selectedProduct.id) : []}
        onAddToCart={handleAddToCart}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAdd={handleAddCustomer}
      />

      {/* Staff Selection Modal */}
      <StaffSelectionModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSelect={handleStaffSelect}
        staffList={staffList}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={handleReceiptClose}
        customer={selectedCustomer}
        cart={cart}
        total={total}
        tax={tax}
        subtotal={subtotal}
        paymentMethod={completedSaleData?.paymentMethod || ''}
        staffName={completedSaleData?.staffName || ''}
      />
    </div>
  );
}
