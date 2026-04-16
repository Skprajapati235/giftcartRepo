"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Review } from "./index";
import Link from "next/link";
import { Star, MessageCircle, Trash2, X, ChevronLeft, ChevronRight, CornerDownRight, Edit2, Search, MoreHorizontal, User, Box, ArrowRight, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Check, Ban } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  total: number;
  totalPages: number;
  currentPage: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
}

export default function ReviewList({ 
  reviews, 
  loading, 
  total,
  totalPages,
  currentPage,
  searchTerm,
  onPageChange,
  onSearchChange,
  onDelete, 
  onStatusUpdate 
}: ReviewListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<{ images: string[]; index: number } | null>(null);
  
  // Track collapsed state (true means hidden)
  const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleReply = (id: string) => {
    setCollapsedReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="bg-card rounded-3xl border border-border-theme p-4">
        <TableSkeleton rows={8} cols={6} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[500px]">
      {/* Header Filter Bar */}
      <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-30">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews, products, users..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border-theme">
          Total Reviews: {total}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left table-fixed border-collapse">
          <thead>
            <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
              <th className="px-6 py-4 w-[25%]">Product</th>
              <th className="px-6 py-4 w-[20%]">Customer</th>
              <th className="px-6 py-4 w-[12%]">Rating</th>
              <th className="px-6 py-4 w-[25%] text-center">Engagement & Status</th>
              <th className="px-6 py-4 w-[10%]">Media</th>
              <th className="px-6 py-4 w-[12%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme">
            {reviews.map((review) => {
              const itemIsCollapsed = collapsedReplies[review._id] || false;
              
              return (
              <React.Fragment key={review._id}>
                <tr className="hover:bg-hover-theme transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl border border-border-theme bg-hover-theme overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                        <img src={review.product.image} className="h-full w-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{review.product.name}</p>
                        <p className="text-xs font-black text-primary mt-0.5">₹{review.product.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-2 border-primary/20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {review.user?.profilePic ? (
                          <img src={review.user.profilePic} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <User size={18} className="text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{review.user?.name || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{review.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-800"} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {review.rating === 5 ? 'Excellent' : review.rating >= 4 ? 'Very Good' : 'Average'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic leading-relaxed font-medium">
                        "{review.comment}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <ThumbsUp size={14} className="text-green-500" />
                           <span className="text-xs font-bold text-foreground/70">{(review.likes || []).length}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <ThumbsDown size={14} className="text-rose-400" />
                           <span className="text-xs font-bold text-foreground/70">{(review.dislikes || []).length}</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          review.status === 'approved' ? 'bg-green-100 text-green-600 border border-green-200' :
                          review.status === 'rejected' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                          'bg-amber-100 text-amber-600 border border-amber-200'
                        }`}>
                          {review.status}
                        </div>

                        <p className="text-[10px] text-slate-400 font-bold ml-auto border-l border-border-theme pl-3">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {review.images && review.images.length > 0 ? (
                      <div 
                        className="relative cursor-pointer group/img inline-block" 
                        onClick={() => setSelectedGallery({ images: review.images, index: 0 })}
                      >
                        <img src={review.images[0]} className="h-12 w-12 rounded-xl object-cover border border-border-theme shadow-sm transition group-hover/img:scale-110" alt="" />
                        {review.images.length > 1 && (
                          <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-card shadow-lg">
                            {review.images.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase italic">No images</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       {review.status === 'pending' && (
                         <>
                           <button 
                             onClick={() => onStatusUpdate(review._id, 'approved')}
                             className="p-2 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-all shadow-sm"
                             title="Approve Review"
                           >
                             <Check size={18} />
                           </button>
                           <button 
                             onClick={() => onStatusUpdate(review._id, 'rejected')}
                             className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
                             title="Reject Review"
                           >
                             <Ban size={18} />
                           </button>
                         </>
                       )}
                       {review.reply && (
                        <button 
                          onClick={() => toggleReply(review._id)}
                          className={`p-2 rounded-xl border border-border-theme transition-all ${itemIsCollapsed ? 'text-slate-400 hover:bg-hover-theme' : 'text-primary bg-primary/10 border-primary/20'}`}
                        >
                          <CornerDownRight size={18} className={itemIsCollapsed ? "" : "rotate-90"} />
                        </button>
                       )}
                       <button
                        onClick={() => setOpenMenuId(openMenuId === review._id ? null : review._id)}
                        className="p-2 text-slate-400 hover:text-foreground transition rounded-xl bg-hover-theme/50"
                       >
                        <MoreHorizontal size={20} />
                       </button>
                    </div>

                    {openMenuId === review._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-6 top-14 w-44 bg-card rounded-2xl shadow-2xl border border-border-theme py-2 z-50 animate-in fade-in zoom-in duration-200"
                      >
                        <Link
                          href={`/reviews/${review._id}/reply`}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                        >
                          <MessageCircle size={16} className="text-primary" />
                          Reply Back
                        </Link>
                        <Link
                          href={`/reviews/${review._id}/edit`}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                        >
                          <Edit2 size={16} className="text-amber-500" />
                          Edit Content
                        </Link>
                        <div className="mx-2 my-1 border-t border-border-theme" />
                        <button
                          onClick={() => { setOpenMenuId(null); onDelete(review._id); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 size={16} />
                          Delete Review
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {/* Premium Sleek Reply Row */}
                {review.reply && !itemIsCollapsed && (
                  <tr className="bg-slate-100/20 dark:bg-white/[0.02] animate-in fade-in slide-in-from-top-2 duration-500">
                    <td colSpan={6} className="px-14 py-4 pb-6">
                       <div className="flex items-start gap-5">
                          <div className="shrink-0 mt-1">
                             <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5">
                                <CornerDownRight className="h-4 w-4 text-primary" />
                             </div>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                   <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                   <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">Store Response</span>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-border-theme to-transparent" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                   {new Date(review.replyAt!).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                             </div>
                             
                             <div className="relative pl-6 py-1">
                                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-primary/40 to-primary/0" />
                                <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-relaxed italic opacity-95">
                                   "{review.reply}"
                                </p>
                             </div>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
          Showing {(currentPage - 1) * 10 + Math.min(1, reviews.length)}-{Math.min(currentPage * 10, total)} of {total}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>

      {/* Gallery Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-hidden">
           <button onClick={() => setSelectedGallery(null)} className="absolute top-8 right-8 text-white p-3 hover:bg-white/10 rounded-full transition-colors z-[110] bg-black/20">
              <X className="h-8 w-8" />
           </button>
           
           <div className="relative w-full max-w-5xl flex items-center justify-center px-20">
              {selectedGallery.images.length > 1 && (
                <button 
                  onClick={() => setSelectedGallery({...selectedGallery, index: (selectedGallery.index - 1 + selectedGallery.images.length) % selectedGallery.images.length})}
                  className="absolute left-4 p-5 text-white hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-90"
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>
              )}

              <div className="relative group">
                <img 
                  src={selectedGallery.images[selectedGallery.index]} 
                  className="max-h-[75vh] max-w-full rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] object-contain border border-white/10"
                  alt="Product review"
                />
                <div className="absolute inset-x-0 -bottom-12 flex justify-center">
                   <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                      <p className="text-white text-xs font-black uppercase tracking-widest">{selectedGallery.index + 1} / {selectedGallery.images.length}</p>
                   </div>
                </div>
              </div>

              {selectedGallery.images.length > 1 && (
                <button 
                  onClick={() => setSelectedGallery({...selectedGallery, index: (selectedGallery.index + 1) % selectedGallery.images.length})}
                  className="absolute right-4 p-5 text-white hover:bg-white/10 rounded-full transition-all hover:scale-110 active:scale-90"
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              )}
           </div>

           <div className="absolute bottom-8 flex gap-3 overflow-x-auto p-6 max-w-[90%] scrollbar-hide">
              {selectedGallery.images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedGallery({...selectedGallery, index: i})}
                  className={`h-20 w-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-0.5 shrink-0 ${i === selectedGallery.index ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img src={img} className="h-full w-full object-cover rounded-[0.8rem]" alt="" />
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
