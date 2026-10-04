"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderDetail } from "../../services/adminService";
import { useTheme } from "../../context/ThemeContext";
import { RowSkeleton } from "../skeletonLoader/commonSkeleton";
import { AlertTriangle, CheckCircle2, XCircle, Clock, Truck, Sparkles, Gift, Heart, MessageSquare } from "lucide-react";
import { getRelativeTime, getDetailedElapsedTime, formatOrderDateTime } from "../../utils/timeAgo";

export interface AddonItem {
  _id?: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string;
  category?: string;
}

interface OrderItem {
  product: { image: string; name: string };
  name: string;
  quantity: number;
  price: number;
  salePrice?: number;
  discount?: number;
  tax?: number;
  discountAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  itemTotal?: number;
  deliveryTime?: string;
  expectedDeliveryDate?: string;
  selectedVariant?: string;
  isEggless?: boolean;
  flavor?: string;
  weight?: string;
  flowerCount?: string;
}

interface OrderDetailData {
  _id: string;
  user: { name: string; mobileNumber?: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  isPaymentAbandoned?: boolean;
  paymentCancelReason?: string;
  paymentAbandonedAt?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
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
  addons?: AddonItem[];
  messageOnCake?: string;
  cardMessage?: string;
  senderName?: string;
  recipientName?: string;
  deliverySlot?: {
    slotName?: string;
    slotType?: string;
    timeRange?: string;
    extraCharge?: number;
    deliveryDate?: string;
  };
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
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
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

  // ─── Price Breakdown — uses the EXACT amounts stored on the order at
  // checkout time (utils/priceCalculator.js on the backend), so this
  // screen can never disagree with what the customer actually paid.
  // Falls back to re-deriving them only for orders placed before these
  // fields existed.
  const itemsBreakdown = order.items.map((item) => {
    const qty = Number(item.quantity || 1);
    const unitPrice = Number(item.salePrice ?? item.price ?? 0);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    const shipping = Number(item.shippingCost || 0);
    const unitDiscount = unitPrice * (discount / 100);
    const unitTax = (unitPrice - unitDiscount) * (tax / 100);
    const discountAmt = item.discountAmount != null ? Number(item.discountAmount) : unitDiscount * qty;
    const taxAmt = item.taxAmount != null ? Number(item.taxAmount) : unitTax * qty;
    const total = item.itemTotal != null ? Number(item.itemTotal) : unitPrice * qty - discountAmt + taxAmt + shipping;
    return { qty, unitPrice, discount, tax, shipping, discountAmt, taxAmt, total };
  });

  const subtotal = itemsBreakdown.reduce((s, b) => s + b.unitPrice * b.qty, 0);
  const totalDiscount = itemsBreakdown.reduce((s, b) => s + b.discountAmt, 0);
  const totalTax = itemsBreakdown.reduce((s, b) => s + b.taxAmt, 0);
  // Shipping is a flat, one-time charge per cart line (not per unit).
  const totalShipping = itemsBreakdown.reduce((s, b) => s + b.shipping, 0);
  const couponDiscount = Number(order.discountAmount || 0);
  const addonsTotal = (order.addons || []).reduce(
    (acc, a) => acc + (Number(a.price || 0) * (Number(a.quantity) || 1)),
    0
  );

  const isOrderPaymentIncomplete = (order: OrderDetailData): boolean => {
    if (!order) return false;
    if (order.paymentMethod === 'COD') return false;
    if (order.paymentStatus === 'Success') return false;
    if (order.isPaymentAbandoned) return true;
    if (order.paymentStatus === 'Incomplete' || order.paymentStatus === 'Cancelled') return true;
    if (order.paymentStatus === 'Pending' && order.createdAt) {
      const diffMins = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
      if (diffMins > 15) return true;
    }
    return false;
  };

  const isIncomplete = isOrderPaymentIncomplete(order);
  const orderStatus = ({ Shipped: "Shipping", Preparing: "In Kitchen", OutForDelivery: "Out for Delivery" } as Record<string, string>)[order.status] || order.status;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Home</span>
            <span>›</span>
            <span>Orders</span>
            <span>›</span>
            <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">#{order._id.slice(-8).toUpperCase()}</span>
            <span className={`ml-1 rounded-lg px-3 py-1 text-xs font-bold text-white ${
              orderStatus === 'Delivered' ? 'bg-green-600' :
              orderStatus === 'Cancelled' ? 'bg-red-600' :
              orderStatus === 'Out for Delivery' ? 'bg-orange-500' :
              orderStatus === 'Shipping' ? 'bg-cyan-600' :
              orderStatus === 'In Kitchen' ? 'bg-teal-600' :
              orderStatus === 'Processing' ? 'bg-blue-600' :
              orderStatus === 'Packed' ? 'bg-purple-600' :
              orderStatus === 'Received' ? 'bg-indigo-600' : 'bg-amber-500'
            }`}>
              {orderStatus}
            </span>
            {isIncomplete && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-black text-rose-600 border border-rose-500/20">
                <AlertTriangle size={12} />
                User Backed Out
              </span>
            )}

            {/* Arrived Elapsed Time Badge */}
            {order.createdAt && (
              <div 
                className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 px-3 py-1 text-xs font-extrabold text-pink-600 dark:text-pink-400 shadow-xs"
                title={`Order arrival time: ${new Date(order.createdAt).toLocaleString('en-IN')}`}
              >
                <Clock size={13} className="text-pink-500 animate-pulse" />
                <span>Arrived: {getRelativeTime(order.createdAt)}</span>
                <span className="text-slate-400 font-medium hidden sm:inline">
                  • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </button>
      </div>

      {/* ── Abandoned / Incomplete Payment Banner ── */}
      {isIncomplete && (
        <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/80 dark:border-rose-500/25 dark:bg-rose-500/10 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-rose-500 p-2.5 text-white shrink-0 mt-0.5 shadow-sm shadow-rose-500/30">
              <AlertTriangle size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-rose-900 dark:text-rose-300 text-base">
                  ⚠️ Payment Not Completed — Customer Returned Without Paying
                </h3>
                <span className="rounded-lg bg-rose-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  User Backed Out
                </span>
              </div>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                The customer initiated this online order, but exited or backed out of the payment gateway without completing the payment.
                {order.paymentCancelReason && (
                  <span className="block mt-1 font-bold">Details: {order.paymentCancelReason}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

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
                        {item.weight && (
                          <span className="inline-flex items-center bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight">
                            {item.weight}
                          </span>
                        )}
                        {item.flowerCount && (
                          <span className="inline-flex items-center bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight">
                            {item.flowerCount}
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

          {/* ── Celebration Add-ons ── */}
          {order.addons && order.addons.length > 0 && (
            <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-theme">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Celebration Add-ons</h2>
                    <p className="text-xs text-slate-400">Extra party items & accessories requested with this order</p>
                  </div>
                </div>
                <span className="rounded-xl bg-pink-500/10 border border-pink-500/20 px-3 py-1 text-xs font-black text-pink-600 dark:text-pink-400">
                  {order.addons.length} Add-on{order.addons.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.addons.map((addon, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border-theme bg-background/50 hover:bg-hover-theme/60 transition"
                  >
                    <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border-theme overflow-hidden shrink-0 flex items-center justify-center relative">
                      {addon.image ? (
                        <img src={addon.image} alt={addon.name} className="h-full w-full object-cover" />
                      ) : (
                        <Gift className="h-6 w-6 text-pink-500" />
                      )}
                      {addon.quantity && addon.quantity > 1 && (
                        <span className="absolute bottom-1 right-1 bg-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          x{addon.quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{addon.name}</h4>
                      {addon.category && (
                        <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded">
                          {addon.category}
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="text-slate-400 font-medium">
                          Qty: <strong className="text-slate-700 dark:text-slate-300">{addon.quantity || 1}</strong>
                        </span>
                        <span className="font-black text-pink-600 dark:text-pink-400">
                          ₹{Number(addon.price || 0) * (Number(addon.quantity) || 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Custom Messages & Greetings ── */}
          {(order.messageOnCake || order.cardMessage || order.recipientName || order.senderName) && (
            <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-theme">
                <Heart className="h-5 w-5 text-rose-500" />
                <h2 className="text-lg font-bold text-foreground">Celebration Customization & Message</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.messageOnCake && (
                  <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1 flex items-center gap-1.5">
                      <span>🎂 Message on Cake</span>
                    </div>
                    <p className="text-sm font-black text-foreground italic">
                      "{order.messageOnCake}"
                    </p>
                  </div>
                )}

                {order.cardMessage && (
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1.5">
                      <span>💌 Greeting Card Message</span>
                    </div>
                    <p className="text-sm font-medium text-foreground italic">
                      "{order.cardMessage}"
                    </p>
                    {(order.senderName || order.recipientName) && (
                      <div className="mt-2 pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs text-slate-500">
                        {order.senderName && <span>From: <strong className="text-foreground">{order.senderName}</strong></span>}
                        {order.recipientName && <span>To: <strong className="text-foreground">{order.recipientName}</strong></span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Payment Info ── */}
          <section className={`rounded-2xl border p-6 shadow-sm ${cardBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Payment Breakdown</h2>
              {isIncomplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
                  <AlertTriangle size={13} />
                  User Returned (Unpaid)
                </span>
              ) : (
                <span className={`rounded-lg px-3 py-1 text-xs font-bold text-white ${
                  order.paymentStatus === 'Success' ? 'bg-green-600' :
                  order.paymentStatus === 'Failed' ? 'bg-red-600' : 'bg-amber-500'
                }`}>
                  {order.paymentStatus}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal ({order.items.length} items)</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1 font-medium">
                    <Sparkles size={13} className="text-pink-500" />
                    Celebration Add-ons ({order.addons?.length || 0} items)
                  </span>
                  <span className="font-semibold text-pink-600 dark:text-pink-400">+₹{addonsTotal.toFixed(2)}</span>
                </div>
              )}
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

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                  order.paymentMethod === 'COD' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {order.paymentMethod || 'Online'}
                </span>
              </div>
              {isIncomplete && (
                <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 mt-1">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    Payment Status:
                  </span>
                  <span>Incomplete • Customer Backed Out</span>
                </div>
              )}
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
                  <span className="text-slate-400">Phone</span>
                  <span className="font-bold">{order.user?.mobileNumber || "N/A"}</span>
                </div>
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

            {order.deliverySlot && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mb-6">
                <h4 className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Delivery Slot</h4>
                <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-700 dark:text-pink-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-wider text-[11px]">{order.deliverySlot.slotName || order.deliverySlot.slotType || "Slot"}</span>
                    {order.deliverySlot.extraCharge ? (
                      <span className="text-pink-600">+₹{order.deliverySlot.extraCharge}</span>
                    ) : null}
                  </div>
                  {order.deliverySlot.timeRange && (
                    <div className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={11} className="text-pink-500" />
                      <span>{order.deliverySlot.timeRange}</span>
                    </div>
                  )}
                  {order.deliverySlot.deliveryDate && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      Date: {order.deliverySlot.deliveryDate}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Arrived</h4>
                <span className="text-xs font-black text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-pink-500/20 shadow-xs">
                  <Clock size={12} className="text-pink-500 animate-pulse" />
                  {getRelativeTime(order.createdAt)}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {formatOrderDateTime(order.createdAt)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Order placed {getDetailedElapsedTime(order.createdAt)}
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
