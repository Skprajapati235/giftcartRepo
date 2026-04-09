"use client";

import CouponView from "../components/coupons";
import ProtectedRoute from "../components/ProtectedRoute";

export default function CouponsPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-8 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Offer Management</p>
        </div>
        <CouponView />
      </main>
    </ProtectedRoute>
  );
}
