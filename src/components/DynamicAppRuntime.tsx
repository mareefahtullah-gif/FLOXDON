import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Star,
  Clock,
  Filter,
  ArrowRight,
  ShieldCheck,
  Heart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Send,
  Download,
  Calendar,
  User,
  Activity,
  HeartPulse,
  AlertCircle,
  Truck,
  MapPin,
  Navigation,
  Fuel,
  MessageSquare,
  Users,
  Smile,
  Hash,
  CheckCircle2,
  Sliders,
  Sparkles,
  Package,
  Layers,
  FileText
} from 'lucide-react';
import { Project, DeviceView } from '../types';
import { detectAppDomain } from '../utils/aiAppSynthesizer';

interface DynamicAppRuntimeProps {
  project: Project;
  deviceView?: DeviceView;
}

export const DynamicAppRuntime: React.FC<DynamicAppRuntimeProps> = ({ project, deviceView = 'desktop' }) => {
  const domainMeta = useMemo(() => {
    return detectAppDomain(`${project.name} ${project.description || ''}`);
  }, [project.name, project.description]);

  switch (domainMeta.domain) {
    case 'ecommerce':
    case 'food_delivery':
      return <EcommerceRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    case 'finance':
      return <FinanceRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    case 'healthcare':
      return <HealthcareRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    case 'logistics':
      return <LogisticsRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    case 'communication':
      return <ChatRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    case 'project_management':
      return <KanbanRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    case 'inventory':
      return <InventoryRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
    default:
      return <CustomDomainRuntime project={project} domainMeta={domainMeta} isMobile={deviceView === 'mobile'} />;
  }
};

// =========================================================================
// 1. E-COMMERCE & FOOD DELIVERY RUNTIME
// =========================================================================
const EcommerceRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project, domainMeta, isMobile }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; tag: string }[]>([
    { id: 'p1', name: 'Signature Gourmet Roast', price: 18.50, quantity: 1, tag: '☕' },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const catalog = [
    { id: 'p1', name: 'Signature Gourmet Roast', category: 'Beverages', price: 18.50, rating: 4.9, prep: '5-10 min', tag: '☕', stock: 'In Stock', desc: 'Direct-trade artisanal single origin beans.' },
    { id: 'p2', name: 'Organic Sourdough Basket', category: 'Bakery', price: 12.00, rating: 4.8, prep: '15 min', tag: '🥖', stock: 'In Stock', desc: 'Slow-fermented wild yeast crust with honey butter.' },
    { id: 'p3', name: 'Mediterranean Quinoa Bowl', category: 'Meals', price: 16.75, rating: 4.9, prep: '12 min', tag: '🥗', stock: 'Fresh', desc: 'Roasted seasonal roots, kalamata olives, tahini.' },
    { id: 'p4', name: 'Prime Truffle Wagyu Burger', category: 'Meals', price: 22.50, rating: 5.0, prep: '18 min', tag: '🍔', stock: 'Chef Special', desc: 'Aged wagyu patty, black truffle aioli on brioche.' },
    { id: 'p5', name: 'Ceremonial Matcha Parfait', category: 'Desserts', price: 9.25, rating: 4.7, prep: '8 min', tag: '🍵', stock: 'In Stock', desc: 'Uji matcha mousse, chia pudding, berries.' },
    { id: 'p6', name: 'Crispy Herbed Fingerlings', category: 'Sides', price: 8.00, rating: 4.8, prep: '10 min', tag: '🥔', stock: 'In Stock', desc: 'Sea salt, rosemary, and smoked paprika garlic dip.' },
  ];

  const categories = ['All', 'Meals', 'Bakery', 'Beverages', 'Desserts', 'Sides'];

  const filtered = catalog.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart = (prod: typeof catalog[0]) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === prod.id);
      if (ex) return prev.map((i) => (i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { id: prod.id, name: prod.name, price: prod.price, quantity: 1, tag: prod.tag }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleCheckout = () => {
    setOrderNotice(`Order #FLX-${Math.floor(1000 + Math.random() * 9000)} Placed! Total: $${(cartTotal * 1.08 + 2.99).toFixed(2)}`);
    setCart([]);
    setIsCartOpen(false);
    setTimeout(() => setOrderNotice(null), 5000);
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">Live Ordering • Express Delivery</p>
          </div>
        </div>

        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="relative px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Cart (${cartTotal.toFixed(2)})</span>
          {cartCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Success Banner */}
      {orderNotice && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{orderNotice}</span>
        </div>
      )}

      {/* Main Catalog View */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeCategory === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((prod) => (
            <div key={prod.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <span className="text-2xl p-1.5 bg-slate-50 rounded-lg">{prod.tag}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {prod.stock}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">{prod.name}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{prod.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">${prod.price.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span>{prod.rating}</span>
                    <span>• {prod.prep}</span>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-in Cart Drawer */}
      {isCartOpen && (
        <div className="p-4 bg-white border-t border-slate-200 shadow-lg space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Shopping Cart ({cartCount})</h4>
            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
          </div>

          {cart.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Your cart is currently empty.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{item.tag}</span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"><Minus className="w-3 h-3" /></button>
                    <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"><Plus className="w-3 h-3" /></button>
                    <span className="font-bold text-slate-900 w-14 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-mono">Tax & Express Delivery Included</div>
                <div className="text-sm font-bold text-slate-900">Total: ${(cartTotal * 1.08 + 2.99).toFixed(2)}</div>
              </div>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <span>Checkout Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. BANKING & FINTECH RUNTIME
// =========================================================================
const FinanceRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project, domainMeta, isMobile }) => {
  const [balance, setBalance] = useState(48250.75);
  const [savings, setSavings] = useState(128400.00);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transactions, setTransactions] = useState([
    { id: 'tx-1', desc: 'Stripe Settlement Payout', category: 'Income', amount: +4850.00, date: 'Today, 09:15 AM', type: 'credit' },
    { id: 'tx-2', desc: 'Amazon Web Services PaaS', category: 'Infrastructure', amount: -384.20, date: 'Yesterday', type: 'debit' },
    { id: 'tx-3', desc: 'Direct Client Wire Transfer', category: 'Income', amount: +12000.00, date: 'Sep 10', type: 'credit' },
    { id: 'tx-4', desc: 'GitHub Enterprise Copilot', category: 'Software', amount: -210.00, date: 'Sep 08', type: 'debit' },
  ]);

  const handleSendTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0 || !recipient.trim()) return;

    setBalance((prev) => prev - amt);
    setTransactions([
      {
        id: `tx-${Date.now()}`,
        desc: `Transfer to ${recipient}`,
        category: 'Transfer',
        amount: -amt,
        date: 'Just now',
        type: 'debit',
      },
      ...transactions,
    ]);
    setTransferAmount('');
    setRecipient('');
    setIsTransferModalOpen(false);
  };

  const handleExportCsv = () => {
    const csv = 'Transaction ID,Description,Category,Amount,Date,Type\n' +
      transactions.map(t => `${t.id},"${t.desc}",${t.category},${t.amount},${t.date},${t.type}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">ACID Ledger • Real-time Reconciliation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
            title="Download CSV Statement"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Transfer</span>
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Balances Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Primary Operating Account</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>+14.8% inflow this month • FDIC Insured</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>High-Yield Treasury Reserve</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              ${savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold">
              4.85% APY compounding daily
            </div>
          </div>
        </div>

        {/* Transactions Feed */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Recent Transactions</h3>
            <span className="text-[11px] text-slate-500">{transactions.length} records</span>
          </div>

          <div className="space-y-1.5">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{tx.desc}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.category} • {tx.date}</div>
                  </div>
                </div>

                <div className={`font-mono font-bold text-xs sm:text-sm ${
                  tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {tx.type === 'credit' ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="p-4 bg-white border-t border-slate-200 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Wire / Transfer Funds</h4>
            <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">Cancel</button>
          </div>

          <form onSubmit={handleSendTransfer} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Recipient Name / IBAN / ACH Routing..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount (USD)..."
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              Confirm Wire Transfer
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 3. HEALTHCARE & CLINIC RUNTIME
// =========================================================================
const HealthcareRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project }) => {
  const [patients, setPatients] = useState([
    { id: 'P-101', name: 'Eleanor Vance', age: 48, triage: 'Routine', vitals: { bp: '120/80', hr: 72, spo2: '99%' }, room: '3B', status: 'Admitted' },
    { id: 'P-102', name: 'Marcus Sterling', age: 62, triage: 'Critical', vitals: { bp: '148/95', hr: 104, spo2: '94%' }, room: 'ICU-1', status: 'Observed' },
    { id: 'P-103', name: 'Sophia Chen', age: 29, triage: 'Moderate', vitals: { bp: '115/75', hr: 80, spo2: '98%' }, room: '2A', status: 'Pre-Op' },
  ]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [triageSelect, setTriageSelect] = useState('Routine');

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;
    setPatients([
      {
        id: `P-${Math.floor(104 + Math.random() * 800)}`,
        name: newPatientName.trim(),
        age: 35,
        triage: triageSelect,
        vitals: { bp: '122/82', hr: 76, spo2: '98%' },
        room: `Ward ${Math.floor(1 + Math.random() * 5)}`,
        status: 'Triage Assigned',
      },
      ...patients,
    ]);
    setNewPatientName('');
    setIsBookingOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">HIPAA Compliant • Electronic Health Records</p>
          </div>
        </div>

        <button
          onClick={() => setIsBookingOpen(!isBookingOpen)}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Intake Patient</span>
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Triage Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
            <div className="text-[10px] font-mono text-slate-400">Critical Triage</div>
            <div className="text-base sm:text-lg font-bold text-rose-600 mt-0.5">1 Active</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
            <div className="text-[10px] font-mono text-slate-400">Total Inpatients</div>
            <div className="text-base sm:text-lg font-bold text-slate-800 mt-0.5">{patients.length} Beds</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-center">
            <div className="text-[10px] font-mono text-slate-400">Physicians On-Duty</div>
            <div className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5">8 Specialists</div>
          </div>
        </div>

        {/* Patients EHR Cards */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Inpatient Monitor</div>
          <div className="space-y-2">
            {patients.map((pat) => (
              <div key={pat.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{pat.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({pat.id} • {pat.age}y)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pat.triage === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : pat.triage === 'Moderate'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {pat.triage}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[9px] text-slate-400 font-mono">Blood Pressure</div>
                    <div className="text-xs font-bold text-slate-800 font-mono">{pat.vitals.bp}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[9px] text-slate-400 font-mono">Heart Rate</div>
                    <div className="text-xs font-bold text-emerald-600 font-mono">{pat.vitals.hr} bpm</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[9px] text-slate-400 font-mono">SpO2 Oxygen</div>
                    <div className="text-xs font-bold text-blue-600 font-mono">{pat.vitals.spo2}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <div className="text-[9px] text-slate-400 font-mono">Bed Allocation</div>
                    <div className="text-xs font-bold text-slate-800">{pat.room}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isBookingOpen && (
        <form onSubmit={handleAddPatient} className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Clinical Inpatient Intake</span>
            <button type="button" onClick={() => setIsBookingOpen(false)} className="text-slate-400">Close</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Patient Full Name..."
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <select
              value={triageSelect}
              onChange={(e) => setTriageSelect(e.target.value)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="Routine">Routine</option>
              <option value="Moderate">Moderate</option>
              <option value="Critical">Critical Emergency</option>
            </select>
            <button type="submit" className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg">Intake</button>
          </div>
        </form>
      )}
    </div>
  );
};

// =========================================================================
// 4. FLEET LOGISTICS RUNTIME
// =========================================================================
const LogisticsRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project }) => {
  const [fleet, setFleet] = useState([
    { id: 'FLT-01', truck: 'Volvo FH16 Globetrotter', driver: 'Alex Jensen', cargo: 'Refrigerated Pharma', temp: '3.8°C', fuel: '84%', speed: '62 mph', status: 'In Transit', loc: 'Route I-95 North' },
    { id: 'FLT-02', truck: 'Freightliner Cascadia', driver: 'Dmitri Volkov', cargo: 'Dry Goods Pallets', temp: 'Ambient', fuel: '61%', speed: '55 mph', status: 'In Transit', loc: 'Denver Hub East' },
    { id: 'FLT-03', truck: 'Scania 770S Heavy', driver: 'Elena Rostova', cargo: 'Semiconductor Silicon', temp: '19.2°C', fuel: '92%', speed: '0 mph', status: 'Dock Loading', loc: 'Austin Gateway Terminal' },
  ]);

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">Live GPS Telemetry & Cargo Sensors</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sub-second GPS
        </span>
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-mono text-slate-400">Active Trucks</div>
            <div className="text-base font-bold text-slate-800 mt-0.5">{fleet.length} Units</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-mono text-slate-400">On-Time Delivery</div>
            <div className="text-base font-bold text-emerald-600 mt-0.5">99.4% SLA</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] font-mono text-slate-400">Fleet Fuel Avg</div>
            <div className="text-base font-bold text-blue-600 mt-0.5">79% Fuel</div>
          </div>
        </div>

        <div className="space-y-2">
          {fleet.map((unit) => (
            <div key={unit.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{unit.truck} ({unit.id})</div>
                  <div className="text-[11px] text-slate-500">Driver: {unit.driver} • Cargo: {unit.cargo}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {unit.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-[10px] font-mono">
                <div className="p-1 rounded bg-slate-50">
                  <div className="text-slate-400">Speed</div>
                  <div className="font-bold text-slate-800">{unit.speed}</div>
                </div>
                <div className="p-1 rounded bg-slate-50">
                  <div className="text-slate-400">Sensor Temp</div>
                  <div className="font-bold text-blue-600">{unit.temp}</div>
                </div>
                <div className="p-1 rounded bg-slate-50">
                  <div className="text-slate-400">Fuel Level</div>
                  <div className="font-bold text-emerald-600">{unit.fuel}</div>
                </div>
                <div className="p-1 rounded bg-slate-50">
                  <div className="text-slate-400">Waypoint</div>
                  <div className="font-bold text-slate-800 truncate">{unit.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. SOCIAL & CHAT RUNTIME
// =========================================================================
const ChatRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project }) => {
  const [messages, setMessages] = useState([
    { id: 'm1', user: 'Sarah Lin', avatar: '👩‍💻', text: 'All microservices deployed cleanly to production cluster.', time: '10:42 AM' },
    { id: 'm2', user: 'David Kim', avatar: '👨‍🚀', text: 'Capacitor native Android APK build signed with debug keystore.', time: '10:45 AM' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([
      ...messages,
      {
        id: `m-${Date.now()}`,
        user: 'You',
        avatar: '⚡',
        text: inputText.trim(),
        time: 'Just now',
      },
    ]);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">#general • 14 Members Online</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto flex flex-col justify-end">
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 text-xs">
            <span className="text-xl p-1 bg-white rounded-xl shadow-2xs border border-slate-200">{m.avatar}</span>
            <div className="space-y-0.5 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{m.user}</span>
                <span className="text-[10px] text-slate-400 font-mono">{m.time}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-2xs leading-relaxed">
                {m.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          placeholder="Type a message to the channel..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

// =========================================================================
// 6. AGILE KANBAN RUNTIME
// =========================================================================
const KanbanRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project }) => {
  const [tasks, setTasks] = useState([
    { id: 'T-1', title: 'Implement biometric biometric passkeys', col: 'In Progress', prio: 'High' },
    { id: 'T-2', title: 'Verify offline CRDT sync resolution', col: 'In Progress', prio: 'Urgent' },
    { id: 'T-3', title: 'Automated Play Store release channel', col: 'Completed', prio: 'Medium' },
    { id: 'T-4', title: 'Telemetry WebSocket reconnection loop', col: 'Backlog', prio: 'Medium' },
  ]);
  const [newTitle, setNewTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: `T-${tasks.length + 1}`,
        title: newTitle.trim(),
        col: 'Backlog',
        prio: 'High',
      },
    ]);
    setNewTitle('');
  };

  const moveTask = (id: string, newCol: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, col: newCol } : t)));
  };

  const columns = ['Backlog', 'In Progress', 'Completed'];

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">Agile Sprint Workspace • Kanban Flow</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            placeholder="Create user story or issue..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
          />
          <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Add Task
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.col === col);
            return (
              <div key={col} className="p-3 bg-slate-100 rounded-xl space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>{col}</span>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-600 text-[10px] flex items-center justify-center font-mono">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {colTasks.map((t) => (
                    <div key={t.id} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                      <div className="text-xs font-bold text-slate-800 leading-tight">{t.title}</div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <span className="font-mono text-slate-400">{t.id}</span>
                        <div className="flex gap-1">
                          {col !== 'Completed' && (
                            <button
                              onClick={() => moveTask(t.id, col === 'Backlog' ? 'In Progress' : 'Completed')}
                              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                            >
                              Next →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 7. INVENTORY RUNTIME
// =========================================================================
const InventoryRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project }) => {
  const [items, setItems] = useState([
    { sku: 'SKU-0921', name: 'Alloy Mounting Brackets', qty: 450, bin: 'A-12', reorder: 100, status: 'In Stock' },
    { sku: 'SKU-1842', name: 'Brushless DC Servo Motors', qty: 14, bin: 'B-04', reorder: 50, status: 'Low Stock' },
    { sku: 'SKU-5820', name: 'Thermal Barrier Gaskets', qty: 1200, bin: 'C-08', reorder: 300, status: 'In Stock' },
  ]);

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">Warehouse SKU Inventory • Realtime Bin Tracking</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.sku} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{it.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">SKU: {it.sku} • Bin Location: {it.bin}</div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono text-sm text-slate-900">{it.qty} Units</div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  it.status === 'Low Stock' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {it.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 8. CUSTOM ENTERPRISE DOMAIN RUNTIME
// =========================================================================
const CustomDomainRuntime: React.FC<{ project: Project; domainMeta: any; isMobile: boolean }> = ({ project, domainMeta }) => {
  const [entities, setEntities] = useState([
    { id: 'ENT-001', name: 'Production Telemetry Gateway', metric: '1.2ms', status: 'Healthy', tags: ['Cluster', 'API'] },
    { id: 'ENT-002', name: 'PostgreSQL Relational Storage Pool', metric: '14/50 active', status: 'Optimal', tags: ['Database'] },
    { id: 'ENT-003', name: 'Capacitor Native Hardware Bridge', metric: '60 fps', status: 'Synced', tags: ['Mobile'] },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setEntities([
      ...entities,
      {
        id: `ENT-00${entities.length + 1}`,
        name: inputVal.trim(),
        metric: '0.8ms',
        status: 'Active',
        tags: ['Custom'],
      },
    ]);
    setInputVal('');
  };

  return (
    <div className="flex-1 flex flex-col font-sans bg-slate-50 text-slate-900">
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{project.name}</h2>
            <p className="text-[10px] text-slate-500">{domainMeta.category} • Specialized Architecture</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/70">
          <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-700">{domainMeta.category}</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{project.name}</div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{project.description || domainMeta.description}</p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="Add dynamic entity or record..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
          />
          <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Insert
          </button>
        </form>

        <div className="space-y-1.5">
          {entities.map((ent) => (
            <div key={ent.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{ent.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{ent.id} • Latency: {ent.metric}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {ent.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
