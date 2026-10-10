"use client";

import React from "react";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  Tag,
  DollarSign,
} from "lucide-react";

interface DecorationPackagesViewProps {
  packages: any[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (pkg: any) => void;
  onDelete: (pkg: any) => void;
}

export default function DecorationPackagesView({
  packages,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: DecorationPackagesViewProps) {
  if (loading) {
    return (
      <div className="p-16 text-center bg-card rounded-3xl border border-border-theme">
        <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-semibold">Loading decoration packages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Decoration Packages Catalog</h2>
          <p className="text-xs text-muted-foreground">
            Available packages for hotel rooms, birthdays, and surprise proposals
          </p>
        </div>

        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} />
          <span>Add Package</span>
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border-theme space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto">
            <Sparkles size={30} />
          </div>
          <h3 className="text-base font-bold text-foreground">No Decoration Packages Found</h3>
          <p className="text-xs text-muted-foreground">Create your first hotel room or party setup package.</p>
          <button
            onClick={onAdd}
            className="px-5 py-2.5 rounded-2xl bg-pink-500 text-white text-xs font-bold shadow-md hover:bg-pink-600 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus size={16} /> Add First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-card rounded-3xl border border-border-theme hover:border-pink-500/40 transition-all duration-200 overflow-hidden shadow-sm flex flex-col group"
            >
              {/* Cover Image */}
              <div className="relative aspect-video bg-surface overflow-hidden">
                <img
                  src={pkg.coverImage || (pkg.images && pkg.images[0]) || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80"}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                  {pkg.category}
                </span>

                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    pkg.isActive
                      ? "bg-emerald-500/80 text-white border-emerald-400"
                      : "bg-rose-500/80 text-white border-rose-400"
                  }`}
                >
                  {pkg.isActive ? "Active" : "Paused"}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-pink-500 transition-colors line-clamp-1">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {pkg.summary || pkg.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-xl font-black text-foreground">
                      ₹{pkg.salePrice || pkg.price}
                    </span>
                    {pkg.salePrice && pkg.price > pkg.salePrice && (
                      <span className="text-xs line-through text-muted-foreground">₹{pkg.price}</span>
                    )}
                    <span className="text-[11px] text-emerald-500 font-bold ml-auto flex items-center gap-1">
                      <Clock size={12} /> {pkg.estimatedSetupTime || "2 hours"}
                    </span>
                  </div>

                  {/* Inclusions highlights */}
                  {Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-theme space-y-1 text-[11px] text-muted-foreground">
                      {pkg.inclusions.slice(0, 3).map((inc: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                      {pkg.inclusions.length > 3 && (
                        <p className="text-[10px] text-pink-500 font-semibold pt-0.5">
                          +{pkg.inclusions.length - 3} more items included
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border-theme flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    ★ {pkg.ratings || 4.9} ({pkg.numReviews || 0} reviews)
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(pkg)}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
                      title="Edit Package"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(pkg)}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
