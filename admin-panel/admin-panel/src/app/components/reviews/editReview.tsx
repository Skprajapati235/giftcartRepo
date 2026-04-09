"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviewById, adminUpdateReview } from "../../services/reviewService";
import { Review } from "./index";
import { ArrowLeft, Save, Star, AlertCircle } from "lucide-react";

export default function EditReviewView() {
  const { id } = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await getReviewById(id as string);
        setReview(data);
        setComment(data.comment);
        setRating(data.rating);
      } catch (error) {
        console.error("Failed to fetch review", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReview();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminUpdateReview(id as string, { comment, rating });
      router.push("/reviews");
    } catch (error) {
      alert("Failed to update review");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!review) return <div>Review not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-foreground transition-colors group">
          <div className="p-2 rounded-xl group-hover:bg-hover-theme transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <span className="font-bold">Back to Reviews</span>
        </button>
      </div>

      <div className="bg-card p-8 rounded-3xl border border-border-theme shadow-sm mb-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-theme">
          <div className="p-3 bg-amber-50 rounded-2xl">
             <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div>
             <h2 className="text-xl font-bold">Edit Customer Feedback</h2>
             <p className="text-sm text-slate-400 font-medium">Moderate and refine user reviews</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                 Star Rating
                 <span className="text-xs font-normal text-slate-400 tracking-normal">(Click to select)</span>
               </label>
               <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border-theme">
                 {[1, 2, 3, 4, 5].map((s) => (
                   <button 
                     key={s} 
                     type="button" 
                     onClick={() => setRating(s)}
                     className="transition-transform active:scale-90"
                   >
                     <Star className={`h-10 w-10 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-4">
                <label className="text-sm font-bold text-slate-500">Moderation Notes</label>
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                   <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                   <p className="text-xs leading-relaxed">As an admin, you can correct typos or moderate language. Please maintain the user's original sentiment where possible.</p>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">Review Comment</label>
            <textarea 
              className="w-full h-48 p-4 bg-background border border-border-theme rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              placeholder="User review text..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
          >
            <Save className="h-5 w-5" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
