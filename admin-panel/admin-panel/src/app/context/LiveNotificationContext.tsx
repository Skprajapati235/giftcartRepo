"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { soundEffects } from "../utils/soundEffects";
import { getUnviewedOrders, markOrderAsViewed } from "../services/adminService";

export interface LiveNotification {
  id: string;
  type: "order" | "midnight" | "stock" | "support";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  amount?: number;
  customer?: string;
}

interface LiveNotificationContextType {
  notifications: LiveNotification[];
  unreadCount: number;
  isMuted: boolean;
  pushPermission: NotificationPermission | "default";
  toggleMute: () => void;
  requestPushPermission: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  triggerTestOrder: () => void;
}

const LiveNotificationContext = createContext<LiveNotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isMuted: false,
  pushPermission: "default",
  toggleMute: () => {},
  requestPushPermission: async () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  triggerTestOrder: () => {},
});

export const LiveNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([
    {
      id: "init-1",
      type: "midnight",
      title: "Midnight Cake Priority Alert",
      message: "Order #9824 requires dispatch by 11:30 PM for Sector 15 Faridabad.",
      timestamp: "10 mins ago",
      read: false,
      link: "/orders",
      amount: 899,
      customer: "Aarav Sharma",
    },
    {
      id: "init-2",
      type: "order",
      title: "New Pre-paid Order",
      message: "Payment confirmed via Razorpay for Chocolate Truffle Cake.",
      timestamp: "25 mins ago",
      read: false,
      link: "/orders",
      amount: 649,
      customer: "Pooja Malhotra",
    },
    {
      id: "init-3",
      type: "stock",
      title: "Low Inventory Warning",
      message: "Red Velvet Flavor Stock is below threshold (only 2 left).",
      timestamp: "1 hour ago",
      read: true,
      link: "/inventory",
    },
  ]);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");

  useEffect(() => {
    setIsMuted(soundEffects.getMuted());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  const requestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setPushPermission(perm);
        if (perm === "granted") {
          new Notification("GiftFestive Notifications Active", {
            body: "You will now receive instant desktop alerts for new midnight orders!",
            icon: "/images/GiftFestive.png",
          });
        }
      } catch (e) {
        console.warn("Push permission error:", e);
      }
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/images/GiftFestive.png",
        });
      } catch (e) {
        console.warn("Browser notification display error:", e);
      }
    }
  };

  const addNotification = (notif: Omit<LiveNotification, "id" | "timestamp" | "read">) => {
    const newEntry: LiveNotification = {
      ...notif,
      id: "notif-" + Date.now(),
      timestamp: "Just now",
      read: false,
    };

    setNotifications((prev) => [newEntry, ...prev]);

    // Sound effect
    if (notif.type === "midnight") {
      soundEffects.playUrgentAlert();
    } else {
      soundEffects.playOrderChime();
    }

    // Push notification
    sendBrowserNotification(notif.title, notif.message);
  };

  // Poll for actual unviewed orders
  useEffect(() => {
    let isMounted = true;
    const checkLiveOrders = async () => {
      try {
        const orders = await getUnviewedOrders();
        if (orders && orders.length > 0 && isMounted) {
          orders.forEach((order: any) => {
            addNotification({
              type: order.deliverySlot?.name?.toLowerCase().includes("midnight") ? "midnight" : "order",
              title: `New Order #${(order._id || "").slice(-5).toUpperCase()}`,
              message: `${order.user?.name || "Customer"} placed an order worth ₹${order.totalAmount || 0}`,
              link: "/orders",
              amount: order.totalAmount,
              customer: order.user?.name || "Customer",
            });
            markOrderAsViewed(order._id).catch(() => {});
          });
        }
      } catch (_) {}
    };

    const interval = setInterval(checkLiveOrders, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const triggerTestOrder = () => {
    const names = ["Simran Kaur", "Vikas Verma", "Deepak Gupta", "Rohan Mehta", "Ananya Joshi"];
    const cakes = ["Belgian Dark Truffle", "Fresh Red Velvet Heart", "Pineapple Blossom Cake", "Blueberry Cheesecake"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomCake = cakes[Math.floor(Math.random() * cakes.length)];
    const randomAmount = Math.floor(Math.random() * 600) + 499;
    const isMidnight = Math.random() > 0.5;

    addNotification({
      type: isMidnight ? "midnight" : "order",
      title: isMidnight ? "🌙 New Midnight Delivery Order!" : "🎂 New Order Received!",
      message: `${randomName} ordered ${randomCake} (₹${randomAmount}) for Sector 14, Faridabad`,
      link: "/orders",
      amount: randomAmount,
      customer: randomName,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <LiveNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isMuted,
        pushPermission,
        toggleMute,
        requestPushPermission,
        markAsRead,
        markAllAsRead,
        clearAll,
        triggerTestOrder,
      }}
    >
      {children}
    </LiveNotificationContext.Provider>
  );
};

export const useLiveNotifications = () => useContext(LiveNotificationContext);
