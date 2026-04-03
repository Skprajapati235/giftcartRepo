"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import { getAllOrders, getOrderPayments } from "../services/adminService";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAdmin } from "../context/AdminContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import GlobalLoader from "../components/GlobalLoaders/GlobalLoader";

interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    pinCode: string;
  };
  items: Array<{ name: string; quantity: number; price: number }>;
  createdAt: string;
}

interface Payment {
  _id: string;
  razorpayPaymentId: string;
  totalAmount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { products, users, loading: adminLoading } = useAdmin();
  const { theme } = useTheme();
  const { token, authenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!authenticated || !token) return;
    try {
      const [ordRes, payRes] = await Promise.all([
        getAllOrders(),
        getOrderPayments()
      ]);
      setOrders(ordRes);
      setPayments(payRes);
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && token) {
      fetchData();
    }
  }, [authenticated, token]);

  const totalRevenue = payments.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pageWrapper = "bg-background text-foreground";
  const sectionWrapper = "bg-card shadow-lg border border-transparent dark:border-border-theme";

  return (
    <ProtectedRoute>
      <main className={`flex-1 p-10 ${pageWrapper}`}>
        <div className="mb-8 items-end justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
        </div>

        {(loading || adminLoading) ? (
          <div className="py-20 text-center"><GlobalLoader /></div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} subtitle="Successful payments" />
              <Card title="Orders" value={orders.length} subtitle="Orders placed" />
              <Card title="Products" value={products.length} subtitle="Active listings" />
              <Card title="Users" value={users.length} subtitle="Customers" />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              {/* Recent Orders */}
              <section className={`rounded-3xl p-6 shadow-sm ${sectionWrapper}`}>
                <h3 className="mb-4 text-lg font-bold">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id} className="border-t border-border-theme/50 last:border-0 hover:bg-hover-theme/30 transition-colors">
                          <td className="py-4 font-medium uppercase font-mono">{order._id.slice(-6)}</td>
                          <td className="py-4">{order.user?.name}</td>
                          <td className="py-4 font-semibold text-pink-600">₹{order.totalAmount}</td>
                          <td className="py-4 text-right">
                            <Link
                              href={`/orders/${order._id}`}
                              className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-indigo-400"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Recent Payments */}
              <section className={`rounded-3xl p-6 shadow-sm ${sectionWrapper}`}>
                <h3 className="mb-4 text-lg font-bold">Recent Payments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="pb-3">Payment ID</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 5).map((pay) => (
                        <tr key={pay._id} className="border-t border-border-theme/50 last:border-0 hover:bg-hover-theme/30 transition-colors">
                          <td className="py-4 font-mono text-xs">{pay.razorpayPaymentId}</td>
                          <td className="py-4 font-bold text-green-600">₹{pay.totalAmount}</td>
                          <td className="py-4 text-slate-500">{new Date(pay.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}


