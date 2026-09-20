"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Package, AlertTriangle, Hash, Check, Loader2 } from "lucide-react";
import { InventoryItem } from "../../services/inventoryService";

interface QuickRestockModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    stock: number;
    operation: "set" | "add" | "subtract";
    lowStockThreshold: number;
    sku: string;
    variantType?: "flowerCountOptions" | "weightOptions";
    variantId?: string;
  }) => Promise<void>;
}

export default function QuickRestockModal({
  item,
  isOpen,
  onClose,
  onSave,
}: QuickRestockModalProps) {
  if (!isOpen || !item) return null;

  const [mode, setMode] = useState<"set" | "add">("add");
  const [amount, setAmount] = useState<number>(10);
  const [exactStock, setExactStock] = useState<number>(item.stock);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(item.lowStockThreshold || 5);
  const [sku, setSku] = useState<string>(item.sku || "");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Variant selection (if any)
  const hasVariants = (item.flowerCountOptions && item.flowerCountOptions.length > 0) ||
                     (item.weightOptions && item.weightOptions.length > 0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("main");

  useEffect(() => {
    setExactStock(item.stock);
    setLowStockThreshold(item.lowStockThreshold || 5);
    setSku(item.sku || "");
    setAmount(10);
    setMode("add");
    setSelectedVariantId("main");
  }, [item]);

  const quickChips = [5, 10, 20, 50, 100];

  const handleQuickAdd = (num: number) => {
    setMode("add");
    setAmount(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedVariantId !== "main") {
        const variantType = item.flowerCountOptions?.some((v) => v._id === selectedVariantId)
          ? "flowerCountOptions"
          : "weightOptions";

        await onSave({
          stock: mode === "set" ? exactStock : amount,
          operation: mode,
          lowStockThreshold,
          sku,
          variantType,
          variantId: selectedVariantId,
        });
      } else {
        await onSave({
          stock: mode === "set" ? exactStock : amount,
          operation: mode,
          lowStockThreshold,
          sku,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedNewStock = mode === "add" ? item.stock + (Number(amount) || 0) : Number(exactStock) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-border-theme bg-card p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-14 w-14 rounded-2xl object-cover border border-border-theme shadow-sm"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-border-theme flex items-center justify-center text-primary">
              <Package className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Quick Restock
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {item.name}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              SKU: <span className="font-mono font-medium">{item.sku}</span>
            </p>
          </div>
        </div>

        {/* Current Stock Banner */}
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-border-theme bg-background p-3.5">
          <div>
            <span className="text-xs text-slate-500 font-medium">Current Stock</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {item.stock} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium">New Stock After Save</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {calculatedNewStock} <span className="text-xs font-normal text-slate-400">units</span>
            </div>
          </div>
        </div>

        {/* Variant selector if variants exist */}
        {hasVariants && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Item / Variant:
            </label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
            >
              <option value="main">Main Product (Root Stock)</option>
              {item.flowerCountOptions?.map((f) => (
                <option key={f._id} value={f._id}>
                  🌸 {f.flowerCount} (Current Stock: {f.stock || 0})
                </option>
              ))}
              {item.weightOptions?.map((w) => (
                <option key={w._id} value={w._id}>
                  🎂 {w.weight} (Current Stock: {w.stock || 0})
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Switcher: Add Stock vs Set Exact */}
          <div className="flex rounded-xl border border-border-theme p-1 bg-background">
            <button
              type="button"
              onClick={() => setMode("add")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "add"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              + Add Units
            </button>
            <button
              type="button"
              onClick={() => setMode("set")}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                mode === "set"
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Set Exact Stock
            </button>
          </div>

          {mode === "add" ? (
            <div>
              {/* Quick Add Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {quickChips.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleQuickAdd(num)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                      amount === num
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-border-theme bg-background text-slate-700 dark:text-slate-300 hover:border-emerald-500"
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>

              {/* Custom Add Units Input */}
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold focus:border-primary focus:outline-none"
                  placeholder="Enter quantity to add"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Exact Total Stock Quantity:
              </label>
              <input
                type="number"
                min="0"
                value={exactStock}
                onChange={(e) => setExactStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold focus:border-primary focus:outline-none"
                placeholder="Enter exact stock count"
              />
            </div>
          )}

          {/* Low Stock Alert Threshold & SKU */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-theme">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-border-theme bg-background px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3 text-slate-400" />
                SKU Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-border-theme bg-background px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border-theme bg-background py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-2 text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
