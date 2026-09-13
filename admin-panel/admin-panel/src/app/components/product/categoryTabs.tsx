"use client";

import React, { useEffect, useState } from "react";
import * as service from "../../services/adminService";

interface CategoryTabsProps {
  activeCategory: string; // "" = All
  onChange: (categoryId: string) => void;
}

// One tab per category that exists in the database — nothing hardcoded.
// Add a new category (Cake, Flower, Bouquet, Ring, Teddy Bear, or anything
// else) from the Category section and a tab for it shows up here
// automatically, with its own scoped product list + add/edit/delete.
export default function CategoryTabs({ activeCategory, onChange }: CategoryTabsProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Large limit so every category becomes a tab, not just the first page.
        const resp = await service.getCategories({ page: 1, limit: 100 });
        const list = Array.isArray(resp) ? resp : resp?.data || [];
        if (!cancelled) setCategories(list);
      } catch (err) {
        console.error("Failed to load categories for tabs", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-thin">
      <button
        type="button"
        onClick={() => onChange("")}
        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition whitespace-nowrap ${
          activeCategory === ""
            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
            : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
        }`}
      >
        All Products
      </button>

      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-hover-theme animate-pulse shrink-0" />
          ))}
        </div>
      ) : (
        categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => onChange(cat._id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition whitespace-nowrap ${
              activeCategory === cat._id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
            }`}
          >
            {cat.image && (
              <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover" />
            )}
            {cat.name}
          </button>
        ))
      )}

      {!loading && categories.length === 0 && (
        <span className="text-xs font-semibold text-slate-400 italic px-2">
          No categories yet — add one from the Category section first.
        </span>
      )}
    </div>
  );
}
