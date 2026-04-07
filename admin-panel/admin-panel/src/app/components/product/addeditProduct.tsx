"use client";

import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import * as service from "../../services/adminService";
import { useAdmin } from "../../context/AdminContext";

interface AddEditProductProps {
  product: any; // null if adding
  onClose: () => void;
}

export default function AddEditProduct({ product, onClose }: AddEditProductProps) {
  const { categories, createProduct, updateProduct } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price ? String(product.price) : "",
    salePrice: product?.salePrice ? String(product.salePrice) : "",
    description: product?.description || "",
    image: product?.image || "",
    category: product?.category?._id || product?.category || "",
    weight: product?.weight || "",
    flowers: product?.flowers ? String(product.flowers) : "",
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const file = event.target.files[0];
      const data = await service.uploadImage(file);
      setForm((current) => ({ ...current, image: data.url }));
    } catch (err: any) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        flowers: form.flowers ? Number(form.flowers) : undefined,
        weight: form.weight ? form.weight.toString() : undefined
      };

      if (product?._id) {
        await updateProduct(product._id, payload);
      } else {
        await createProduct(payload);
      }
      onClose();
    } catch (error) {
      console.error("Product action error:", error);
      alert("Failed to save product. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card rounded-[2.5rem] border border-border-theme shadow-2xl max-w-5xl mx-auto overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-6 border-b border-border-theme flex justify-between items-center bg-hover-theme/50">
        <h2 className="text-lg font-bold text-foreground">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
          <X size={20} />
        </button>
      </div>

      <form className="p-8" onSubmit={handleSubmit}>
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left Side: Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter product title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Write a brief description..."
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Number of Flowers</label>
                <input
                  value={form.flowers}
                  onChange={(e) => setForm({ ...form, flowers: e.target.value })}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Weight of Cake</label>
                <input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 1kg, 500gm"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">List Price (MRP ₹)</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 999"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Sale Price (Offer ₹)</label>
                <input
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 799"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Side: Image Upload */}
          <div className="space-y-6">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter">Product Image</label>
            <div className="relative aspect-square w-full rounded-3xl border-2 border-dashed border-border-theme bg-hover-theme/30 flex flex-col items-center justify-center overflow-hidden group">
              {form.image ? (
                <>
                  <img src={form.image} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-slate-900 px-6 py-2 rounded-xl font-bold shadow-lg text-sm">Update Image</label>
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-primary font-bold">Select Image</span>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">JPG, PNG allowed</p>
                  </div>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <p className="text-primary font-bold">Uploading...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-theme flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto border border-border-theme text-slate-700 rounded-2xl px-6 py-4 font-bold hover:bg-hover-theme transition"
          >
            Cancel
          </button>
          <button
            disabled={saving || uploadingImage}
            className="w-full sm:w-auto bg-primary text-white px-16 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Saving..." : product?._id ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
    </section>
  );
}
