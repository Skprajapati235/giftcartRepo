"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Phone,
  MessageCircle,
  Users,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  CreditCard,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  Save,
  Check,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

interface Props {
  booking: any;
  partners: any[];
  onClose: () => void;
  onRefresh: () => void;
}

const STATUS_STEPS = [
  { key: "Pending", label: "Received", icon: Clock },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "Decorator Assigned", label: "Assigned", icon: Users },
  { key: "In Setup", label: "In Setup", icon: Sparkles },
  { key: "Decorated & Ready", label: "Ready", icon: ShieldCheck },
  { key: "Completed", label: "Completed", icon: CheckCircle2 },
];

export default function DecorationBookingDetailModal({
  booking,
  partners,
  onClose,
  onRefresh,
}: Props) {
  const { showToast } = useToast();
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [status, setStatus] = useState(booking.status || "Pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Decorator Assignment
  const [selectedPartnerId, setSelectedPartnerId] = useState(
    booking.assignedPartner?._id || booking.assignedPartner || ""
  );
  const [decoratorPayout, setDecoratorPayout] = useState(booking.decoratorPayout || 800);
  const [savingPartner, setSavingPartner] = useState(false);

  // Balance Payment Collection
  const [balancePaymentMethod, setBalancePaymentMethod] = useState("Cash on Setup");
  const [balanceNotes, setBalanceNotes] = useState("");
  const [recordingBalance, setRecordingBalance] = useState(false);

  // Editable details
  const [hotelName, setHotelName] = useState(booking.hotelName || "");
  const [roomNumber, setRoomNumber] = useState(booking.roomNumber || "");
  const [specialInstructions, setSpecialInstructions] = useState(booking.specialInstructions || "");
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || "");
  const [savingDetails, setSavingDetails] = useState(false);

  // Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await service.updateDecorationBookingStatus(currentBooking._id, {
        status: newStatus,
      });
      if (res?.success) {
        showToast(`Status updated to "${newStatus}"`, "success");
        setStatus(newStatus);
        setCurrentBooking((prev: any) => ({ ...prev, status: newStatus }));
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Save Partner Assignment
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPartner(true);
      const res = await service.assignDecorationDecorator(currentBooking._id, {
        partnerId: selectedPartnerId || null,
        decoratorPayout: Number(decoratorPayout) || 0,
      });
      if (res?.success) {
        showToast("Decorator partner assignment saved!", "success");
        setCurrentBooking(res.booking || res.data || currentBooking);
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to assign decorator", "error");
    } finally {
      setSavingPartner(false);
    }
  };

  // Record Balance Payment
  const handleRecordBalance = async () => {
    try {
      setRecordingBalance(true);
      const res = await service.recordDecorationBalancePayment(currentBooking._id, {
        balancePaymentMethod,
        notes: balanceNotes,
      });
      if (res?.success) {
        showToast("Balance payment recorded successfully!", "success");
        setCurrentBooking(res.booking || res.data || currentBooking);
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to record balance payment", "error");
    } finally {
      setRecordingBalance(false);
    }
  };

  // Save Room & Notes Details
  const handleSaveDetails = async () => {
    try {
      setSavingDetails(true);
      const res = await service.updateDecorationBooking(currentBooking._id, {
        hotelName,
        roomNumber,
        specialInstructions,
        adminNotes,
      });
      if (res?.success) {
        showToast("Booking details saved successfully!", "success");
        setCurrentBooking(res.booking || res.data || currentBooking);
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update details", "error");
    } finally {
      setSavingDetails(false);
    }
  };

  // WhatsApp Work Order generator
  const getWhatsAppSlip = () => {
    const bk = currentBooking;
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

*💳 Balance Collection from Guest:* ₹${bk.balanceAmount || 0} (${bk.balancePaymentStatus || "Pending"})

_⚠️ Note: Decorator must finish before surprise entry. Zero damage to walls guaranteed._`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === currentBooking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-gray-100 dark:border-slate-800 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-gray-50/70 dark:bg-slate-800/40">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-black text-pink-600 dark:text-pink-400">
                {currentBooking.bookingId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300">
                {currentBooking.venueType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                {currentBooking.paymentType || "Advance Downpayment"}
              </span>
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {currentBooking.packageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Order Lifecycle Progress Bar */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">
                Setup Progress Pipeline
              </span>
              <span className="font-black text-pink-600 dark:text-pink-400">
                Current Status: {currentBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentBooking.status === step.key;
                const StepIcon = step.icon;

                return (
                  <button
                    key={step.key}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(step.key)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      isCurrent
                        ? "bg-pink-600 text-white border-pink-600 shadow-md scale-105"
                        : isPassed
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-slate-800 hover:border-pink-300"
                    }`}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold leading-tight">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TWO COLUMN GRID: FINANCIALS & VENUE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. FINANCIALS & DOWNPAYMENT CARD */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-pink-600" />
                  Commercials & Downpayment
                </h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {currentBooking.paymentStatus}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Total Setup Price:</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    ₹{currentBooking.totalAmount}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Advance Downpayment Paid:</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{currentBooking.advanceAmount || 0}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Status: {currentBooking.downpaymentStatus || "Paid"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Remaining Balance Due at Venue:</span>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      ₹{currentBooking.balanceAmount || 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {currentBooking.balancePaymentStatus === "Collected by Decorator"
                        ? "✅ Collected by Decorator"
                        : "⚠️ Pending Collection on Setup"}
                    </span>
                  </div>
                </div>

                {currentBooking.razorpayPaymentId && (
                  <div className="flex justify-between items-center py-1 text-[11px]">
                    <span className="text-gray-400">Razorpay Payment ID:</span>
                    <span className="font-mono text-gray-600 dark:text-gray-300">
                      {currentBooking.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              {/* Balance Collection Box (if pending) */}
              {currentBooking.balancePaymentStatus !== "Collected by Decorator" &&
                currentBooking.balanceAmount > 0 && (
                  <div className="mt-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2.5">
                    <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Record Balance Collection on Site
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={balancePaymentMethod}
                        onChange={(e) => setBalancePaymentMethod(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                      >
                        <option value="Cash on Setup">Cash on Setup</option>
                        <option value="UPI to Decorator">UPI to Decorator</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleRecordBalance}
                        disabled={recordingBalance}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {recordingBalance ? "Recording..." : "Mark ₹" + currentBooking.balanceAmount + " Paid"}
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* 2. VENUE & HOTEL DETAILS CARD */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-pink-600" />
                  Venue & Hotel Information
                </h3>
                <span className="text-[11px] font-bold text-pink-600">
                  {currentBooking.city || "Faridabad"}
                </span>
              </div>

              <div className="space-y-3">
                {currentBooking.venueType === "Hotel Room" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">
                        Hotel Name:
                      </label>
                      <input
                        type="text"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">
                        Room Number:
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="e.g. 302"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-bold text-xs"
                      />
                    </div>
                  </div>
                ) : null}

                {currentBooking.bookingHolderName && (
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold">
                      Hotel Check-In Guest Name:
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {currentBooking.bookingHolderName}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-400 block text-[10px] font-bold">
                    Full Venue Address:
                  </span>
                  <p className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentBooking.venueAddress}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${hotelName || ""} ${currentBooking.venueAddress} Faridabad`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Open Location in Google Maps
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: SCHEDULE & PERSONALIZATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 3. EVENT SCHEDULE & SURPRISE TIMINGS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3.5">
              <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-purple-600" />
                Schedule & Critical Timings
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Setup Date:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">
                    📅 {currentBooking.setupDate}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Decorator Arrival Slot:</span>
                  <span className="font-extrabold text-pink-600 dark:text-pink-400">
                    ⏱️ {currentBooking.setupTimeSlot}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Customer Surprise Entry:</span>
                  <span className="font-extrabold text-purple-700 dark:text-purple-300">
                    🎉 {currentBooking.surpriseEntryTime || "Normal check-in"}
                  </span>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300">
                  💡 Decorator must complete balloons, fairy lights & petal layout 15 minutes before the surprise entry time!
                </div>
              </div>
            </div>

            {/* 4. PERSONALIZATION & THEME */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3.5">
              <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Balloon Personalization & Inclusions
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Color Theme:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    🎨 {currentBooking.colorTheme || "Red & Gold"}
                  </span>
                </div>

                <div className="py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500 block mb-0.5">Foil Balloon Custom Text:</span>
                  <span className="text-sm font-black text-pink-600 dark:text-pink-400">
                    🎈 "{currentBooking.customMessage || "Standard Inclusions"}"
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    Special Customer Instructions:
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium"
                    placeholder="e.g. Call on arrival, do not ring doorbell"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: CUSTOMER & PARTNER DISPATCH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 5. CUSTOMER CONTACT */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3.5">
              <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <Users className="w-4 h-4 text-blue-600" />
                Customer Contact Details
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">
                    {currentBooking.customerName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                  <span className="text-gray-500">Phone Call:</span>
                  <a
                    href={`tel:${currentBooking.customerPhone}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {currentBooking.customerPhone}
                  </a>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">WhatsApp:</span>
                  <a
                    href={`https://wa.me/91${currentBooking.customerWhatsapp?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-green-600 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Open WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>

            {/* 6. DECORATOR PARTNER ALLOCATION */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3.5">
              <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                <Users className="w-4 h-4 text-emerald-600" />
                Faridabad Decorator Dispatch
              </h3>

              <form onSubmit={handleSavePartner} className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    Assign Local Partner:
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="">-- No Decorator Assigned --</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.ownerName || p.ownerFirstName} • {p.city || "Faridabad"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">
                      Agreed Payout (₹):
                    </label>
                    <input
                      type="number"
                      value={decoratorPayout}
                      onChange={(e) => setDecoratorPayout(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 font-bold text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={savingPartner}
                      className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingPartner ? "Saving..." : "Update Partner"}
                    </button>
                  </div>
                </div>

                {/* 1-Click WhatsApp Work Order Dispatch Slip */}
                <div className="pt-2">
                  <a
                    href={getWhatsAppSlip()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Dispatch Work Order Slip on WhatsApp
                  </a>
                </div>
              </form>
            </div>
          </div>

          {/* ADMIN INTERNAL NOTES */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Internal Admin Notes & Log
              </h3>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs hover:opacity-90 transition flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                {savingDetails ? "Saving..." : "Save Notes"}
              </button>
            </div>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal communication, guest requests, or partner notes..."
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-medium"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-800/40">
          <span className="text-gray-400 text-[11px]">
            Created on {new Date(currentBooking.createdAt).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold rounded-xl text-xs transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
