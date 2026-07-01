import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { vegetables, categories as staticCategories } from './data/vegetables';
import Logo from './components/Logo';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import OrderConfirmation from './components/OrderConfirmation';
import AdminDashboard from './components/AdminDashboard';
import WhatsappButton from './components/WhatsappButton';
import BusinessCardModal from './components/BusinessCardModal';
import InstallPrompt from './components/InstallPrompt';
import { generateOrderId, saveNewOrder } from './services/googleSheets';
import { getProducts, saveProducts, getCategories } from './services/crudService';
import {
  ShoppingBag,
  Search,
  Settings,
  Globe,
  ChevronRight,
  Clock,
  TrendingUp,
  Truck,
  ShieldCheck,
  Store,
  Utensils,
  QrCode,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { getOffers } from './services/googleSheets';

const BUSINESS_PHONE = '9626815733';

/* ─── Mobile Bottom Nav ─────────────────────────────────────────── */
function BottomNav({ cart, onOpenCart, onOpenCardModal, toggleLanguage, lang, onAdmin }) {
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Cart Checkout Strip (shows only when cart has items) */}
      {cart.length > 0 && (
        <button
          onClick={onOpenCart}
          className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 py-2.5 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="bg-white/20 rounded-lg px-2 py-0.5 text-xs font-black">{cartCount} items</span>
            <span className="text-sm font-bold">View Cart</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black">₹{cartTotal}</span>
            <ChevronRight size={18} />
          </div>
        </button>
      )}

      {/* Nav Buttons Row */}
      <div className="grid grid-cols-4 h-14">
        {/* Cart Icon Tab */}
        <button onClick={onOpenCart} className="relative flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-emerald-600 transition-colors active:scale-90">
          <div className="relative">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Cart</span>
        </button>

        {/* Language Toggle */}
        <button onClick={toggleLanguage} className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-emerald-600 transition-colors active:scale-90">
          <Globe size={22} />
          <span className="text-[10px] font-semibold">{lang === 'en' ? 'தமிழ்' : 'EN'}</span>
        </button>

        {/* Business Card / QR */}
        <button onClick={onOpenCardModal} className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-emerald-600 transition-colors active:scale-90">
          <QrCode size={22} />
          <span className="text-[10px] font-semibold">QR Card</span>
        </button>

        {/* Admin */}
        <button onClick={onAdmin} className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-emerald-600 transition-colors active:scale-90">
          <Settings size={22} />
          <span className="text-[10px] font-semibold">Admin</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Storefront ────────────────────────────────────────────────── */
function Storefront({ cart, onAddToCart, onUpdateQuantity, onOpenCart, onNavigate, catalog, onOpenCardModal, onUpdateCatalog }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [offerText, setOfferText] = useState('');
  const [categories, setCategories] = useState([{ id: 'all', en: 'All Veggies', ta: 'அனைத்தும்' }]);

  useEffect(() => {
    const offers = getOffers();
    setOfferText(lang === 'en' ? (offers.en || '') : (offers.ta || ''));
  }, [lang]);

  useEffect(() => {
    const loadCats = () => {
      const cats = getCategories();
      setCategories([{ id: 'all', en: 'All Veggies', ta: 'அனைத்தும்', emoji: '🛒' }, ...cats.map(c => ({ id: c.id, en: c.nameEn, ta: c.nameTa }))]);
    };
    loadCats();
    window.addEventListener('tapgo:tapgo_categories_db', loadCats);
    return () => window.removeEventListener('tapgo:tapgo_categories_db', loadCats);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);

  const filteredVegetables = catalog.filter(item => {
    const itemName = lang === 'en' ? item.nameEn : item.nameTa;
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-outfit" style={{ paddingBottom: '110px' }}>

      {/* ── Mobile Header ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Logo className="h-9" />
          <div className="flex items-center gap-2">
            <WhatsappButton phoneNumber={BUSINESS_PHONE} className="hidden sm:flex" />
            <button
              onClick={() => setShowSearch(v => !v)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors active:scale-90"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                id="product-search"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-2 text-slate-400 active:scale-90">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Category Pills */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full shrink-0 transition-all border active:scale-95 ${isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }`}
              >
                {lang === 'en' ? cat.en : cat.ta}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-3 pt-3 space-y-4">

        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-white rounded-2xl p-5 shadow-lg">
          <div className="absolute -top-4 -right-4 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
              <Clock size={10} className="animate-pulse" />
              {t('deliveryTimeVal')}
            </span>
            <h1 className="text-lg font-black leading-tight mb-1">{t('tagline')}</h1>
            <p className="text-xs text-emerald-200/90 font-medium mb-4">{t('subTagline')}</p>
            {offerText && (
              <div className="mb-3 text-sm font-bold bg-white/10 px-3 py-2 rounded-xl inline-block text-emerald-200">
                {offerText}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-emerald-200">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-xl">
                <Truck size={12} className="text-emerald-400 shrink-0" /><span>Next-Day</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-xl">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" /><span>Wholesale</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-xl">
                <TrendingUp size={12} className="text-emerald-400 shrink-0 animate-pulse" /><span>Zero Waste</span>
              </div>
            </div>
          </div>
        </section>

        {/* Business Type Chips */}
        <section className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{t('bulkSourcing')}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Utensils, en: 'Hotels / Restaurants', ta: 'ஹோட்டல்கள் / உணவகம்' },
              { icon: Store, en: 'Grocery Stores', ta: 'மளிகை கடைகள்' },
              { icon: Utensils, en: 'Mess & Canteens', ta: 'மெஸ் & கேன்டீன்' },
              { icon: Store, en: 'Tea Shops & Stalls', ta: 'டீக்கடைகள்' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
                <b.icon size={14} className="text-emerald-600 shrink-0" />
                <span>{lang === 'en' ? b.en : b.ta}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Catalog Header */}
        <div className="flex flex-col gap-3 px-1">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">{t('categoriesLabel')}</h2>
            <span className="text-xs text-slate-400 font-semibold">{filteredVegetables.length} items</span>
          </div>
        </div>

        {/* Product Grid */}
        {filteredVegetables.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-base font-bold text-slate-400 mb-1">No vegetables found</p>
            <p className="text-xs text-slate-300">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredVegetables.map(veg => {
              const cartItem = cart.find(i => i.id === veg.id);
              return (
                <ProductCard
                  key={veg.id}
                  product={veg}
                  cartItem={cartItem}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  onUpdateProduct={(updated) => {
                    const updatedCatalog = catalog.map(c => c.id === updated.id ? { ...c, ...updated } : c);
                    onUpdateCatalog(updatedCatalog);
                  }}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav
        cart={cart}
        onOpenCart={onOpenCart}
        onOpenCardModal={onOpenCardModal}
        toggleLanguage={toggleLanguage}
        lang={lang}
        onAdmin={() => onNavigate('admin')}
      />
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────────────── */
function MainApp() {
  const [currentTab, setCurrentTab] = useState('shop');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Catalog State with LocalStorage sync
  const defaultCatalog = vegetables.map(item => ({
    stock: item.stock ?? 100,
    outOfStock: item.outOfStock ?? false,
    ...item
  }));

  const [catalog, setCatalog] = useState(() => {
    // Use crudService products if available, else seed from static vegetables
    const saved = getProducts();
    if (saved && saved.length > 0) return saved;
    // Seed crudService with static vegetable data on first run
    saveProducts(defaultCatalog);
    return defaultCatalog;
  });

  // Keep catalog in sync with crudService events
  useEffect(() => {
    const handler = () => setCatalog(getProducts());
    window.addEventListener('tapgo:tapgo_catalog_db', handler);
    return () => window.removeEventListener('tapgo:tapgo_catalog_db', handler);
  }, []);

  const handleUpdateCatalog = (newCatalog) => {
    saveProducts(newCatalog);
    setCatalog(newCatalog);
  };

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? {
          ...item,
          quantity: item.quantity + product.minOrder
        } : item);
      }
      return [...prev, { ...product, quantity: product.minOrder }];
    });
  };

  const handleUpdateQuantity = (productId, nextQty) => {
    const productDef = catalog.find(v => v.id === productId);
    const minQty = productDef ? productDef.minOrder : 1;
    if (nextQty < minQty) {
      setCart(prev => prev.filter(i => i.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: nextQty } : i));
    }
  };

  const handleClearCart = () => setCart([]);

  const handleOrderPlaced = async (orderData) => {
    const orderId = generateOrderId();
    const finalizedOrder = {
      ...orderData,
      orderId,
      date: new Date().toLocaleString(),
      status: 'Pending'
    };
    await saveNewOrder(finalizedOrder);
    setCurrentOrder(finalizedOrder);
    setCart([]);
    setIsCartOpen(false);
    setCurrentTab('confirmation');
  };

  return (
    <>
      {currentTab === 'shop' && (
        <Storefront
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigate={setCurrentTab}
          catalog={catalog}
          onOpenCardModal={() => setIsCardModalOpen(true)}
          onUpdateCatalog={handleUpdateCatalog}
        />
      )}

      {currentTab === 'admin' && (
        <AdminDashboard
          onBackToStore={() => setCurrentTab('shop')}
          catalog={catalog}
          onUpdateCatalog={handleUpdateCatalog}
        />
      )}

      {currentTab === 'confirmation' && (
        <OrderConfirmation
          order={currentOrder}
          onBackToStore={() => { setCurrentOrder(null); setCurrentTab('shop'); }}
          supportPhone={BUSINESS_PHONE}
        />
      )}

      {/* Cart Drawer */}
      <Cart
        cartItems={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Business Card Modal */}
      <BusinessCardModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
