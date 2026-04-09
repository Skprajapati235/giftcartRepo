"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReviewById, adminReplyReview } from "../../services/reviewService";
import { Review } from "./index";
import { ArrowLeft, Send, User, MessageSquare } from "lucide-react";

export default function ReplyReviewView() {
  const { id } = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await getReviewById(id as string);
        setReview(data);
        setReplyText(data.reply || "");
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
      await adminReplyReview(id as string, replyText);
      router.push("/reviews");
    } catch (error) {
      alert("Failed to send reply");
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

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border-theme shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Product</h3>
            <img src={review.product.image} className="w-full aspect-square object-cover rounded-2xl border border-border-theme mb-4" alt="" />
            <p className="font-bold text-slate-900">{review.product.name}</p>
            <p className="text-primary font-black mt-1">₹{review.product.price}</p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border-theme shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Customer</h3>
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
               </div>
               <div>
                  <p className="font-bold text-slate-900">{review.user.name}</p>
                  <p className="text-xs text-slate-500">{review.user.email}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-8 rounded-3xl border border-border-theme shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Reply to Feedback
               </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border-theme mb-8">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer Review</p>
               <p className="text-slate-700 leading-relaxed italic">"{review.comment}"</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500">Your Response</label>
                  <textarea 
                    className="w-full h-48 p-4 bg-background border border-border-theme rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Type your official response here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
               </div>

               <button 
                 type="submit"
                 className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
               >
                 <Send className="h-5 w-5" />
                 Send Official Reply
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
