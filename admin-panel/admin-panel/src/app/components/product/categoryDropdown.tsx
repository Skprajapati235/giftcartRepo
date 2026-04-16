"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import * as service from "../../services/adminService";

interface CategoryDropdownProps {
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryDropdown({ selectedCategory, onCategoryChange }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchCategories = useCallback(async (pageNum: number) => {
    if (loading || (!hasMore && pageNum > 1)) return;
    setLoading(true);
    try {
      const resp = await service.getCategories({ page: pageNum, limit: 10 });
      const newItems = Array.isArray(resp) ? resp : (resp.data || []);
      if (pageNum === 1) {
        setCategories(newItems);
      } else {
        setCategories(prev => [...prev, ...newItems]);
      }
      console.log("Categories loaded for dropdown:", newItems.length);
      setHasMore(pageNum < (resp.totalPages || 1));
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load categories for dropdown", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 5 && hasMore && !loading) {
      fetchCategories(page + 1);
    }
  };

  const selectedName = selectedCategory 
    ? categories.find(c => c._id === selectedCategory)?.name || "Category"
    : "All Categories";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background border border-border-theme px-4 py-2.5 rounded-2xl text-sm font-bold text-foreground transition hover:bg-hover-theme"
      >
        <Filter size={16} className="text-slate-400" />
        <span className="truncate max-w-[120px]">{selectedName}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border-theme rounded-2xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div 
            ref={listRef}
            onScroll={handleScroll}
            className="max-height-[300px] overflow-y-auto py-2"
            style={{ maxHeight: "250px" }}
          >
            <button
              onClick={() => { onCategoryChange(""); setIsOpen(false); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-bold transition hover:bg-hover-theme ${!selectedCategory ? "text-primary bg-primary/5" : "text-foreground"}`}
            >
              All Categories
              {!selectedCategory && <Check size={14} />}
            </button>
            
            <div className="mx-2 my-1 border-t border-border-theme/50" />

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { onCategoryChange(cat._id); setIsOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-bold transition hover:bg-hover-theme ${selectedCategory === cat._id ? "text-primary bg-primary/5" : "text-foreground"}`}
              >
                <div className="flex items-center gap-3">
                  {cat.image && <img src={cat.image} className="w-6 h-6 rounded-md object-cover" />}
                  <span className="truncate">{cat.name}</span>
                </div>
                {selectedCategory === cat._id && <Check size={14} />}
              </button>
            ))}

            {loading && (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
