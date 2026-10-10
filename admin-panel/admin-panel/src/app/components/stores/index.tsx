"use client";

import React, { useState, useEffect, useCallback } from "react";
import StoreList from "./storeList";
import AddEditStore from "./addEditStore";
import StoreDetailsModal from "./storeDetailsModal";
import DeleteModal from "../ui/DeleteModal";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

export default function PartnerStoreView() {
  const { showToast } = useToast();

  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<any>({
    totalStores: 0,
    activeStores: 0,
    totalCities: 0,
    cities: [],
  });

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  // Modals state
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [detailsStore, setDetailsStore] = useState<any>(null);
  const [storeToDelete, setStoreToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await service.getStores({
        page,
        limit: 12,
        search: search.trim(),
        status: statusFilter,
        city: cityFilter,
      });

      if (res) {
        setStores(res.stores || res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error("Failed to load partner stores:", err);
      showToast(err?.response?.data?.message || "Failed to load partner stores", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, cityFilter, showToast]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Debounced search reset to page 1
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleCityChange = (val: string) => {
    setCityFilter(val);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setEditingStore(null);
    setShowAddEdit(true);
  };

  const handleOpenEdit = (store: any) => {
    setEditingStore(store);
    setDetailsStore(null);
    setShowAddEdit(true);
  };

  const handleOpenDetails = (store: any) => {
    setDetailsStore(store);
  };

  const handleConfirmDelete = async () => {
    if (!storeToDelete?._id) return;
    setIsDeleting(true);
    try {
      await service.deleteStore(storeToDelete._id);
      showToast("Partner store deleted successfully", "success");
      setStoreToDelete(null);
      fetchStores();
    } catch (err: any) {
      console.error("Error deleting store:", err);
      showToast(err?.response?.data?.message || "Failed to delete store", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (store: any) => {
    try {
      await service.toggleStoreStatus(store._id);
      showToast(`Store status updated!`, "success");
      fetchStores();
    } catch (err: any) {
      console.error("Error toggling status:", err);
      showToast(err?.response?.data?.message || "Failed to toggle status", "error");
    }
  };

  return (
    <div className="space-y-6">
      <StoreList
        stores={stores}
        loading={loading}
        total={total}
        totalPages={totalPages}
        page={page}
        stats={stats}
        search={search}
        statusFilter={statusFilter}
        cityFilter={cityFilter}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCityChange={handleCityChange}
        onPageChange={setPage}
        onAddStore={handleOpenAdd}
        onEditStore={handleOpenEdit}
        onViewDetails={handleOpenDetails}
        onDeleteStore={setStoreToDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add / Edit Store Modal */}
      {showAddEdit && (
        <AddEditStore
          store={editingStore}
          onClose={() => {
            setShowAddEdit(false);
            setEditingStore(null);
          }}
          onSuccess={fetchStores}
        />
      )}

      {/* Store Profile / Details Modal */}
      {detailsStore && (
        <StoreDetailsModal
          store={detailsStore}
          onClose={() => setDetailsStore(null)}
          onEdit={handleOpenEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {storeToDelete && (
        <DeleteModal
          isOpen={Boolean(storeToDelete)}
          onClose={() => setStoreToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Remove Partner Store"
          description={`Are you sure you want to remove "${storeToDelete.name}" from your partner network? You will no longer be able to route local orders to this store.`}
          itemName={storeToDelete.name}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
