"use client";

import React, { useEffect, useState } from "react";
import {
  Camera,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  RefreshCw,
  Heart,
  MapPin,
  X,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import AddEditDecorationSample from "./AddEditDecorationSample";
import { useToast } from "@/context/ToastContext";

export default function DecorationSamplesView() {
  const { showToast } = useToast();
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // In-Page Add/Edit View (Zero Modals!)
  const [editingSample, setEditingSample] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      setLoading(true);
      const res = await service.getDecorationSamples();
      if (res?.success) {
        setSamples(res.samples || res.data || []);
      }
    } catch (err) {
      console.error("Error loading samples:", err);
      showToast("Failed to fetch showcase samples", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStorefront = async (s: any) => {
    try {
      const res = await service.toggleDecorationSample(s._id);
      if (res?.success) {
        showToast(
          `Sample visibility set to ${!s.showOnStorefront ? "Visible" : "Hidden"}`,
          "success"
        );
        setSamples((prev) =>
          prev.map((item) =>
            item._id === s._id ? { ...item, showOnStorefront: !item.showOnStorefront } : item
          )
        );
      }
    } catch (err: any) {
      showToast(err.message || "Failed to toggle visibility", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove sample "${title}"?`)) return;
    try {
      await service.deleteDecorationSample(id);
      showToast("Sample removed successfully", "success");
      loadSamples();
    } catch (err: any) {
      showToast(err.message || "Failed to delete sample", "error");
    }
  };

  // If in Add/Edit mode, render the single-file in-page component directly!
  if (isAddingNew || editingSample) {
    return (
      <AddEditDecorationSample
        sample={editingSample}
        onClose={() => {
          setIsAddingNew(false);
          setEditingSample(null);
          loadSamples();
        }}
      />
    );
  }

  const filtered = samples.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.hotelOrLocation?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.occasion?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="w-6 h-6 text-pink-600" />
              Real Setup Showcase Gallery
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40">
              Customer Showcase
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real setup photos taken inside Faridabad hotel rooms and venues to build instant customer trust.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadSamples}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            title="Refresh Samples"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setEditingSample(null);
              setIsAddingNew(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Real Setup Sample</span>
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
          placeholder="Search setup photos by hotel, venue, occasion, or sector..."
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

      {/* Samples Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Real Setup Showcase Photos...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            No real setup photos yet
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {search
              ? "No sample matches your search query."
              : "Add completed setup photos to showcase your decorations to shoppers."}
          </p>
          {!search && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 transition"
            >
              + Add First Sample
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo Container */}
                <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={s.imageUrl}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) =>
                      ((e.target as any).src =
                        "https://placehold.co/600x400?text=Decor+Sample")
                    }
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                      {s.venueType || "Hotel Room"}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-pink-600/80 backdrop-blur-md text-white text-[10px] font-bold">
                      {s.occasion || "Anniversary"}
                    </span>
                  </div>

                  {/* Toggle Storefront Button */}
                  <button
                    onClick={() => handleToggleStorefront(s)}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition flex items-center gap-1 ${
                      s.showOnStorefront
                        ? "bg-emerald-500/80 text-white hover:bg-emerald-600"
                        : "bg-slate-900/80 text-slate-400 hover:text-white"
                    }`}
                    title={s.showOnStorefront ? "Visible to customers" : "Hidden from customers"}
                  >
                    {s.showOnStorefront ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Hotel / Location pill on bottom left */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl font-bold max-w-[75%] truncate">
                      <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                      <span className="truncate">
                        {s.hotelOrLocation || s.city || "Faridabad"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl font-bold">
                      <Heart className="w-3 h-3 text-rose-500 fill-current" />
                      <span>{s.likesCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-pink-600 transition line-clamp-1">
                    {s.title}
                  </h3>

                  {s.caption && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {s.caption}
                    </p>
                  )}

                  {/* Tags */}
                  {Array.isArray(s.tags) && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {s.tags.slice(0, 4).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-gray-400">
                  {s.city || "Faridabad"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSample(s);
                      setIsAddingNew(false);
                    }}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-700 transition"
                    title="Edit Sample"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s._id, s.title)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                    title="Remove Sample"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
