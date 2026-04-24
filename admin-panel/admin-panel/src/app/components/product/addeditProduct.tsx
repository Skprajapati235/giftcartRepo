"use client";

import React, { useState } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import * as service from "../../services/adminService";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";

interface AddEditProductProps {
  product: any; // null if adding
  onClose: () => void;
}

export default function AddEditProduct({ product, onClose }: AddEditProductProps) {
  const { categories, createProduct, updateProduct } = useAdmin();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price ? String(product.price) : "",
    salePrice: product?.salePrice ? String(product.salePrice) : "",
    description: product?.description || "",
    image: product?.image || "",
    images: product?.images || [],
    category: product?.category?._id || product?.category || "",
    weight: product?.weight || "",
    weightOptions: product?.weightOptions || [],
    flowers: product?.flowers ? String(product.flowers) : "",
    flowerOptions: product?.flowerOptions || [],
    hasEgglessOption: product?.hasEgglessOption || false,
    shippingCost: product?.shippingCost !== undefined ? String(product.shippingCost) : "0",
    discount: product?.discount !== undefined ? String(product.discount) : "0",
    tax: product?.tax !== undefined ? String(product.tax) : "0",
    isCodAvailable: product?.isCodAvailable !== undefined ? product.isCodAvailable : true,
    deliveryTime: product?.deliveryTime || "3-5",
    expectedDeliveryDate: product?.expectedDeliveryDate || "Monday, 20 Oct",
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isMain: boolean = false) => {
    if (!event.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const file = event.target.files[0];
      const data = await service.uploadImage(file);

      if (isMain) {
        if (form.image) {
          await service.deleteImage(form.image).catch(() => { });
        }
        setForm((current) => ({ ...current, image: data.url }));
      } else {
        setForm((current) => ({ ...current, images: [...current.images, data.url] }));
      }

      showToast("Image uploaded successfully!", "success");
    } catch (err: any) {
      showToast("Image upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = async (index: number) => {
    const url = form.images[index];
    try {
      await service.deleteImage(url).catch(() => { });
      const newImages = [...form.images];
      newImages.splice(index, 1);
      setForm((current) => ({ ...current, images: newImages }));
    } catch (e) {
      console.error(e);
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
        weight: form.weight ? form.weight.toString() : undefined,
        shippingCost: form.shippingCost ? Number(form.shippingCost) : 0,
        discount: form.discount ? Number(form.discount) : 0,
        tax: form.tax ? Number(form.tax) : 0,
        isCodAvailable: form.isCodAvailable,
        weightOptions: form.weightOptions.map((opt: any) => ({ ...opt, price: Number(opt.price) })),
        flowerOptions: form.flowerOptions.map((opt: any) => ({ ...opt, count: Number(opt.count), price: Number(opt.price) })),
      };

      if (product?._id) {
        await updateProduct(product._id, payload);
        showToast("Product updated successfully!", "success");
      } else {
        await createProduct(payload);
        showToast("Product created successfully!", "success");
      }
      onClose();
    } catch (error) {
      showToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const addWeightOption = () => {
    setForm(f => ({ ...f, weightOptions: [...f.weightOptions, { weight: "", price: 0 }] }));
  };
  const removeWeightOption = (index: number) => {
    const newOpts = [...form.weightOptions];
    newOpts.splice(index, 1);
    setForm(f => ({ ...f, weightOptions: newOpts }));
  };
  const updateWeightOption = (index: number, field: string, value: any) => {
    const newOpts = [...form.weightOptions];
    newOpts[index] = { ...newOpts[index], [field]: value };
    setForm(f => ({ ...f, weightOptions: newOpts }));
  };

  const addFlowerOption = () => {
    setForm(f => ({ ...f, flowerOptions: [...f.flowerOptions, { count: 0, price: 0 }] }));
  };
  const removeFlowerOption = (index: number) => {
    const newOpts = [...form.flowerOptions];
    newOpts.splice(index, 1);
    setForm(f => ({ ...f, flowerOptions: newOpts }));
  };
  const updateFlowerOption = (index: number, field: string, value: any) => {
    const newOpts = [...form.flowerOptions];
    newOpts[index] = { ...newOpts[index], [field]: value };
    setForm(f => ({ ...f, flowerOptions: newOpts }));
  };

  return (
    <section className="bg-card rounded-[2.5rem] border border-border-theme shadow-2xl mx-auto overflow-hidden animate-in zoom-in-95 duration-200 w-full max-w-5xl h-[90vh] flex flex-col">
      <div className="p-6 border-b border-border-theme flex justify-between items-center bg-hover-theme/50 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
          <X size={20} />
        </button>
      </div>

      <form className="p-8 flex-1 overflow-y-auto" onSubmit={handleSubmit}>
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

            <div className="border-t border-border-theme pt-4 mt-4">
              <h3 className="text-md font-bold text-foreground mb-4">Product Variations</h3>

              <div className="flex items-center gap-3 mb-6">
                <input
                  type="checkbox"
                  id="hasEgglessOption"
                  checked={form.hasEgglessOption}
                  onChange={(e) => setForm({ ...form, hasEgglessOption: e.target.checked })}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="hasEgglessOption" className="text-sm font-bold text-slate-700">Has Eggless Option (Cakes)</label>
              </div>

              {/* Weight Options */}
              <div className="mb-6 bg-hover-theme/50 p-4 rounded-xl border border-border-theme">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-700">Weight Variants</label>
                  <button type="button" onClick={addWeightOption} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
                {form.weightOptions.map((opt: any, i: any) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      value={opt.weight}
                      onChange={(e) => updateWeightOption(i, "weight", e.target.value)}
                      placeholder="e.g. 500gm"
                      className="flex-1 rounded-lg border border-border-theme px-3 py-2 text-sm"
                    />
                    <input
                      value={opt.price}
                      onChange={(e) => updateWeightOption(i, "price", e.target.value)}
                      placeholder="Price ₹"
                      type="number"
                      className="w-24 rounded-lg border border-border-theme px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={() => removeWeightOption(i)} className="text-rose-500 p-2"><Trash2 size={16} /></button>
                  </div>
                ))}
                {form.weightOptions.length === 0 && <p className="text-xs text-slate-400">No weight variants added.</p>}
              </div>

              {/* Flower Options */}
              <div className="mb-6 bg-hover-theme/50 p-4 rounded-xl border border-border-theme">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-700">Flower Count Variants</label>
                  <button type="button" onClick={addFlowerOption} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold flex items-center gap-1">
                    <Plus size={12} /> Add
                  </button>
                </div>
                {form.flowerOptions.map((opt: any, i: any) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      value={opt.count}
                      onChange={(e) => updateFlowerOption(i, "count", e.target.value)}
                      placeholder="Count (e.g. 10)"
                      type="number"
                      className="flex-1 rounded-lg border border-border-theme px-3 py-2 text-sm"
                    />
                    <input
                      value={opt.price}
                      onChange={(e) => updateFlowerOption(i, "price", e.target.value)}
                      placeholder="Price ₹"
                      type="number"
                      className="w-24 rounded-lg border border-border-theme px-3 py-2 text-sm"
                    />
                    <button type="button" onClick={() => removeFlowerOption(i)} className="text-rose-500 p-2"><Trash2 size={16} /></button>
                  </div>
                ))}
                {form.flowerOptions.length === 0 && <p className="text-xs text-slate-400">No flower variants added.</p>}
              </div>

            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isCodAvailable"
                checked={form.isCodAvailable}
                onChange={(e) => setForm({ ...form, isCodAvailable: e.target.checked })}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isCodAvailable" className="text-sm font-bold text-slate-700">Cash on Delivery Available</label>
            </div>
          </div>

          {/* Right Side: Image Upload & Other details */}
          <div className="space-y-6">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter">Main Image</label>
            <div className="relative aspect-square w-full h-64 rounded-3xl border-2 border-dashed border-border-theme bg-hover-theme/30 flex flex-col items-center justify-center overflow-hidden group mb-6">
              {form.image ? (
                <>
                  <img src={form.image} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-slate-900 px-6 py-2 rounded-xl font-bold shadow-lg text-sm">
                      Update Main Image
                      <input type="file" onChange={(e) => handleFileUpload(e, true)} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-primary font-bold">Select Main Image</span>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">JPG, PNG allowed</p>
                  </div>
                  <input type="file" onChange={(e) => handleFileUpload(e, true)} className="hidden" />
                </label>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter mb-2">Gallery Images (Optional)</label>
              <div className="flex flex-wrap gap-4">
                {form.images.map((img: any, i: any) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border-theme group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border-theme flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary cursor-pointer transition">
                  <Plus size={24} />
                  <input type="file" onChange={(e) => handleFileUpload(e, false)} className="hidden" accept="image/*" />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-border-theme pt-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Shipping Cost (₹)</label>
                <input
                  value={form.shippingCost}
                  onChange={(e) => setForm({ ...form, shippingCost: e.target.value })}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Discount (%)</label>
                <input
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Tax (%)</label>
                <input
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 18"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Delivery Time (Hours)</label>
                <input
                  value={form.deliveryTime}
                  onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 24-48"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Expected Delivery (Hours)</label>
                <input
                  value={form.expectedDeliveryDate}
                  onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 2 Hours"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-theme flex flex-col sm:flex-row justify-end gap-4 flex-shrink-0">
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
