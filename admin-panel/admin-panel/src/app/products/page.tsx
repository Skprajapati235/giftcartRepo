"use client";

import ProductView from "../components/product";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
            Catalog Management
          </p>
        </div>
        <ProductView />
      </AdminMain>
    </ProtectedRoute>
  );
}
