"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CouponList from "./couponList";
import AddEditCoupon from "./addEditCoupon";
import DeleteModal from "../ui/DeleteModal";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/couponService";
import { useToast } from "../../../context/ToastContext";

export default function CouponView() {
  const {
    data: coupons,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getAllCoupons, "coupons");

  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    refresh();
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await service.deleteCoupon(deleteId);
      showToast("Coupon deleted successfully", "success");
      refresh();
      setDeleteId(null);
    } catch (err) {
      showToast("Failed to delete coupon", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Coupons & Promo Codes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Manage marketing discounts, seasonal offers, and coupon usage thresholds</p>
        </div>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-95 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={18} />
            Create Coupon
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditCoupon coupon={editingCoupon} onClose={closeForm} />
      ) : (
        <CouponList
          coupons={coupons}
          loading={loading}
          total={total}
          totalPages={totalPages}
          currentPage={params.page}
          searchTerm={params.search}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DeleteModal
        isOpen={!!deleteId}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
