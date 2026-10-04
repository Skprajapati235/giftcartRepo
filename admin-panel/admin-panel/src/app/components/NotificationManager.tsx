"use client";

import React, { useEffect, useState } from "react";
import { getUnviewedOrders, markOrderAsViewed } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { Bell, Package, X, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { soundEffects } from "../utils/soundEffects";

export default function NotificationManager() {
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const newOrdersRef = React.useRef<any[]>([]);
  const { showToast } = useToast();
  const router = useRouter();

  // Sync ref with state
  useEffect(() => {
    newOrdersRef.current = newOrders;
  }, [newOrders]);

  const checkOrders = async () => {
    try {
      const orders = await getUnviewedOrders();
      if (orders && orders.length > 0) {
        // Filter out orders we already have in our local state to avoid multiple toasts for same order
        const freshOrders = orders.filter((o: any) => !newOrdersRef.current.find((no) => no._id === o._id));

        if (freshOrders.length > 0) {
          freshOrders.forEach((order: any) => {
            const isMidnight = Boolean(order.deliverySlot?.name?.toLowerCase().includes("midnight"));
            if (isMidnight) {
              soundEffects.playUrgentAlert();
              showToast(`🌙 Urgent Midnight Order from ${order.user?.name || "Customer"}!`, "info");
            } else {
              soundEffects.playOrderChime();
              showToast(`🎂 New Order from ${order.user?.name || "Customer"}!`, "success");
            }

            // Desktop notification if permitted
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(`GiftFestive: ${isMidnight ? "🌙 Midnight Order" : "🎂 New Order"}`, {
                  body: `${order.user?.name || "Customer"} - Total: ₹${order.totalAmount || 0}`,
                  icon: "/images/GiftFestive.png",
                });
              } catch (_) {}
            }
          });
          setNewOrders(orders);
        }
      } else {
        setNewOrders([]);
      }
    } catch (error) {
      console.error("Failed to check for new orders", error);
    }
  };

  useEffect(() => {
    checkOrders(); // Check immediately on mount
    const interval = setInterval(() => {
      checkOrders();
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (id: string) => {
    // Optimistically remove the notification first so the UI responds instantly
    setNewOrders((prev) => prev.filter((o) => o._id !== id));
    
    try {
      await markOrderAsViewed(id);
    } catch (error) {
      console.error("Failed to mark order as viewed", error);
    }
  };

  if (newOrders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 animate-in fade-in slide-in-from-right-10 duration-500">
      {newOrders.map((order) => {
        const isMidnight = Boolean(order.deliverySlot?.name?.toLowerCase().includes("midnight"));
        return (
          <div
            key={order._id}
            className={`border-2 shadow-2xl rounded-2xl p-4 w-80 backdrop-blur-xl flex gap-4 relative group hover:scale-[1.02] transition-transform cursor-pointer ${
              isMidnight
                ? "bg-purple-950/90 border-purple-500 text-white"
                : "bg-card border-pink-500/40 text-foreground"
            }`}
            onClick={() => {
              router.push(`/orders`);
              handleDismiss(order._id);
            }}
          >
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${
                isMidnight
                  ? "bg-purple-500/20 border-purple-400 text-purple-300"
                  : "bg-pink-500/10 border-pink-500/20 text-pink-500"
              }`}
            >
              {isMidnight ? <Moon size={24} /> : <Package size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${
                  isMidnight ? "text-purple-300" : "text-pink-500"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isMidnight ? "bg-purple-400" : "bg-pink-500"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isMidnight ? "bg-purple-400" : "bg-pink-500"
                    }`}
                  ></span>
                </span>
                {isMidnight ? "Midnight Express" : "New Order"}
              </p>
              <p className="text-sm font-bold truncate">{order.user?.name || "Customer"}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>#{order._id.slice(-6).toUpperCase()}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">₹{order.totalAmount || 0}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(order._id);
              }}
              className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
