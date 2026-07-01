import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const translations = {
  en: {
    appName: 'TapGo',
    tagline: 'Order Veggies Today, Get Them Fresh Tomorrow!',
    subTagline: '⏰ Order anytime! We buy fresh from the market and deliver directly to you tomorrow.',
    bulkSourcing: 'We Supply Fresh Vegetables To:',
    searchPlaceholder: 'Search fresh vegetables...',
    placeOrderInfo: '⏰ Order anytime today. Sourced fresh from the market and delivered to you tomorrow at your chosen time!',
    categoriesLabel: 'Vegetable Catalog',
    addToCart: 'Add',
    added: 'Added',
    cartTitle: 'My Cart',
    cartEmpty: 'Your cart is empty',
    items: 'items',
    item: 'item',
    total: 'Total',
    deliveryTime: 'Delivery Time',
    deliveryTimeVal: 'Tomorrow',
    deliveryCharge: 'Delivery Charge',
    free: 'FREE',
    grandTotal: 'Grand Total',
    checkoutTitle: 'Delivery details',
    customerName: 'Your Name / Shop Name',
    customerNamePl: 'Enter your name or shop name',
    phone: 'WhatsApp Mobile Number',
    phonePl: '10-digit mobile number',
    businessType: 'Business Type',
    businessTypePl: 'Select your business type',
    deliveryNote: 'Delivery Instructions (Optional)',
    deliveryNotePl: 'e.g., Leave near the front door or call on arrival',
    placeOrderBtn: 'Place Order via WhatsApp',
    placeOrderSheetBtn: 'Confirm Sourcing Order',
    requiredField: 'This field is required',
    invalidPhone: 'Please enter a valid 10-digit number',
    successTitle: 'Order Placed Successfully! 🎉',
    successSubtitle: 'Thank you for buying vegetables with TapGo! We source fresh at 4 AM and deliver tomorrow morning.',
    orderId: 'Order ID',
    status: 'Status',
    date: 'Order Date',
    whatsappBtnText: 'Send Confirmation to Balaji (WhatsApp)',
    adminLogin: 'Admin Login',
    adminPassword: 'Password',
    adminEnterPassword: 'Enter Admin Password',
    loginBtn: 'Login',
    invalidPassword: 'Incorrect Password. Please try again.',
    adminTitle: 'TapGo Admin Dashboard',
    searchOrders: 'Search by customer name or phone...',
    filterStatus: 'All Statuses',
    backToStore: 'Back to Shop',
    logout: 'Logout',
    pending: 'Pending',
    confirmed: 'Confirmed',
    purchased: 'Purchased',
    delivered: 'Delivered',
    orderTotal: 'Order Total',
    phoneLabel: 'Phone',
    noOrders: 'No orders found.',
    loading: 'Loading...',
    statusUpdated: 'Status updated successfully!',
    whatsappSupport: 'Chat with Balaji',
    marketPriceLabel: 'Market Price',
    appPriceLabel: 'TapGo Price',
    savingsLabel: 'You Save',
    congratsNotes: 'Thanks for purchasing fresh vegetables! Order daily to get the best market rates delivered to your doorstep. TapGo guarantees maximum freshness and wholesale savings!',
    businessTypes: {
      retail: 'Retail Customer / சில்லறை',
      hotel: 'Hotel & Restaurant / ஹோட்டல்',
      teashop: 'Tea Stall / டீக்கடை',
      mess: 'Mess & Canteen / மெஸ்',
      store: 'Grocery Store / மளிகை கடை',
      bulk: 'Bulk Buyer / மொத்த கொள்முதல்'
    },
    quickNote: 'Note: Market rates fluctuate daily. TapGo guarantees the lowest wholesale rate at the time of purchase!',
    deliveryTimingLabel: 'Preferred Delivery Timing',
    timeSlots: {
      morning: 'Morning (6 AM - 9 AM)',
      lateMorning: 'Late Morning (9 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 3 PM)',
      evening: 'Evening (3 PM - 6 PM)'
    }
  },
  ta: {
    appName: 'TapGo',
    tagline: 'இன்று காய்கறி ஆர்டர் செய்யுங்கள், நாளை புதியதாக பெறுங்கள்!',
    subTagline: '⏰ எப்போது வேண்டுமானாலும் ஆர்டர் செய்யுங்கள்! மார்க்கெட்டில் இருந்து ஃபிரெஷ்ஷாக வாங்கி நேரடியாக உங்கள் கடைக்கு டெலிவரி செய்கிறோம்!',
    bulkSourcing: 'நாங்கள் காய்கறி சப்ளை செய்யும் இடங்கள்:',
    searchPlaceholder: 'காய்கறிகளைத் தேடுங்கள்...',
    placeOrderInfo: '⏰ எப்போது வேண்டுமானாலும் ஆர்டர் செய்யுங்கள். நாளை மார்க்கெட்டில் இருந்து புதியதாக வாங்கி நீங்கள் விரும்பும் நேரத்தில் டெலிவரி செய்கிறோம்!',
    categoriesLabel: 'காய்கறி பட்டியல்',
    addToCart: 'சேர்க்க',
    added: 'சேர்க்கப்பட்டது',
    cartTitle: 'எனது கார்ட்',
    cartEmpty: 'உங்கள் கார்ட் காலியாக உள்ளது',
    items: 'பொருட்கள்',
    item: 'பொருள்',
    total: 'மொத்தம்',
    deliveryTime: 'டெலிவரி நேரம்',
    deliveryTimeVal: 'நாளை',
    deliveryCharge: 'டெலிவரி கட்டணம்',
    free: 'இலவசம்',
    grandTotal: 'மொத்த தொகை',
    checkoutTitle: 'டெலிவரி விவரங்கள்',
    customerName: 'உங்கள் பெயர் / கடையின் பெயர்',
    customerNamePl: 'உங்கள் பெயர் அல்லது கடையின் பெயரை உள்ளிடவும்',
    phone: 'வாட்ஸ்அப் மொபைல் எண்',
    phonePl: '10-இலக்க மொபைல் எண்',
    businessType: 'வணிக வகை',
    businessTypePl: 'உங்கள் வணிக வகையைத் தேர்ந்தெடுக்கவும்',
    deliveryNote: 'டெலிவரி வழிமுறைகள் (விருப்பத்தேர்வு)',
    deliveryNotePl: 'எ.கா., வாசலில் வைக்கவும் அல்லது வந்ததும் போன் செய்யவும்',
    placeOrderBtn: 'வாட்ஸ்அப் மூலம் ஆர்டர் செய்',
    placeOrderSheetBtn: 'ஆர்டரை உறுதிசெய்',
    requiredField: 'இந்த விவரம் தேவை',
    invalidPhone: 'சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்',
    successTitle: 'ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது! 🎉',
    successSubtitle: 'டாப்கோவில் புதிய காய்கறிகள் வாங்கியதற்கு நன்றி! அதிகாலை 4 மணிக்கு வாங்கி நாளை காலை டெலிவரி செய்வோம்.',
    orderId: 'ஆர்டர் ஐடி',
    status: 'நிலை',
    date: 'ஆர்டர் தேதி',
    whatsappBtnText: 'பாலாஜிக்கு ஆர்டர் அனுப்பவும் (WhatsApp)',
    adminLogin: 'அட்மின் உள்நுழைவு',
    adminPassword: 'கடவுச்சொல்',
    adminEnterPassword: 'அட்மின் கடவுச்சொல்லை உள்ளிடவும்',
    loginBtn: 'உள்நுழை',
    invalidPassword: 'தவறான கடவுச்சொல். மீண்டும் முயல்க.',
    adminTitle: 'TapGo அட்மின் டேஷ்போர்டு',
    searchOrders: 'வாடிக்கையாளர் பெயர் அல்லது எண்ணை தேடுங்கள்...',
    filterStatus: 'அனைத்து நிலைகளும்',
    backToStore: 'கடைக்குச் செல்ல',
    logout: 'வெளியேறு',
    pending: 'காத்திருக்கிறது',
    confirmed: 'உறுதி செய்யப்பட்டது',
    purchased: 'வாங்கப்பட்டது',
    delivered: 'டெலிவரி செய்யப்பட்டது',
    orderTotal: 'ஆர்டர் மொத்தம்',
    phoneLabel: 'தொலைபேசி',
    noOrders: 'ஆர்டர்கள் எதுவும் இல்லை.',
    loading: 'ஏற்றப்படுகிறது...',
    statusUpdated: 'நிலை வெற்றிகரமாக மாற்றப்பட்டது!',
    whatsappSupport: 'பாலாஜியுடன் பேச',
    marketPriceLabel: 'சந்தை விலை',
    appPriceLabel: 'டாப்கோ விலை',
    savingsLabel: 'உங்கள் லாபம்',
    congratsNotes: 'புதிய காய்கறிகளை வாங்கியதற்கு நன்றி! தினசரி சிறந்த சந்தை விலையில் ஃபிரெஷ் காய்கறிகளை நேரடியாக உங்கள் கடைக்கு பெற தினமும் டாப்கோவில் ஆர்டர் செய்யுங்கள். முழு லாபம் மற்றும் சேமிப்பிற்கு உத்தரவாதம்!',
    businessTypes: {
      retail: 'சில்லறை வாடிக்கையாளர் / Retail',
      hotel: 'ஹோட்டல் / Hotel & Restaurant',
      teashop: 'டீக்கடை / Tea Stall',
      mess: 'மெஸ் / Mess & Canteen',
      store: 'மளிகை கடை / Grocery Store',
      bulk: 'மொத்த கொள்முதல் / Bulk Buyer'
    },
    quickNote: 'குறிப்பு: காய்கறி விலைகள் தினசரி மாறும். வாங்கும் நேரத்தில் சிறந்த மொத்த விலை உங்களுக்கு வழங்கப்படும்!',
    deliveryTimingLabel: 'விருப்பமான டெலிவரி நேரம்',
    timeSlots: {
      morning: 'காலை (6 AM - 9 AM)',
      lateMorning: 'நண்பகல் (9 AM - 12 PM)',
      afternoon: 'மதியம் (12 PM - 3 PM)',
      evening: 'மாலை (3 PM - 6 PM)'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('tapgo_lang');
    return saved || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ta' : 'en';
    setLang(nextLang);
    localStorage.setItem('tapgo_lang', nextLang);
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const tBiz = (key) => {
    return translations[lang].businessTypes[key] || key;
  };

  const tTime = (key) => {
    return translations[lang].timeSlots[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t, tBiz, tTime }}>
      {children}
    </LanguageContext.Provider>
  );
};
