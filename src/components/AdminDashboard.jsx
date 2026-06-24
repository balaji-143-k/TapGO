import React, { useState, useEffect } from 'react';
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  getGoogleSheetsUrl, 
  setGoogleSheetsUrl,
  verifyAdminPassword,
  updateAdminPassword
} from '../services/googleSheets';
import { useLanguage } from './LanguageContext';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Database, 
  ChevronRight, 
  LogOut, 
  Lock, 
  Phone, 
  MessageSquare, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  Eye,
  Settings,
  ShieldAlert,
  ArrowLeft,
  Edit,
  Layers,
  Save,
  Check,
  X,
  RotateCcw,
  Image as ImageIcon,
  TrendingDown,
  Upload
} from 'lucide-react';
import Logo from './Logo';

export default function AdminDashboard({ onBackToStore, catalog, onUpdateCatalog }) {
  const { lang, t, tBiz } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard navigation subtab: 'orders' or 'inventory'
  const [activeSubTab, setActiveSubTab] = useState('orders');

  // Settings & DB State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  
  // Filter states (Orders)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessFilter, setBusinessFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Filter states (Inventory)
  const [vegSearch, setVegSearch] = useState('');
  const [vegCategoryFilter, setVegCategoryFilter] = useState('all');
  
  // Inline editing states for inventory
  const [editingRowId, setEditingRowId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMarketPrice, setEditMarketPrice] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameTa, setEditNameTa] = useState('');

  const [statusMessage, setStatusMessage] = useState('');

  // Load configuration on mount
  useEffect(() => {
    setSheetsUrl(getGoogleSheetsUrl());
    const adminSession = sessionStorage.getItem('tapgo_admin_auth');
    if (adminSession === 'true') {
      setIsAuthenticated(true);
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyAdminPassword(password)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('tapgo_admin_auth', 'true');
      setLoginError('');
      setPassword('');
    } else {
      setLoginError(t('invalidPassword'));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tapgo_admin_auth');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusMessage('Updating status...');
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      await loadOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      setStatusMessage('Order status updated successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } else {
      setStatusMessage('Update failed.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setGoogleSheetsUrl(sheetsUrl);
    
    if (newPassword.trim()) {
      const pSuccess = updateAdminPassword(newPassword);
      if (pSuccess) {
        setPasswordMessage('Settings and Password updated!');
        setNewPassword('');
      } else {
        setPasswordMessage('Failed to update password.');
      }
    } else {
      setPasswordMessage('Google Sheets Sync URL updated!');
    }
    
    loadOrders(); 
    setTimeout(() => setPasswordMessage(''), 4000);
  };

  // Inventory Sourcing updates
  const startEditing = (veg) => {
    setEditingRowId(veg.id);
    setEditPrice(veg.price);
    setEditMarketPrice(veg.marketPrice || veg.price);
    setEditPhoto(veg.image);
    setEditNameEn(veg.nameEn);
    setEditNameTa(veg.nameTa);
  };

  const cancelEditing = () => {
    setEditingRowId(null);
  };

  const parseSaveValue = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const saveProductRow = (id) => {
    const updated = catalog.map(item => {
      if (item.id === id) {
        return {
          ...item,
          price: parseSaveValue(editPrice, item.price),
          marketPrice: parseSaveValue(editMarketPrice, item.marketPrice || item.price),
          image: editPhoto.trim() || item.image,
          nameEn: editNameEn.trim() || item.nameEn,
          nameTa: editNameTa.trim() || item.nameTa
        };
      }
      return item;
    });
    
    onUpdateCatalog(updated);
    setEditingRowId(null);
    setStatusMessage('Item rates and details updated!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const toggleStockStatus = (id, currentOutOfStock) => {
    const updated = catalog.map(item => {
      if (item.id === id) {
        return {
          ...item,
          outOfStock: !currentOutOfStock
        };
      }
      return item;
    });
    onUpdateCatalog(updated);
    setStatusMessage('Vegetable stock status updated!');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const resetToDefaultCatalog = () => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to reset all rates and photos to default values?' : 'அனைத்து காய்கறி விலைகளையும் பழையபடி மாற்ற வேண்டுமா?')) {
      localStorage.removeItem('tapgo_catalog_db');
      window.location.reload();
    }
  };

  // Filter Orders Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesBusiness = businessFilter === 'all' || order.businessType === businessFilter;

    return matchesSearch && matchesStatus && matchesBusiness;
  });

  // Filter Inventory Vegetables Logic
  const filteredVegetables = catalog.filter(veg => {
    const name = lang === 'en' ? veg.nameEn : veg.nameTa;
    const matchesSearch = name.toLowerCase().includes(vegSearch.toLowerCase());
    const matchesCategory = vegCategoryFilter === 'all' || veg.category === vegCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Analytics Metrics
  const totalSales = orders
    .filter(o => o.status.toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  
  const pendingOrders = orders.filter(o => o.status.toLowerCase() === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 font-outfit text-slate-800 pb-12">
      {/* Admin Navbar */}
      <nav className="glass-nav sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo className="h-9" />
              <span className="ml-2.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-outfit">
                Merchant Slot
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all border cursor-pointer ${
                  showSettings 
                    ? 'bg-slate-100 border-slate-200 text-slate-700' 
                    : 'border-transparent text-slate-500 hover:bg-slate-50'
                }`}
                title="System Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={loadOrders}
                className="p-2 text-slate-500 hover:bg-slate-50 border border-transparent rounded-xl transition-all cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onBackToStore}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all cursor-pointer"
                title="Return to Main Store"
              >
                <ArrowLeft size={16} />
                <span>{t('backToStore')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-bold transition-all cursor-pointer"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Status Alerts / Updates Toast */}
        {statusMessage && (
          <div className="mb-4 bg-emerald-600 text-white rounded-xl p-3 text-center text-sm font-bold shadow-md animate-fade-in">
            {statusMessage}
          </div>
        )}

        {/* Configuration settings overlay */}
        {showSettings && (
          <div className="mb-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} className="text-emerald-600" />
                <span>Sourcing System Settings</span>
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Google Sheets Web App URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">
                    Orders will sync to your Sheet. If left empty, TapGo will save data locally in this browser.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Change Merchant Admin Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave empty to keep current password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-emerald-600 font-bold">{passwordMessage}</span>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Sales</p>
              <h4 className="text-lg md:text-xl font-extrabold text-slate-800">₹{totalSales}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Orders</p>
              <h4 className="text-lg md:text-xl font-extrabold text-slate-800">{orders.length}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Pending Orders</p>
              <h4 className="text-lg md:text-xl font-extrabold text-slate-800">{pendingOrders}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getGoogleSheetsUrl() ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-500'}`}>
              <Database size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Database Sync</p>
              <span className={`text-xs font-extrabold ${getGoogleSheetsUrl() ? 'text-emerald-700' : 'text-rose-600'}`}>
                {getGoogleSheetsUrl() ? 'Google Sheets' : 'Local Storage'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher for Orders vs Rates */}
        <div className="flex border-b border-slate-200 mb-6 bg-white p-1 rounded-2xl border shadow-sm">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-outfit ${
              activeSubTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Orders Log ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-outfit ${
              activeSubTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={18} />
            <span>Rates & Stock Manager ({catalog.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders Log */}
        {activeSubTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative grow max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by customer name, phone or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="purchased">Purchased</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Business</span>
                    <select
                      value={businessFilter}
                      onChange={(e) => setBusinessFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <option value="all">All Businesses</option>
                      <option value="retail">Retail Customers</option>
                      <option value="hotel">Hotels</option>
                      <option value="teashop">Tea Shops</option>
                      <option value="mess">Messes</option>
                      <option value="store">Provision Stores</option>
                      <option value="bulk">Bulk Buyers</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                  <RefreshCw className="animate-spin text-emerald-700" size={32} />
                  <p className="text-sm font-semibold">{t('loading')}</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <p className="text-base font-bold mb-1">{t('noOrders')}</p>
                  <p className="text-xs text-slate-400">No matches found for active filters.</p>
                </div>
              ) : (
                <>
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Type</th>
                          <th className="p-4 w-72">Vegetables Ordered</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredOrders.map((order) => (
                          <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-800">{order.orderId}</td>
                            <td className="p-4 text-slate-500 text-xs">{order.date}</td>
                            <td className="p-4 font-bold text-slate-800">{order.name}</td>
                            <td className="p-4 font-mono">
                              <a href={`tel:${order.phone}`} className="hover:text-emerald-600 flex items-center gap-1">
                                <Phone size={12} className="text-slate-400" />
                                <span>{order.phone}</span>
                              </a>
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-600">
                              {tBiz(order.businessType)}
                            </td>
                            <td className="p-4">
                              <p className="text-slate-600 text-xs font-semibold line-clamp-2 leading-relaxed" title={order.product}>
                                {order.product}
                              </p>
                            </td>
                            <td className="p-4 font-extrabold text-slate-800">₹{order.totalAmount}</td>
                            <td className="p-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                className={`px-2.5 py-1 rounded-md text-xs font-bold border focus:outline-none cursor-pointer ${
                                  order.status.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  order.status.toLowerCase() === 'purchased' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  order.status.toLowerCase() === 'confirmed' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Purchased">Purchased</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <a
                                  href={`https://wa.me/91${order.phone}?text=Hi%20${encodeURIComponent(order.name)},%20this%20is%20TapGo%20regarding%20your%20vegetable%20order%2520${order.orderId}.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-[#25D366] hover:bg-emerald-50 rounded-lg cursor-pointer"
                                  title="WhatsApp Customer"
                                >
                                  <MessageSquare size={16} />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Order List */}
                  <div className="block lg:hidden divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <div key={order.orderId} className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{order.name}</h4>
                            <p className="text-[10px] text-slate-400">{order.date}</p>
                          </div>
                          <span className="font-extrabold text-sm text-slate-800">₹{order.totalAmount}</span>
                        </div>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg font-semibold">{order.product}</p>
                        <div className="flex justify-between items-center pt-1.5">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="px-2 py-1 rounded border text-xs font-bold bg-white cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Purchased">Purchased</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          <div className="flex gap-2">
                            <a href={`tel:${order.phone}`} className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                              <Phone size={14} />
                            </a>
                            <button onClick={() => setSelectedOrder(order)} className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Rates & Stock Manager (Merchant Slot) */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Inventory Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex grow max-w-md gap-2">
                <div className="relative grow">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search vegetables by name..."
                    value={vegSearch}
                    onChange={(e) => setVegSearch(e.target.value)}
                    className="pl-9 w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                
                <select
                  value={vegCategoryFilter}
                  onChange={(e) => setVegCategoryFilter(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">All categories</option>
                  <option value="daily">Daily Veggies</option>
                  <option value="greens">Greens</option>
                  <option value="herbs">Herbs</option>
                  <option value="exotic">Exotic</option>
                </select>
              </div>

            </div>

            {/* Sourcing Editor Layout */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Vegetable</th>
                      <th className="p-4">Names (EN / தமிழ்)</th>
                      <th className="p-4 text-center">Category</th>
                      <th className="p-4 w-44">Market Rate (₹)</th>
                      <th className="p-4 w-44">TapGo Rate (₹)</th>
                      <th className="p-4 w-40 text-center">Stock Status</th>
                      <th className="p-4">Daily Image URL</th>
                      <th className="p-4 text-center">Save</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredVegetables.map((veg) => {
                      const isEditing = editingRowId === veg.id;
                      const displayUnit = lang === 'en' ? veg.unit : (veg.unit === 'kg' ? 'கிலோ' : veg.unit === 'kattu' ? 'கட்டு' : veg.unit === 'piece' ? 'பீஸ்' : 'பாக்கெட்');
                      
                      return (
                        <tr key={veg.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Image */}
                          <td className="p-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                              <img src={isEditing ? editPhoto : veg.image} alt={veg.nameEn} className="w-full h-full object-cover" />
                            </div>
                          </td>

                          {/* Names */}
                          <td className="p-4">
                            {isEditing ? (
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={editNameEn}
                                  onChange={(e) => setEditNameEn(e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-50 rounded border border-slate-200 text-xs font-bold"
                                  placeholder="English Name"
                                />
                                <input
                                  type="text"
                                  value={editNameTa}
                                  onChange={(e) => setEditNameTa(e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-emerald-800"
                                  placeholder="தமிழ் பெயர்"
                                />
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-bold text-slate-800">{veg.nameEn}</h4>
                                <h4 className="text-xs font-bold text-emerald-700">{veg.nameTa}</h4>
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td className="p-4 text-center">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                              {veg.category}
                            </span>
                          </td>

                          {/* Editable Market Price */}
                          <td className="p-4">
                            {isEditing ? (
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                <input
                                  type="number"
                                  value={editMarketPrice}
                                  onChange={(e) => setEditMarketPrice(e.target.value)}
                                  className="pl-6 w-full px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold focus:outline-emerald-500 focus:bg-white"
                                  placeholder="Market Price"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-slate-400 text-xs line-through">₹{veg.marketPrice || veg.price}</span>
                                <span className="text-[10px] text-slate-400">/ {displayUnit}</span>
                              </div>
                            )}
                          </td>

                          {/* Editable TapGo Price */}
                          <td className="p-4">
                            {isEditing ? (
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                <input
                                  type="number"
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="pl-6 w-full px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold focus:outline-emerald-500 focus:bg-white"
                                  placeholder="TapGo Price"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-black text-emerald-700 text-sm">₹{veg.price}</span>
                                <span className="text-xs text-slate-500">/ {displayUnit}</span>
                              </div>
                            )}
                          </td>

                          {/* Stock Toggle Switch */}
                          <td className="p-4">
                            <button
                              onClick={() => toggleStockStatus(veg.id, veg.outOfStock)}
                              className={`w-full py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                                veg.outOfStock
                                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {veg.outOfStock 
                                ? (lang === 'en' ? 'OUT OF STOCK' : 'கையிருப்பு இல்லை') 
                                : (lang === 'en' ? 'IN STOCK' : 'சரக்கு உள்ளது')}
                            </button>
                          </td>

                          {/* Daily Photo - Upload or URL */}
                          <td className="p-4">
                            {isEditing ? (
                              <div className="space-y-1.5 min-w-40">
                                {/* File Upload Button */}
                                <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all">
                                  <Upload size={12} />
                                  <span>Upload Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = (ev) => setEditPhoto(ev.target.result);
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </label>
                                {/* Or paste URL */}
                                <input
                                  type="text"
                                  value={editPhoto}
                                  onChange={(e) => setEditPhoto(e.target.value)}
                                  className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white font-mono"
                                  placeholder="...or paste image URL"
                                />
                                <button
                                  onClick={() => saveProductRow(veg.id)}
                                  className="w-full mt-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold"
                                  title="Save image and row changes"
                                >
                                  Save Daily Image URL
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <img src={veg.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                                <span className="text-[10px] text-slate-400 truncate max-w-20 font-mono" title={veg.image}>
                                  {veg.image.startsWith('data:') ? '[Uploaded]' : veg.image.split('/').pop()}
                                </span>
                              </div>
                            )}

                          </td>

                          {/* Save Actions */}
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <div className="flex flex-col items-center justify-center gap-2">
                                <button
                                  onClick={() => saveProductRow(veg.id)}
                                  className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all"
                                  title="Save Changes"
                                >
                                  <span className="inline-flex items-center justify-center gap-1">
                                    <Check size={14} />
                                    Save Row
                                  </span>
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                                  title="Cancel Edit"
                                >
                                  <span className="inline-flex items-center justify-center gap-1">
                                    <X size={14} />
                                    Cancel
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditing(veg)}
                                className="p-2 bg-slate-100 hover:bg-emerald-50/40 hover:text-emerald-700 text-slate-600 rounded-xl cursor-pointer transition-all mx-auto block border border-slate-200/50"
                                title="Edit Rates / Details"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl space-y-5 z-10 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800">
                Order Detail Summary
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-3 gap-y-2 text-slate-600 font-medium">
                <div className="text-slate-400 font-semibold">Order ID</div>
                <div className="col-span-2 text-right font-extrabold text-slate-800">{selectedOrder.orderId}</div>

                <div className="text-slate-400 font-semibold">Date / Time</div>
                <div className="col-span-2 text-right text-slate-900 font-semibold">{selectedOrder.date}</div>

                <div className="text-slate-400 font-semibold">Name / Business</div>
                <div className="col-span-2 text-right font-bold text-slate-800">{selectedOrder.name}</div>

                <div className="text-slate-400 font-semibold">Phone Number</div>
                <div className="col-span-2 text-right text-slate-800 font-semibold font-mono">
                  <a href={`tel:${selectedOrder.phone}`} className="hover:underline">+91 {selectedOrder.phone}</a>
                </div>

                <div className="text-slate-400 font-semibold">Business Category</div>
                <div className="col-span-2 text-right text-slate-900 font-semibold">
                  {tBiz(selectedOrder.businessType)}
                </div>

                <div className="text-slate-400 font-semibold">Instructions</div>
                <div className="col-span-2 text-right text-slate-600 italic">
                  {selectedOrder.deliveryNote || 'None'}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Vegetable Breakdown
                </span>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 space-y-1 text-xs text-slate-700 font-semibold max-h-40 overflow-y-auto">
                  {selectedOrder.product.split(', ').map((itemText, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1">
                      <span>{itemText}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center font-extrabold text-lg text-slate-800 pt-3 border-t border-slate-150">
                <span>Total Amount Paid</span>
                <span className="text-emerald-700 text-xl">₹{selectedOrder.totalAmount}</span>
              </div>

              {/* Edit Status */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Update Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Pending', 'Confirmed', 'Purchased', 'Delivered'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => handleStatusChange(selectedOrder.orderId, statusOption)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedOrder.status === statusOption
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-655 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3.5 pt-3 border-t border-slate-100">
              <a
                href={`https://wa.me/91${selectedOrder.phone}?text=Hi%20${encodeURIComponent(selectedOrder.name)},%20this%20is%20TapGo%20regarding%20your%20vegetable%20order%2520${selectedOrder.orderId}.`}
                target="_blank"
                rel="noreferrer"
                className="grow flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>WhatsApp Customer</span>
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
