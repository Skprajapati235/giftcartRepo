"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CouponList from "./couponList";
import AddEditCoupon from "./addEditCoupon";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/couponService";

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await service.deleteCoupon(id);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">Coupons & Promo Codes</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
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
    </>
  );
}
