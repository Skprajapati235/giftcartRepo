"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../../context/ToastContext";
import { getCategories } from "../../services/adminService";
import {
  InventoryItem,
  InventorySummary,
  getInventorySummary,
  getInventoryItems,
  updateProductStock,
  bulkUpdateProductStock,
  downloadInventoryExcel,
  downloadInventoryPdf,
} from "../../services/inventoryService";
import InventoryStats from "./inventoryStats";
import InventoryFilterBar from "./inventoryFilterBar";
import InventoryTable from "./inventoryTable";
import QuickRestockModal from "./quickRestockModal";
import { Boxes, PlusCircle, Layers, Check } from "lucide-react";
import AddEditProduct from "../product/addeditProduct";

export default function InventoryView() {
  const { showToast } = useToast();

  // Summary KPI state
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  // Items state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkRestocking, setIsBulkRestocking] = useState<boolean>(false);
  const [bulkAmount, setBulkAmount] = useState<number>(10);

  // Modals state
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Export & Refresh loading states
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories({ limit: 100 });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const data = await getInventorySummary();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching inventory summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      const res = await getInventoryItems({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        category: selectedCategory,
        sortBy: sortBy as any,
        sortOrder,
      });
      setItems(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      showToast("Failed to fetch inventory items", "error");
    } finally {
      setLoadingItems(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, selectedCategory, sortBy, sortOrder, showToast]);

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Clear selections on page or filter change
  useEffect(() => {
    setSelectedIds([]);
  }, [page, statusFilter, selectedCategory, debouncedSearch]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSummary(), fetchItems()]);
    setIsRefreshing(false);
    showToast("Inventory refreshed", "success");
  };

  // Quick inline increment / decrement (+1 / -1)
  const handleInlineAdjust = async (item: InventoryItem, delta: number) => {
    try {
      // Optimistic UI update
      const newStock = Math.max(0, item.stock + delta);
      setItems((prev) =>
        prev.map((it) => (it._id === item._id ? { ...it, stock: newStock } : it))
      );

      await updateProductStock(item._id, {
        stock: Math.abs(delta),
        operation: delta > 0 ? "add" : "subtract",
      });

      // Refresh summary quietly to update total stock and valuation
      fetchSummary();
    } catch (err) {
      console.error("Error updating inline stock:", err);
      showToast("Failed to adjust stock", "error");
      fetchItems();
    }
  };

  // Quick restock modal save
  const handleRestockSave = async (payload: {
    stock: number;
    operation: "set" | "add" | "subtract";
    lowStockThreshold: number;
    sku: string;
    variantType?: "flowerCountOptions" | "weightOptions";
    variantId?: string;
  }) => {
    if (!restockItem) return;
    try {
      await updateProductStock(restockItem._id, payload);
      showToast(`Stock updated for ${restockItem.name}`, "success");
      fetchItems();
      fetchSummary();
    } catch (err) {
      console.error("Error updating stock:", err);
      showToast("Failed to update stock", "error");
      throw err;
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      showToast("Preparing Excel spreadsheet...", "info");
      await downloadInventoryExcel({
        search: debouncedSearch,
        status: statusFilter,
        category: selectedCategory,
      });
      showToast("Excel spreadsheet downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export Excel file", "error");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export to PDF
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      showToast("Generating PDF report...", "info");
      await downloadInventoryPdf({
        search: debouncedSearch,
        status: statusFilter,
        category: selectedCategory,
      });
      showToast("PDF report downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to export PDF file", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(items.map((it) => it._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Bulk add stock
  const handleBulkAddStock = async () => {
    if (selectedIds.length === 0) return;
    try {
      const updates = selectedIds.map((id) => ({
        id,
        stock: bulkAmount,
        operation: "add" as const,
      }));
      await bulkUpdateProductStock(updates);
      showToast(`Added +${bulkAmount} units to ${selectedIds.length} items!`, "success");
      setSelectedIds([]);
      setIsBulkRestocking(false);
      fetchItems();
      fetchSummary();
    } catch (err) {
      console.error("Bulk update failed:", err);
      showToast("Failed to perform bulk restock", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Inventory Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Track warehouse stock, valuations, low-stock alerts, and download audit reports.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Items Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-bold text-primary">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => setIsBulkRestocking(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary text-white px-3.5 py-2 text-xs sm:text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Bulk Restock</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <InventoryStats
        summary={summary}
        loading={loadingSummary}
        activeStatus={statusFilter}
        onSelectStatus={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
      />

      {/* Filter and Search Bar */}
      <InventoryFilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        categories={categories}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          setSortBy(field);
          setSortOrder(order);
          setPage(1);
        }}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isExportingExcel={isExportingExcel}
        isExportingPdf={isExportingPdf}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        counts={{
          all: summary?.totalProducts || 0,
          in_stock: summary?.inStockCount || 0,
          low_stock: summary?.lowStockCount || 0,
          out_of_stock: summary?.outOfStockCount || 0,
        }}
      />

      {/* Inventory Data Table */}
      <InventoryTable
        items={items}
        loading={loadingItems}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        limit={limit}
        onPageChange={setPage}
        onQuickRestock={(item) => {
          setRestockItem(item);
          setIsRestockOpen(true);
        }}
        onInlineAdjust={handleInlineAdjust}
        onEditProduct={(id) => {
          // Open product edit
          const prod = items.find((it) => it._id === id);
          if (prod) setEditingProduct(prod);
        }}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Quick Restock Modal */}
      <QuickRestockModal
        item={restockItem}
        isOpen={isRestockOpen}
        onClose={() => {
          setIsRestockOpen(false);
          setRestockItem(null);
        }}
        onSave={handleRestockSave}
      />

      {/* Bulk Restock Dialog */}
      {isBulkRestocking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-border-theme bg-card p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Bulk Restock ({selectedIds.length} Items)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add units to all {selectedIds.length} selected items simultaneously.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Units to add to each product:
              </label>
              <div className="flex gap-2">
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => setBulkAmount(num)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      bulkAmount === num
                        ? "bg-primary text-white"
                        : "border border-border-theme bg-background text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="1"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-sm text-slate-900 dark:text-white font-bold"
              />

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => setIsBulkRestocking(false)}
                  className="flex-1 rounded-xl border border-border-theme bg-background py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAddStock}
                  className="flex-1 rounded-xl bg-primary text-white py-2 text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Apply to All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal if triggered from action */}
      {editingProduct && (
        <AddEditProduct
          product={editingProduct}
          onClose={() => {
            setEditingProduct(null);
            fetchItems();
            fetchSummary();
          }}
        />
      )}
    </div>
  );
}
