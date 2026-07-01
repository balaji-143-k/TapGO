import React, { useState, useEffect } from 'react';
import {
  getCategories, addCategory, updateCategory, deleteCategory,
  getProducts
} from '../services/crudService';
import {
  Plus, Edit2, Trash2, Check, X, Tag, AlertTriangle
} from 'lucide-react';

const EMOJIS = ['🥦','🌿','🌶️','🍄','🥕','🧅','🍅','🧄','🫛','🥬','🌽','🫑','🥒','🍆','🫚'];

export default function CategoryCRUD() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameTa, setEditNameTa] = useState('');
  const [editEmoji, setEditEmoji] = useState('🥬');
  const [showAdd, setShowAdd] = useState(false);
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameTa, setNewNameTa] = useState('');
  const [newEmoji, setNewEmoji] = useState('🥬');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = () => {
    setCategories(getCategories());
    setProducts(getProducts());
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('tapgo:tapgo_categories_db', handler);
    window.addEventListener('tapgo:tapgo_catalog_db', handler);
    return () => {
      window.removeEventListener('tapgo:tapgo_categories_db', handler);
      window.removeEventListener('tapgo:tapgo_catalog_db', handler);
    };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const productCount = (catId) => products.filter(p => p.category === catId).length;

  const handleAdd = () => {
    if (!newNameEn.trim() || !newNameTa.trim()) return showToast('Fill both names', 'error');
    addCategory({ nameEn: newNameEn.trim(), nameTa: newNameTa.trim(), emoji: newEmoji });
    setNewNameEn(''); setNewNameTa(''); setNewEmoji('🥬');
    setShowAdd(false);
    refresh();
    showToast('Category added!');
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditNameEn(cat.nameEn);
    setEditNameTa(cat.nameTa);
    setEditEmoji(cat.emoji || '🥬');
  };

  const handleUpdate = (id) => {
    if (!editNameEn.trim() || !editNameTa.trim()) return showToast('Fill both names', 'error');
    updateCategory(id, { nameEn: editNameEn.trim(), nameTa: editNameTa.trim(), emoji: editEmoji });
    setEditingId(null);
    refresh();
    showToast('Category updated!');
  };

  const handleDelete = (id) => {
    try {
      deleteCategory(id);
      setConfirmDelete(null);
      refresh();
      showToast('Category deleted!');
    } catch (e) {
      setConfirmDelete(null);
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-4 relative">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Delete Category?</p>
                <p className="text-xs text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800">Categories</h3>
          <p className="text-xs text-slate-400">{categories.length} categories</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-black text-violet-700 uppercase tracking-wider">New Category</p>

          {/* Emoji picker */}
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setNewEmoji(e)}
                className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${newEmoji === e ? 'bg-violet-600 ring-2 ring-violet-400' : 'bg-white border border-slate-200 hover:border-violet-300'}`}>
                {e}
              </button>
            ))}
          </div>
          <input value={newNameEn} onChange={e => setNewNameEn(e.target.value)} placeholder="Name (English)" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200" />
          <input value={newNameTa} onChange={e => setNewNameTa(e.target.value)} placeholder="பெயர் (Tamil)" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200" />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700">Add</button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            {editingId === cat.id ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEditEmoji(e)}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${editEmoji === e ? 'bg-violet-600 ring-2 ring-violet-400' : 'bg-white border border-slate-200 hover:border-violet-300'}`}>
                      {e}
                    </button>
                  ))}
                </div>
                <input value={editNameEn} onChange={e => setEditNameEn(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                <input value={editNameTa} onChange={e => setEditNameTa(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center gap-1"><X size={13} /> Cancel</button>
                  <button onClick={() => handleUpdate(cat.id)} className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-violet-700"><Check size={13} /> Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {cat.emoji || '🥬'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{cat.nameEn}</p>
                  <p className="text-xs text-slate-500 truncate">{cat.nameTa}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                    <Tag size={9} />
                    {productCount(cat.id)} products
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(cat)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setConfirmDelete(cat.id)} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
