"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { soundEffects } from "../utils/soundEffects";

export interface LiveNotification {
  id: string;
  type: "order" | "midnight" | "stock" | "support";
  title: string;
  message: string;
  timestamp?: string;
  createdAt: number | string;
  read: boolean;
  link?: string;
  orderId?: string;
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
  addNotification: (notification: Omit<LiveNotification, "id" | "read"> & { id?: string }) => void;
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
  addNotification: () => {},
  triggerTestOrder: () => {},
});

export const LiveNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");
  const notificationIds = useRef(new Set<string>());

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

  const addNotification = (notif: Omit<LiveNotification, "id" | "read"> & { id?: string }) => {
    const now = Date.now();
    const id = notif.id || `notif-${now}`;
    if (notificationIds.current.has(id)) return;
    notificationIds.current.add(id);

    const newEntry: LiveNotification = {
      ...notif,
      id,
      createdAt: notif.createdAt || now,
      timestamp: notif.timestamp || "Just now",
      read: false,
      link: notif.link || "/orders",
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
      createdAt: Date.now(),
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
        addNotification,
        triggerTestOrder,
      }}
    >
      {children}
    </LiveNotificationContext.Provider>
  );
};

export const useLiveNotifications = () => useContext(LiveNotificationContext);
