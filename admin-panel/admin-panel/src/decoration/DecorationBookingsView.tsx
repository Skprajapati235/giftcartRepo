"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Phone,
  MessageCircle,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Sparkles,
  X,
  CreditCard,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Decorator Assigned",
  "In Setup",
  "Decorated & Ready",
  "Completed",
  "Cancelled",
];

export default function DecorationBookingsView() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Assign Decorator Modal
  const [assignModalBooking, setAssignModalBooking] = useState<any | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [decoratorPayout, setDecoratorPayout] = useState<number>(0);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadBookings();
    loadPartners();
  }, [statusFilter, dateFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (search.trim()) params.search = search.trim();

      const res = await service.getDecorationBookings(params);
      if (res?.success) {
        setBookings(res.bookings || res.data || []);
      }
    } catch (err) {
      console.error("Error loading decoration bookings:", err);
      showToast("Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      const res = await service.getDecoratorPartners({ city: "Faridabad" });
      if (res?.success) {
        setPartners(res.partners || res.data || []);
      }
    } catch (err) {
      console.warn("Could not load decorator partners:", err);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await service.updateDecorationBookingStatus(bookingId, { status: newStatus });
      if (res?.success) {
        showToast(`Status updated to "${newStatus}"`, "success");
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleOpenAssignModal = (bk: any) => {
    setAssignModalBooking(bk);
    setSelectedPartnerId(bk.assignedPartner?._id || bk.assignedPartner || "");
    setDecoratorPayout(bk.decoratorPayout || 800);
  };

  const handleSaveDecoratorAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalBooking) return;

    try {
      setAssigning(true);
      const res = await service.assignDecorationDecorator(assignModalBooking._id, {
        partnerId: selectedPartnerId || null,
        decoratorPayout: Number(decoratorPayout) || 0,
      });

      if (res?.success) {
        showToast("Decorator assigned successfully!", "success");
        setAssignModalBooking(null);
        loadBookings();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to assign decorator", "error");
    } finally {
      setAssigning(false);
    }
  };

  // Generate 1-Click WhatsApp Dispatch Slip for Decorator
  const getWhatsAppSlip = (bk: any) => {
    const text = `*🎪 GIFT CART - FARIDABAD VENUE DECORATION WORK ORDER*
----------------------------------------
*Booking ID:* ${bk.bookingId}
*Package:* ${bk.packageTitle}
*Venue Type:* ${bk.venueType}
${bk.hotelName ? `*Hotel / Resort:* ${bk.hotelName}` : ""}
${bk.roomNumber ? `*Room Number:* ${bk.roomNumber}` : ""}
${bk.bookingHolderName ? `*Hotel Reservation Name:* ${bk.bookingHolderName}` : ""}
*Address:* ${bk.venueAddress}, ${bk.city || "Faridabad"}

*📅 Setup Date:* ${bk.setupDate}
*⏰ Decorator Setup Window:* ${bk.setupTimeSlot}
${bk.surpriseEntryTime ? `*🎉 Surprise Entry Time:* ${bk.surpriseEntryTime}` : ""}

*🎈 Balloon / Foil Text:* ${bk.customMessage || "Standard Inclusions"}
*🎨 Color Theme:* ${bk.colorTheme || "Red & Gold"}

*👤 Customer Contact:* ${bk.customerName} (${bk.customerPhone})
*💵 Agreed Decorator Payout:* ₹${bk.decoratorPayout || "As Agreed"}

_⚠️ Note: Decorator must finish before surprise entry. Zero damage to walls guaranteed._`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hotel, guest name, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadBookings()}
            className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 focus:outline-none shadow-xs transition"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                loadBookings();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Pills, Date Picker & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none shadow-xs"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none shadow-xs"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="px-2 py-1 text-xs font-bold text-pink-600 hover:underline"
            >
              Clear Date
            </button>
          )}

          <button
            onClick={loadBookings}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition shadow-xs"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* BOOKINGS LIST */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-400">Loading Faridabad decoration bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-slate-800 space-y-3">
          <div className="text-4xl">🎈</div>
          <h3 className="text-base font-bold text-gray-800 dark:text-white">
            No decoration bookings found
          </h3>
          <p className="text-xs text-gray-500">
            {search || statusFilter !== "all" || dateFilter
              ? "Try clearing filters to see all booked venue experiences."
              : "New customer room & party bookings in Faridabad will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((bk) => (
            <div
              key={bk._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-pink-200 dark:hover:border-pink-900/40 transition-all space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/decoration-panel/bookings/${bk._id}`}
                      className="text-sm font-black text-pink-600 dark:text-pink-400 hover:underline"
                    >
                      {bk.bookingId}
                    </Link>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300">
                      {bk.venueType}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      Booked on: {new Date(bk.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    <Link
                      href={`/decoration-panel/bookings/${bk._id}`}
                      className="hover:text-pink-600 dark:hover:text-pink-400 transition"
                    >
                      {bk.packageTitle}
                    </Link>
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="text-lg font-black text-gray-900 dark:text-white">
                      ₹{bk.totalAmount}
                    </div>
                    <div className="text-[10px] space-y-0.5">
                      {bk.paymentType === "Advance Downpayment" ? (
                        <>
                          <span className="font-bold text-emerald-600 block">
                            Adv: ₹{bk.advanceAmount || 0} ({bk.downpaymentStatus || "Paid"})
                          </span>
                          <span className={`font-bold block ${bk.balancePaymentStatus === "Collected by Decorator" ? "text-emerald-600" : "text-rose-500"}`}>
                            {bk.balancePaymentStatus === "Collected by Decorator" ? "Bal: Paid ✅" : `Bal Due: ₹${bk.balanceAmount || 0}`}
                          </span>
                        </>
                      ) : (
                        <span className="text-green-600 font-bold block">
                          {bk.paymentType || bk.paymentMethod} • {bk.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline Status Changer Dropdown */}
                  <select
                    value={bk.status}
                    onChange={(e) => handleStatusChange(bk._id, e.target.value)}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Kab Kaha Kaise Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Venue & Hotel Details */}
                <div className="bg-pink-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-pink-100/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-400">
                    📍 Where (Venue Location)
                  </div>
                  {bk.hotelName && (
                    <p className="font-bold text-gray-900 dark:text-white text-xs">
                      🏨 {bk.hotelName} {bk.roomNumber && `(Room: ${bk.roomNumber})`}
                    </p>
                  )}
                  {bk.bookingHolderName && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Hotel Guest Name:</strong> {bk.bookingHolderName}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    {bk.venueAddress}, {bk.city || "Faridabad"}
                  </p>
                </div>

                {/* 2. Setup Timing & Personalization */}
                <div className="bg-purple-50/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-purple-100/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    ⏰ When & How (Schedule)
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    📅 Date: {bk.setupDate}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    ⏱️ Setup Slot: {bk.setupTimeSlot}
                  </p>
                  {bk.surpriseEntryTime && (
                    <p className="text-purple-700 dark:text-purple-300 font-bold">
                      🎉 Surprise Entry: {bk.surpriseEntryTime}
                    </p>
                  )}
                  {bk.customMessage && (
                    <p className="text-pink-700 dark:text-pink-400 font-black">
                      🎈 Balloon Text: "{bk.customMessage}"
                    </p>
                  )}
                  {bk.colorTheme && (
                    <p className="text-gray-600 dark:text-gray-400">
                      🎨 Theme: {bk.colorTheme}
                    </p>
                  )}
                </div>

                {/* 3. Customer & Decorator Partner */}
                <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    👤 Customer & Decorator
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{bk.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${bk.customerPhone}`}
                        className="text-pink-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> {bk.customerPhone}
                      </a>
                      <a
                        href={`https://wa.me/91${bk.customerWhatsapp?.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">Assigned Partner:</span>
                      <button
                        onClick={() => handleOpenAssignModal(bk)}
                        className="text-[11px] font-bold text-pink-600 hover:underline"
                      >
                        {bk.assignedPartnerName ? "Change" : "+ Assign"}
                      </button>
                    </div>
                    {bk.assignedPartnerName ? (
                      <div className="mt-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {bk.assignedPartnerName}
                        </span>
                        <span className="text-gray-500 block text-[10px]">
                          Payout: ₹{bk.decoratorPayout || 0}
                        </span>
                      </div>
                    ) : (
                      <span className="text-rose-500 font-bold text-[11px] block mt-0.5">
                        ⚠️ No Decorator Assigned Yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Full Details & Timeline page link */}
                  <Link
                    href={`/decoration-panel/bookings/${bk._id}`}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Full Details & Timeline
                  </Link>

                  {/* 1-Click WhatsApp Dispatch Slip */}
                  <a
                    href={getWhatsAppSlip(bk)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    1-Click WhatsApp Work Order Slip
                  </a>

                  {/* Assign Decorator button */}
                  <button
                    onClick={() => handleOpenAssignModal(bk)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {bk.assignedPartnerName ? "Edit Partner Payout" : "Assign Faridabad Partner"}
                  </button>
                </div>

                <div className="text-[11px] text-gray-500 font-medium">
                  {bk.specialInstructions && (
                    <span>📝 Notes: "{bk.specialInstructions}"</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN DECORATOR PARTNER MODAL */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Assign Faridabad Decorator Partner
            </h3>
            <p className="text-xs text-gray-500">
              Booking: <strong>{assignModalBooking.bookingId}</strong> ({assignModalBooking.packageTitle})
            </p>

            <form onSubmit={handleSaveDecoratorAssignment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Select Decorator Partner (Faridabad Tie-up)
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 font-medium"
                >
                  <option value="">-- Unassigned --</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.ownerName || p.ownerFirstName} • {p.city || "Faridabad"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Agreed Decorator Payout (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={decoratorPayout}
                  onChange={(e) => setDecoratorPayout(Number(e.target.value))}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 font-bold"
                />
                <span className="text-[10px] text-gray-500 block mt-1">
                  Customer Price: ₹{assignModalBooking.totalAmount} • Your Net Profit: ₹
                  {Math.max(0, assignModalBooking.totalAmount - (Number(decoratorPayout) || 0))}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {assigning ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
