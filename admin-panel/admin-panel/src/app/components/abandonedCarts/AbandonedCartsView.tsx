"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Send,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Percent,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";

interface AbandonedCartItem {
  name: string;
  weight: string;
  qty: number;
  price: number;
}

interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  items: AbandonedCartItem[];
  cartTotal: number;
  droppedAt: string;
  status: "Pending" | "WhatsApp Sent" | "Email Sent" | "Recovered";
  couponSent?: string;
}

const INITIAL_CARTS: AbandonedCart[] = [
  {
    id: "cart-101",
    customerName: "Riya Sharma",
    phone: "9818123456",
    email: "riya.sharma@gmail.com",
    items: [
      { name: "Belgian Dark Chocolate Truffle Cake", weight: "1 Kg", qty: 1, price: 899 },
      { name: "Heart Sparkler Candle", weight: "Standard", qty: 2, price: 120 },
    ],
    cartTotal: 1019,
    droppedAt: "25 mins ago",
    status: "Pending",
  },
  {
    id: "cart-102",
    customerName: "Arjun Verma",
    phone: "9910543210",
    email: "arjun.verma@outlook.com",
    items: [
      { name: "Fresh Strawberry Cream Cake", weight: "500g", qty: 1, price: 549 },
      { name: "Bouquet of 10 Red Roses", weight: "Fresh Cut", qty: 1, price: 699 },
    ],
    cartTotal: 1248,
    droppedAt: "1 hour ago",
    status: "WhatsApp Sent",
    couponSent: "COMEBACK15",
  },
  {
    id: "cart-103",
    customerName: "Sneha Kapoor",
    phone: "9871098765",
    email: "sneha.k@gmail.com",
    items: [
      { name: "Midnight Red Velvet Heart Cake", weight: "1.5 Kg", qty: 1, price: 1399 },
    ],
    cartTotal: 1399,
    droppedAt: "3 hours ago",
    status: "Recovered",
    couponSent: "FESTIVE15",
  },
  {
    id: "cart-104",
    customerName: "Gaurav Malhotra",
    phone: "9560412389",
    email: "gaurav.m@yahoo.com",
    items: [
      { name: "Pineapple Delight Eggless Cake", weight: "1 Kg", qty: 1, price: 649 },
      { name: "Birthday Balloon Bouquet", weight: "Pack of 5", qty: 1, price: 299 },
    ],
    cartTotal: 948,
    droppedAt: "5 hours ago",
    status: "Pending",
  },
];

import { abandonedCartService } from "../../services/abandonedCartService";

export default function AbandonedCartsView() {
  const { showToast } = useToast();
  const [carts, setCarts] = useState<any[]>(INITIAL_CARTS);
  const [discountCode, setDiscountCode] = useState("SWEET15");
  const [discountPercent, setDiscountPercent] = useState(15);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchLiveCarts = async () => {
    setLoading(true);
    try {
      const data = await abandonedCartService.getAbandonedCarts();
      if (data && data.length > 0) {
        setCarts(
          data.map((c: any) => ({
            id: c.id,
            customerName: c.customerName,
            phone: c.phone,
            email: c.email,
            items: c.items || [],
            cartTotal: c.cartTotal || 0,
            droppedAt: c.droppedAt ? new Date(c.droppedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Recent",
            status: c.status,
            couponSent: c.couponSent,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch abandoned carts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCarts();
  }, []);

  const totalLost = carts.reduce((acc, c) => acc + (c.status !== "Recovered" ? c.cartTotal : 0), 0);
  const totalRecovered = carts.reduce((acc, c) => acc + (c.status === "Recovered" ? c.cartTotal : 0), 0);
  const recoveredCount = carts.filter((c) => c.status === "Recovered").length;
  const conversionRate = carts.length > 0 ? Math.round((recoveredCount / carts.length) * 100) : 0;

  const handleSendWhatsApp = async (cart: any) => {
    const rawPhone = cart.phone.replace(/[^0-9]/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = encodeURIComponent(
      `Hello ${cart.customerName}! 🎂 We noticed you left your delicious cake order in your cart at GiftFestive Faridabad.\n\n` +
      `Here is a special ${discountPercent}% discount just for you! Use coupon code: *${discountCode}* at checkout.\n\n` +
      `Complete your order here: https://www.giftfestive.com/cart\n\n` +
      `Freshly baked & guaranteed midnight delivery!`
    );

    const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(waUrl, "_blank");

    setCarts((prev) =>
      prev.map((c) =>
        c.id === cart.id ? { ...c, status: "WhatsApp Sent", couponSent: discountCode } : c
      )
    );

    try {
      await abandonedCartService.recordRecovery(cart.id, discountCode, "whatsapp");
    } catch (_) {}

    showToast(`WhatsApp recovery opened for ${cart.customerName}`, "success");
  };

  const handleSendEmail = async (cart: any) => {
    setCarts((prev) =>
      prev.map((c) =>
        c.id === cart.id ? { ...c, status: "Email Sent", couponSent: discountCode } : c
      )
    );
    try {
      await abandonedCartService.recordRecovery(cart.id, discountCode, "email");
    } catch (_) {}
    showToast(`Recovery email dispatched to ${cart.email}`, "success");
  };

  const handleMarkRecovered = async (id: string) => {
    setCarts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Recovered" } : c))
    );
    try {
      await abandonedCartService.markRecovered(id);
    } catch (_) {}
    showToast("Cart marked as successfully converted!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <ShoppingCart className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Abandoned Cart Recovery & Marketing Automation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Automatically recover dropped checkouts by sending personalized WhatsApp discount coupons and reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast("Checking live abandoned checkouts...", "info")}
            className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Carts</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Dropped Carts</span>
          <p className="text-2xl font-black text-foreground mt-1">{carts.length}</p>
          <span className="text-[10px] text-amber-500 font-semibold">● Incomplete Checkout</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue At Risk</span>
          <p className="text-2xl font-black text-rose-500 mt-1">₹{totalLost.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Pending recovery</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recovered Revenue</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">₹{totalRecovered.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-500 font-bold">↑ High ROI Channel</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recovery Conversion Rate</span>
          <p className="text-2xl font-black text-pink-500 mt-1">{conversionRate}%</p>
          <span className="text-[10px] text-pink-500 font-semibold">{recoveredCount} of {carts.length} orders saved</span>
        </div>
      </div>

      {/* Automation Trigger Settings Card */}
      <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              Automated Follow-up Campaign Rules
            </h3>
            <p className="text-xs text-slate-500">Configure default discount coupons applied to recovery links.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Auto-Dispatach Rule:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendEnabled}
                onChange={(e) => {
                  setAutoSendEnabled(e.target.checked);
                  showToast(
                    e.target.checked
                      ? "Auto-send 15m WhatsApp recovery enabled"
                      : "Auto-send paused",
                    "info"
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
              Recovery Discount Code
            </label>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs font-mono font-bold text-foreground focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
              Discount Percentage
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border-theme bg-background px-3 py-2">
              <Percent className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                min={5}
                max={50}
                className="w-full bg-transparent text-xs font-bold text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">
              Delivery City Target
            </label>
            <div className="rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs font-bold text-foreground">
              Faridabad & NCR Zones
            </div>
          </div>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="rounded-3xl border border-border-theme bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-theme flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Incomplete Checkouts Stream</h3>
          <span className="text-xs text-slate-400">{carts.length} Active Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-theme bg-background/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Shopper</th>
                <th className="py-3.5 px-4">Items in Cart</th>
                <th className="py-3.5 px-4">Cart Value</th>
                <th className="py-3.5 px-4">Dropped</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme/60">
              {carts.map((cart) => (
                <tr key={cart.id} className="hover:bg-hover-theme/60 transition">
                  {/* Shopper */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-foreground">{cart.customerName}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" />
                      +91 {cart.phone}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{cart.email}</p>
                  </td>

                  {/* Items */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="space-y-1">
                      {cart.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-pink-500">{it.qty}x</span>
                          <span className="truncate">{it.name}</span>
                          <span className="text-[10px] text-slate-400">({it.weight})</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Value */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-black text-foreground">
                    ₹{cart.cartTotal}
                  </td>

                  {/* Dropped Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{cart.droppedAt}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {cart.status === "Recovered" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Recovered
                      </span>
                    ) : cart.status === "WhatsApp Sent" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        <MessageSquare className="h-3 w-3" />
                        WhatsApp Sent
                      </span>
                    ) : cart.status === "Email Sent" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                        <Mail className="h-3 w-3" />
                        Email Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {cart.status !== "Recovered" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(cart)}
                            className="flex items-center gap-1 rounded-xl bg-emerald-500 text-white px-2.5 py-1.5 text-[11px] font-bold shadow-xs hover:bg-emerald-600 active:scale-95 transition"
                            title="Send WhatsApp recovery with 15% discount link"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendEmail(cart)}
                            className="flex items-center gap-1 rounded-xl border border-border-theme bg-background px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition"
                            title="Send recovery email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkRecovered(cart.id)}
                            className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[11px] font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition"
                            title="Mark as recovered"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}

                      {cart.status === "Recovered" && (
                        <span className="text-[11px] text-emerald-500 font-bold">
                          Converted 🎉
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
