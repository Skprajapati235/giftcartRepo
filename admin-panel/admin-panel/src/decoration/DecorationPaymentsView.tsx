"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowRight,
  MapPin,
  Search,
  X,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

export default function DecorationPaymentsView() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "paid" | "cod" | "pending" | "dropped">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await service.getDecorationBookings({ limit: 200 });
      if (res?.success) {
        setBookings(res.bookings || res.data || []);
      }
    } catch (err) {
      console.error("Error loading payment data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Telemetry Metrics
  const paidOnline = bookings.filter((b) => b.paymentStatus === "Paid" && b.paymentMethod === "Online");
  const payOnSetupCOD = bookings.filter((b) => b.paymentMethod === "COD" && b.status !== "Cancelled");
  const paymentPending = bookings.filter(
    (b) => b.paymentStatus === "Pending" && b.status !== "Cancelled" && b.paymentMethod !== "COD"
  );
  const droppedCancelled = bookings.filter((b) => b.status === "Cancelled" || b.paymentStatus === "Failed");

  const totalPaidAmount = paidOnline.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalCODAmount = payOnSetupCOD.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalPendingAmount = paymentPending.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalDroppedAmount = droppedCancelled.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const totalInquiries = bookings.length;
  const confirmedCount = paidOnline.length + payOnSetupCOD.length;
  const conversionRate = totalInquiries > 0 ? Math.round((confirmedCount / totalInquiries) * 100) : 0;

  // Filtered list
  const displayList = bookings.filter((b) => {
    if (filterType === "paid" && b.paymentStatus !== "Paid") return false;
    if (filterType === "cod" && (b.paymentMethod !== "COD" || b.status === "Cancelled")) return false;
    if (filterType === "pending" && (b.paymentStatus !== "Pending" || b.status === "Cancelled")) return false;
    if (filterType === "dropped" && b.status !== "Cancelled" && b.paymentStatus !== "Failed") return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchPhone = b.customerPhone?.includes(q);
      const matchId = b.bookingId?.toLowerCase().includes(q);
      const matchVenue = (b.hotelName || b.venueAddress)?.toLowerCase().includes(q);
      const matchPkg = b.packageTitle?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId && !matchVenue && !matchPkg) return false;
    }
    return true;
  });

  const getRecoveryWhatsApp = (b: any) => {
    const text = `Namaste ${b.customerName || "ji"}, 
We noticed your Faridabad hotel room / party decoration booking for *${b.hotelName || b.venueAddress || "Faridabad venue"}* on *${b.setupDate}* was not finalized. 

Would you like our Faridabad coordinator to confirm your setup slot right now with *Pay on Setup / Cash on Delivery* (Zero advance required)? 

Please reply to lock your decorator slot!`;
    return `https://wa.me/91${(b.customerWhatsapp || b.customerPhone)?.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 dark:bg-pink-900/40 px-2.5 py-0.5 rounded-full">
            Faridabad Telemetry Funnel
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
            Payment Telemetry & Retention Tracking
          </h2>
          <p className="text-xs text-gray-500">
            Track payments received, pay-on-setup orders, and 1-click WhatsApp recovery for dropped inquiries.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-600 hover:bg-gray-200"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 4 TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Paid Online */}
        <div
          onClick={() => setFilterType("paid")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === "paid"
              ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
              : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-green-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === "paid" ? "text-white/80" : "text-gray-500"
              }`}
            >
              Paid Online (UPI / Card)
            </span>
            <CheckCircle2
              className={`w-5 h-5 ${filterType === "paid" ? "text-white" : "text-green-500"}`}
            />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">₹{totalPaidAmount.toLocaleString("en-IN")}</div>
            <span
              className={`text-xs font-semibold ${
                filterType === "paid" ? "text-white/90" : "text-green-600 font-bold"
              }`}
            >
              {paidOnline.length} Bookings Settled
            </span>
          </div>
        </div>

        {/* 2. Pay on Setup (COD) */}
        <div
          onClick={() => setFilterType("cod")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === "cod"
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === "cod" ? "text-white/80" : "text-gray-500"
              }`}
            >
              Pay on Setup (COD)
            </span>
            <DollarSign
              className={`w-5 h-5 ${filterType === "cod" ? "text-white" : "text-blue-500"}`}
            />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">₹{totalCODAmount.toLocaleString("en-IN")}</div>
            <span
              className={`text-xs font-semibold ${
                filterType === "cod" ? "text-white/90" : "text-blue-600 font-bold"
              }`}
            >
              {payOnSetupCOD.length} Collect on Delivery
            </span>
          </div>
        </div>

        {/* 3. Payment Pending */}
        <div
          onClick={() => setFilterType("pending")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === "pending"
              ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
              : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === "pending" ? "text-white/80" : "text-gray-500"
              }`}
            >
              Pending Authorization
            </span>
            <Clock
              className={`w-5 h-5 ${filterType === "pending" ? "text-white" : "text-amber-500"}`}
            />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">₹{totalPendingAmount.toLocaleString("en-IN")}</div>
            <span
              className={`text-xs font-semibold ${
                filterType === "pending" ? "text-white/90" : "text-amber-600 font-bold"
              }`}
            >
              {paymentPending.length} Awaiting Confirmation
            </span>
          </div>
        </div>

        {/* 4. Drop-offs & Cancelled */}
        <div
          onClick={() => setFilterType("dropped")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === "dropped"
              ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-500/20"
              : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                filterType === "dropped" ? "text-white/80" : "text-gray-500"
              }`}
            >
              Dropped / Cancelled
            </span>
            <XCircle
              className={`w-5 h-5 ${filterType === "dropped" ? "text-white" : "text-rose-500"}`}
            />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black">₹{totalDroppedAmount.toLocaleString("en-IN")}</div>
            <span
              className={`text-xs font-semibold ${
                filterType === "dropped" ? "text-white/90" : "text-rose-600 font-bold"
              }`}
            >
              {droppedCancelled.length} Lost / Dropped Orders
            </span>
          </div>
        </div>
      </div>

      {/* FILTER ACTIVE PILL BAR & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search payments by customer, hotel, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 focus:outline-none shadow-xs transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-2">
            <span>Filter:</span>
            <span className="capitalize px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300">
              {filterType} ({displayList.length})
            </span>
            {filterType !== "all" && (
              <button onClick={() => setFilterType("all")} className="text-pink-600 underline">
                Show All
              </button>
            )}
          </div>

          <div>
            <span>Conversion: </span>
            <strong className="text-green-600">{conversionRate}%</strong>
          </div>
        </div>
      </div>

      {/* DETAILED ORDERS LIST WITH 1-CLICK WHATSAPP RECOVERY */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-500">No records found for the selected payment filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-pink-600">{b.bookingId}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {b.packageTitle}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600">
                    {b.venueType}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-3">
                  <span>
                    👤 {b.customerName} ({b.customerPhone})
                  </span>
                  <span>📍 {b.hotelName || b.venueAddress || "Faridabad"}</span>
                  <span>📅 {b.setupDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <div className="text-sm font-black text-gray-900 dark:text-white">
                    ₹{b.totalAmount}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      b.paymentStatus === "Paid"
                        ? "text-green-600"
                        : b.paymentMethod === "COD"
                        ? "text-blue-600"
                        : "text-rose-500"
                    }`}
                  >
                    {b.paymentMethod} • {b.paymentStatus}
                  </span>
                </div>

                {/* 1-Click WhatsApp Recovery Ping for Drop-offs */}
                {(b.status === "Cancelled" || b.paymentStatus !== "Paid") && (
                  <a
                    href={getRecoveryWhatsApp(b)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                    title="Send WhatsApp recovery offer with COD"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Recover Order</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
