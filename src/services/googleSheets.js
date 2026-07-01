/**
 * TapGo - Google Sheets & Order Management Service
 * 
 * This service handles saving orders to Google Sheets via an Apps Script Web App.
 * If the Web App URL is not configured, it falls back to LocalStorage, ensuring
 * the app is 100% functional out-of-the-box.
 * 
 * --- GOOGLE APPS SCRIPT CODE TO PASTE IN GOOGLE SHEETS ---
 * 
 * Open your Google Sheet, go to Extensions > Apps Script, replace the code with the following,
 * and click "Deploy > New Deployment" as a Web App (Access: "Anyone").
 * 
 * ```javascript
 * function doGet(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = sheet.getDataRange().getValues();
 *   var headers = data[0];
 *   var jsonArray = [];
 *   
 *   for (var i = 1; i < data.length; i++) {
 *     var row = data[i];
 *     var record = {};
 *     for (var j = 0; j < headers.length; j++) {
 *       record[headers[j]] = row[j];
 *     }
 *     jsonArray.push(record);
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify(jsonArray))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   try {
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     var payload = JSON.parse(e.postData.contents);
 *     
 *     // If action is update status
 *     if (payload.action === 'updateStatus') {
 *       var data = sheet.getDataRange().getValues();
 *       var orderIdCol = 0; // Column A
 *       var statusCol = 7;   // Column H
 *       var rowUpdated = false;
 *       
 *       for (var i = 1; i < data.length; i++) {
 *         if (data[i][orderIdCol] == payload.orderId) {
 *           sheet.getRange(i + 1, statusCol + 1).setValue(payload.status);
 *           rowUpdated = true;
 *         }
 *       }
 *       return ContentService.createTextOutput(JSON.stringify({ success: rowUpdated }))
 *         .setMimeType(ContentService.MimeType.JSON);
 *     }
 *     
 *     // Otherwise, add new order(s)
 *     var orders = Array.isArray(payload) ? payload : [payload];
 *     
 *     for (var k = 0; k < orders.length; k++) {
 *       var order = orders[k];
 *       sheet.appendRow([
 *         order.orderId,
 *         order.date,
 *         order.name,
 *         order.phone,
 *         order.businessType,
 *         order.product,
 *         order.quantity,
 *         order.totalAmount,
 *         order.status,
 *         order.deliveryNote || ''
 *       ]);
 *     }
 *     
 *     return ContentService.createTextOutput(JSON.stringify({ success: true }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * ```
 */

const LOCAL_ORDERS_KEY = 'tapgo_orders_db';
const SHEETS_URL_KEY = 'tapgo_google_sheets_url';
const ADMIN_PASSWORD_KEY = 'tapgo_admin_password';
const OFFER_EN_KEY = 'tapgo_offer_en';
const OFFER_TA_KEY = 'tapgo_offer_ta';

// Default Admin password is 'tapgo123'
if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, 'tapgo123');
}

// Helper to get Google Sheets URL from LocalStorage (configurable in Admin Panel)
export const getGoogleSheetsUrl = () => {
  return localStorage.getItem(SHEETS_URL_KEY) || '';
};

// Helper to set Google Sheets URL
export const setGoogleSheetsUrl = (url) => {
  if (url) {
    localStorage.setItem(SHEETS_URL_KEY, url);
  } else {
    localStorage.removeItem(SHEETS_URL_KEY);
  }
};

// Generate Unique Order ID (TG-YYYYMMDD-XXXX)
export const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Random 4 digits
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  
  return `TG-${dateStr}-${randomNum}`;
};

// Mock initial data if no orders exist, to make dashboard look rich and premium!
const getMockOrders = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
  const formatDate = (date, hoursOffset = 0) => {
    const d = new Date(date.getTime() + hoursOffset * 60 * 60 * 1000);
    return d.toLocaleString();
  };

  return [
    {
      orderId: 'TG-20260623-1492',
      date: formatDate(yesterday, -2),
      name: 'Saravana Bhavan Hotel',
      phone: '9876543210',
      businessType: 'hotel',
      product: 'Onion (Bellary) x 50kg, Tomato (Local) x 25kg, Garlic (Poondu) x 5kg',
      quantity: 80,
      totalAmount: 3250,
      status: 'Delivered',
      deliveryNote: 'Deliver near back kitchen gate before 7 AM.'
    },
    {
      orderId: 'TG-20260623-8831',
      date: formatDate(yesterday, 3),
      name: 'Ramu Tea Stall',
      phone: '9012345678',
      businessType: 'teashop',
      product: 'Ginger (Inji) x 3kg, Lemon (Elumichai) x 20piece, Mint Leaves (Pudhina) x 10kattu',
      quantity: 33,
      totalAmount: 540,
      status: 'Purchased',
      deliveryNote: 'Call on arrival.'
    },
    {
      orderId: 'TG-20260624-2204',
      date: formatDate(now, -4),
      name: 'Annapoorna Mess',
      phone: '9443210987',
      businessType: 'mess',
      product: 'Potato (Indore) x 20kg, Carrot (Ooty) x 10kg, Ara Keerai x 15kattu',
      quantity: 45,
      totalAmount: 1315,
      status: 'Confirmed',
      deliveryNote: 'Leave with security guard.'
    },
    {
      orderId: 'TG-20260624-9481',
      date: formatDate(now, -1),
      name: 'Karthik Store',
      phone: '9123456789',
      businessType: 'store',
      product: 'Onion (Bellary) x 10kg, Tomato (Local) x 10kg, Ladies Finger (Okra) x 5kg',
      quantity: 25,
      totalAmount: 805,
      status: 'Pending',
      deliveryNote: ''
    }
  ];
};

// Get all orders (Loads from Google Sheets if configured, otherwise falls back to LocalStorage)
export const fetchAllOrders = async () => {
  const url = getGoogleSheetsUrl();
  
  if (url) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Return sorted by date descending
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    } catch (e) {
      console.warn("Failed to fetch from Google Sheets, using LocalStorage fallback", e);
    }
  }

  // LocalStorage Fallback
  let localOrders = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!localOrders) {
    // If no orders exist, initialize with mock data so dashboard is beautiful immediately
    const mock = getMockOrders();
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(mock));
    return mock;
  }
  
  try {
    return JSON.parse(localOrders).sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    return [];
  }
};

// Create a new order (Saves to both Google Sheets if configured, and always to LocalStorage)
export const saveNewOrder = async (order) => {
  // Save to LocalStorage first
  let localOrders = [];
  try {
    const existing = localStorage.getItem(LOCAL_ORDERS_KEY);
    localOrders = existing ? JSON.parse(existing) : [];
  } catch (e) {
    localOrders = [];
  }
  
  localOrders.unshift(order); // Add to beginning
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(localOrders));

  // Notify other parts of the app (admin panel) that orders changed
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('tapgo:orders-updated', { detail: { order } }));
    }
  } catch (e) {
    // ignore
  }

  // Sync to Google Sheets if URL exists
  const url = getGoogleSheetsUrl();
  if (url) {
    try {
      // Use no-cors or standard depending on setup, but standard is preferred if CORS is handled in apps script
      // Standard fetch options for Apps Script web app
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(order)
      });
      const result = await response.json();
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('tapgo:orders-updated', { detail: { order, result } }));
        }
      } catch (e) {}
      return { success: true, localOnly: false, result };
    } catch (e) {
      console.error("Failed to send order to Google Sheets:", e);
      return { success: true, localOnly: true, error: e.message };
    }
  }

  return { success: true, localOnly: true };
};

// Update Order Status
export const updateOrderStatus = async (orderId, newStatus) => {
  // Update in LocalStorage
  let localOrders = [];
  try {
    const existing = localStorage.getItem(LOCAL_ORDERS_KEY);
    localOrders = existing ? JSON.parse(existing) : [];
  } catch (e) {
    localOrders = [];
  }

  let updated = false;
  localOrders = localOrders.map(order => {
    if (order.orderId === orderId) {
      order.status = newStatus;
      updated = true;
    }
    return order;
  });

  if (updated) {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(localOrders));
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('tapgo:orders-updated', { detail: { orderId, newStatus } }));
      }
    } catch (e) {}
  }

  // Update in Google Sheets
  const url = getGoogleSheetsUrl();
  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          orderId: orderId,
          status: newStatus
        })
      });
    } catch (e) {
      console.error("Failed to update status in Google Sheets:", e);
    }
  }

  return updated;
};

// Offer helpers
export const getOffers = () => {
  return {
    en: localStorage.getItem(OFFER_EN_KEY) || '',
    ta: localStorage.getItem(OFFER_TA_KEY) || ''
  };
};

export const setOffers = (offers) => {
  if (offers.en !== undefined) localStorage.setItem(OFFER_EN_KEY, offers.en || '');
  if (offers.ta !== undefined) localStorage.setItem(OFFER_TA_KEY, offers.ta || '');
};

// Verify Admin Password
export const verifyAdminPassword = (password) => {
  const saved = localStorage.getItem(ADMIN_PASSWORD_KEY);
  return saved === password;
};

// Update Admin Password
export const updateAdminPassword = (newPassword) => {
  if (newPassword && newPassword.trim()) {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
    return true;
  }
  return false;
};
