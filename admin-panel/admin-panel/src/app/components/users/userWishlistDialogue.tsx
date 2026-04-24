"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Heart, Package } from "lucide-react";
import * as service from "../../services/adminService";
import Pagination from "../Pagination";

interface UserWishlistDialogueProps {
  user: any;
  onClose: () => void;
}

export default function UserWishlistDialogue({ user, onClose }: UserWishlistDialogueProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filter, setFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await service.getUserWishlist(user._id, { page, limit, filter });
      setItems(response.items || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a slight debounce for filter changes
    const timer = setTimeout(() => {
      fetchWishlist();
    }, 300);
    return () => clearTimeout(timer);
  }, [user._id, page, filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border-theme overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border-theme bg-hover-theme/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">
                Wishlist
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                {user.name}'s Saved Items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-card rounded-full text-slate-400 hover:text-foreground hover:bg-hover-theme transition-all shadow-sm border border-border-theme"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="text-sm font-bold text-slate-400 bg-hover-theme px-4 py-2 rounded-xl border border-border-theme">
            {total} Items
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-black/20">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Heart size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-bold">No items found</p>
              <p className="text-sm">This user's wishlist is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={item._id} className="bg-card p-4 rounded-2xl border border-border-theme shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-hover-theme flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-black text-primary">₹{product.salePrice || product.price}</span>
                        <span className="text-xs text-slate-400 font-semibold bg-hover-theme px-2 py-1 rounded-lg">
                          Added {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border-theme bg-card flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
