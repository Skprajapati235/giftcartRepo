"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Edit,
  Trash2,
  RefreshCw,
  Store,
  Star,
  X,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import AddEditDecorationPartner from "./AddEditDecorationPartner";
import { useToast } from "@/context/ToastContext";

export default function DecorationPartnersView() {
  const { showToast } = useToast();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // In-Page Add/Edit Partner View (NO MODALS!)
  const [editingPartner, setEditingPartner] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await service.getDecoratorPartners({ city: "Faridabad" });
      if (res?.success) {
        setPartners(res.partners || res.data || []);
      }
    } catch (err) {
      console.error("Error loading decorator partners:", err);
      showToast("Failed to fetch Faridabad decorator partners", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove decorator partner "${name}"?`)) return;
    try {
      await service.deleteDecoratorPartner(id);
      showToast("Decorator partner removed successfully", "success");
      loadPartners();
    } catch (err: any) {
      showToast(err.message || "Failed to delete partner", "error");
    }
  };

  // If in Add/Edit mode, render the single-file in-page component directly!
  if (isAddingNew || editingPartner) {
    return (
      <AddEditDecorationPartner
        partner={editingPartner}
        onClose={() => {
          setIsAddingNew(false);
          setEditingPartner(null);
          loadPartners();
        }}
      />
    );
  }

  const filtered = partners.filter((p) => {
    const s = search.toLowerCase();
    const areasMatch = Array.isArray(p.coveredAreas)
      ? p.coveredAreas.some((a: string) => a.toLowerCase().includes(s))
      : false;
    return (
      p.name?.toLowerCase().includes(s) ||
      p.ownerName?.toLowerCase().includes(s) ||
      p.phone?.includes(s) ||
      p.city?.toLowerCase().includes(s) ||
      areasMatch
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Store className="w-6 h-6 text-pink-600" />
              Faridabad Decorator Tie-up Partners
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40">
              Dedicated Model
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Exclusive local balloon artists, florists & room decorators for NIT, Sectors 15/21 & Surajkund.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadPartners}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            title="Refresh Partners"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setEditingPartner(null);
              setIsAddingNew(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Faridabad Decorator</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partner, owner, phone, or sector..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Faridabad Decorator Partners...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            No decorator partners found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {search
              ? "No partner matches your search query."
              : "Onboard your first Faridabad decorator partner to assign bookings."}
          </p>
          {!search && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 transition"
            >
              + Onboard First Partner
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((partner) => {
            const cleanPhone = (partner.whatsapp || partner.phone || "").replace(/\D/g, "");
            const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

            return (
              <div
                key={partner._id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Name & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-pink-600 transition truncate">
                          {partner.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                        Owner:{" "}
                        <strong className="text-gray-800 dark:text-gray-200">
                          {partner.ownerName}
                        </strong>
                      </p>
                    </div>

                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-200 dark:border-amber-900/40 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {partner.rating || "4.9"}
                    </span>
                  </div>

                  {/* Contact Badges */}
                  <div className="flex items-center gap-2 mt-4">
                    <a
                      href={`tel:${partner.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition border border-gray-200 dark:border-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>{partner.phone}</span>
                    </a>

                    <a
                      href={`https://wa.me/${waPhone}?text=Hello%20${encodeURIComponent(partner.ownerName)},%20GiftCart%20Faridabad%20Decoration%20Team%20here.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 text-xs font-black transition border border-emerald-200 dark:border-emerald-900/40"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Covered Sectors */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-pink-500" />
                      <span>Coverage in {partner.city || "Faridabad"}:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(partner.coveredAreas) && partner.coveredAreas.length > 0 ? (
                        partner.coveredAreas.map((area: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-[10px] font-bold border border-pink-100 dark:border-pink-900/30"
                          >
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">
                          All Faridabad Sectors
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats & Commission */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Setups Done
                      </span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {partner.totalSetupsCompleted || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Platform Cut
                      </span>
                      <span className="text-sm font-black text-pink-600 dark:text-pink-400">
                        {partner.commissionPercentage || 20}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400">
                    ID: {partner._id.slice(-6).toUpperCase()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPartner(partner);
                        setIsAddingNew(false);
                      }}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-700 transition"
                      title="Edit Partner (In-Page)"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id, partner.name)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                      title="Remove Partner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
