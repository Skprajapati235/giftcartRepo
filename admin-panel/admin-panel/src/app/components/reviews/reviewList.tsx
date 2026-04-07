"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";

interface ReviewListProps {
  reviews: any[];
  loading: boolean;
}

export default function ReviewList({ reviews, loading }: ReviewListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const userName = review.user?.name?.toLowerCase() || "";
        const userEmail = review.user?.email?.toLowerCase() || "";
        const productName = review.product?.name?.toLowerCase() || "";
        const comment = review.comment?.toLowerCase() || "";
        return (
          userName.includes(normalizedSearch) ||
          userEmail.includes(normalizedSearch) ||
          productName.includes(normalizedSearch) ||
          comment.includes(normalizedSearch)
        );
      }),
    [normalizedSearch, reviews]
  );

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / 10));
  const pageReviews = filteredReviews.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[420px]">
      <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by user, product or review..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : filteredReviews.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No reviews found.</div>
      ) : (
        <div className="overflow-x-auto min-h-[420px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                <th className="px-6 py-4 w-[22%]">Customer</th>
                <th className="px-6 py-4 w-[18%]">Product</th>
                <th className="px-6 py-4 w-[14%]">Rating</th>
                <th className="px-6 py-4 w-[26%]">Review</th>
                <th className="px-6 py-4 w-[10%]">Images</th>
                <th className="px-6 py-4 w-[10%]">Status</th>
                <th className="px-6 py-4 w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {pageReviews.map((review) => (
                <tr key={review._id} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-foreground truncate">{review.user?.name || "Unknown"}</div>
                    <div className="text-xs text-slate-400 truncate">{review.user?.email}</div>
                    <div className="text-xs text-slate-400 truncate">{review.user?.city}, {review.user?.state}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-semibold text-foreground truncate">{review.product?.name || "Product"}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {review.rating?.toFixed(1)} ★
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 overflow-hidden overflow-ellipsis max-w-[220px] break-words">
                    {review.comment || "-"}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {review.images?.length || 0}
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${review.adminReply?.message ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {review.adminReply?.message ? "Replied" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <Link href={`/reviews/${review._id}`} className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredReviews.length} Reviews</div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
