"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  Heart,
  ChevronRight,
  Filter,
  FileText,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

interface DecorationBookingsViewProps {
  bookings: any[];
  partners: any[]; // PartnerStore list for decorator assignment
  loading: boolean;
  stats: any;
  statusFilter: string;
  search: string;
  onStatusChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Decorator Assigned",
  "In Setup",
  "Decorated & Ready",
  "Completed",
  "Cancelled",
];

export default function DecorationBookingsView({
  bookings,
  partners,
  loading,
  stats,
  statusFilter,
  search,
  onStatusChange,
  onSearchChange,
  onRefresh,
}: DecorationBookingsViewProps) {
  const { showToast } = useToast();

  const [assignModalBooking, setAssignModalBooking] = useState<any>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [payoutInput, setPayoutInput] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await service.updateDecorationBookingStatus(bookingId, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, "success");
      onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update status", "error");
    }
  };

  const handleOpenAssign = (booking: any) => {
    setAssignModalBooking(booking);
    setSelectedPartnerId(booking.assignedPartner?._id || booking.assignedPartner || "");
    setPayoutInput(booking.decoratorPayout ? booking.decoratorPayout.toString() : "");
  };

  const handleConfirmAssign = async () => {
    if (!assignModalBooking) return;
    setAssigning(true);
    try {
      await service.assignDecorationDecorator(assignModalBooking._id, {
        partnerId: selectedPartnerId || null,
        decoratorPayout: payoutInput ? Number(payoutInput) : 0,
      });
      showToast("Decorator assigned successfully!", "success");
      setAssignModalBooking(null);
      onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to assign decorator", "error");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Total Bookings
          </p>
          <h3 className="text-2xl font-black text-foreground mt-1">{stats?.totalBookings || 0}</h3>
          <p className="text-[11px] text-pink-500 mt-0.5">Hotel & venue events</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Today's Setups
          </p>
          <h3 className="text-2xl font-black text-amber-500 mt-1">{stats?.todaySetups || 0}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled for today</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Active in Pipeline
          </p>
          <h3 className="text-2xl font-black text-blue-500 mt-1">{stats?.activeSetups || 0}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Assigned or in setup</p>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Completed Setups
          </p>
          <h3 className="text-2xl font-black text-emerald-500 mt-1">{stats?.completedSetups || 0}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Delivered happily</p>
        </div>
      </div>

      {/* 2. FILTER & SEARCH STRIP */}
      <div className="p-4 rounded-3xl bg-card border border-border-theme shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by hotel name, booking ID, customer, city..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-border-theme bg-surface text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/30"
          >
            <option value="all">All Pipeline Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. BOOKINGS PIPELINE LIST */}
      {loading ? (
        <div className="p-16 text-center bg-card rounded-3xl border border-border-theme">
          <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-semibold">Loading venue bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border-theme space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto">
            <Building size={30} />
          </div>
          <h3 className="text-base font-bold text-foreground">No Venue Bookings Found</h3>
          <p className="text-xs text-muted-foreground">
            {search || statusFilter !== "all"
              ? "Try clearing filters to see all bookings."
              : "When customers book hotel or party room decor, they will appear here in real-time."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            // Build pre-filled WhatsApp Dispatch Message
            const targetPhone = b.assignedPartnerPhone || b.assignedPartner?.whatsappNumber || "";
            const cleanPartnerPhone = targetPhone.replace(/\D/g, "");
            const waPartnerNumber = cleanPartnerPhone.startsWith("91")
              ? cleanPartnerPhone
              : `91${cleanPartnerPhone}`;

            const dispatchMsg = encodeURIComponent(
              `*NEW VENUE DECORATION ORDER - GiftCart*\n` +
                `*Booking ID:* ${b.bookingId}\n` +
                `*Package:* ${b.packageTitle}\n\n` +
                `📍 *VENUE DETAILS:*\n` +
                `• Venue Type: ${b.venueType}\n` +
                `• Hotel/Venue: ${b.hotelName || "Private Venue"}\n` +
                `• Room / Floor: ${b.roomNumber || "N/A"}\n` +
                `• Hotel Booking Name: ${b.bookingHolderName || "N/A"}\n` +
                `• Address: ${b.venueAddress}, ${b.city}\n\n` +
                `🕒 *TIMINGS:*\n` +
                `• Setup Date: ${b.setupDate}\n` +
                `• Setup Slot: ${b.setupTimeSlot}\n` +
                `• Surprise Entry: ${b.surpriseEntryTime || "N/A"}\n\n` +
                `🎈 *PERSONALIZATION:*\n` +
                `• Wall/Foil Text: ${b.customMessage || "Standard Birthday/Anniversary"}\n` +
                `• Color Theme: ${b.colorTheme || "Red & Gold"}\n` +
                `• Special Notes: ${b.specialInstructions || "None"}\n\n` +
                `👤 *CUSTOMER:* ${b.customerName} (${b.customerPhone})\n\n` +
                `Please confirm setup arrival!`
            );

            const whatsappDispatchUrl = `https://wa.me/${waPartnerNumber}?text=${dispatchMsg}`;

            return (
              <div
                key={b._id}
                className="p-5 rounded-3xl bg-card border border-border-theme hover:border-pink-500/30 transition-all shadow-sm space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-theme pb-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/decoration-panel/bookings/${b._id}`}
                      className="font-mono text-xs font-black text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded-xl hover:underline"
                    >
                      {b.bookingId}
                    </Link>
                    <h3 className="font-bold text-sm text-foreground">
                      <Link
                        href={`/decoration-panel/bookings/${b._id}`}
                        className="hover:text-pink-500 transition"
                      >
                        {b.packageTitle}
                      </Link>
                    </h3>
                    <span className="text-xs font-black text-emerald-500">₹{b.totalAmount}</span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">Status:</span>
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusUpdate(b._id, e.target.value)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        b.status === "Completed"
                          ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                          : b.status === "In Setup" || b.status === "Decorated & Ready"
                          ? "bg-blue-500/15 text-blue-500 border-blue-500/30"
                          : b.status === "Decorator Assigned"
                          ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                          : "bg-surface text-foreground border-border-theme"
                      }`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Core Venue & Timing Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Venue & Hotel */}
                  <div className="p-3.5 rounded-2xl bg-surface border border-border-theme space-y-1.5">
                    <p className="text-[11px] font-bold text-pink-500 uppercase tracking-wider flex items-center gap-1">
                      <Building size={13} /> Venue Location
                    </p>
                    <p className="font-bold text-foreground text-sm">
                      {b.hotelName || b.venueType}
                      {b.roomNumber ? ` (Room ${b.roomNumber})` : ""}
                    </p>
                    {b.bookingHolderName && (
                      <p className="text-muted-foreground">
                        Booked under: <span className="text-foreground font-semibold">{b.bookingHolderName}</span>
                      </p>
                    )}
                    <p className="text-muted-foreground line-clamp-1">{b.venueAddress}, {b.city}</p>
                  </div>

                  {/* Col 2: Date & Setup Timings */}
                  <div className="p-3.5 rounded-2xl bg-surface border border-border-theme space-y-1.5">
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={13} /> Timings & Schedule
                    </p>
                    <p className="font-bold text-foreground">
                      📅 Date: {b.setupDate}
                    </p>
                    <p className="text-muted-foreground">
                      Setup Slot: <span className="text-foreground font-semibold">{b.setupTimeSlot}</span>
                    </p>
                    {b.surpriseEntryTime && (
                      <p className="text-amber-500 font-semibold">
                        🎉 Surprise Entry: {b.surpriseEntryTime}
                      </p>
                    )}
                  </div>

                  {/* Col 3: Personalization */}
                  <div className="p-3.5 rounded-2xl bg-surface border border-border-theme space-y-1.5">
                    <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={13} /> Customization
                    </p>
                    <p className="text-foreground">
                      Text: <span className="font-bold text-pink-400 font-mono">"{b.customMessage || "Standard Occasion"}"</span>
                    </p>
                    <p className="text-muted-foreground">
                      Theme: <span className="text-foreground font-semibold">{b.colorTheme}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Customer: {b.customerName} ({b.customerPhone})
                    </p>
                  </div>
                </div>

                {/* Bottom Dispatch & Assignment Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {b.assignedPartnerName ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Decorator: {b.assignedPartnerName}
                        {b.decoratorPayout > 0 && ` (Payout: ₹${b.decoratorPayout})`}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-surface border border-border-theme text-muted-foreground text-xs font-semibold">
                        No Decorator Assigned Yet
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenAssign(b)}
                      className="px-3 py-1 rounded-xl bg-surface border border-border-theme text-foreground hover:bg-surface/80 text-xs font-bold transition-colors"
                    >
                      {b.assignedPartnerName ? "Change Decorator" : "Assign Decorator"}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/decoration-panel/bookings/${b._id}`}
                      className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <FileText size={14} />
                      <span>Full Details & Timeline</span>
                    </Link>

                    {/* Instant WhatsApp Dispatch Button */}
                    {targetPhone ? (
                      <a
                        href={whatsappDispatchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <MessageCircle size={15} />
                        <span>Send Order Slip to Decorator on WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleOpenAssign(b)}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle size={15} />
                        <span>Assign Partner to Dispatch on WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ASSIGN DECORATOR MODAL */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border-theme p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Assign Decorator / Partner Store
            </h3>
            <p className="text-xs text-muted-foreground">
              Select one of your tie-up stores or local balloon decorators for booking{" "}
              <span className="font-mono text-pink-500 font-bold">{assignModalBooking.bookingId}</span>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Select Partner Store / Decorator</label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              >
                <option value="">-- Choose Partner Store --</option>
                {partners.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.city || "No City"}) - {p.whatsappNumber || p.ownerPhone}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Decorator Payout Amount (₹)</label>
              <input
                type="number"
                value={payoutInput}
                onChange={(e) => setPayoutInput(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full px-4 py-2.5 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              />
              <p className="text-[11px] text-muted-foreground">
                Amount you agreed to pay the decorator (customer pays ₹{assignModalBooking.totalAmount})
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme">
              <button
                type="button"
                onClick={() => setAssignModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-border-theme text-xs font-bold text-foreground hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                disabled={assigning}
                className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-500/20"
              >
                {assigning ? "Saving..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
