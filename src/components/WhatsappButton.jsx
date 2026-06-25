import React from 'react';
import { useLanguage } from './LanguageContext';

export default function WhatsappButton({ phoneNumber = '919626815733', className = '' }) {
  const { lang, t } = useLanguage();
  
  const handleWhatsappClick = () => {
    const text = lang === 'en' 
      ? 'Hi TapGo, I would like to inquire about ordering bulk vegetables.' 
      : 'வணக்கம் TapGo, நான் காய்கறிகள் ஆர்டர் செய்வதைப் பற்றி விசாரிக்க விரும்புகிறேன்.';
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleWhatsappClick}
      aria-label="Contact support on WhatsApp"
      className={`flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold py-2 px-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-300 cursor-pointer ${className}`}
    >
      <svg
        className="w-5 h-5 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.479 2.007 14.02 1.01 11.393 1.01c-5.452 0-9.88 4.379-9.884 9.822 0 1.742.476 3.442 1.391 4.935L1.87 20.274l4.777-1.12zm11.38-5.32c-.3-.149-1.786-.88-2.063-.98-.277-.101-.48-.149-.68.15-.2.3-.779.98-.956 1.18-.178.2-.355.224-.656.075-3.007-1.505-5.071-2.78-7.087-6.242-.3-.519.3-.482.86-1.602.1-.2.05-.375-.025-.524-.075-.15-.68-1.638-.933-2.247-.247-.591-.497-.512-.68-.521-.173-.008-.372-.01-.572-.01-.2 0-.528.075-.804.378-.276.3-.1.979-.1 2.378 0 1.4 1.021 2.75 1.165 2.95.144.2 2.01 3.07 4.871 4.308.68.295 1.21.47 1.62.601.684.217 1.306.186 1.8.113.548-.08 1.786-.73 2.037-1.435.252-.705.252-1.31.178-1.435-.074-.125-.277-.2-.578-.35z" />
      </svg>
      <span className="text-sm font-medium hidden sm:inline-block">{t('whatsappSupport')}</span>
    </button>
  );
}
