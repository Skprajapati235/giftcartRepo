"use client";

import LeadView from "../components/leads";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function LeadsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
            Insight &gt; Leads
          </p>
        </div>
        <LeadView />
      </AdminMain>
    </ProtectedRoute>
  );
}
