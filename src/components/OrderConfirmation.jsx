import React, { useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { CheckCircle2, MessageSquare, ArrowLeft, Star, RefreshCw } from 'lucide-react';

export default function OrderConfirmation({ order, onBackToStore, supportPhone = '919626815733' }) {
  const { lang, t, tBiz } = useLanguage();
  
  if (!order) return null;

  // Calculate Sourcing Savings
  const rawItems = order.itemsRaw || [];
  const totalSavings = rawItems.reduce((sum, item) => {
    const itemMarketPrice = item.marketPrice || item.price;
    const itemSaved = (itemMarketPrice - item.price) * item.quantity;
    return sum + itemSaved;
  }, 0);

  const buildMerchantMessage = () => {
    const itemsText = rawItems.map(item => {
      const pName = item.nameEn;
      const pUnit = item.unit;
      return `• ${pName}: ${item.quantity}${pUnit} @ ₹${item.price}/${pUnit} = ₹${item.price * item.quantity}`;
    }).join('\n');

    const businessTypeLabel = tBiz(order.businessType);

    return `🟢 *NEW ORDER - TapGo* 🟢
━━━━━━━━━━━━━━━━━━━━━
*Order ID:* ${order.orderId}
*Date & Time:* ${order.date}

👤 *Customer Details:*
*Name:* ${order.name}
*Phone:* +91 ${order.phone}
*Type:* ${businessTypeLabel}

🥦 *Items to Source:*
${itemsText}

💰 *Total Amount:* ₹${order.totalAmount}
${totalSavings > 0 ? `💚 *Market Savings:* ₹${totalSavings}\n` : ''}🚚 *Delivery:* ${t('deliveryTimeVal')}
${order.deliveryNote ? `\n📝 *Note:* ${order.deliveryNote}` : ''}
━━━━━━━━━━━━━━━━━━━━━
_Please confirm this order ASAP!_`;
  };

  // Auto-notify merchant on WhatsApp when order is placed
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const timer = setTimeout(() => {
      const url = `https://wa.me/${supportPhone}?text=${encodeURIComponent(buildMerchantMessage())}`;
      window.open(url, '_blank');
    }, 800);
    return () => clearTimeout(timer);
  // Only run once when component mounts with the order
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WhatsApp Share - customer can resend to merchant
  const handleShareWhatsapp = () => {
    const url = `https://wa.me/${supportPhone}?text=${encodeURIComponent(buildMerchantMessage())}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-4 animate-fade-in text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75 duration-1000"></div>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 relative" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-outfit">
            {t('successTitle')}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal font-semibold">
            {t('successSubtitle')}
          </p>
        </div>

        {/* Savings Celebration Box */}
        {totalSavings > 0 && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-3.5 text-slate-800 text-xs font-bold flex items-center justify-between text-left shadow-sm">
            <div>
              <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block mb-0.5">💰 Sourcing Savings</span>
              <span className="text-slate-500 font-medium">You saved compared to market:</span>
            </div>
            <span className="text-base font-black text-emerald-700 bg-white border border-emerald-100 py-1 px-3 rounded-xl shadow-sm">
              ₹{totalSavings}
            </span>
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 text-xs space-y-3 font-outfit font-medium">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] text-slate-400 font-black uppercase tracking-wider">
            <span>Order Summary</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
              {t('pending')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-y-2.5 text-slate-600 font-semibold">
            <div className="text-slate-400 font-bold">{t('orderId')}</div>
            <div className="col-span-2 text-right font-black text-slate-900">{order.orderId}</div>
            
            <div className="text-slate-400 font-bold">{t('date')}</div>
            <div className="col-span-2 text-right text-slate-700 text-[10px]">{order.date}</div>

            <div className="text-slate-400 font-bold">{t('customerName')}</div>
            <div className="col-span-2 text-right text-slate-800">{order.name}</div>

            <div className="text-slate-400 font-bold">{t('phone')}</div>
            <div className="col-span-2 text-right text-slate-800 font-mono">+91 {order.phone}</div>

            <div className="text-slate-400 font-bold">{t('businessType')}</div>
            <div className="col-span-2 text-right text-slate-800">{tBiz(order.businessType)}</div>
            
            <div className="text-slate-400 font-bold">{t('deliveryTime')}</div>
            <div className="col-span-2 text-right text-emerald-700 font-extrabold">{t('deliveryTimeVal')}</div>

            {order.deliveryNote && (
              <>
                <div className="text-slate-400 font-bold">Instructions</div>
                <div className="col-span-2 text-right text-slate-500 italic text-[11px] font-medium">"{order.deliveryNote}"</div>
              </>
            )}
          </div>

          {/* Ordered items breakdown */}
          <div className="border-t border-slate-200 pt-3 mt-1.5 space-y-2">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Sourced List</span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {rawItems.map((item, idx) => {
                const itemName = lang === 'en' ? item.nameEn : item.nameTa;
                const itemUnit = lang === 'en' ? item.unit : (item.unit === 'kg' ? 'கிலோ' : item.unit === 'kattu' ? 'கட்டு' : item.unit === 'piece' ? 'பீஸ்' : 'பாக்கெட்');
                return (
                  <div key={idx} className="flex justify-between items-center text-[11px] text-slate-700 font-medium">
                    <span className="line-clamp-1">{itemName} x {item.quantity} {itemUnit}</span>
                    <span className="font-bold text-slate-800">₹{item.price * item.quantity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center font-black text-sm text-slate-900">
            <span>{t('grandTotal')}</span>
            <span className="text-emerald-700 text-base">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Attractive notes to purchase again */}
        <div className="bg-linear-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-black text-xs uppercase tracking-wider">
            <Star size={12} className="fill-emerald-500 text-emerald-500" />
            <span>{lang === 'en' ? 'Thank You for Ordering!' : 'ஆர்டர் செய்தமைக்கு நன்றி!'}</span>
            <Star size={12} className="fill-emerald-500 text-emerald-500" />
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed text-center font-medium">
            {t('congratsNotes')}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 font-bold mt-1">
            <RefreshCw size={10} />
            <span>{lang === 'en' ? 'Order again tomorrow for fresh next-day delivery!' : 'நாளை மறுபடியும் ஆர்டர் செய்யுங்கள்!'}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* WhatsApp Share Button */}
          <button
            onClick={handleShareWhatsapp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 transform active:scale-95 shadow-md shadow-emerald-200 cursor-pointer font-outfit text-sm"
          >
            <MessageSquare size={18} />
            <span>{t('whatsappBtnText')}</span>
          </button>

          {/* Back to Shop */}
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 transform active:scale-95 cursor-pointer font-outfit text-xs"
          >
            <ArrowLeft size={16} />
            <span>{t('backToStore')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
