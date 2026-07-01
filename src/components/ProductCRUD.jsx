import React, { useState, useEffect, useRef } from 'react';
import {
  getProducts, addProduct, updateProduct, deleteProduct,
  getCategories
} from '../services/crudService';
import {
  Plus, Edit2, Trash2, Check, X, Search, Filter,
  AlertTriangle, Package, ChevronDown, Image as ImageIcon,
  Tag, ToggleLeft, ToggleRight, Save
} from 'lucide-react';

const UNITS = ['kg', 'kattu', 'piece', 'pack', 'litre', 'dozen'];

export default function ProductCRUD() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const emptyForm = {
    nameEn: '', nameTa: '', category: 'daily',
    price: '', marketPrice: '', unit: 'kg',
    minOrder: '1', stock: '100', image: '',
    descriptionEn: '', descriptionTa: '',
    outOfStock: false,
  };
  const [form, setForm] = useState(emptyForm);

  const refresh = () => {
    setProducts(getProducts());
    setCategories(getCategories());
  };

  useEffect(() => {
    refresh();
    const h1 = () => setProducts(getProducts());
    const h2 = () => setCategories(getCategories());
    window.addEventListener('tapgo:tapgo_catalog_db', h1);
    window.addEventListener('tapgo:tapgo_categories_db', h2);
    return () => {
      window.removeEventListener('tapgo:tapgo_catalog_db', h1);
      window.removeEventListener('tapgo:tapgo_categories_db', h2);
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      nameEn: product.nameEn || '',
      nameTa: product.nameTa || '',
      category: product.category || 'daily',
      price: String(product.price || ''),
      marketPrice: String(product.marketPrice || ''),
      unit: product.unit || 'kg',
      minOrder: String(product.minOrder || '1'),
      stock: String(product.stock ?? 100),
      image: product.image || '',
      descriptionEn: product.descriptionEn || '',
      descriptionTa: product.descriptionTa || '',
      outOfStock: product.outOfStock || false,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nameEn.trim()) return showToast('English name is required', 'error');
    if (!form.nameTa.trim()) return showToast('Tamil name is required', 'error');
    if (isNaN(parseFloat(form.price))) return showToast('Enter a valid price', 'error');

    const productData = {
      nameEn: form.nameEn.trim(),
      nameTa: form.nameTa.trim(),
      category: form.category,
      price: parseFloat(form.price) || 0,
      marketPrice: parseFloat(form.marketPrice) || 0,
      unit: form.unit,
      minOrder: parseFloat(form.minOrder) || 1,
      stock: parseInt(form.stock) || 0,
      image: form.image.trim(),
      descriptionEn: form.descriptionEn.trim(),
      descriptionTa: form.descriptionTa.trim(),
      outOfStock: form.outOfStock,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      showToast('Product updated!');
    } else {
      addProduct(productData);
      showToast('Product added!');
    }

    setShowModal(false);
    refresh();
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setConfirmDelete(null);
    refresh();
    showToast('Product deleted!');
  };

  const handleToggleStock = (product) => {
    updateProduct(product.id, { outOfStock: !product.outOfStock });
    refresh();
  };

  const filtered = products.filter(p => {
    const name = `${p.nameEn} ${p.nameTa}`.toLowerCase();
    return name.includes(search.toLowerCase()) &&
      (catFilter === 'all' || p.category === catFilter);
  });

  const catName = (id) => {
    const c = categories.find(c => c.id === id);
    return c ? c.nameEn : id;
  };

  return (
    <div className="space-y-4 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-xl animate-bounce-in ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">Delete Product?</p>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Fill all fields for best results</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Names */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Names</label>
                <input
                  value={form.nameEn}
                  onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="Name in English *"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <input
                  value={form.nameTa}
                  onChange={e => setForm(f => ({ ...f, nameTa: e.target.value }))}
                  placeholder="Tamil name / தமிழ் பெயர் *"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {/* Category + Unit row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 bg-white pr-8">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nameEn}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Unit</label>
                  <div className="relative">
                    <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 bg-white pr-8">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Our Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0.00" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Market Price (₹)</label>
                  <input type="number" value={form.marketPrice} onChange={e => setForm(f => ({ ...f, marketPrice: e.target.value }))}
                    placeholder="0.00" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
              </div>

              {/* Stock + Min Order row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="100" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Min Order</label>
                  <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                    placeholder="1" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1"><ImageIcon size={10} /> Image URL</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..." className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-full h-24 object-cover rounded-xl mt-2 border border-slate-200" onError={e => e.target.style.display='none'} />
                )}
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Descriptions</label>
                <textarea value={form.descriptionEn} onChange={e => setForm(f => ({ ...f, descriptionEn: e.target.value }))}
                  placeholder="Short description (English)" rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none" />
                <textarea value={form.descriptionTa} onChange={e => setForm(f => ({ ...f, descriptionTa: e.target.value }))}
                  placeholder="சிறு விளக்கம் (Tamil)" rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none" />
              </div>

              {/* Out of Stock toggle */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">Out of Stock</p>
                  <p className="text-xs text-slate-400">Hides add-to-cart for this item</p>
                </div>
                <button onClick={() => setForm(f => ({ ...f, outOfStock: !f.outOfStock }))}
                  className={`transition-colors ${form.outOfStock ? 'text-red-500' : 'text-slate-300'}`}>
                  {form.outOfStock ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Save size={16} />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800">Products</h3>
          <p className="text-xs text-slate-400">{products.length} total · {filtered.length} shown</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" />
        </div>
        <div className="relative">
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 text-slate-700">
            <option value="all">All</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nameEn}</option>)}
          </select>
          <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Products Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
          <Package size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-400 text-sm">No products found</p>
          <p className="text-xs text-slate-300 mt-1">Try a different filter or add a new product</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => (
            <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all">
              <div className="flex items-center gap-3">
                {/* Image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  {product.image ? (
                    <img src={product.image} alt={product.nameEn} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {categories.find(c => c.id === product.category)?.emoji || '🥬'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-slate-800 text-sm truncate">{product.nameEn}</p>
                    {product.outOfStock && (
                      <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase">OOS</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{product.nameTa}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-black text-emerald-700">₹{product.price}/{product.unit}</span>
                    {product.marketPrice > product.price && (
                      <span className="text-[10px] text-slate-400 line-through">₹{product.marketPrice}</span>
                    )}
                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">
                      {catName(product.category)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      (product.stock ?? 0) < 10 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => openEdit(product)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleToggleStock(product)}
                    className={`p-2 rounded-xl border transition-colors ${product.outOfStock ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
                    title={product.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}>
                    {product.outOfStock ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                  </button>
                  <button onClick={() => setConfirmDelete(product.id)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
