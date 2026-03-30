"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";

const sampleOrders = [
  { id: "ORD-1001", customer: "Arun Kumar", total: 1299, status: "Delivered", date: "2025-03-12" },
  { id: "ORD-1002", customer: "Neha Sharma", total: 799, status: "Processing", date: "2025-03-13" },
  { id: "ORD-1003", customer: "Aisha Khan", total: 199, status: "Shipped", date: "2025-03-14" },
  { id: "ORD-1004", customer: "Ravi Patel", total: 149, status: "Delivered", date: "2025-03-15" },
  { id: "ORD-1005", customer: "Priya Singh", total: 999, status: "Cancelled", date: "2025-03-16" },
  { id: "ORD-1006", customer: "Sonia Rao", total: 249, status: "Processing", date: "2025-03-17" },
  { id: "ORD-1007", customer: "Manish Gupta", total: 549, status: "Shipped", date: "2025-03-18" },
  { id: "ORD-1008", customer: "Kiran Joshi", total: 699, status: "Delivered", date: "2025-03-19" },
  { id: "ORD-1009", customer: "Ritu Verma", total: 349, status: "Processing", date: "2025-03-20" },
  { id: "ORD-1010", customer: "Vikram Singh", total: 1199, status: "Shipped", date: "2025-03-21" },
  { id: "ORD-1011", customer: "Sonal Mehta", total: 459, status: "Delivered", date: "2025-03-22" },
  { id: "ORD-1012", customer: "Amit Joshi", total: 299, status: "Processing", date: "2025-03-23" },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredOrders = useMemo(
    () => sampleOrders.filter((order) =>
      order.id.toLowerCase().includes(normalizedSearch) ||
      order.customer.toLowerCase().includes(normalizedSearch) ||
      order.status.toLowerCase().includes(normalizedSearch)
    ),
    [normalizedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / 10));
  const pageOrders = filteredOrders.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <Sidebar />
        <main className="flex-1 p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Orders</p>
              {/* <h1 className="mt-2 text-3xl font-semibold">Order management</h1>
              <p className="mt-2 text-sm text-slate-600">Review recent orders and track status.</p> */}
            </div>
          </div>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Order list</h2>
                <p className="mt-1 text-sm text-slate-600">Search orders by id, customer or status.</p>
              </div>
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search orders"
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>

            {pageOrders.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3">Order ID</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100">
                        <td className="px-3 py-4 font-medium text-slate-900">{order.id}</td>
                        <td className="px-3 py-4 text-slate-600">{order.customer}</td>
                        <td className="px-3 py-4 text-slate-600">${order.total.toFixed(2)}</td>
                        <td className="px-3 py-4 text-slate-600">{order.status}</td>
                        <td className="px-3 py-4 text-slate-600">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
