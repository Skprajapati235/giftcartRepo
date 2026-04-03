"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderDetail } from "../../services/adminService";
import { useTheme } from "../../context/ThemeContext";
import { RowSkeleton } from "../skeletonLoader/commonSkeleton";

interface OrderDetailData {
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
  items: Array<{ 
    product: { image: string, name: string },
    name: string, 
    quantity: number, 
    price: number 
  }>;
  createdAt: string;
}

export default function OrderDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await getOrderDetail(id as string);
        setOrder(res);
      } catch (err) {
        console.error("Fetch order detail error", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrderDetail();
  }, [id]);

  const pageWrapper = theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";

  if (loading) return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
          <div className="h-7 w-48 rounded-xl bg-slate-200 dark:bg-slate-700 skeleton-shimmer" />
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-border-theme bg-card p-6 shadow-sm">
            <div className="h-5 w-32 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer mb-6" />
            <RowSkeleton rows={4} />
          </div>
          <div className="rounded-2xl border border-border-theme bg-card p-6 shadow-sm">
            <div className="h-5 w-32 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer mb-6" />
            <RowSkeleton rows={4} />
          </div>
        </div>
        <div className="rounded-2xl border border-border-theme bg-card p-6 shadow-sm h-fit">
          <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-700 skeleton-shimmer mb-6" />
          <RowSkeleton rows={6} />
        </div>
      </div>
    </>
  );

  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Home</span>
            <span>›</span>
            <span>Order Details</span>
            <span>›</span>
            <span className="font-mono">{order._id}</span>
            <span className={`ml-2 rounded-lg px-3 py-1 text-xs font-bold text-white ${
              order.status === 'Pending' ? 'bg-red-600' : 'bg-green-600'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <h2 className="mb-6 text-lg font-bold">Item ({order.items.length})</h2>
            <div className="space-y-6">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Products</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                           <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{order._id}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">Total Item : {item.quantity}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-lg font-bold">Payment Info</h2>
               <span className={`rounded-lg px-3 py-1 text-xs font-bold text-white ${
                  order.paymentStatus === 'Pending' ? 'bg-red-600' : 'bg-green-600'
               }`}>
                  {order.paymentStatus}
               </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Item</span>
                  <span className="font-semibold">₹ {order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-semibold">₹ 0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold">₹ 0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-semibold">₹ 0</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between border-t border-slate-100 pt-6">
                 <span className="text-lg font-bold">Total</span>
                 <span className="text-lg font-bold">₹ {order.totalAmount}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <h2 className="mb-6 text-lg font-bold border-b border-slate-100 pb-4">Order info</h2>
            
            <div className="mb-8">
              <h4 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Contact Details</h4>
              <div className="flex justify-between items-center text-sm mb-3">
                 <span className="text-slate-400">Name</span>
                 <span className="font-bold">{order.user?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400">Email</span>
                 <span className="font-bold">{order.user?.email}</span>
              </div>
            </div>

            <div className="mb-8 border-t border-slate-100 pt-6">
              <h4 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Payment methods</h4>
              <div className="flex items-center gap-2">
                 <span className="font-bold italic text-indigo-700">▲Razorpay</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-tight dark:text-white">Shipping address</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="font-bold">{order.shippingAddress.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Address</span>
                  <span className="font-bold text-right">{order.shippingAddress.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pin Code</span>
                  <span className="font-bold">{order.shippingAddress.pinCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-bold">{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
