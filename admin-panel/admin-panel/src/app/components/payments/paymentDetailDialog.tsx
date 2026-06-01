"use client";

import React, { useEffect } from "react";

type Payment = any;

export default function PaymentDetailDialog({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!payment) return null;

  const statusColor = (status: string) => {
    if (!status) return "bg-gray-400 text-white";
    if (status === "Success") return "bg-emerald-500 text-white";
    if (status === "Processing") return "bg-amber-500 text-white";
    if (status === "Pending") return "bg-blue-500 text-white";
    if (status === "Failed") return "bg-red-500 text-white";
    return "bg-gray-400 text-white";
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full md:w-[620px] bg-card border-l border-border-theme shadow-2xl p-0 overflow-auto">
        <div className="p-6 bg-card border-b border-border-theme">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="w-1 h-10 rounded bg-gradient-to-b from-indigo-500 to-cyan-400" />
              <div>
                <h3 className="text-2xl font-extrabold text-foreground">Payment Details</h3>
                <div className="text-sm text-slate-400 mt-1">{payment.razorpayPaymentId || payment._id}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-2xl font-bold text-foreground">₹{(payment.totalAmount ?? 0).toFixed(2)}</div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-foreground p-2">✕</button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusColor(payment.paymentStatus)}`}>
              {payment.paymentStatus}
            </span>
            <span className="inline-flex items-center bg-hover-theme text-sm px-2 py-1 rounded-md text-foreground">{payment.paymentMethod}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 p-4 rounded-lg bg-card/60 border border-border-theme">
              <h4 className="text-sm font-bold text-foreground mb-2">Customer</h4>
              <div className="text-lg font-semibold text-foreground">{payment.user?.name}</div>
              <div className="text-xs text-slate-400">{payment.user?.email}</div>
            </div>

            <div className="w-48 p-4 rounded-lg bg-card/60 border border-border-theme flex flex-col items-end justify-between">
              <div className="text-xs text-slate-400">Status</div>
              <div className="text-sm font-bold"><span className={`px-3 py-1 rounded-full ${statusColor(payment.paymentStatus)}`}>{payment.paymentStatus}</span></div>
              <div className="mt-2 text-xs text-slate-400">Date</div>
              <div className="text-sm">{new Date(payment.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card/60 border border-border-theme">
            <h4 className="text-sm font-bold text-foreground">Shipping Address</h4>
            <div className="mt-2 text-sm text-foreground font-semibold">{payment.shippingAddress?.fullName}</div>
            <div className="text-xs text-slate-400">{payment.shippingAddress?.phone}</div>
            <div className="mt-1 text-sm text-foreground">{payment.shippingAddress?.address}</div>
            <div className="text-xs text-slate-400">Pin: {payment.shippingAddress?.pinCode}</div>
          </div>

          <div className="p-4 rounded-lg bg-card/60 border border-border-theme">
            <h4 className="text-sm font-bold text-foreground">Items ({payment.items?.length || 0})</h4>
            <div className="mt-3 space-y-3">
              {(payment.items || []).map((it: any) => (
                <div key={it._id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gradient-to-r from-white/2 to-white/1 border border-border-theme">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold">{(it.name || 'Item').charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-foreground">{it.name}</div>
                      <div className="text-xs text-slate-400">Qty: {it.quantity} • {it.weight || ''}</div>
                      {it.flavor ? <div className="text-xs text-slate-400">Flavor: {it.flavor}</div> : null}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-foreground">₹{(it.itemTotal ?? it.price ?? 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="p-4 rounded-lg bg-card/60 border border-border-theme w-full">
              <h4 className="text-sm font-bold text-foreground">Payment Info</h4>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Method</div>
                <div className="text-foreground font-semibold">{payment.paymentMethod}</div>

                <div className="text-slate-400">Razorpay Order ID</div>
                <div className="text-foreground font-semibold">{payment.razorpayOrderId}</div>

                <div className="text-slate-400">Razorpay Payment ID</div>
                <div className="text-foreground font-semibold">{payment.razorpayPaymentId}</div>
              </div>
            </div>

            <div className="w-64 p-4 rounded-lg bg-card/60 border border-border-theme">
              <h4 className="text-sm font-bold text-foreground">Totals</h4>
              <div className="mt-3 text-sm">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{(payment.items || []).reduce((s: number, i: any) => s + (i.itemTotal ?? i.price ?? 0), 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Shipping</span><span>₹{(payment.items || []).reduce((s: number, i: any) => s + (i.shippingCost ?? 0), 0).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold mt-2"><span>Total</span><span>₹{(payment.totalAmount ?? 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card/60 border border-border-theme">
            <h4 className="text-sm font-bold text-foreground">WhatsApp Logs</h4>
            <div className="mt-2 space-y-2 text-xs text-slate-400">
              {(payment.whatsappLogs || []).map((log: any) => (
                <div key={log._id} className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{log.event}</div>
                    <div className="text-[11px]">To: {log.to}</div>
                  </div>
                  <div className="text-[11px]">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button className="px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10">Resend Receipt</button>
            <button className="px-4 py-2 rounded-lg bg-amber-500 text-white">Mark as Delivered</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
