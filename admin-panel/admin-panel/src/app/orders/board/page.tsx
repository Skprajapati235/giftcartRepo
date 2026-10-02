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
  Sparkles,
  Gift,
  RefreshCw,
  Volume2,
  VolumeX,
  Phone,
  Eye,
  ArrowRight,
  MessageSquare,
  AlertCircle,
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

const COLUMNS: { id: KitchenStatus; label: string; icon: any; color: string; bg: string }[] = [
  { id: "Received", label: "🔔 New / Received", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "Preparing", label: "👨‍🍳 In Kitchen / Baking", icon: ChefHat, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  { id: "Packed", label: "📦 Quality Checked & Packed", icon: Package, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "OutForDelivery", label: "🛵 Out for Delivery", icon: Bike, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { id: "Delivered", label: "✅ Delivered", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
];

export default function KitchenBoardPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  // Play browser beep when a new order arrives
  const playChime = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch (e) {
      // Audio autoplay policy
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders({ limit: 100 });
      const list: OrderData[] = Array.isArray(res) ? res : res?.data || [];

      // Check if new orders arrived since last poll
      if (prevCountRef.current > 0 && list.length > prevCountRef.current) {
        playChime();
      }
      prevCountRef.current = list.length;
      setOrders(list);
    } catch (err) {
      console.error("Failed to load orders for Kanban:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 25000); // 25s auto-poll
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (order: OrderData, nextStatus: KitchenStatus) => {
    try {
      setUpdatingId(order._id);
      await updateOrderKitchenStatus(order._id, nextStatus);
      // Update locally
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, kitchenStatus: nextStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getOrdersForColumn = (status: KitchenStatus) => {
    return orders.filter((o) => {
      const k = o.kitchenStatus || (o.status === "Delivered" ? "Delivered" : o.status === "Shipped" ? "OutForDelivery" : o.status === "Processing" ? "Preparing" : "Received");
      return k === status;
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

  return (
    <ProtectedRoute>
      <AdminMain className="max-w-[1800px] mx-auto">
        <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Live Kitchen & Order Board (KDS)</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse">
                  ● LIVE
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Visual Kanban fulfillment pipeline for chefs, bakers, and dispatchers. Auto-refreshes in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition ${
              audioEnabled
                ? "bg-card border-border text-foreground hover:bg-muted"
                : "bg-muted border-border/50 text-muted-foreground"
            }`}
            title={audioEnabled ? "Sound Alert ON" : "Sound Alert OFF"}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
            <span>{audioEnabled ? "Sound ON" : "Muted"}</span>
          </button>

          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition shadow-sm text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Board
          </button>

          <Link
            href="/orders"
            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium text-foreground transition"
          >
            Table View
          </Link>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 min-h-[650px] items-start">
        {COLUMNS.map((col) => {
          const colOrders = getOrdersForColumn(col.id);
          const Icon = col.icon;
          const next = getNextAction(col.id);

          return (
            <div
              key={col.id}
              className="bg-card border border-border rounded-2xl flex flex-col h-full shadow-sm overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-4 border-b border-border flex items-center justify-between ${col.bg}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${col.color}`} />
                  <span className="font-bold text-sm text-foreground">{col.label}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-background/80 text-foreground border border-border shadow-sm">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-3 space-y-3 overflow-y-auto max-h-[750px] scrollbar-thin">
                {colOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    No orders in this stage
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const isUpdating = updatingId === order._id;
                    const isMidnight = order.deliverySlot?.slotType === "midnight";
                    const isFixed = order.deliverySlot?.slotType === "fixed_time";

                    return (
                      <div
                        key={order._id}
                        className="p-4 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-200 space-y-3 shadow-xs"
                      >
                        {/* Order ID & Time */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-foreground">
                            #{String(order._id).slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Delivery Slot Badge */}
                        {order.deliverySlot && (
                          <div
                            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                              isMidnight
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                : isFixed
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isMidnight ? <Moon className="w-3.5 h-3.5 shrink-0" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{order.deliverySlot.timeRange || order.deliverySlot.slotName}</span>
                          </div>
                        )}

                        {/* Customer Info */}
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-foreground truncate">
                            {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                          </p>
                          {(order.shippingAddress?.phone || order.user?.mobileNumber) && (
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground/80" />
                              {order.shippingAddress?.phone || order.user?.mobileNumber}
                            </p>
                          )}
                        </div>

                        {/* Items preview */}
                        <div className="space-y-1 pt-1 border-t border-border">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-xs text-foreground flex items-center justify-between">
                              <span className="font-medium truncate max-w-[150px]">
                                {item.name} {item.isEggless ? "🥚(Eggless)" : ""}
                              </span>
                              <span className="text-muted-foreground font-mono">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-[11px] text-muted-foreground font-medium">
                              +{order.items.length - 3} more items
                            </p>
                          )}
                        </div>

                        {/* Custom Message on Cake */}
                        {(order.messageOnCake || order.items.some((i) => i.messageOnCake)) && (
                          <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-xs text-pink-700 dark:text-pink-300">
                            <span className="font-bold flex items-center gap-1 mb-0.5">
                              🎂 Cake Message:
                            </span>
                            <span className="italic font-serif">
                              "{order.messageOnCake || order.items.find((i) => i.messageOnCake)?.messageOnCake}"
                            </span>
                          </div>
                        )}

                        {/* Greeting Card Message */}
                        {order.cardMessage && (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                            <span className="font-bold flex items-center gap-1 mb-0.5">
                              💌 Greeting Card:
                            </span>
                            <span className="italic">"{order.cardMessage}"</span>
                          </div>
                        )}

                        {/* Add-ons */}
                        {order.addons && order.addons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {order.addons.map((a, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              >
                                🎁 {a.name} (×{a.quantity})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Total amount & Action */}
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">₹{order.totalAmount}</span>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/orders?id=${order._id}`}
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                              title="View Order"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {next && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleAdvanceStatus(order, next.next)}
                                className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
                              >
                                {isUpdating ? "..." : next.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </AdminMain>
</ProtectedRoute>
  );
}
