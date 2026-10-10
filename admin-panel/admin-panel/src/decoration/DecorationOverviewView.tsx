"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  Users,
  RefreshCw,
  ArrowRight,
  Store,
  Layers,
  Camera,
} from "lucide-react";
import * as service from "@/app/services/adminService";

export default function DecorationOverviewView() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await service.getDecorationAnalytics();
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Error loading decoration analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-pink-600 animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Calculating Faridabad Decoration Financials & Telemetry...
        </p>
      </div>
    );
  }

  const {
    totalBookings = 0,
    totalRevenue = 0,
    totalPayouts = 0,
    netProfit = 0,
    profitMargin = 0,
    todayCount = 0,
    statusCounts = {},
    venueCounts = {},
    upcomingSetups = [],
  } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOP FINANCIAL KPI TILES ("Kamai Breakdown") */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Gross Booking Sales
            </span>
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              ₹{Number(totalRevenue).toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-green-600 font-bold">
              <span>↑ Active Bookings:</span>
              <span className="text-gray-500 dark:text-gray-400 font-semibold">{totalBookings} Total</span>
            </div>
          </div>
        </div>

        {/* Decorator Payouts */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Decorator Partner Payouts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              ₹{Number(totalPayouts).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">
              Disbursed to Faridabad partners
            </p>
          </div>
        </div>

        {/* Net Platform Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-950/40 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Net Platform Profit
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{Number(netProfit).toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-bold">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {profitMargin}% Clean Margin
              </span>
            </div>
          </div>
        </div>

        {/* Today's Setups */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Live Setups
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {todayCount}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">
              In Faridabad Hotels & Venues
            </p>
          </div>
        </div>
      </div>

      {/* QUICK COMMAND SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/decoration-panel/bookings"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block group-hover:text-pink-600 transition">
                Live Bookings
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Work orders</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/decoration-panel/partners"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block group-hover:text-pink-600 transition">
                Tie-up Partners
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Faridabad local</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/decoration-panel/samples"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block group-hover:text-pink-600 transition">
                Showcase Gallery
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Real setup photos</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/decoration-panel/packages"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-gray-900 dark:text-white block group-hover:text-pink-600 transition">
                Packages Catalog
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Pricing & themes</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 2. UPCOMING DECORATION SETUPS (Faridabad Pipeline) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-pink-600" />
              Upcoming Scheduled Setups
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Earliest upcoming hotel room and venue surprise orders in Faridabad
            </p>
          </div>
          <Link
            href="/decoration-panel/bookings"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {upcomingSetups.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-500 font-semibold bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
            No pending setups scheduled for future dates right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSetups.map((bk: any) => (
              <div
                key={bk._id}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 space-y-3 hover:border-pink-300 dark:hover:border-pink-900/60 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-pink-600 dark:text-pink-400">
                    {bk.bookingId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300">
                    {bk.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {bk.packageTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="line-clamp-1">
                      {bk.hotelName ? `Hotel: ${bk.hotelName}` : bk.venueType}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 text-xs flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span className="font-bold">📅 {bk.setupDate}</span>
                  <span className="font-semibold text-pink-600">⏱️ {bk.setupTimeSlot}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-gray-500 font-medium">Customer:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {bk.customerName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. VENUE TYPE & STATUS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-gray-900 dark:text-white">
            Booking Status Pipeline
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time status breakdown of active and completed orders
          </p>

          <div className="space-y-2.5 pt-2">
            {Object.entries(statusCounts).map(([status, count]: [string, any]) => (
              <div
                key={status}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 text-xs"
              >
                <span className="font-bold text-gray-800 dark:text-gray-200">{status}</span>
                <span className="px-2.5 py-1 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-black">
                  {count} bookings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-black text-gray-900 dark:text-white">
            Venue & Setup Locations
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Popular venue types booked by customers in Faridabad
          </p>

          <div className="space-y-2.5 pt-2">
            {Object.entries(venueCounts).map(([venue, count]: [string, any]) => (
              <div
                key={venue}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 text-xs"
              >
                <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-pink-500" />
                  {venue}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-black">
                  {count} setups
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
