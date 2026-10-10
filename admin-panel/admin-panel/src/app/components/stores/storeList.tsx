"use client";

import React, { useState } from "react";
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Percent,
} from "lucide-react";

interface StoreListProps {
  stores: any[];
  loading: boolean;
  total: number;
  totalPages: number;
  page: number;
  stats?: {
    totalStores: number;
    activeStores: number;
    totalCities: number;
    cities: string[];
  };
  search: string;
  statusFilter: string;
  cityFilter: string;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onAddStore: () => void;
  onEditStore: (store: any) => void;
  onDeleteStore: (store: any) => void;
  onToggleStatus: (store: any) => void;
}

export default function StoreList({
  stores,
  loading,
  total,
  totalPages,
  page,
  stats,
  search,
  statusFilter,
  cityFilter,
  onSearchChange,
  onStatusChange,
  onCityChange,
  onPageChange,
  onAddStore,
  onEditStore,
  onDeleteStore,
  onToggleStatus,
}: StoreListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const totalStores = stats?.totalStores ?? total ?? 0;
  const activeStores = stats?.activeStores ?? stores.filter((s) => s.status === "active").length;
  const totalCities = stats?.totalCities ?? (stats?.cities?.length || 0);

  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS / TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Total Tie-up Stores
              </p>
              <h3 className="text-2xl font-black text-foreground mt-1">{totalStores}</h3>
              <p className="text-[11px] text-amber-500 mt-0.5">Network fulfillment hubs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Store size={22} />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Active Partners
              </p>
              <h3 className="text-2xl font-black text-emerald-500 mt-1">{activeStores}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Ready to prepare orders</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Cities Covered
              </p>
              <h3 className="text-2xl font-black text-blue-500 mt-1">{totalCities}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Local partner presence</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <MapPin size={22} />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border-theme shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Risk Management
              </p>
              <h3 className="text-xl font-bold text-purple-400 mt-1">Zero Return</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">On-demand fulfillment</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
              <Percent size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL STRIP: SEARCH, FILTERS, ADD BUTTON */}
      <div className="p-4 rounded-3xl bg-card border border-border-theme shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by store name, owner, phone, city..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
            <option value="onboarding">Onboarding</option>
          </select>

          {/* City filter */}
          {stats?.cities && stats.cities.length > 0 && (
            <select
              value={cityFilter}
              onChange={(e) => onCityChange(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-border-theme bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="all">All Cities</option>
              {stats.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}

          {/* View mode toggle */}
          <div className="flex items-center rounded-2xl border border-border-theme bg-surface p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === "grid"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === "table"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={onAddStore}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Add Tie-Up Store</span>
          </button>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      {loading ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border-theme">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Loading partner stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border-theme space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Store size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No Partner Stores Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              {search || statusFilter !== "all" || cityFilter !== "all"
                ? "Try adjusting your filters or search keywords."
                : "Tie-up with local bakeries, florists or gift shops to fulfill orders in your city!"}
            </p>
          </div>
          <button
            onClick={onAddStore}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 text-white text-xs font-bold shadow-md hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Your First Store
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => {
            const cleanPhone = (store.whatsappNumber || store.ownerPhone || "").replace(/\D/g, "");
            const waNumber = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
            const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
              `Hello ${store.ownerFirstName || store.name}, this is from GiftCart regarding a delivery order.`
            )}`;

            return (
              <div
                key={store._id}
                className="bg-card rounded-3xl border border-border-theme hover:border-amber-500/40 transition-all duration-200 overflow-hidden shadow-sm flex flex-col group"
              >
                {/* Store Top Banner / Thumbnail */}
                <div
                  onClick={() => onEditStore(store)}
                  className="relative h-28 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 p-4 flex items-start justify-between border-b border-border-theme cursor-pointer"
                >
                  {store.image && (
                    <img
                      src={store.image}
                      alt={store.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  <div className="relative flex items-center gap-3 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-card border-2 border-border-theme shadow-md overflow-hidden flex items-center justify-center text-amber-500 shrink-0">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store size={26} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors line-clamp-1">
                        {store.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-amber-500 shrink-0" />
                        <span className="truncate">{store.city || "No City Specified"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
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

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Owner & Contact details */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Owner:</span>
                      <span className="font-semibold text-foreground">
                        {store.ownerFirstName} {store.ownerLastName || ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Calling Phone:</span>
                      <span className="font-mono text-foreground">{store.ownerPhone}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>WhatsApp:</span>
                      <span className="font-mono text-emerald-500 font-semibold">
                        {store.whatsappNumber}
                      </span>
                    </div>

                    {store.commissionPercentage > 0 && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Margin / Discount:</span>
                        <span className="font-bold text-rose-500">
                          {store.commissionPercentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categories Tags */}
                  {Array.isArray(store.categories) && store.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {store.categories.slice(0, 3).map((cat: string) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-lg text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        >
                          {cat}
                        </span>
                      ))}
                      {store.categories.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-lg text-[10px] text-muted-foreground bg-surface">
                          +{store.categories.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Address preview */}
                  {store.address && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                      {store.address}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-border-theme flex items-center justify-between gap-1">
                    {/* Instant WhatsApp Action */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-1">
                      {/* Edit Button -> Opens single AddEditStore component */}
                      <button
                        onClick={() => onEditStore(store)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                        title="Edit Store"
                      >
                        <Edit size={15} />
                      </button>

                      {/* Toggle status */}
                      <button
                        onClick={() => onToggleStatus(store)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          store.status === "active"
                            ? "text-emerald-500 hover:bg-emerald-500/10"
                            : "text-muted-foreground hover:bg-surface"
                        }`}
                        title="Toggle Active/Inactive"
                      >
                        {store.status === "active" ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <XCircle size={15} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteStore(store)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Store"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-card rounded-3xl border border-border-theme overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface/70 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border-theme">
                <tr>
                  <th className="px-5 py-3.5">Store / Bakery</th>
                  <th className="px-4 py-3.5">Owner & Mobile</th>
                  <th className="px-4 py-3.5">City & Address</th>
                  <th className="px-4 py-3.5">Commission</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-theme">
                {stores.map((store) => {
                  const cleanPhone = (store.whatsappNumber || store.ownerPhone || "").replace(
                    /\D/g,
                    ""
                  );
                  const waNumber = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `Hello ${store.ownerFirstName || store.name}, this is from GiftCart regarding an order.`
                  )}`;

                  return (
                    <tr
                      key={store._id}
                      className="hover:bg-surface/50 transition-colors group cursor-pointer"
                      onClick={() => onEditStore(store)}
                    >
                      <td className="px-5 py-3.5 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-border-theme overflow-hidden flex items-center justify-center text-amber-500 shrink-0">
                            {store.image ? (
                              <img
                                src={store.image}
                                alt={store.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Store size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-amber-500 transition-colors">
                              {store.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                              {store.description || "Partner Store"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-foreground">
                          {store.ownerFirstName} {store.ownerLastName || ""}
                        </p>
                        <p className="font-mono text-muted-foreground text-[11px]">
                          {store.ownerPhone}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-foreground">{store.city || "—"}</p>
                        <p className="text-muted-foreground text-[11px] truncate max-w-xs">
                          {store.address || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-rose-500">
                        {store.commissionPercentage || 0}%
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            store.status === "active"
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : store.status === "onboarding"
                              ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                          }`}
                        >
                          {store.status || "active"}
                        </span>
                      </td>

                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>

                          <button
                            onClick={() => onEditStore(store)}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={() => onDeleteStore(store)}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing page {page} of {totalPages} ({total} total partner stores)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-border-theme text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  p === page
                    ? "bg-amber-500 text-white shadow-sm"
                    : "border border-border-theme text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-border-theme text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
