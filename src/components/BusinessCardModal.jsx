import React from 'react';
import { useLanguage } from './LanguageContext';
import { X, Printer, Share2, QrCode } from 'lucide-react';

export default function BusinessCardModal({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  
  if (!isOpen) return null;

  // We generate a QR code pointing to the current domain (where the app is hosted)
  // or a fallback to their TapGo website domain so it's ready for production!
  const currentUrl = window.location.origin || 'https://tapgo.in';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 shadow-2xl space-y-6 z-10 animate-scale-up my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <QrCode className="text-emerald-600" size={22} />
            <h3 className="font-extrabold text-lg text-slate-800 font-outfit">
              {lang === 'en' ? 'TapGo Business Card & QR' : 'டாப்கோ பிசினஸ் கார்டு & QR'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
          
          {/* Card Images (Front & Back merged) */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Official Business Card' : 'அதிகாரப்பூர்வ பிசினஸ் கார்டு'}
            </p>
            
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-50 transition-transform duration-300 hover:scale-[1.01]">
              <img 
                src="/business_card.jpg" 
                alt="TapGo Business Card" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* QR Code Sourcing */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/50 shrink-0">
              <img 
                src={qrCodeUrl} 
                alt="Order QR Code" 
                className="w-36 h-36 object-contain"
              />
            </div>
            
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-extrabold text-slate-900 text-base">
                {lang === 'en' ? 'Scan to Order Online' : 'ஆர்டர் செய்ய ஸ்கேன் செய்யவும்'}
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                {lang === 'en' 
                  ? 'Show this QR code to your buyers (Hotels, Tea Shops, Messes). They can scan it with their mobile camera to open TapGo instantly and place orders!'
                  : 'உங்கள் வாடிக்கையாளர்களிடம் (ஹோட்டல், டீக்கடை, மெஸ்) இந்த QR குறியீட்டைக் காட்டுங்கள். அவர்கள் தங்கள் கேமரா மூலம் ஸ்கேன் செய்து உடனடியாக ஆர்டர் செய்யலாம்!'}
              </p>
              
              <div className="pt-2 text-xs font-bold text-emerald-700 font-mono select-all">
                {currentUrl}
              </div>
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="grow flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 transform active:scale-95 shadow-md shadow-emerald-200 cursor-pointer"
          >
            <Printer size={16} />
            <span>{lang === 'en' ? 'Print Card & QR' : 'கார்டு அச்சிடுக'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'மூடு'}
          </button>
        </div>
      </div>
    </div>
  );
}
