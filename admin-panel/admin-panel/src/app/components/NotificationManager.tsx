"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getUnviewedOrders, markOrderAsViewed } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { Package, X, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLiveNotifications } from "../context/LiveNotificationContext";
import type { UnviewedOrder } from "../services/adminService";

export default function NotificationManager() {
  const [newOrders, setNewOrders] = useState<UnviewedOrder[]>([]);
  const newOrdersRef = React.useRef<UnviewedOrder[]>([]);
  const { showToast } = useToast();
  const router = useRouter();
  const { addNotification, markAsRead } = useLiveNotifications();
  const isCheckingRef = React.useRef(false);

  // Sync ref with state
  useEffect(() => {
    newOrdersRef.current = newOrders;
  }, [newOrders]);

  const checkOrders = useCallback(async () => {
    if (isCheckingRef.current || document.visibilityState === "hidden") return;
    isCheckingRef.current = true;
    try {
      const orders = await getUnviewedOrders();
      if (orders.length > 0) {
        // Filter out orders we already have in our local state to avoid multiple toasts for same order
        const freshOrders = orders.filter((order) => !newOrdersRef.current.some((seen) => seen._id === order._id));

        if (freshOrders.length > 0) {
          newOrdersRef.current = [...freshOrders, ...newOrdersRef.current];
          setNewOrders((prev) => [...freshOrders, ...prev]);
          freshOrders.forEach((order) => {
            const isMidnight = Boolean(order.deliverySlot?.name?.toLowerCase().includes("midnight"));
            const customer = order.user?.name || "Customer";
            addNotification({
              id: `order-${order._id}`,
              type: isMidnight ? "midnight" : "order",
              title: `New Order #${String(order._id).slice(-5).toUpperCase()}`,
              message: `${customer} placed an order worth ₹${order.totalAmount || 0}`,
              link: `/orders/${order._id}`,
              orderId: order._id,
              amount: order.totalAmount,
              customer,
              createdAt: order.createdAt || new Date().toISOString(),
            });
            if (isMidnight) {
              showToast(`🌙 Urgent Midnight Order from ${order.user?.name || "Customer"}!`, "info");
            } else {
              showToast(`🎂 New Order from ${order.user?.name || "Customer"}!`, "success");
            }

            // Desktop notification if permitted
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(`GiftFestive: ${isMidnight ? "🌙 Midnight Order" : "🎂 New Order"}`, {
                  body: `${order.user?.name || "Customer"} - Total: ₹${order.totalAmount || 0}`,
                  icon: "/images/GiftFestive.png",
                });
              } catch (error) {
                console.warn("Browser notification display error:", error);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Failed to check for new orders", error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [addNotification, showToast]);

  useEffect(() => {
    void checkOrders();
    const interval = window.setInterval(() => void checkOrders(), 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkOrders();
    };
    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkOrders]);

  const handleDismiss = async (id: string) => {
    // Optimistically remove the notification first so the UI responds instantly
    setNewOrders((prev) => prev.filter((o) => o._id !== id));
    newOrdersRef.current = newOrdersRef.current.filter((order) => order._id !== id);
    markAsRead(`order-${id}`);
    
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
