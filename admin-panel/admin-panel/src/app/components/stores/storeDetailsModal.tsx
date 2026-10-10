"use client";

import React from "react";
import {
  X,
  Store,
  User,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Edit,
  Tag,
  Percent,
  Calendar,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface StoreDetailsModalProps {
  store: any;
  onClose: () => void;
  onEdit: (store: any) => void;
}

export default function StoreDetailsModal({ store, onClose, onEdit }: StoreDetailsModalProps) {
  if (!store) return null;

  const cleanPhone = (store.whatsappNumber || store.ownerPhone || "").replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${store.ownerFirstName || store.name}, this is from GiftCart Team regarding a customer order fulfillment.`
  )}`;

  const callUrl = `tel:${store.ownerPhone || store.whatsappNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card w-full max-w-2xl my-8 rounded-3xl border border-border-theme shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner / Header */}
        <div className="relative h-44 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-purple-500/20 border-b border-border-theme flex items-end p-6">
          {store.image && (
            <img
              src={store.image}
              alt={store.name}
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <X size={18} />
          </button>

          <div className="relative flex items-center gap-4 z-10">
            <div className="w-20 h-20 rounded-2xl bg-card border-2 border-border-theme shadow-xl overflow-hidden flex items-center justify-center text-amber-500 shrink-0">
              {store.image ? (
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Store size={36} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground drop-shadow-sm">{store.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                    store.status === "active"
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      : store.status === "onboarding"
                      ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                      : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                  }`}
                >
                  {store.status || "active"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-amber-500" />
                {store.city || "City not set"}
                {store.state ? `, ${store.state}` : ""}
                {store.pincode ? ` - ${store.pincode}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Contact Action Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-surface/50 border-b border-border-theme">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <MessageCircle size={15} />
            <span>Send Order on WhatsApp</span>
          </a>

          <a
            href={callUrl}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 text-xs font-semibold transition-all"
          >
            <Phone size={15} />
            <span>Call Owner</span>
          </a>

          {store.googleMapsUrl ? (
            <a
              href={store.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 hover:bg-purple-500/20 text-xs font-semibold transition-all"
            >
              <ExternalLink size={15} />
              <span>Open in Maps</span>
            </a>
          ) : (
            <button
              onClick={() => onEdit(store)}
              className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold transition-all"
            >
              <Edit size={15} />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          {/* Owner & Communication Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-border-theme space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-blue-500" /> Owner Details
              </p>
              <p className="text-base font-bold text-foreground">
                {store.ownerFirstName} {store.ownerLastName || ""}
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone size={12} /> Calling:{" "}
                  <span className="font-mono text-foreground font-semibold">
                    {store.ownerPhone}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle size={12} className="text-emerald-500" /> WhatsApp:{" "}
                  <span className="font-mono text-foreground font-semibold">
                    {store.whatsappNumber}
                  </span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border-theme space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={13} className="text-rose-500" /> Commercial Tie-Up
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-500">
                  {store.commissionPercentage || 0}%
                </span>
                <span className="text-xs text-muted-foreground">Margin / Agreed Discount</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tie-up partner under GiftCart managed network. Zero customer return risk.
              </p>
            </div>
          </div>

          {/* Full Address */}
          {store.address && (
            <div className="p-4 rounded-2xl bg-surface border border-border-theme space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-500" /> Store Physical Address
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{store.address}</p>
              <p className="text-xs text-muted-foreground">
                {store.city} {store.state ? `, ${store.state}` : ""} {store.pincode ? ` - ${store.pincode}` : ""}
              </p>
            </div>
          )}

          {/* Specialities / Categories */}
          {Array.isArray(store.categories) && store.categories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={13} className="text-purple-500" /> Partner Specializations
              </p>
              <div className="flex flex-wrap gap-2">
                {store.categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {store.description && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-amber-500" /> Store Description & Offerings
              </p>
              <div className="p-4 rounded-2xl bg-surface border border-border-theme text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {store.description}
              </div>
            </div>
          )}

          {/* Private Notes */}
          {store.notes && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-blue-500" /> Admin Private Notes
              </p>
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 whitespace-pre-wrap leading-relaxed">
                {store.notes}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border-theme">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> Partner Added: {new Date(store.createdAt).toLocaleDateString()}
            </span>
            <span>Store ID: {store._id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-theme bg-surface/50">
          <button
            onClick={() => onEdit(store)}
            className="px-5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Edit size={14} /> Edit Store Info
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-border-theme text-foreground hover:bg-surface text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
