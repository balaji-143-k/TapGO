/**
 * TapGO — Centralized CRUD Service
 * All data is persisted in localStorage. Dispatches custom events on every mutation
 * so any listening component can reactively update.
 */

const KEYS = {
  PRODUCTS: 'tapgo_catalog_db',
  ORDERS: 'tapgo_orders_db',
  CATEGORIES: 'tapgo_categories_db',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); }
  catch { return null; }
};

const write = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(`tapgo:${key}`, { detail: data }));
};

const genId = (prefix = 'item') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── Default Categories ──────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'daily',  nameEn: 'Daily Veggies',    nameTa: 'தினசரி காய்கறிகள்', emoji: '🥦' },
  { id: 'greens', nameEn: 'Leafy Greens',     nameTa: 'கீரை வகைகள்',       emoji: '🌿' },
  { id: 'herbs',  nameEn: 'Herbs & Spices',   nameTa: 'மூலிகைகள் & மசாலா', emoji: '🌶️' },
  { id: 'exotic', nameEn: 'Exotic Veggies',   nameTa: 'அரிய காய்கறிகள்',   emoji: '🍄' },
];

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const getProducts = () => read(KEYS.PRODUCTS) || [];

export const saveProducts = (products) => write(KEYS.PRODUCTS, products);

export const addProduct = (product) => {
  const products = getProducts();
  const newProduct = {
    id: genId('prod'),
    stock: 100,
    outOfStock: false,
    ...product,
  };
  const updated = [...products, newProduct];
  write(KEYS.PRODUCTS, updated);
  return newProduct;
};

export const updateProduct = (id, data) => {
  const products = getProducts().map(p => p.id === id ? { ...p, ...data } : p);
  write(KEYS.PRODUCTS, products);
  return products.find(p => p.id === id);
};

export const deleteProduct = (id) => {
  const products = getProducts().filter(p => p.id !== id);
  write(KEYS.PRODUCTS, products);
  return true;
};

// ─── ORDERS ─────────────────────────────────────────────────────────────────
export const getOrders = () => {
  const orders = read(KEYS.ORDERS) || [];
  return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const addOrder = (order) => {
  const orders = read(KEYS.ORDERS) || [];
  const newOrder = { ...order, createdAt: new Date().toISOString() };
  const updated = [newOrder, ...orders];
  write(KEYS.ORDERS, updated);
  return newOrder;
};

export const updateOrder = (orderId, data) => {
  const orders = (read(KEYS.ORDERS) || []).map(o =>
    o.orderId === orderId ? { ...o, ...data } : o
  );
  write(KEYS.ORDERS, orders);
  return orders.find(o => o.orderId === orderId);
};

export const deleteOrder = (orderId) => {
  const orders = (read(KEYS.ORDERS) || []).filter(o => o.orderId !== orderId);
  write(KEYS.ORDERS, orders);
  return true;
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const getCategories = () => {
  const saved = read(KEYS.CATEGORIES);
  if (!saved) {
    write(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return saved;
};

export const addCategory = (category) => {
  const cats = getCategories();
  const idBase = category.nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const newCat = { id: `cat_${idBase}_${Date.now()}`, emoji: '🥬', ...category };
  const updated = [...cats, newCat];
  write(KEYS.CATEGORIES, updated);
  return newCat;
};

export const updateCategory = (id, data) => {
  const cats = getCategories().map(c => c.id === id ? { ...c, ...data } : c);
  write(KEYS.CATEGORIES, cats);
  return cats.find(c => c.id === id);
};

export const deleteCategory = (id) => {
  const products = getProducts();
  const inUse = products.some(p => p.category === id);
  if (inUse) throw new Error('Category has products. Reassign them first.');
  const cats = getCategories().filter(c => c.id !== id);
  write(KEYS.CATEGORIES, cats);
  return true;
};
