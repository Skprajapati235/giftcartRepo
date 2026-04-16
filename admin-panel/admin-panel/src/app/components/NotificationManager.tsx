"use client";

import React, { useEffect, useState } from "react";
import { getUnviewedOrders, markOrderAsViewed } from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import { Bell, Package, X } from "lucide-react";
import { useRouter } from "next/navigation";

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
            showToast(`New Order from ${order.user?.name || "Customer"}!`, "success");
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
    // Check immediately and then every 30 seconds
    checkOrders();
    const interval = setInterval(checkOrders, 30000);
    return () => clearInterval(interval);
  }, []); // Only run once on mount

  const handleDismiss = async (id: string) => {
    try {
      await markOrderAsViewed(id);
      setNewOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (error) {
      console.error("Failed to mark order as viewed", error);
    }
  };

  if (newOrders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 animate-in fade-in slide-in-from-right-10 duration-500">
      {newOrders.map((order) => (
        <div
          key={order._id}
          className="bg-card border-2 border-primary/30 shadow-2xl rounded-2xl p-4 w-80 backdrop-blur-xl flex gap-4 relative group hover:scale-[1.02] transition-transform cursor-pointer"
          onClick={() => {
            router.push(`/orders`);
            handleDismiss(order._id);
          }}
        >
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <Package className="text-primary" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New Order Received
            </p>
            <p className="text-sm font-bold text-foreground truncate">{order.user?.name || "Anonymous"}</p>
            <p className="text-[10px] text-slate-500 font-medium">Order: #{order._id.slice(-6).toUpperCase()}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss(order._id);
            }}
            className="h-6 w-6 rounded-full hover:bg-hover-theme flex items-center justify-center text-slate-400 hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
