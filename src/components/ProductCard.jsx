import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { stripName } from '../utils/nameUtils';
import { Plus, Minus } from 'lucide-react';
import { Edit, Check, X } from 'lucide-react';

export default function ProductCard({ product, cartItem, onAddToCart, onUpdateQuantity, onUpdateProduct }) {
  const { lang, t } = useLanguage();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameEn, setEditNameEn] = useState(product.nameEn || '');
  const [editNameTa, setEditNameTa] = useState(product.nameTa || '');
  
  const rawName = lang === 'en' ? product.nameEn : product.nameTa;
  const name = stripName(rawName);
  const description = lang === 'en' ? product.descriptionEn : product.descriptionTa;
  const quantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.outOfStock === true || (product.stock ?? 0) <= 0;
  
  // Format unit translation
  const getTranslatedUnit = (unit) => {
    if (unit === 'kg') return lang === 'en' ? 'kg' : 'கிலோ';
    if (unit === 'kattu') return lang === 'en' ? 'bundle' : 'கட்டு';
    if (unit === 'piece') return lang === 'en' ? 'piece' : 'பீஸ்';
    if (unit === 'pack') return lang === 'en' ? 'pack' : 'பாக்கெட்';
    return unit;
  };

  const handleSaveNames = () => {
    if (typeof onUpdateProduct === 'function') {
      onUpdateProduct({ ...product, nameEn: editNameEn.trim() || product.nameEn, nameTa: editNameTa.trim() || product.nameTa });
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditNameEn(product.nameEn || '');
    setEditNameTa(product.nameTa || '');
    setIsEditingName(false);
  };

  return (
    <div className={`glass-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group border bg-white ${
      isOutOfStock 
        ? 'border-slate-200 opacity-75' 
        : 'border-slate-100 hover:border-emerald-100'
    }`}>
      {/* Product Image & Badge */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            !isOutOfStock && 'group-hover:scale-105'
          }`}
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {product.category === 'greens' && (lang === 'en' ? 'Greens' : 'கீரை')}
          {product.category === 'daily' && (lang === 'en' ? 'Daily' : 'தினசரி')}
          {product.category === 'herbs' && (lang === 'en' ? 'Herbs' : 'மசாலா')}
          {product.category === 'exotic' && (lang === 'en' ? 'Exotic' : 'அரியவை')}
        </div>

        {/* Out Of Stock Overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {lang === 'en' ? 'Out of Stock' : 'சரக்கு இல்லை'}
            </span>
          </div>
        ) : (
          product.minOrder > 1 && (
            <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Min: {product.minOrder} {getTranslatedUnit(product.unit)}
            </div>
          )
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col grow justify-between">
        <div>
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="w-full">
                <input value={editNameEn} onChange={e => setEditNameEn(e.target.value)} className="w-full px-2 py-1 rounded-md border border-slate-200 text-sm font-bold mb-1" />
                <input value={editNameTa} onChange={e => setEditNameTa(e.target.value)} className="w-full px-2 py-1 rounded-md border border-slate-200 text-xs font-bold text-emerald-800" />
              </div>
            ) : (
              <h3 className={`font-bold text-base mb-1 line-clamp-1 ${isOutOfStock ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {name}
              </h3>
            )}

            {/* Edit controls */}
            <div className="ml-auto flex items-center gap-1">
              {isEditingName ? (
                <>
                  <button onClick={handleSaveNames} className="p-1 rounded-md bg-emerald-600 text-white" title="Save name">
                    <Check size={14} />
                  </button>
                  <button onClick={handleCancelEdit} className="p-1 rounded-md bg-slate-100 text-slate-600" title="Cancel">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingName(true)} className="p-1 rounded-md bg-slate-50 text-slate-600 border border-slate-100" title="Edit name">
                  <Edit size={14} />
                </button>
              )}
            </div>
          </div>

          <p className="text-slate-400 text-[11px] mb-3 line-clamp-2 min-h-8 leading-normal font-medium">
            {description}
          </p>
        </div>
        
        <div className="space-y-3 mt-auto">
          {/* Price Comparisons (Market vs App Price) */}
          <div className="flex flex-col bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
            {product.marketPrice > product.price && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-0.5">
                <span>{t('marketPriceLabel')}:</span>
                <span className="line-through">₹{product.marketPrice}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t('appPriceLabel')}:</span>
              <div className="flex items-baseline">
                <span className={`text-base font-black ${isOutOfStock ? 'text-slate-400' : 'text-emerald-700'}`}>
                  ₹{product.price}
                </span>
                <span className="text-[10px] text-slate-500 ml-0.5 font-bold">/{getTranslatedUnit(product.unit)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-2">
              <span>{lang === 'en' ? 'Stock' : 'பங்கு'}</span>
              <span className={`${isOutOfStock ? 'text-red-600' : 'text-emerald-700'} font-black`}>{product.stock ?? 0}</span>
            </div>
          </div>

          {isOutOfStock ? (
            <button
              disabled
              className="w-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold py-2 px-3 rounded-xl border border-slate-200 text-xs cursor-not-allowed"
            >
              {lang === 'en' ? 'Unavailable' : 'சரக்கு இல்லை'}
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl transition-all duration-200 transform active:scale-95 text-xs shadow-sm shadow-emerald-250 cursor-pointer"
            >
              <Plus size={14} />
              <span>{t('addToCart')}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full bg-emerald-600 text-white rounded-xl py-1 px-2 shadow-sm">
              <button
                onClick={() => onUpdateQuantity(product.id, quantity - product.minOrder)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-xs w-8 text-center">
                {quantity} {getTranslatedUnit(product.unit)}
              </span>
              <button
                onClick={() => onUpdateQuantity(product.id, quantity + product.minOrder)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
