"use client";

import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import CouponList from "./couponList";
import AddEditCoupon from "./addEditCoupon";
import * as service from "../../services/couponService";

export default function CouponView() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await service.getAllCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openForm = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
    fetchCoupons();
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await service.deleteCoupon(id);
      fetchCoupons();
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
