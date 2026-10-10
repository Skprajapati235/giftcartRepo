"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  RefreshCw,
  Power,
  Layers,
  MapPin,
  X,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import AddEditDecorationPackage from "./AddEditDecorationPackage";
import { useToast } from "@/context/ToastContext";

export default function DecorationPackagesView() {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  // In-Page Add/Edit Mode (NO POPUP MODALS!)
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [categoryFilter]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const res = await service.getDecorationPackages({
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });
      if (res?.success) {
        setPackages(res.packages || res.data || []);
      }
    } catch (err) {
      console.error("Error loading decoration packages:", err);
      showToast("Failed to fetch packages", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (pkg: any) => {
    try {
      const res = await service.updateDecorationPackage(pkg._id, {
        isActive: !pkg.isActive,
      });
      if (res?.success) {
        showToast(
          `Package "${pkg.title}" is now ${!pkg.isActive ? "Active" : "Inactive"}`,
          "success"
        );
        setPackages((prev) =>
          prev.map((p) => (p._id === pkg._id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (err: any) {
      showToast(err.message || "Failed to toggle package", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete package "${title}"?`)) return;
    try {
      await service.deleteDecorationPackage(id);
      showToast("Package deleted successfully", "success");
      loadPackages();
    } catch (err: any) {
      showToast(err.message || "Failed to delete package", "error");
    }
  };

  // If in Add/Edit mode, render the single-file in-page component directly!
  if (isAddingNew || editingPackage) {
    return (
      <AddEditDecorationPackage
        pkg={editingPackage}
        onClose={() => {
          setIsAddingNew(false);
          setEditingPackage(null);
          loadPackages();
        }}
      />
    );
  }

  const filtered = packages.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s) ||
      p.summary?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-pink-600" />
              Decoration Packages Catalog
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40">
              Faridabad Launch
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure room decor experiences, pricing, balloon counts, and hotel inclusions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadPackages}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            title="Refresh Packages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setEditingPackage(null);
              setIsAddingNew(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages by title, theme, inclusions..."
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

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-pink-500 shadow-xs"
        >
          <option value="all">All Categories</option>
          <option value="Hotel Room Decor">Hotel Room Decor</option>
          <option value="Birthday Party Setup">Birthday Party Setup</option>
          <option value="Romantic Anniversary">Romantic Anniversary</option>
          <option value="Canopy & Cabana">Canopy & Cabana</option>
          <option value="Marry Me / Proposal">Marry Me / Proposal</option>
          <option value="Baby Shower & Welcome">Baby Shower & Welcome</option>
        </select>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-pink-600 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Loading Decoration Packages...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            No decoration packages found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {search
              ? "Try clearing your search query"
              : "Get started by adding your first decoration package."}
          </p>
          {!search && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-bold hover:bg-pink-500 transition"
            >
              + Create Package
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((pkg) => {
            const cover = pkg.coverImage || (pkg.images && pkg.images[0]) || "";

            return (
              <div
                key={pkg._id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Cover */}
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎈
                      </div>
                    )}

                    {/* Category pill */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                      {pkg.category || "Decor"}
                    </span>

                    {/* Active Status Badge */}
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition flex items-center gap-1 ${
                        pkg.isActive
                          ? "bg-emerald-500/90 text-white hover:bg-emerald-600"
                          : "bg-rose-500/90 text-white hover:bg-rose-600"
                      }`}
                      title="Click to toggle active status"
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{pkg.isActive ? "Live" : "Paused"}</span>
                    </button>

                    {/* Price Tag in Image */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-md text-gray-900 dark:text-white font-black text-sm shadow">
                      ₹{pkg.salePrice || pkg.price}
                      {pkg.salePrice && pkg.price && (
                        <span className="text-[10px] text-gray-400 line-through ml-1.5 font-normal">
                          ₹{pkg.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-pink-600 transition line-clamp-1">
                      {pkg.title}
                    </h3>

                    {pkg.summary && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {pkg.summary}
                      </p>
                    )}

                    {/* Inclusions count & Estimated time */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{pkg.inclusions?.length || 0} Inclusions</span>
                      </span>

                      {pkg.estimatedSetupTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-pink-500" />
                          <span>{pkg.estimatedSetupTime}</span>
                        </span>
                      )}
                    </div>

                    {/* Faridabad coverage indicator */}
                    <div className="flex items-center gap-1 text-[10.5px] font-bold text-pink-600">
                      <MapPin className="w-3 h-3" />
                      <span>Faridabad Delivery & Setup Available</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-semibold text-gray-400">
                    ID: {pkg._id.slice(-6).toUpperCase()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setIsAddingNew(false);
                      }}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-slate-700 transition"
                      title="Edit Package"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id, pkg.title)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
                      title="Delete Package"
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
