"use client";

import React, { useState } from "react";
import { X, Calendar, Percent, IndianRupee, ShieldCheck, ShieldAlert, Zap, Upload, Sparkles } from "lucide-react";
import * as service from "../../services/couponService";
import * as adminService from "../../services/adminService";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";

interface AddEditCouponProps {
  coupon?: any;
  onClose: () => void;
}

export default function AddEditCoupon({ coupon, onClose }: AddEditCouponProps) {
  const { showToast } = useToast();
  const { products, occasions } = useAdmin();
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue || "",
    minOrderAmount: coupon?.minOrderAmount || 0,
    maxDiscount: coupon?.maxDiscount || 0,
    expiryDate: coupon?.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
    usageLimit: coupon?.usageLimit || 100,
    isActive: coupon?.isActive !== undefined ? coupon.isActive : true,
    image: coupon?.image || "",
    isNewUserOnly: coupon?.isNewUserOnly || false,
    applicableProducts: (coupon?.applicableProducts || []).map((p: any) => p?._id || p),
    applicableOccasions: (coupon?.applicableOccasions || []).map((o: any) => o?._id || o),
  });
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const toggleInList = (field: "applicableProducts" | "applicableOccasions", id: string) => {
    setFormData((prev) => {
      const list = prev[field].includes(id)
        ? prev[field].filter((x: string) => x !== id)
        : [...prev[field], id];
      return { ...prev, [field]: list };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setSaving(true);
    try {
      if (coupon?._id) {
        await service.updateCoupon(coupon._id, formData);
        showToast("Coupon updated successfully", "success");
      } else {
        await service.createCoupon(formData);
        showToast("Coupon created successfully", "success");
      }
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  return (
    <div className="bg-card rounded-3xl border border-border-theme p-8 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{coupon?._id ? "Edit Coupon" : "Create New Offer"}</h2>
          <p className="text-sm text-slate-500 font-medium font-sans">Configure discount rules and expiry</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-hover-theme rounded-2xl text-slate-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {/* Left Side: Basic Info & Image */}
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Coupon Background/Ad Image</label>
            <div className="relative aspect-[21/9] w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
              {formData.image ? (
                <>
                  <img src={formData.image} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button type="button" onClick={() => setShowMediaModal(true)} className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                      Change Image
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => setShowMediaModal(true)} className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload size={24} className="text-slate-300" />
                  <span className="text-xs font-bold text-blue-600">Select Ad Banner</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Coupon Code</label>
            <div className="relative">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="E.G. FESTIVE50"
                className="w-full bg-background border border-border-theme rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              />
              <button 
                type="button" 
                onClick={generateCode}
                className="absolute right-3 top-2.5 p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                title="Generate Random Code"
              >
                <Zap size={16} fill="white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Constraints & Logic */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-background border border-border-theme rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Value</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder="0"
                  className="w-full bg-background border border-border-theme rounded-2xl pl-12 pr-5 py-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <div className="absolute left-4 top-4 text-slate-400">
                   {formData.discountType === "percentage" ? <Percent size={18} /> : <IndianRupee size={18} />}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Min Order (₹)</label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="0"
                className="w-full bg-background border border-border-theme rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-background border border-border-theme rounded-2xl px-5 py-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="bg-hover-theme/30 p-6 rounded-3xl border border-border-theme space-y-5">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-black text-foreground flex items-center gap-2"><Sparkles size={14} className="text-primary" /> New Users Only</p>
                   <p className="text-[11px] text-slate-500 font-medium font-sans">Only usable by an account with no prior orders</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isNewUserOnly: !formData.isNewUserOnly })}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 shrink-0 ${formData.isNewUserOnly ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                   <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isNewUserOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Limit to Products (optional)</p>
                <div className="max-h-36 overflow-y-auto rounded-2xl border border-border-theme bg-background p-3 space-y-1.5">
                  {products.length === 0 ? (
                    <p className="text-xs text-slate-400 italic px-1">No products yet</p>
                  ) : products.map((p: any) => (
                    <label key={p._id} className="flex items-center gap-2 text-xs font-semibold text-foreground px-1 py-1 rounded-lg hover:bg-hover-theme cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applicableProducts.includes(p._id)}
                        onChange={() => toggleInList("applicableProducts", p._id)}
                        className="accent-primary"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Leave empty to apply to every product.</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Limit to Occasions (optional)</p>
                <div className="max-h-36 overflow-y-auto rounded-2xl border border-border-theme bg-background p-3 space-y-1.5">
                  {occasions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic px-1">No occasions yet</p>
                  ) : occasions.map((o: any) => (
                    <label key={o._id} className="flex items-center gap-2 text-xs font-semibold text-foreground px-1 py-1 rounded-lg hover:bg-hover-theme cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.applicableOccasions.includes(o._id)}
                        onChange={() => toggleInList("applicableOccasions", o._id)}
                        className="accent-primary"
                      />
                      {o.name}
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Leave empty to apply regardless of occasion.</p>
              </div>
          </div>

          <div className="bg-hover-theme/30 p-6 rounded-3xl border border-border-theme">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-black text-foreground">Active Status</p>
                   <p className="text-[11px] text-slate-500 font-medium font-sans">Allow users to use this coupon</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${formData.isActive ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                   <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 pt-6 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-5 border border-border-theme rounded-2xl font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-[2] px-8 py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {saving ? "Processing..." : coupon?._id ? "Save Changes" : "Create Coupon Now"}
          </button>
        </div>
      </form>
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => setFormData({ ...formData, image: url as string })}
          multiple={false}
        />
      )}
    </div>
  );
}
