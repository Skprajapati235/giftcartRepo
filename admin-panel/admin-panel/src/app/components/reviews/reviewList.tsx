"use client";

import React, { useState } from "react";
import { Review } from "./index";
import Link from "next/link";
import { Star, MessageCircle, Trash2, X, ChevronLeft, ChevronRight, CornerDownRight, Edit2 } from "lucide-react";

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function ReviewList({ reviews, loading, onDelete }: ReviewListProps) {
  const [selectedGallery, setSelectedGallery] = useState<{ images: string[]; index: number } | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border-theme overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-theme bg-slate-50/50 dark:bg-slate-900/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Product</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Rating</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Review</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Images</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-theme">
            {reviews.map((review) => (
              <React.Fragment key={review._id}>
                <tr className="hover:bg-hover-theme transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={review.product.image} className="h-12 w-12 rounded-xl object-cover border border-border-theme" alt="" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{review.product.name}</p>
                        <p className="text-xs text-slate-500">₹{review.product.price}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{review.user?.name || "Anonymous"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-xs line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {review.images && review.images.length > 0 && (
                        <div className="relative cursor-pointer" onClick={() => setSelectedGallery({ images: review.images, index: 0 })}>
                          <img src={review.images[0]} className="h-10 w-10 rounded-lg object-cover border border-border-theme" alt="" />
                          {review.images.length > 1 && (
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+{review.images.length - 1}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/reviews/${review._id}/reply`}
                        className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-xl"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </Link>
                      <Link 
                        href={`/reviews/${review._id}/edit`}
                        className="p-2 text-slate-400 hover:text-amber-500 transition-colors hover:bg-amber-50 rounded-xl"
                      >
                        <Edit2 className="h-5 w-5" />
                      </Link>
                      <button 
                        onClick={() => onDelete(review._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Admin Reply Sub-row */}
                {review.reply && (
                  <tr className="bg-slate-50/30 dark:bg-slate-900/10">
                    <td colSpan={6} className="px-14 py-3">
                       <div className="flex items-start gap-2">
                          <CornerDownRight className="h-4 w-4 text-slate-400 mt-1" />
                          <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-border-theme shadow-sm">
                             <div className="flex justify-between items-center mb-1">
                               <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Admin Reply</p>
                               <span className="text-[10px] text-slate-400">{review.replyAt ? new Date(review.replyAt).toLocaleDateString() : ""}</span>
                             </div>
                             <p className="text-sm text-slate-700">{review.reply}</p>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gallery Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 animate-in fade-in duration-300">
           <button onClick={() => setSelectedGallery(null)} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10">
              <X className="h-8 w-8" />
           </button>
           
           <div className="relative w-full max-w-4xl flex items-center justify-center">
              {selectedGallery.images.length > 1 && (
                <button 
                  onClick={() => setSelectedGallery({...selectedGallery, index: (selectedGallery.index - 1 + selectedGallery.images.length) % selectedGallery.images.length})}
                  className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              <img 
                src={selectedGallery.images[selectedGallery.index]} 
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain"
                alt="Product review"
              />

              {selectedGallery.images.length > 1 && (
                <button 
                  onClick={() => setSelectedGallery({...selectedGallery, index: (selectedGallery.index + 1) % selectedGallery.images.length})}
                  className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              )}
           </div>

           <div className="absolute bottom-10 flex gap-2 overflow-x-auto p-4 max-w-full">
              {selectedGallery.images.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  onClick={() => setSelectedGallery({...selectedGallery, index: i})}
                  className={`h-16 w-16 rounded-lg object-cover cursor-pointer border-2 transition-all ${i === selectedGallery.index ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-50'}`}
                  alt=""
                />
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
