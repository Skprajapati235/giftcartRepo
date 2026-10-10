"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import * as service from "@/app/services/adminService";

export default function DecorationFinancialsView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await service.getDecorationBookings({ limit: 200 });
      if (res?.success) {
        setBookings(res.bookings || res.data || []);
      }
    } catch (err) {
      console.error("Error loading financial ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const validBookings = bookings.filter((b) => b.status !== "Cancelled");
  const filteredBookings = validBookings.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      b.bookingId?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      (b.hotelName || b.venueAddress)?.toLowerCase().includes(q) ||
      b.packageTitle?.toLowerCase().includes(q)
    );
  });
  const totalRevenue = validBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalPayouts = validBookings.reduce((sum, b) => sum + (Number(b.decoratorPayout) || 0), 0);
  const netProfit = totalRevenue - totalPayouts;
  const overallMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const exportCSV = () => {
    const headers = [
      "Booking ID",
      "Date",
      "Customer",
      "City",
      "Package",
      "Venue Type",
      "Hotel / Address",
      "Customer Paid (INR)",
      "Decorator Payout (INR)",
      "Net Profit (INR)",
      "Payment Mode",
      "Status",
    ];

    const rows = validBookings.map((b) => {
      const price = Number(b.totalAmount) || 0;
      const payout = Number(b.decoratorPayout) || 0;
      const profit = price - payout;
      return [
        b.bookingId,
        b.setupDate,
        `"${b.customerName}"`,
        `"${b.city || "Faridabad"}"`,
        `"${b.packageTitle}"`,
        `"${b.venueType}"`,
        `"${b.hotelName || b.venueAddress}"`,
        price,
        payout,
        profit,
        b.paymentMethod,
        b.status,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `faridabad_decoration_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 dark:bg-pink-900/40 px-2.5 py-0.5 rounded-full">
            Commercials & Ledger
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
            Decoration Profit & Payouts Ledger (Faridabad)
          </h2>
          <p className="text-xs text-gray-500">
            Per-booking customer bill, decorator partner payout, and net platform profit ledger.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadLedger}
            className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Export Faridabad Ledger CSV</span>
          </button>
        </div>
      </div>

      {/* 3 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Customer Inflow
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Across {validBookings.length} completed & confirmed setups
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Decorator Payouts
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-purple-600">
            ₹{totalPayouts.toLocaleString("en-IN")}
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Disbursed to Faridabad local tie-up partners
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-950/40 shadow-sm bg-gradient-to-br from-emerald-500/5 to-transparent">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Net Platform Profit
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{netProfit.toLocaleString("en-IN")}
          </div>
          <span className="text-xs font-bold text-emerald-600 mt-1 block">
            {overallMargin}% Clean Platform Margin
          </span>
        </div>
      </div>

      {/* SEARCH BAR & SUMMARY */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ledger by booking ID, customer, hotel..."
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
        <div className="text-xs font-medium text-slate-400">
          Showing {filteredBookings.length} of {validBookings.length} entries
        </div>
      </div>

      {/* DETAILED LEDGER TABLE */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-500">No transactions match your search query.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 text-[10px] uppercase font-black tracking-wider text-gray-500">
                  <th className="py-4 px-5">Booking ID</th>
                  <th className="py-4 px-4">Setup Date</th>
                  <th className="py-4 px-4">Venue & Hotel</th>
                  <th className="py-4 px-4">Customer Paid</th>
                  <th className="py-4 px-4">Decorator Payout</th>
                  <th className="py-4 px-4">Net Platform Profit</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                {filteredBookings.map((b) => {
                  const customerPaid = Number(b.totalAmount) || 0;
                  const partnerPayout = Number(b.decoratorPayout) || 0;
                  const profit = customerPaid - partnerPayout;

                  return (
                    <tr
                      key={b._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-4 px-5 font-black text-pink-600">
                        {b.bookingId}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                        {b.setupDate}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">
                          {b.hotelName || b.venueAddress || "Faridabad"}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {b.venueType} • {b.city || "Faridabad"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                        ₹{customerPaid}
                      </td>
                      <td className="py-4 px-4 font-bold text-purple-600">
                        ₹{partnerPayout}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{profit}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
