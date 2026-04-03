"use client";

import React, { useEffect, useState } from "react";
import { X, Mail, MapPin, User, Phone, Calendar, CheckCircle2 } from "lucide-react";
import { getAllOrders } from "../../services/adminService";

interface UserDetailProps {
  user: any;
  onClose: () => void;
}

export default function UserDetailDialogue({ user, onClose }: UserDetailProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const allOrders = await getAllOrders();
        // Assuming user match by email if ID is deeply populated
        const userOrders = allOrders.filter((o: any) => o.user?.email === user.email);
        setOrders(userOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (user) fetchUserOrders();
  }, [user]);

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      {/* Floating wider dialog panel with manual top/bottom margin or padding */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-card shadow-2xl z-50 flex flex-col p-8 sm:py-10 animate-in slide-in-from-right duration-300">

        {/* Header - Fixed */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-foreground">Contact Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Profile Info - Fixed (Non-scrollable) */}
        <div className="shrink-0">
          {/* Avatar and Main Info */}
          <div className="flex flex-col items-center mt-2 mb-8 text-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 p-1">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <div className="bg-amber-100 h-full w-full flex items-center justify-center text-amber-500">
                    <User size={40} />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
              {user.name} <CheckCircle2 className="text-blue-500" size={18} />
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Details Grid Array */}
          <div className="grid grid-cols-2 gap-6 bg-card border border-border-theme p-6 rounded-2xl mb-8 shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1 mb-1">
                <User size={12} className="text-blue-500" /> NAME
              </p>
              <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Mail size={12} className="text-blue-500" /> EMAIL
              </p>
              <p className="font-bold text-sm text-foreground truncate">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Phone size={12} className="text-blue-500" /> PHONE NO
              </p>
              <p className="font-bold text-sm text-foreground truncate">{user.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1 mb-1">
                <Calendar size={12} className="text-blue-500" /> CREATED AT
              </p>
              <p className="font-bold text-sm text-foreground truncate">{new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border-theme mb-4">
            <button className="border-b-2 border-primary text-primary font-bold text-sm pb-2 px-2 uppercase tracking-wide">
              ORDER ({orders.length})
            </button>
          </div>
        </div>

        {/* Orders List - Only this part is scrollable */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loadingOrders ? (
            <div className="text-center py-10 text-slate-400 font-bold text-sm animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-70">
              <svg className="w-24 h-24 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-slate-500 font-semibold">No order available</p>
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {orders.map((order) => (
                <div key={order._id} className="border border-border-theme p-4 rounded-xl flex justify-between items-center bg-hover-theme/50">
                  <div>
                    <p className="text-xs font-mono text-slate-400 font-bold mb-1">#{order._id.slice(-6)}</p>
                    <p className="text-sm font-bold text-foreground">₹{order.totalAmount}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
