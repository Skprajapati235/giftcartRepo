"use client";

import CrmView from "../components/crm";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function CrmPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
            Insight &gt; CRM Contacts
          </p>
        </div>
        <CrmView />
      </AdminMain>
    </ProtectedRoute>
  );
}
