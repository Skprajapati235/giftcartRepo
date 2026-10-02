"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ChefHat,
  Package,
  Bike,
  CheckCircle2,
  Clock,
  Moon,
  Zap,
  Sun,
  RefreshCw,
  Volume2,
  VolumeX,
  Phone,
  Eye,
  ArrowRight,
  AlertCircle,
  Calendar,
  LayoutGrid,
  Columns3,
  Search,
  PackageCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { getAllOrders } from "../../services/adminService";
import { updateOrderKitchenStatus } from "../../services/giftingService";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";

type KitchenStatus = "Received" | "Preparing" | "Packed" | "OutForDelivery" | "Delivered";

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  messageOnCake?: string;
  isEggless?: boolean;
  selectedVariant?: string;
  flavor?: string;
  deliveryTime?: string;
  expectedDeliveryDate?: string;
}

interface OrderData {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  kitchenStatus?: KitchenStatus;
  deliverySlot?: {
    slotName?: string;
    slotType?: string;
    timeRange?: string;
    extraCharge?: number;
    deliveryDate?: string;
  };
  messageOnCake?: string;
  cardMessage?: string;
  recipientName?: string;
  senderName?: string;
  addons?: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress?: {
    fullName: string;
    phone: string;
    houseNo?: string;
    street?: string;
    pinCode?: string;
  };
  user?: {
    name: string;
    mobileNumber?: string;
  };
  items: OrderItem[];
}

const PIPELINE_COLUMNS: { id: KitchenStatus; label: string; icon: LucideIcon; color: string; bg: string }[] = [
  { id: "Received", label: "🔔 New / Received", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "Preparing", label: "👨‍🍳 In Kitchen / Baking", icon: ChefHat, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "Packed", label: "📦 Quality Checked & Packed", icon: Package, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "OutForDelivery", label: "🛵 Out for Delivery", icon: Bike, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { id: "Delivered", label: "✅ Delivered", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
];

const SLOT_COLUMNS = [
  { id: "midnight", label: "🌙 Midnight Delivery", sub: "11:00 PM - 12:00 AM", icon: Moon, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "early_morning", label: "⚡ Early Morning", sub: "6:00 AM - 9:00 AM", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { id: "fixed", label: "⏰ Fixed Time / Express", sub: "Exact hours & 2-3h express", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "standard", label: "☀️ Standard Day Slots", sub: "Regular delivery slots", icon: Sun, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "other", label: "📋 General / Unassigned", sub: "Standard fulfillment", icon: Package, color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/20" },
];

const SLOT_FILTERS = [
  { id: "all", label: "All Slots", icon: "✨" },
  { id: "midnight", label: "Midnight Delivery 🌙", icon: "🌙" },
  { id: "early_morning", label: "Early Morning ⚡", icon: "⚡" },
  { id: "fixed", label: "Fixed Time ⏰", icon: "⏰" },
  { id: "standard", label: "Standard Slots ☀️", icon: "☀️" },
];

export default function KitchenBoardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [slotFilter, setSlotFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"pipeline" | "slots">("pipeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const prevCountRef = useRef(0);
  const requestIdRef = useRef(0);
  const hasLoadedOrdersRef = useRef(false);
  const lastLoadedSearchRef = useRef("");

  // Play browser chime when a new order arrives
  const playChime = React.useCallback(() => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new window.AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // Audio autoplay policy
    }
  }, [audioEnabled]);

  const loadOrders = React.useCallback(async (initialLoad = false) => {
    const requestId = ++requestIdRef.current;
    const currentSearch = debouncedSearch.trim();
    try {
      if (initialLoad) setLoading(true);
      else setRefreshing(true);
      const res = await getAllOrders({ limit: 100, search: currentSearch || undefined });
      if (requestId !== requestIdRef.current) return;
      const list: OrderData[] = Array.isArray(res) ? res : res?.data || [];

      // Check if new orders arrived since last poll
      if (
        !currentSearch &&
        lastLoadedSearchRef.current === currentSearch &&
        !initialLoad &&
        prevCountRef.current > 0 &&
        list.length > prevCountRef.current
      ) {
        playChime();
      }
      prevCountRef.current = list.length;
      lastLoadedSearchRef.current = currentSearch;
      setOrders(list);
      setTotalOrders(Array.isArray(res) ? list.length : Number(res?.total ?? list.length));
      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to load orders for Kanban:", err);
      setMessage({ type: "error", text: "Could not refresh orders. Check your connection and try again." });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [debouncedSearch, playChime]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    loadOrders(!hasLoadedOrdersRef.current);
    hasLoadedOrdersRef.current = true;
    const interval = setInterval(() => loadOrders(), 20000); // 20s auto-poll
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Helper to extract and infer slot info cleanly for any order
  const getOrderSlotInfo = (order: OrderData) => {
    const rawType = (order.deliverySlot?.slotType || "").toLowerCase();
    const rawName = (order.deliverySlot?.slotName || order.items[0]?.deliveryTime || "").toLowerCase();

    let slotType: "midnight" | "early_morning" | "fixed" | "standard" | "other" = "standard";

    if (rawType === "midnight" || rawName.includes("midnight") || rawName.includes("11 pm") || rawName.includes("11:00 pm")) {
      slotType = "midnight";
    } else if (rawType === "early_morning" || rawName.includes("early") || rawName.includes("morning") || rawName.includes("6 am") || rawName.includes("7 am")) {
      slotType = "early_morning";
    } else if (rawType === "fixed" || rawType === "fixed_time" || rawName.includes("fixed") || rawName.includes("hour")) {
      slotType = "fixed";
    } else if (order.deliverySlot?.slotName || order.items[0]?.deliveryTime) {
      slotType = "standard";
    } else {
      slotType = "other";
    }

    const displaySlot = order.deliverySlot?.timeRange || order.deliverySlot?.slotName || order.items[0]?.deliveryTime || "Standard Delivery";
    const displayDate = order.deliverySlot?.deliveryDate || order.items[0]?.expectedDeliveryDate;
    const extraCharge = order.deliverySlot?.extraCharge || 0;

    return { slotType, displaySlot, displayDate, extraCharge };
  };

  const getEffectiveKitchenStatus = (order: OrderData): KitchenStatus => {
    if (order.kitchenStatus) return order.kitchenStatus;
    if (order.status === "Delivered") return "Delivered";
    if (order.status === "Shipped") return "OutForDelivery";
    if (order.status === "Processing") return "Preparing";
    return "Received";
  };

  const handleAdvanceStatus = async (order: OrderData, nextStatus: KitchenStatus) => {
    try {
      setUpdatingId(order._id);
      await updateOrderKitchenStatus(order._id, nextStatus);
      const mappedStatus =
        nextStatus === "Delivered"
          ? "Delivered"
          : nextStatus === "OutForDelivery"
          ? "Shipped"
          : nextStatus === "Received"
          ? "Pending"
          : "Processing";
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, kitchenStatus: nextStatus, status: mappedStatus } : o))
      );
      setMessage({
        type: "success",
        text: `Order #${String(order._id).slice(-6).toUpperCase()} moved to "${nextStatus}"`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update kitchen status:", err);
      setMessage({ type: "error", text: "Failed to update order kitchen status" });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders for Pipeline View (by KitchenStatus)
  const filteredOrders = orders;
  const isSearchPending = searchTerm.trim() !== debouncedSearch;

  const activeOrders = filteredOrders.filter((order) => order.status !== "Cancelled" && order.status !== "Delivered");
  const preparingCount = activeOrders.filter((order) =>
    ["Preparing", "Packed"].includes(getEffectiveKitchenStatus(order))
  ).length;
  const deliveryCount = activeOrders.filter((order) =>
    getEffectiveKitchenStatus(order) === "OutForDelivery"
  ).length;

  const getOrdersForPipelineColumn = (status: KitchenStatus) => {
    return filteredOrders.filter((o) => {
      if (o.status === "Cancelled") return false;

      const { slotType } = getOrderSlotInfo(o);
      if (slotFilter !== "all" && slotType !== slotFilter) {
        return false;
      }

      return getEffectiveKitchenStatus(o) === status;
    });
  };

  // Filter orders for Slot Group View (by Slot category)
  const getOrdersForSlotColumn = (slotCategory: string) => {
    return filteredOrders.filter((o) => {
      if (o.status === "Cancelled") return false;
      const { slotType } = getOrderSlotInfo(o);
      return slotType === slotCategory;
    });
  };

  const getNextAction = (status: KitchenStatus): { next: KitchenStatus; label: string } | null => {
    switch (status) {
      case "Received":
        return { next: "Preparing", label: "Send to Kitchen ➔" };
      case "Preparing":
        return { next: "Packed", label: "Mark Packed ➔" };
      case "Packed":
        return { next: "OutForDelivery", label: "Hand to Rider ➔" };
      case "OutForDelivery":
        return { next: "Delivered", label: "Mark Delivered ✅" };
      default:
        return null;
    }
  };

  // Count active orders per slot for the filter tabs
  const getSlotCounts = () => {
    const counts = { all: 0, midnight: 0, early_morning: 0, fixed: 0, standard: 0 };
    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      counts.all++;
      const { slotType } = getOrderSlotInfo(o);
      if (counts[slotType as keyof typeof counts] !== undefined) {
        counts[slotType as keyof typeof counts]++;
      }
    });
    return counts;
  };
  const slotCounts = getSlotCounts();

  const renderOrderCard = (order: OrderData) => {
    const isUpdating = updatingId === order._id;
    const currentKitchenStatus = getEffectiveKitchenStatus(order);
    const next = getNextAction(currentKitchenStatus);
    const { slotType, displaySlot, displayDate, extraCharge } = getOrderSlotInfo(order);

    return (
      <div
        key={order._id}
        className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm transition-all duration-200 hover:border-orange-400 hover:shadow-md space-y-3"
      >
        {/* Order ID & Time */}
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/orders/${order._id}`}
            className="font-mono text-sm font-black text-foreground hover:text-orange-500 transition flex items-center gap-1.5"
            title="View Order Details"
          >
            <span>#{String(order._id).slice(-6).toUpperCase()}</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-[10px] text-slate-400">
              {new Date(order.createdAt).toLocaleDateString([], { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        {/* Delivery Slot Badge & Expected Date */}
        <div
          className={`min-h-11 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 ${
            slotType === "midnight"
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              : slotType === "early_morning"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : slotType === "fixed"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {slotType === "midnight" ? (
              <Moon className="w-3.5 h-3.5 shrink-0" />
            ) : slotType === "early_morning" ? (
              <Zap className="w-3.5 h-3.5 shrink-0" />
            ) : slotType === "fixed" ? (
              <Clock className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Sun className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate font-bold">{displaySlot}</span>
          </div>
          {extraCharge ? (
            <span className="font-black shrink-0 text-[10px] bg-background/80 px-1.5 py-0.5 rounded-md">
              +₹{extraCharge}
            </span>
          ) : null}
        </div>

        {/* Expected Delivery Date if present */}
        {displayDate && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-card px-2 py-1 rounded-lg border border-border-theme">
            <Calendar className="w-3 h-3 text-orange-500 shrink-0" />
            <span>Delivery: {displayDate}</span>
          </div>
        )}

        {/* Customer Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
            <p className="text-sm font-bold text-foreground truncate">
              {order.shippingAddress?.fullName || order.user?.name || "Customer"}
            </p>
          </div>
          {(order.shippingAddress?.phone || order.user?.mobileNumber) && (
            <a
              href={`tel:${order.shippingAddress?.phone || order.user?.mobileNumber}`}
              className="shrink-0 rounded-lg border border-border-theme p-2 text-slate-500 hover:text-orange-500 hover:border-orange-300 transition"
              aria-label={`Call ${order.shippingAddress?.fullName || order.user?.name || "customer"}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Items preview */}
        <div className="space-y-2 rounded-xl bg-background p-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Order items</span>
            <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
          </div>
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="text-xs text-foreground flex items-center justify-between gap-2">
              <span className="font-medium truncate">
                {item.name} {item.isEggless ? "🥚(Eggless)" : ""}
              </span>
              <span className="shrink-0 text-slate-500 font-mono text-[11px]">×{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[11px] text-slate-400 font-medium">
              +{order.items.length - 3} more items
            </p>
          )}
        </div>

        {/* Custom Message on Cake */}
        {(order.messageOnCake || order.items.some((i) => i.messageOnCake)) && (
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-700 dark:text-pink-300">
            <span className="font-bold flex items-center gap-1 mb-0.5">
              🎂 Cake Inscription:
            </span>
            <span className="italic font-serif font-bold">
              &quot;{order.messageOnCake || order.items.find((i) => i.messageOnCake)?.messageOnCake}&quot;
            </span>
          </div>
        )}

        {/* Greeting Card Message */}
        {order.cardMessage && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
            <span className="font-bold flex items-center gap-1 mb-0.5">
              💌 Greeting Card:
            </span>
            <span className="italic font-medium">&quot;{order.cardMessage}&quot;</span>
          </div>
        )}

        {/* Add-ons */}
        {order.addons && order.addons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {order.addons.map((a, i) => (
              <span
                key={i}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              >
                🎁 {a.name} (×{a.quantity})
              </span>
            ))}
          </div>
        )}

        {/* Current status tag in slot view */}
        {viewMode === "slots" && (
          <div className="flex items-center justify-between text-[11px] font-bold px-2.5 py-1 rounded-xl bg-card border border-border-theme">
            <span className="text-slate-400">Kitchen Stage:</span>
            <span className="text-orange-500 uppercase">{currentKitchenStatus}</span>
          </div>
        )}

        {/* Total amount & Action */}
        <div className="pt-3 border-t border-border-theme space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order total</p>
              <span className="text-base font-black text-foreground">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</span>
            </div>
            <Link
              href={`/orders/${order._id}`}
              className="text-xs font-bold text-slate-500 hover:text-orange-500 flex items-center gap-1"
              title="Open Full Order Detail Page"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {/* Quick Stage Dropdown */}
            <select
              value={currentKitchenStatus}
              disabled={isUpdating}
              onChange={(e) => handleAdvanceStatus(order, e.target.value as KitchenStatus)}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-xl bg-background border border-border-theme text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/30 disabled:opacity-60"
              title="Change Stage"
            >
              <option value="Received">🔔 Received</option>
              <option value="Preparing">👨‍🍳 In Kitchen</option>
              <option value="Packed">📦 Packed</option>
              <option value="OutForDelivery">🛵 Out for Delivery</option>
              <option value="Delivered">✅ Delivered</option>
            </select>

            {next ? (
              <button
                disabled={isUpdating}
                onClick={() => handleAdvanceStatus(order, next.next)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition shadow-sm disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : next.label}
              </button>
            ) : (
              <span className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-center">
                Order complete
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AdminMain className="max-w-[1800px] mx-auto">
        <div className="space-y-6">
          {/* Toast Notification */}
          {message && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm animate-in fade-in duration-200 ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                  : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="text-xs font-bold">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-xs font-bold uppercase opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Top Header */}
          <div className="overflow-hidden rounded-3xl border border-orange-200/70 bg-gradient-to-br from-orange-50 via-card to-amber-50 shadow-sm dark:border-orange-500/15 dark:from-orange-950/20 dark:via-card dark:to-amber-950/10">
            <div className="flex flex-col gap-5 p-5 sm:p-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3 text-orange-600 dark:text-orange-400">
                  <ChefHat className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">Kitchen & Order Board</h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Auto-refresh · 20 sec
                    </span>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                    Track every order from receiving it to handing it over for delivery.
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {lastUpdated
                      ? `Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                      : "Loading latest orders..."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl border border-border-theme bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("pipeline")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                      viewMode === "pipeline" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-hover-theme dark:text-slate-300"
                    }`}
                  >
                    <Columns3 className="h-4 w-4" />
                    Stages
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("slots")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                      viewMode === "slots" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-hover-theme dark:text-slate-300"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Delivery slots
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-theme bg-card px-3 py-2 text-xs font-bold text-foreground transition hover:bg-hover-theme"
                  title={audioEnabled ? "Turn new-order chime off" : "Turn new-order chime on"}
                  aria-pressed={audioEnabled}
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4 text-emerald-500" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                  {audioEnabled ? "Sound on" : "Sound off"}
                </button>

                <button
                  type="button"
                  onClick={() => loadOrders()}
                  disabled={refreshing}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <Link
                  href="/orders"
                  className="inline-flex min-h-10 items-center rounded-xl border border-border-theme bg-card px-4 py-2 text-xs font-bold text-foreground transition hover:bg-hover-theme"
                >
                  All orders
                </Link>
              </div>
            </div>
          </div>

          {/* Order overview */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: "Active orders", value: activeOrders.length, detail: "Need action", icon: Package, tone: "blue" },
              { label: "In preparation", value: preparingCount, detail: "Preparing or packed", icon: ChefHat, tone: "amber" },
              { label: "Out for delivery", value: deliveryCount, detail: "With delivery partner", icon: Bike, tone: "indigo" },
              { label: "Completed", value: filteredOrders.filter((order) => order.status === "Delivered").length, detail: "Delivered orders", icon: PackageCheck, tone: "emerald" },
            ].map((stat) => {
              const tones: Record<string, string> = {
                blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              };
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-border-theme bg-card p-4 shadow-xs">
                  <div className={`rounded-xl p-2.5 ${tones[stat.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black leading-none text-foreground">{stat.value}</p>
                    <p className="mt-1 truncate text-xs font-bold text-foreground">{stat.label}</p>
                    <p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">{stat.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and board filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="kitchen-order-search"
                className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Find an order
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  {refreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </span>
                <input
                  id="kitchen-order-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Order ID, customer name, phone or product"
                  autoComplete="off"
                  className="h-14 w-full pl-16 pr-12 text-sm font-medium placeholder:font-normal sm:text-[15px]"
                  aria-label="Search kitchen orders"
                  aria-describedby="kitchen-search-hint"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-hover-theme hover:text-foreground"
                    aria-label="Clear order search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p id="kitchen-search-hint" className="mt-2 min-h-4 px-1 text-[11px] text-slate-500">
                {isSearchPending
                  ? "Keep typing — search starts when you pause."
                  : refreshing && debouncedSearch
                    ? "Searching orders..."
                    : refreshing
                      ? "Refreshing orders..."
                      : "Search updates automatically after you pause typing."}
              </p>
            </div>
            <div className="flex min-h-14 items-center justify-between gap-4 px-1 lg:min-w-52 lg:flex-col lg:items-start lg:justify-center lg:gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Matching orders
              </span>
              <p className="text-sm font-semibold text-slate-500">
                <span className="text-xl font-black leading-none text-foreground">{filteredOrders.length}</span>
                <span className="px-1.5 text-slate-400">/</span>
                <span className="text-foreground">{totalOrders}</span>
                <span className="ml-1.5">found</span>
              </p>
            </div>
          </div>

          {/* Delivery Slot Filter Tabs (when in Pipeline Stages view) */}
          {viewMode === "pipeline" && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {SLOT_FILTERS.map((f) => {
                const count = slotCounts[f.id as keyof typeof slotCounts] || 0;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSlotFilter(f.id)}
                    className={`min-h-10 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                      slotFilter === f.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-card border-border-theme text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                    }`}
                  >
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        slotFilter === f.id ? "bg-white/20 text-white" : "bg-muted text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Kanban Board Layout */}
          {loading ? (
            <div className="grid grid-flow-col auto-cols-[minmax(280px,320px)] gap-4 overflow-x-auto pb-3">
              {PIPELINE_COLUMNS.map((column) => (
                <div key={column.id} className="min-h-[420px] animate-pulse rounded-2xl border border-border-theme bg-card p-4">
                  <div className="mb-5 h-5 w-2/3 rounded bg-hover-theme" />
                  <div className="space-y-3">
                    <div className="h-48 rounded-xl bg-hover-theme" />
                    <div className="h-48 rounded-xl bg-hover-theme" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border-theme bg-card px-6 py-12 text-center">
              <div className="mb-4 rounded-2xl bg-orange-500/10 p-4 text-orange-500">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {debouncedSearch ? "No matching orders found" : "No orders to show"}
              </h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {debouncedSearch
                  ? `We couldn't find an order, customer, phone number or product matching “${debouncedSearch}”.`
                  : "New orders will appear here automatically as customers place them."}
              </p>
              {debouncedSearch ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
                >
                  <X className="h-4 w-4" />
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => loadOrders()}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh orders
                </button>
              )}
            </div>
          ) : viewMode === "pipeline" ? (
            /* VIEW MODE A: Kitchen Stages Pipeline */
          <div className="grid grid-flow-col auto-cols-[minmax(280px,320px)] gap-4 overflow-x-auto pb-3">
              {PIPELINE_COLUMNS.map((col) => {
                const colOrders = getOrdersForPipelineColumn(col.id);
                const Icon = col.icon;

                return (
                  <div
                    key={col.id}
                    className="flex max-h-[min(72vh,900px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border-theme bg-card shadow-sm"
                  >
                    {/* Column Header */}
                    <div className={`min-h-[62px] p-4 border-b border-border-theme flex items-center justify-between gap-2 ${col.bg}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${col.color}`} />
                        <span className="font-bold text-xs leading-snug text-foreground uppercase tracking-wider">{col.label}</span>
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-background text-foreground border border-border-theme shadow-xs">
                        {colOrders.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin">
                      {colOrders.length === 0 ? (
                        <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-border-theme px-4 text-center">
                          <Package className="mb-2 h-7 w-7 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500">No orders here</p>
                          <p className="mt-1 text-[11px] text-slate-400">Orders will appear when they reach this stage.</p>
                        </div>
                      ) : (
                        colOrders.map(renderOrderCard)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW MODE B: Delivery Slot Columns (apne apne slot me) */
            <div className="grid grid-flow-col auto-cols-[minmax(280px,320px)] gap-4 overflow-x-auto pb-3">
              {SLOT_COLUMNS.map((col) => {
                const colOrders = getOrdersForSlotColumn(col.id);
                const Icon = col.icon;

                return (
                  <div
                    key={col.id}
                    className="flex max-h-[min(72vh,900px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border-theme bg-card shadow-sm"
                  >
                    {/* Column Header */}
                    <div className={`min-h-[62px] p-4 border-b border-border-theme flex items-center justify-between gap-2 ${col.bg}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${col.color}`} />
                        <div>
                          <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
                            {col.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {col.sub}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-background text-foreground border border-border-theme shadow-xs">
                        {colOrders.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin">
                      {colOrders.length === 0 ? (
                        <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-border-theme px-4 text-center">
                          <Calendar className="mb-2 h-7 w-7 text-slate-300" />
                          <p className="text-xs font-bold text-slate-500">No orders in this slot</p>
                          <p className="mt-1 text-[11px] text-slate-400">Scheduled orders will appear here.</p>
                        </div>
                      ) : (
                        colOrders.map(renderOrderCard)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
