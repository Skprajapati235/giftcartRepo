"use client";

import React, { useState } from "react";
import { X, Calendar, Percent, IndianRupee, ShieldCheck, ShieldAlert, Zap, Upload, Sparkles, UserCheck, Hash } from "lucide-react";
import * as service from "../../services/couponService";
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
    title: coupon?.title || "",
    description: coupon?.description || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon?.discountValue !== undefined ? coupon.discountValue : "",
    minOrderAmount: coupon?.minOrderAmount || 0,
    maxDiscount: coupon?.maxDiscount || 0,
    expiryDate: coupon?.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "",
    usageLimit: coupon?.usageLimit || 100,
    perUserLimit: coupon?.perUserLimit !== undefined ? coupon.perUserLimit : 1,
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
    if (!formData.code || formData.discountValue === "" || !formData.expiryDate) {
      showToast("Please fill all required fields (Code, Value, Expiry Date)", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        usageLimit: Number(formData.usageLimit) || 100,
        perUserLimit: Number(formData.perUserLimit) || 1,
      };

      if (coupon?._id) {
        await service.updateCoupon(coupon._id, payload);
        showToast("Coupon updated successfully", "success");
      } else {
        await service.createCoupon(payload);
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
    const prefixes = ["FESTIVE", "SAVE", "SPECIAL", "GIFT", "OFFER", "CELEBRATE"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setFormData({ ...formData, code: `${prefix}${num}` });
  };

  return (
    <div className="bg-card rounded-3xl border border-border-theme p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-theme">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{coupon?._id ? "Edit Coupon / Offer" : "Create New Offer"}</h2>
          <p className="text-sm text-slate-500 font-medium font-sans">Configure discount rules, user limits, and redemption criteria</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-hover-theme rounded-2xl text-slate-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Left Side: Basic Info, Title, Image */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="E.G. FESTIVE20"
                required
                className="w-full bg-background border border-border-theme rounded-2xl px-5 py-3.5 font-mono font-bold text-lg text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              />
              <button 
                type="button" 
                onClick={generateCode}
                className="absolute right-2.5 top-2.5 p-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs font-bold px-3"
                title="Generate Random Code"
              >
                <Zap size={14} fill="white" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Offer Title / Headline
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.G. Flat 20% OFF on Festive Cakes"
              className="w-full bg-background border border-border-theme rounded-2xl px-5 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Offer Description / Terms Subtitle
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="E.G. Save up to ₹150 on handcrafted cakes and gifts above ₹499"
              rows={2}
              className="w-full bg-background border border-border-theme rounded-2xl px-5 py-3 font-medium text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 text-xs resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Offer Banner / Ad Image (Optional)
            </label>
            <div className="relative aspect-[21/9] w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Coupon Banner" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setShowMediaModal(true)} className="cursor-pointer bg-white text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                      Change
                    </button>
                    <button type="button" onClick={() => setFormData({ ...formData, image: "" })} className="cursor-pointer bg-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg">
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => setShowMediaModal(true)} className="cursor-pointer flex flex-col items-center gap-2 p-4">
                  <Upload size={24} className="text-slate-300" />
                  <span className="text-xs font-bold text-primary">Select Banner Image</span>
                </button>
              )}
            </div>
          </div>

          {/* Targeting: Products and Occasions */}
          <div className="bg-hover-theme/30 p-5 rounded-3xl border border-border-theme space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Limit to Products (optional)</p>
              <div className="max-h-32 overflow-y-auto rounded-2xl border border-border-theme bg-background p-2.5 space-y-1">
                {products.length === 0 ? (
                  <p className="text-xs text-slate-400 italic px-1">No products found</p>
                ) : products.map((p: any) => (
                  <label key={p._id} className="flex items-center gap-2 text-xs font-semibold text-foreground px-1 py-1 rounded-lg hover:bg-hover-theme cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applicableProducts.includes(p._id)}
                      onChange={() => toggleInList("applicableProducts", p._id)}
                      className="accent-primary"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Leave empty to apply to all products.</p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Limit to Occasions (optional)</p>
              <div className="max-h-32 overflow-y-auto rounded-2xl border border-border-theme bg-background p-2.5 space-y-1">
                {occasions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic px-1">No occasions found</p>
                ) : occasions.map((o: any) => (
                  <label key={o._id} className="flex items-center gap-2 text-xs font-semibold text-foreground px-1 py-1 rounded-lg hover:bg-hover-theme cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applicableOccasions.includes(o._id)}
                      onChange={() => toggleInList("applicableOccasions", o._id)}
                      className="accent-primary"
                    />
                    <span>{o.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Leave empty to apply to all occasions.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Discount Logic, Limits & Rules */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-background border border-border-theme rounded-2xl px-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === "percentage" ? "e.g. 20" : "e.g. 100"}
                  required
                  className="w-full bg-background border border-border-theme rounded-2xl pl-11 pr-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
                <div className="absolute left-4 top-3.5 text-slate-400">
                  {formData.discountType === "percentage" ? <Percent size={18} /> : <IndianRupee size={18} />}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Min Order Value (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                placeholder="0 = No minimum"
                className="w-full bg-background border border-border-theme rounded-2xl px-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                placeholder="0 = Unlimited"
                disabled={formData.discountType === "fixed"}
                className="w-full bg-background border border-border-theme rounded-2xl px-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-400">Cap maximum savings (e.g. max ₹150 off)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
                className="w-full bg-background border border-border-theme rounded-2xl px-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Per-User Limit
              </label>
              <input
                type="number"
                min="0"
                value={formData.perUserLimit}
                onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                placeholder="1 (0 = unlimited)"
                className="w-full bg-background border border-border-theme rounded-2xl px-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
              />
              <p className="text-[10px] text-slate-400">1 = 1 redemption per customer account</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Total Redemptions Cap (Global Usage Limit)
            </label>
            <input
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              placeholder="e.g. 500 total redemptions"
              className="w-full bg-background border border-border-theme rounded-2xl px-4 py-3.5 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>

          {/* New User Exclusive Toggle */}
          <div className="bg-hover-theme/30 p-5 rounded-3xl border border-border-theme flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-foreground flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" /> New Customers Only
              </p>
              <p className="text-xs text-slate-500 font-medium">Valid only on the first order of a customer account</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isNewUserOnly: !formData.isNewUserOnly })}
              className={`w-14 h-8 rounded-full transition-all flex items-center px-1 shrink-0 ${formData.isNewUserOnly ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isNewUserOnly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Active Status Toggle */}
          <div className="bg-hover-theme/30 p-5 rounded-3xl border border-border-theme flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-foreground">Active Status</p>
              <p className="text-xs text-slate-500 font-medium">Allow customers to view and apply this coupon</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`w-14 h-8 rounded-full transition-all flex items-center px-1 shrink-0 ${formData.isActive ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-all ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="md:col-span-2 pt-6 border-t border-border-theme flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 text-sm border border-border-theme rounded-2xl font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-5 py-3 text-sm bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 text-center"
          >
            {saving ? "Saving Offer..." : coupon?._id ? "Update Offer" : "Launch Offer"}
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
