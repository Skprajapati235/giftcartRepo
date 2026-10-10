"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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
  RefreshCw,
  Eye,
  Info,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

const STATUS_STEPS = [
  { key: "Pending", label: "Received", icon: Clock },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "Decorator Assigned", label: "Assigned", icon: Users },
  { key: "In Setup", label: "In Setup", icon: Sparkles },
  { key: "Decorated & Ready", label: "Ready", icon: ShieldCheck },
  { key: "Completed", label: "Completed", icon: CheckCircle2 },
];

export default function DecorationBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<any | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status state
  const [status, setStatus] = useState("Pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Decorator Assignment
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [decoratorPayout, setDecoratorPayout] = useState(800);
  const [savingPartner, setSavingPartner] = useState(false);

  // Balance Payment Collection
  const [balancePaymentMethod, setBalancePaymentMethod] = useState("Cash on Setup");
  const [balanceNotes, setBalanceNotes] = useState("");
  const [recordingBalance, setRecordingBalance] = useState(false);

  // Editable details
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      loadPartners();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await service.getDecorationBookingById(bookingId);
      if (res?.success && res.booking) {
        const b = res.booking;
        setBooking(b);
        setStatus(b.status || "Pending");
        setSelectedPartnerId(b.assignedPartner?._id || b.assignedPartner || "");
        setDecoratorPayout(b.decoratorPayout || 800);
        setHotelName(b.hotelName || "");
        setRoomNumber(b.roomNumber || "");
        setSpecialInstructions(b.specialInstructions || "");
        setAdminNotes(b.adminNotes || "");
      } else {
        showToast("Booking not found", "error");
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      showToast(err.message || "Failed to load booking details", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooking();
  };

  // Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!booking) return;
    try {
      setUpdatingStatus(true);
      const res = await service.updateDecorationBookingStatus(booking._id, {
        status: newStatus,
      });
      if (res?.success) {
        showToast(`Status updated to "${newStatus}"`, "success");
        setStatus(newStatus);
        setBooking((prev: any) => ({ ...prev, status: newStatus }));
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
    if (!booking) return;
    try {
      setSavingPartner(true);
      const res = await service.assignDecorationDecorator(booking._id, {
        partnerId: selectedPartnerId || null,
        decoratorPayout: Number(decoratorPayout) || 0,
      });
      if (res?.success) {
        showToast("Decorator assigned & payout saved successfully", "success");
        setBooking(res.booking);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to assign decorator", "error");
    } finally {
      setSavingPartner(false);
    }
  };

  // Record Balance Payment
  const handleRecordBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    try {
      setRecordingBalance(true);
      const res = await service.recordDecorationBalancePayment(booking._id, {
        balancePaymentMethod,
        notes: balanceNotes,
      });
      if (res?.success) {
        showToast("Balance payment recorded as collected!", "success");
        setBooking(res.booking);
        setBalanceNotes("");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to record balance payment", "error");
    } finally {
      setRecordingBalance(false);
    }
  };

  // Save General Updates
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    try {
      setSavingDetails(true);
      const res = await service.updateDecorationBooking(booking._id, {
        hotelName,
        roomNumber,
        specialInstructions,
        adminNotes,
      });
      if (res?.success) {
        showToast("Booking details updated", "success");
        setBooking(res.booking);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update booking details", "error");
    } finally {
      setSavingDetails(false);
    }
  };

  // Format WhatsApp Work Order Slip
  const getWhatsAppSlip = () => {
    if (!booking) return "#";
    const partner = partners.find((p) => p._id === selectedPartnerId);
    const targetPhone = partner?.phone || "8400787712";

    const venue = booking.hotelName
      ? `🏨 Hotel: ${booking.hotelName} (Room ${booking.roomNumber || "Pending / Key with Reception"})`
      : `📍 Address: ${booking.venueAddress}`;

    const text =
      `🎈 *GIFTFESTIVE DECORATION WORK ORDER*\n` +
      `--------------------------------------\n` +
      `*Order ID:* ${booking.bookingId}\n` +
      `*Package:* ${booking.packageTitle}\n` +
      `*Date:* ${booking.setupDate}\n` +
      `*Setup Arrival Window:* ${booking.setupTimeSlot}\n` +
      (booking.surpriseEntryTime ? `*Surprise Entry Time:* ${booking.surpriseEntryTime}\n` : "") +
      `*Venue Type:* ${booking.venueType}\n` +
      `${venue}\n` +
      `*City:* ${booking.city || "Faridabad"}\n` +
      `--------------------------------------\n` +
      `*Theme / Colors:* ${booking.colorTheme || "Standard"}\n` +
      (booking.customMessage ? `*Foil Letter Text:* "${booking.customMessage}"\n` : "") +
      (booking.specialInstructions ? `*Instructions:* ${booking.specialInstructions}\n` : "") +
      `--------------------------------------\n` +
      `*Client:* ${booking.customerName} (${booking.customerPhone})\n` +
      `*Payment Plan:* ${booking.paymentType || "Advance Downpayment"}\n` +
      `*Advance Paid:* ₹${booking.advanceAmount || 0} (${booking.downpaymentStatus || "Paid"})\n` +
      `*Balance to Collect on Site:* ₹${booking.balanceAmount || 0} (${booking.balancePaymentStatus || "Pending"})\n` +
      `*Agreed Decorator Payout:* ₹${decoratorPayout}\n` +
      `--------------------------------------\n` +
      `⚠️ *Quality Rules:*\n` +
      `- Use ONLY removable glue dots (0 wall damage).\n` +
      `- Complete setup 30 mins before surprise entry time.\n` +
      `- Take 2 photos after room is ready and share here.`;

    return `https://wa.me/91${targetPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="h-40 bg-gray-200 dark:bg-slate-800 rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="text-4xl">🔍</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Decoration Booking Not Found
        </h2>
        <p className="text-xs text-gray-500">
          The booking ID could not be located in the database.
        </p>
        <Link
          href="/decoration-panel/bookings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-pink-600 text-white font-bold text-xs shadow-lg hover:bg-pink-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings List
        </Link>
      </div>
    );
  }

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/decoration-panel/bookings"
            className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition flex items-center justify-center shadow-xs"
            title="Back to All Bookings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/decoration-panel/bookings" className="hover:underline">
                Decoration Studio
              </Link>
              <span>/</span>
              <span>Bookings</span>
              <span>/</span>
              <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                {booking.bookingId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 mt-0.5">
              <span>{booking.packageTitle}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                {booking.venueType}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition text-xs font-bold flex items-center gap-1.5"
            title="Refresh Booking Details"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href={getWhatsAppSlip()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-green-600/20 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send WhatsApp Work Order</span>
          </a>
        </div>
      </div>

      {/* 6-Step Operational Timeline Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Live Setup Pipeline
            </h2>
            <p className="text-sm font-extrabold text-gray-900 dark:text-white mt-0.5">
              Current Status: <span className="text-pink-600 dark:text-pink-400">{status}</span>
            </p>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Booked on {new Date(booking.createdAt).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STATUS_STEPS.map((st, i) => {
            const isDone = currentStepIdx > i;
            const isCurrent = status === st.key;
            const Icon = st.icon;

            return (
              <button
                type="button"
                key={st.key}
                disabled={updatingStatus}
                onClick={() => handleUpdateStatus(st.key)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isCurrent
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-500 shadow-md shadow-pink-500/25 ring-2 ring-pink-500/30"
                    : isDone
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                    : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black opacity-80">STEP 0{i + 1}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-black truncate">{st.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Core Operations & Financials */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Commercials & Downpayment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Commercials & Downpayment Reconciliation
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                Plan: {booking.paymentType || "Advance Downpayment"}
              </span>
            </div>

            {/* Financials Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Price */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-500">
                  Total Package Price
                </span>
                <div className="text-xl font-black text-gray-900 dark:text-white">
                  ₹{booking.totalAmount?.toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-gray-400 block">
                  Method: {booking.paymentMethod}
                </span>
              </div>

              {/* Advance Token Paid */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>Advance Token Paid</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </span>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  ₹{(booking.advanceAmount || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                  Status: {booking.downpaymentStatus || "Paid"}
                </span>
              </div>

              {/* Balance Amount Due on Setup */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                booking.balancePaymentStatus === "Collected by Decorator"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
              }`}>
                <span className={`text-[10px] font-black uppercase flex items-center justify-between ${
                  booking.balancePaymentStatus === "Collected by Decorator"
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-rose-800 dark:text-rose-300"
                }`}>
                  <span>Balance Due on Setup</span>
                  {booking.balancePaymentStatus === "Collected by Decorator" ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                  )}
                </span>
                <div className={`text-xl font-black ${
                  booking.balancePaymentStatus === "Collected by Decorator"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}>
                  ₹{(booking.balanceAmount || 0).toLocaleString("en-IN")}
                </div>
                <span className={`text-[10px] font-bold block ${
                  booking.balancePaymentStatus === "Collected by Decorator"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-rose-600 dark:text-rose-400"
                }`}>
                  {booking.balancePaymentStatus === "Collected by Decorator"
                    ? `Collected (${booking.balancePaymentMethod || "Cash"}) ✅`
                    : "To Collect After Setup"}
                </span>
              </div>
            </div>

            {/* Inline Balance Payment Collection Form */}
            {booking.balancePaymentStatus !== "Collected by Decorator" && (booking.balanceAmount || 0) > 0 ? (
              <form
                onSubmit={handleRecordBalance}
                className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                    Record Balance Payment Collection (On-Site Setup Completion)
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  When decorator completes room setup and inspects it with the customer, record the balance collection here to reconcile accounts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Payment Collection Method *
                    </label>
                    <select
                      value={balancePaymentMethod}
                      onChange={(e) => setBalancePaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="Cash on Setup">Cash Paid to Decorator</option>
                      <option value="UPI to Decorator">UPI Transfer to Decorator (GPay / PhonePe)</option>
                      <option value="Online Portal">Online Portal Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Collector Reference / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Received by Rahul via GPay"
                      value={balanceNotes}
                      onChange={(e) => setBalanceNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={recordingBalance}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {recordingBalance
                        ? "Recording..."
                        : `Mark Balance (₹${booking.balanceAmount}) as Collected`}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <strong className="text-emerald-900 dark:text-emerald-200 font-bold block">
                    Full Commercial Payment Reconciled & Verified
                  </strong>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                    Method: {booking.balancePaymentMethod || "Direct Payment"}
                    {booking.balanceCollectedAt &&
                      ` • Timestamp: ${new Date(booking.balanceCollectedAt).toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Venue & Location Coordinates */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  Venue & Hotel Location
                </h3>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  (booking.hotelName ? `${booking.hotelName}, ` : "") + booking.venueAddress + ", Faridabad"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Venue Type & Hotel</span>
                <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                  🏨 {booking.hotelName || booking.venueType}
                </p>
                {booking.roomNumber && (
                  <p className="font-bold text-pink-600 dark:text-pink-400">
                    Room Number: {booking.roomNumber}
                  </p>
                )}
                {booking.bookingHolderName && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Booking In Name Of: <strong>{booking.bookingHolderName}</strong>
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Address & City Hub</span>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  {booking.venueAddress}
                </p>
                <p className="text-gray-500 font-semibold">City: {booking.city || "Faridabad"}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Personalization & Room Theme */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Personalization & Decor Customization
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 space-y-1">
                <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase">
                  Foil Text / Neon Letter Message
                </span>
                <p className="font-black text-sm text-pink-700 dark:text-pink-300 font-mono">
                  &ldquo;{booking.customMessage || "Standard Love / Celebration Foil"}&rdquo;
                </p>
                <span className="text-[10px] text-gray-500 block">
                  Included in package setup (golden/rose-gold metallic letters)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Color Palette Theme</span>
                <p className="font-black text-sm text-gray-900 dark:text-white">
                  🎨 {booking.colorTheme || "Red & Gold Theme"}
                </p>
                <span className="text-[10px] text-gray-500 block">
                  Metallic & pastel latex balloons arrangement
                </span>
              </div>
            </div>

            {booking.specialInstructions && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/60 text-xs">
                <strong className="text-gray-900 dark:text-white font-bold block mb-1">
                  Customer Special Instructions:
                </strong>
                <p className="text-gray-700 dark:text-gray-300">{booking.specialInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Schedule, Contact, Assignment & Admin Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Schedule & Timing Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Timings & Arrival
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/60">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Setup Date</span>
                <strong className="text-sm font-extrabold text-gray-900 dark:text-white">
                  📅 {booking.setupDate}
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40">
                <span className="text-[10px] text-pink-700 dark:text-pink-300 font-bold uppercase block">
                  Decorator Setup Slot
                </span>
                <strong className="text-sm font-extrabold text-pink-700 dark:text-pink-300">
                  ⏱️ {booking.setupTimeSlot}
                </strong>
              </div>

              {booking.surpriseEntryTime && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase block">
                    Customer Surprise Entry
                  </span>
                  <strong className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                    🎉 {booking.surpriseEntryTime}
                  </strong>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                    Decorator must finish 30 mins before entry!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Contact Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Customer Contact
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                👤 {booking.customerName}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${booking.customerPhone}`}
                  className="flex-1 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-center font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/91${(booking.customerWhatsapp || booking.customerPhone)?.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-xl text-center font-bold hover:bg-green-100 transition flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Decorator Partner Assignment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Decorator Assignment
              </h3>
            </div>

            <form onSubmit={handleSavePartner} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Assign Faridabad Partner Store *
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="">-- No Decorator Assigned --</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone}) - {p.city || "Faridabad"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Agreed Payout for Decorator (₹)
                </label>
                <input
                  type="number"
                  value={decoratorPayout}
                  onChange={(e) => setDecoratorPayout(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={savingPartner}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPartner ? "Saving..." : "Save Decorator Assignment"}</span>
              </button>
            </form>
          </div>

          {/* Internal Admin Log & Notes Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                Internal Operations Notes
              </h3>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-3 text-xs">
              <textarea
                rows={3}
                placeholder="Log hotel room coordination notes, coordinator remarks..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
              />

              <button
                type="submit"
                disabled={savingDetails}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingDetails ? "Saving..." : "Save Notes"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
