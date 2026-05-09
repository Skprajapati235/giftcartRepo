"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderDetail } from "../../services/adminService";
import { useTheme } from "../../context/ThemeContext";
import { RowSkeleton } from "../skeletonLoader/commonSkeleton";

interface OrderItem {
  product: { image: string; name: string };
  name: string;
  quantity: number;
  price: number;
  salePrice?: number;
  discount?: number;
  tax?: number;
  shippingCost?: number;
  itemTotal?: number;
  deliveryTime?: string;
  expectedDeliveryDate?: string;
  selectedVariant?: string;
  isEggless?: boolean;
}

interface OrderDetailData {
  _id: string;
  user: { name: string; email: string; mobileNumber?: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address?: string;
    houseNo?: string;
    street?: string;
    landmark?: string;
    pinCode: string;
  };
  items: OrderItem[];
  createdAt: string;
  whatsappLogs?: Array<{
    event?: string;
    to?: string;
    sid?: string;
    success?: boolean;
    skipped?: boolean;
    reason?: string;
    error?: { code?: number; message?: string };
    createdAt?: string;
  }>;
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

  // ─── Price Breakdown computed from items ───────────────────────────────────
  const itemsBreakdown = order.items.map((item) => {
    const qty = Number(item.quantity || 1);
    const unitPrice = Number(item.salePrice ?? item.price ?? 0);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    const shipping = Number(item.shippingCost || 0);
    const discounted = unitPrice * (1 - discount / 100);
    const taxAmt = discounted * (tax / 100);
    const total = item.itemTotal ?? Number(((discounted + taxAmt + shipping) * qty).toFixed(2));
    return { qty, unitPrice, discount, tax, shipping, discounted, taxAmt, total };
  });

  const subtotal = itemsBreakdown.reduce((s, b) => s + b.unitPrice * b.qty, 0);
  const totalDiscount = itemsBreakdown.reduce((s, b) => s + (b.unitPrice - b.discounted) * b.qty, 0);
  const totalTax = itemsBreakdown.reduce((s, b) => s + b.taxAmt * b.qty, 0);
  const totalShipping = itemsBreakdown.reduce((s, b) => s + b.shipping * b.qty, 0);
  const couponDiscount = Number(order.discountAmount || 0);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Home</span>
            <span>›</span>
            <span>Orders</span>
            <span>›</span>
            <span className="font-mono text-slate-700">#{order._id.slice(-8).toUpperCase()}</span>
            <span className={`ml-2 rounded-lg px-3 py-1 text-xs font-bold text-white ${
              order.status === 'Delivered' ? 'bg-green-600' :
              order.status === 'Cancelled' ? 'bg-red-600' :
              order.status === 'Shipped' ? 'bg-orange-500' :
              order.status === 'Processing' ? 'bg-blue-600' : 'bg-amber-500'
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

          {/* ── Order Items ── */}
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <h2 className="mb-6 text-lg font-bold">
              Order Items <span className="ml-2 text-sm font-normal text-slate-400">({order.items.length} items)</span>
            </h2>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, i) => {
                const b = itemsBreakdown[i];
                return (
                  <div key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>

                      {/* Variant + Eggless + Flavor badges */}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {item.isEggless && (
                          <span className="inline-flex items-center bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight">
                            Eggless
                          </span>
                        )}
                        {item.flavor && (
                          <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight">
                            {item.flavor}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500">
                        <span>Qty: <strong className="text-slate-700">{item.quantity}</strong></span>
                        <span>Unit Price: <strong className="text-slate-700">₹{b.unitPrice.toFixed(2)}</strong></span>
                        {b.discount > 0 && <span className="text-emerald-600">Discount: {b.discount}%</span>}
                        {b.tax > 0 && <span>Tax: {b.tax}%</span>}
                        {b.shipping > 0 && <span>Shipping: ₹{b.shipping}</span>}
                        {item.expectedDeliveryDate && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Delivers: {item.expectedDeliveryDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-slate-900">₹{b.total.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Item Total</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Payment Info ── */}
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Payment Breakdown</h2>
              <span className={`rounded-lg px-3 py-1 text-xs font-bold text-white ${
                order.paymentStatus === 'Success' ? 'bg-green-600' :
                order.paymentStatus === 'Failed' ? 'bg-red-600' : 'bg-amber-500'
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal ({order.items.length} items)</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Product Discount</span>
                  <span className="font-semibold text-emerald-600">-₹{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              {totalTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-semibold">+₹{totalTax.toFixed(2)}</span>
                </div>
              )}
              {totalShipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-semibold">+₹{totalShipping.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600">Coupon {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-semibold text-pink-600">-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-4 mt-2">
                <span className="text-lg font-bold">Grand Total</span>
                <span className="text-lg font-black text-pink-600">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                  order.paymentMethod === 'COD' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {order.paymentMethod || 'Online'}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* ── Order Info ── */}
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <h2 className="mb-6 text-lg font-bold border-b border-slate-100 pb-4">Order Info</h2>

            <div className="mb-6">
              <h4 className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="font-bold">{order.user?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Email</span>
                  <span className="font-bold text-xs truncate max-w-[150px]">{order.user?.email}</span>
                </div>
                {order.user?.mobileNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-bold">{order.user.mobileNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mb-6">
              <h4 className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Shipping Address</h4>
              <div className="space-y-2 text-sm">
                <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
                <p className="text-slate-600">
                  {order.shippingAddress.houseNo || ''} {order.shippingAddress.street || order.shippingAddress.address || ''}
                  {order.shippingAddress.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}
                </p>
                <p className="text-slate-600">PIN: <strong>{order.shippingAddress.pinCode}</strong></p>
                <p className="text-slate-600">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Order Date</h4>
              <p className="text-sm font-bold text-slate-700">
                {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </section>

          {/* ── WhatsApp Logs ── */}
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <h2 className="mb-6 text-lg font-bold border-b border-slate-100 pb-4">WhatsApp Status</h2>
            {Array.isArray(order.whatsappLogs) && order.whatsappLogs.length ? (
              <div className="space-y-3">
                {order.whatsappLogs.slice(-8).reverse().map((log, idx) => {
                  const ok = log.success;
                  const skipped = log.skipped;
                  const label = ok ? "Sent" : skipped ? "Skipped" : "Failed";
                  const cls = ok ? "bg-emerald-50 text-emerald-700" : skipped ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-700";
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-bold truncate">{log.event || "event"}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {log.to || "—"} {log.sid ? `• SID: ${log.sid}` : ""}
                        </div>
                        {!ok && !skipped && log.error?.message && (
                          <div className="text-[11px] text-red-600 font-semibold truncate">
                            {log.error.code ? `[${log.error.code}] ` : ""}{log.error.message}
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 ${cls}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500">No WhatsApp attempts logged yet.</div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
