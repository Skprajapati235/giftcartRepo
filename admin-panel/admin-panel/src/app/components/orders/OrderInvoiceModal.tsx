"use client";

import React, { useRef, useState } from "react";
import {
  Printer,
  X,
  FileText,
  ChefHat,
  Download,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";

interface OrderInvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, isOpen, onClose }: OrderInvoiceModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"invoice" | "kitchen">("invoice");
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderId = order._id || "GF-00000";
  const shortId = orderId.slice(-6).toUpperCase();
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Today";
  const customerName = order.user?.name || "Customer";
  const customerPhone = order.user?.mobileNumber || order.shippingAddress?.phone || "8400787712";
  const address = order.shippingAddress?.streetAddress || "Faridabad Urban Area, Haryana";
  const pincode = order.shippingAddress?.postalCode || "121001";
  const items = order.items || [
    { name: "Signature Belgian Truffle Cake", quantity: 1, price: order.totalAmount || 649, weight: "1 Kg" },
  ];
  const totalAmount = order.totalAmount || 649;
  const deliveryFee = order.deliveryFee ?? 0;
  const discount = order.discountAmount ?? 0;
  const subtotal = items.reduce((acc: number, it: any) => acc + (it.price || 0) * (it.quantity || 1), 0);
  const gst = Math.round(subtotal * 0.05);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Container Card */}
      <div className="relative w-full max-w-3xl rounded-3xl border border-border-theme bg-card shadow-2xl overflow-hidden my-8">
        {/* Top Control Bar (Hidden during Print) */}
        <div className="print:hidden p-4 border-b border-border-theme flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Order #{shortId} Document Generator
              </h3>
              <p className="text-[10px] text-slate-400">Official Tax Invoice & Kitchen Dispatch Slip</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center rounded-xl border border-border-theme bg-background p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("invoice")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "invoice"
                    ? "bg-pink-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Tax Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("kitchen")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "kitchen"
                    ? "bg-pink-500 text-white shadow-xs"
                    : "text-slate-500 hover:text-foreground"
                }`}
              >
                <ChefHat className="h-3.5 w-3.5" />
                <span>Kitchen Slip</span>
              </button>
            </div>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-pink-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-pink-600 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl hover:bg-hover-theme flex items-center justify-center text-slate-400 hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div ref={printableRef} className="p-6 sm:p-8 bg-white text-slate-900 font-sans print:p-0">
          {activeTab === "invoice" ? (
            /* TAX INVOICE */
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-600 text-white font-black text-lg">
                      G
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                      GiftFestive
                    </h1>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-1">Faridabad Premium Online Gifting & Cakes</p>
                  <p className="text-[11px] text-slate-500">Sector 15 Main Market, Faridabad, Haryana - 121007</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 06AAACG1234F1Z8 • Phone: +91 8400787712</p>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-md bg-slate-900 text-white px-3 py-1 text-xs font-black uppercase tracking-wider">
                    TAX INVOICE
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-2">Invoice #: INV-{shortId}</p>
                  <p className="text-xs text-slate-500">Order ID: #{orderId}</p>
                  <p className="text-xs text-slate-500">Date: {createdAt}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-1">
                    Payment: {order.paymentMethod || "Online"} ({order.paymentStatus || "Paid"})
                  </p>
                </div>
              </div>

              {/* Bill To & Ship To */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Billed & Delivered To:
                  </span>
                  <p className="text-sm font-black text-slate-900">{customerName}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>+91 {customerPhone}</span>
                  </p>
                  {order.shippingAddress?.alternatePhone && (
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-blue-500" />
                      <span>Alt: +91 {order.shippingAddress.alternatePhone}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {address}, Pincode: {pincode}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Delivery Slot & Instructions:
                  </span>
                  <div className="inline-flex items-center gap-1 rounded-lg bg-pink-100 text-pink-700 px-2.5 py-1 text-xs font-bold">
                    <Clock className="h-3 w-3" />
                    <span>{order.deliverySlot?.name || "Standard Delivery Slot"}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 italic">
                    Note: Hand-deliver fresh. Keep refrigerated until celebration.
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b-2 border-slate-900 bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((it: any, index: number) => (
                      <tr key={index}>
                        <td className="py-2.5 px-3 text-slate-500 font-bold">{index + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{it.name || "Celebration Cake"}</p>
                          <span className="text-[10px] text-slate-500">
                            Weight/Variant: {it.weight || "Standard"} • 100% Eggless
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {it.quantity || 1}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          ₹{it.price || totalAmount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ₹{(it.price || totalAmount) * (it.quantity || 1)}
                        </td>
                      </tr>
                    ))}
                    {Array.isArray(order.addons) && order.addons.map((ad: any, idx: number) => (
                      <tr key={`addon-${idx}`} className="bg-pink-50/40">
                        <td className="py-2.5 px-3 text-pink-500 font-bold">{items.length + idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{ad.name}</p>
                          <span className="text-[10px] text-pink-600 font-bold">
                            ✨ Celebration Add-on {ad.category ? `• ${ad.category}` : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {ad.quantity || 1}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          ₹{ad.price || 0}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ₹{(ad.price || 0) * (ad.quantity || 1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Slot Fee:</span>
                      <span className="font-semibold">₹{deliveryFee}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount:</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5% Included):</span>
                    <span className="font-semibold">₹{gst}</span>
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>Grand Total:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Footer & QR */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 border border-slate-300 rounded-lg p-1 flex items-center justify-center font-mono text-[8px] text-center bg-slate-50">
                    [QR CODE]
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Scan to Verify Order</p>
                    <p>https://www.giftfestive.com/track/{orderId.slice(-6)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900">GiftFestive Authorized Signatory</p>
                  <p className="text-[10px] text-slate-400">Computer Generated Document</p>
                </div>
              </div>
            </div>
          ) : (
            /* KITCHEN DISPATCH SLIP */
            <div className="space-y-6">
              <div className="border-b-4 border-orange-500 pb-4 flex items-center justify-between">
                <div>
                  <span className="rounded-lg bg-orange-500 text-white px-3 py-1 text-xs font-black uppercase">
                    👨‍🍳 KITCHEN LIVE DISPATCH TICKET
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">
                    Order #{shortId}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-300 px-3 py-1 text-xs font-black">
                    {order.deliverySlot?.name || "Midnight Delivery Slot"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Booked: {createdAt}</p>
                </div>
              </div>

              {/* High Contrast Chef Instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Items to Bake & Pack:
                </h4>
                {items.map((it: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-2xl border-2 border-slate-800 p-4 bg-orange-50/50 flex items-start justify-between"
                  >
                    <div>
                      <p className="text-lg font-black text-slate-900">{it.name}</p>
                      <p className="text-sm font-bold text-orange-600 mt-0.5">
                        Weight: {it.weight || "1 Kg"} • 100% Pure Vegetarian / Eggless
                      </p>
                      <div className="mt-2 rounded-xl bg-white border border-slate-300 p-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Message on Cake Inscription:
                        </span>
                        <p className="text-sm font-black text-slate-900 italic">
                          "{order.messageOnCake || it.cakeMessage || "Happy Birthday!"}"
                        </p>
                      </div>
                    </div>
                    <span className="rounded-xl bg-slate-900 text-white text-lg font-black px-4 py-2">
                      x{it.quantity || 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Celebration Add-ons to Pack */}
              {Array.isArray(order.addons) && order.addons.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <span>✨ Celebration Add-ons to Pack:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.addons.map((ad: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-purple-300 bg-purple-50/70 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{ad.name}</span>
                          {ad.category && (
                            <span className="text-[10px] text-purple-600 font-semibold">{ad.category}</span>
                          )}
                        </div>
                        <span className="rounded-lg bg-purple-700 text-white text-xs font-black px-2.5 py-1">
                          x{ad.quantity || 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kitchen Checklist */}
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 space-y-2">
                <p className="text-xs font-black uppercase text-slate-600">Packing & Dispatch Checklist:</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-pink-600" />
                    <span>Quality & Cream Inspection</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-pink-600" />
                    <span>Included Cake Knife & Magic Candles</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-pink-600" />
                    <span>Fresh Cut Ribbon Box Pack</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 accent-pink-600" />
                    <span>Handed to Delivery Rider</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
