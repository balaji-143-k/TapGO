import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

export default function Cart({ 
  cartItems, 
  isOpen, 
  onClose, 
  onUpdateQuantity, 
  onClearCart,
  onOrderPlaced 
}) {
  const { lang, t, tBiz } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('retail');
  const [deliveryNote, setDeliveryNote] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    const savedName = localStorage.getItem('tapgo_customer_name') || '';
    const savedPhone = localStorage.getItem('tapgo_customer_phone') || '';
    const savedBizType = localStorage.getItem('tapgo_customer_biztype') || 'retail';
    
    setName(savedName);
    setPhone(savedPhone);
    setBusinessType(savedBizType);
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = 0; // Free delivery
  const grandTotal = subtotal + deliveryCharge;

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = t('requiredField');
    if (!phone.trim()) {
      newErrors.phone = t('requiredField');
    } else if (!/^\d{10}$/.test(phone.trim())) {
      newErrors.phone = t('invalidPhone');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Save details for next time
    localStorage.setItem('tapgo_customer_name', name.trim());
    localStorage.setItem('tapgo_customer_phone', phone.trim());
    localStorage.setItem('tapgo_customer_biztype', businessType);

    // Format products text list for Sheets
    const productSummary = cartItems.map(item => {
      const pName = lang === 'en' ? item.nameEn : item.nameTa;
      return `${pName} (${item.quantity}${item.unit})`;
    }).join(', ');

    // Prepare order object
    const newOrder = {
      name: name.trim(),
      phone: phone.trim(),
      businessType: businessType,
      product: productSummary,
      quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: grandTotal,
      deliveryNote: deliveryNote.trim(),
      // These will be filled by the parent container calling our order generator
      itemsRaw: cartItems // Keep raw items for rendering success summary
    };

    await onOrderPlaced(newOrder);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-650 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="text-lg font-bold font-outfit">{t('cartTitle')}</h2>
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <ShoppingBag size={48} className="stroke-1 mb-3 text-slate-300" />
              <p className="text-sm font-medium">{t('cartEmpty')}</p>
            </div>
          ) : (
            <>
              {/* Timing Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed font-medium">
                {t('placeOrderInfo')}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-450 uppercase tracking-wider">
                  <span>Selected Vegetables</span>
                  <button 
                    onClick={onClearCart} 
                    className="text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Clear</span>
                  </button>
                </div>
                
                <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
                  {cartItems.map((item) => {
                    const itemName = lang === 'en' ? item.nameEn : item.nameTa;
                    const itemUnit = lang === 'en' ? item.unit : (item.unit === 'kg' ? 'கிலோ' : item.unit === 'kattu' ? 'கட்டு' : item.unit === 'piece' ? 'பீஸ்' : 'பாக்கெட்');
                    
                    return (
                      <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={itemName} 
                            className="w-12 h-12 rounded-xl object-cover bg-slate-150"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{itemName}</h4>
                            <p className="text-xs text-slate-400">₹{item.price} / {itemUnit}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center bg-emerald-50 text-emerald-800 rounded-lg p-1 border border-emerald-100">
                            <button 
                              onClick={() => onUpdateQuantity(item.id, item.quantity - item.minOrder)}
                              className="px-1.5 py-0.5 hover:bg-emerald-100 rounded-md font-bold text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-xs px-2 text-center min-w-8">
                              {item.quantity} {itemUnit}
                            </span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, item.quantity + item.minOrder)}
                              className="px-1.5 py-0.5 hover:bg-emerald-100 rounded-md font-bold text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          
                          <span className="font-bold text-sm text-slate-800 w-16 text-right">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes / Pricing Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 italic">
                {t('quickNote')}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-450">
                  {t('checkoutTitle')}
                </h3>
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5">
                    {t('customerName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('customerNamePl')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5">
                    {t('phone')} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 text-sm font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      placeholder={t('phonePl')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-12 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border ${errors.phone ? 'border-red-500' : 'border-slate-200'} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold tracking-wider`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5">
                    {t('businessType')} *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  >
                    <option value="retail">{tBiz('retail')}</option>
                    <option value="hotel">{tBiz('hotel')}</option>
                    <option value="teashop">{tBiz('teashop')}</option>
                    <option value="mess">{tBiz('mess')}</option>
                    <option value="store">{tBiz('store')}</option>
                    <option value="bulk">{tBiz('bulk')}</option>
                  </select>
                </div>

                {/* Delivery instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5">
                    {t('deliveryNote')}
                  </label>
                  <textarea
                    placeholder={t('deliveryNotePl')}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    rows="2"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer Billing Area */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            {/* Bill Summary */}
            <div className="space-y-2 mb-4 text-sm font-medium text-slate-600">
              <div className="flex justify-between">
                <span>{t('total')}</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>{t('deliveryTime')}</span>
                <span className="text-emerald-650 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  {t('deliveryTimeVal')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('deliveryCharge')}</span>
                <span className="text-emerald-600 font-bold">{t('free')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-800 pt-2 border-t border-dashed border-slate-250">
                <span>{t('grandTotal')}</span>
                <span className="text-emerald-700">₹{grandTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 transform active:scale-95 shadow-md shadow-emerald-250 cursor-pointer"
            >
              <span>{isSubmitting ? t('loading') : t('placeOrderSheetBtn')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
