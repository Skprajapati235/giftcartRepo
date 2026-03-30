"use client";

import Card from "../components/Card";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAdmin } from "../context/AdminContext";

export default function DashboardPage() {
  const { products, categories, users, loading, error } = useAdmin();

  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
              {/* <h1 className="mt-2 text-3xl font-semibold">Store overview</h1>
              <p className="mt-2 text-sm text-slate-600">Live data from your API and inventory.</p> */}
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-rose-50 p-8 text-rose-700 shadow-sm dark:bg-rose-950 dark:text-rose-200">
              {error}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-3">
                <Card title="Products" value={products.length} subtitle="Total products in catalog" />
                <Card title="Categories" value={categories.length} subtitle="Active product categories" />
                <Card title="Users" value={users.length} subtitle="Registered users" />
              </div>

              <section className="mt-10 rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Latest products</h2>
                    <p className="mt-1 text-sm text-slate-600">Recently created items and inventory status.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-max border-separate border-spacing-y-3 text-left">
                    <thead>
                      <tr className="text-sm text-slate-500">
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Price</th>
                        <th className="px-3 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 5).map((product) => (
                        <tr key={product._id} className="rounded-3xl bg-slate-50 dark:bg-slate-800">
                          <td className="px-3 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</td>
                          <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {product.category?.name || "Unassigned"}
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-400">${product.price?.toFixed(2)}</td>
                          <td className="px-3 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
    </ProtectedRoute>
  );
}
