"use client";

import React from "react";
import { X, Tag, IndianRupee, Weight, FileText } from "lucide-react";

interface ProductDetailProps {
  product: any;
  onClose: () => void;
}

export default function ProductDetailDialogue({ product, onClose }: ProductDetailProps) {
  if (!product) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card shadow-2xl z-50 flex flex-col p-8 sm:py-10 animate-in slide-in-from-right duration-300 border-l border-border-theme">
        
        {/* Header - Fixed */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-foreground">Product Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Main Visual Header */}
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 mb-8 relative group">
            {product.image ? (
              <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                 <Tag size={48} className="mb-2 opacity-50" />
                 <span className="font-bold uppercase tracking-widest text-xs">No Image</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md font-bold px-3 py-1.5 rounded-lg text-xs border border-border-theme text-foreground uppercase tracking-wider">
               {product.category?.name || "Uncategorized"}
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2 leading-tight">{product.name}</h1>
            <p className="text-sm font-semibold text-slate-400 font-mono">ID: {product._id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border-theme shadow-sm p-5 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                 <IndianRupee size={12} className="text-primary" /> Regular Price
              </p>
              <p className="text-lg font-bold text-foreground line-through opacity-60">₹{product.price}</p>
            </div>
            <div className="bg-primary/5 border border-primary/20 shadow-sm p-5 rounded-2xl">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 mb-2">
                 <IndianRupee size={12} className="text-primary" /> Offer Price
              </p>
              <p className="text-xl font-extrabold text-primary">₹{product.salePrice || product.price}</p>
            </div>
          </div>

          {/* Additional Specifics */}
          <div className="space-y-4 mb-8">
             <div className="flex items-center justify-between border border-border-theme rounded-xl px-5 py-4 bg-card">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Weight size={16} /> Item Weight</span>
                <span className="font-bold text-foreground text-sm">{product.weight || "N/A"}</span>
             </div>
             <div className="flex items-center justify-between border border-border-theme rounded-xl px-5 py-4 bg-card">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Time</span>
                <span className="font-bold text-foreground text-sm">{product.deliveryTime || "24"} Hours</span>
             </div>
             <div className="flex items-center justify-between border border-border-theme rounded-xl px-5 py-4 bg-card">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Delivery</span>
                <span className="font-bold text-foreground text-sm">{product.expectedDeliveryDate || "N/A"}</span>
             </div>
             {product.flowers && (
               <div className="flex items-center justify-between border border-border-theme rounded-xl px-5 py-4 bg-card">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest"><Tag size={16} /> Flowers Count</span>
                  <span className="font-bold text-foreground text-sm">{product.flowers}</span>
               </div>
             )}
          </div>

          <div className="border-t border-border-theme pt-8 mb-8">
             <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4 uppercase tracking-wider">
               <FileText size={16} className="text-slate-400" /> Description
             </h3>
             <p className="text-slate-600 text-sm leading-relaxed">
               {product.description || "No description provided for this product."}
             </p>
          </div>

        </div>
      </div>
    </>
  );
}
