"use client";

import React, { useState } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import * as service from "../../services/adminService";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";

interface AddEditProductProps {
  product: any; // null if adding
  onClose: () => void;
}

type VariantRow = {
  label: string; // weight text ("500g") or flower count text ("10 Roses")
  price: string;
  salePrice: string;
  discount: string;
  tax: string;
  shippingCost: string;
};

const emptyVariantRow = (label = ""): VariantRow => ({
  label,
  price: "",
  salePrice: "",
  discount: "0",
  tax: "0",
  shippingCost: "0",
});

const WEIGHT_PRESETS = ["500g", "1kg", "1.5kg", "2kg", "3kg"];
const FLOWER_COUNT_PRESETS = ["10", "20", "25", "30", "50"];
const FLOWER_COUNT_NAME_PRESETS = ["10 Roses", "12 Flowers", "15 Roses", "20 Flowers", "24 Lilies", "30 Flowers", "50 Roses"];

export default function AddEditProduct({ product, onClose }: AddEditProductProps) {
  const { categories, flavors, cities, occasions, createProduct, updateProduct } = useAdmin();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState<"main" | "gallery" | false>(false);

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    image: product?.image || "",
    images: product?.images || [],
    category: product?.category?._id || product?.category || "",
    isCodAvailable: product?.isCodAvailable !== undefined ? product.isCodAvailable : true,
    hasEgglessOption: product?.hasEgglessOption || false,
    deliveryTime: product?.deliveryTime || "3-5",
    expectedDeliveryDate: product?.expectedDeliveryDate || "Monday, 20 Oct",
    flavor: product?.flavor?._id || product?.flavor || "",
    flowerCount: product?.flowerCount || "",
    availableCities: product?.availableCities || [],
    stock: product?.stock !== undefined ? String(product.stock) : "25",
    sku: product?.sku || "",
    lowStockThreshold: product?.lowStockThreshold !== undefined ? String(product.lowStockThreshold) : "5",
    // Generic (non flower/non cake) pricing — used only when the selected
    // category is neither of those two.
    price: product?.price ? String(product.price) : "",
    salePrice: product?.salePrice ? String(product.salePrice) : "",
    discount: product?.discount !== undefined ? String(product.discount) : "0",
    tax: product?.tax !== undefined ? String(product.tax) : "0",
    shippingCost: product?.shippingCost !== undefined ? String(product.shippingCost) : "0",
    occasions: (product?.occasions || []).map((o: any) => o?._id || o),
  });

  // Multiple weight variants (Cakes) — each with its own price/sale price/
  // discount/tax/shipping. Nothing here is auto-calculated; whatever the
  // admin types in is exactly what gets saved and used.
  const [weightOptions, setWeightOptions] = useState<VariantRow[]>(
    product?.weightOptions?.length
      ? product.weightOptions.map((w: any) => ({
          label: w.weight || "",
          price: w.price !== undefined ? String(w.price) : "",
          salePrice: w.salePrice !== undefined && w.salePrice !== null ? String(w.salePrice) : "",
          discount: w.discount !== undefined ? String(w.discount) : "0",
          tax: w.tax !== undefined ? String(w.tax) : "0",
          shippingCost: w.shippingCost !== undefined ? String(w.shippingCost) : "0",
        }))
      : []
  );

  // Multiple flower-count variants (Flowers / Bouquets) — same idea, own price set
  // per count (10, 20, 25, 30, 50 ... whatever the admin adds).
  const [flowerCountOptions, setFlowerCountOptions] = useState<VariantRow[]>(
    product?.flowerCountOptions?.length
      ? product.flowerCountOptions.map((f: any) => ({
          label: f.flowerCount || "",
          price: f.price !== undefined ? String(f.price) : "",
          salePrice: f.salePrice !== undefined && f.salePrice !== null ? String(f.salePrice) : "",
          discount: f.discount !== undefined ? String(f.discount) : "0",
          tax: f.tax !== undefined ? String(f.tax) : "0",
          shippingCost: f.shippingCost !== undefined ? String(f.shippingCost) : "0",
        }))
      : []
  );

  const selectedCategory = categories.find((c: any) => c._id === form.category);
  const categoryName = (selectedCategory?.name || "").toLowerCase();
  const isCakeCategory = categoryName.includes("cake") || categoryName.includes("pastry");
  const isFlowerCategory =
    categoryName.includes("flower") ||
    categoryName.includes("bookey") ||
    categoryName.includes("bouquet") ||
    categoryName.includes("bouq") ||
    categoryName.includes("buke") ||
    categoryName.includes("rose") ||
    categoryName.includes("bunch") ||
    categoryName.includes("floral");
  const isGenericCategory = !isCakeCategory && !isFlowerCategory;

  const handleMediaSelect = (urls: string | string[]) => {
    if (showMediaModal === "main") {
      setForm((current) => ({ ...current, image: urls as string }));
    } else if (showMediaModal === "gallery") {
      setForm((current) => ({
        ...current,
        images: Array.isArray(urls) ? [...current.images, ...urls] : [...current.images, urls],
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm((current) => ({ ...current, images: newImages }));
  };

  // ── Available Cities (Locations) Helpers ──
  const allCities = React.useMemo(() => {
    const list: string[] = [];
    cities.forEach((entry: any) => {
      if (Array.isArray(entry.cities)) {
        entry.cities.forEach((c: string) => {
          if (c && typeof c === "string" && !list.includes(c)) list.push(c);
        });
      } else if (typeof entry === "string" && !list.includes(entry)) {
        list.push(entry);
      } else if (entry?.name && typeof entry.name === "string" && !list.includes(entry.name)) {
        list.push(entry.name);
      }
    });
    return list;
  }, [cities]);

  const isAllCitiesSelected =
    allCities.length > 0 && allCities.every((cityName) => form.availableCities.includes(cityName));

  const handleToggleAllCities = () => {
    setForm((current) => ({
      ...current,
      availableCities: isAllCitiesSelected ? [] : [...allCities],
    }));
  };

  const handleToggleCity = (cityName: string) => {
    setForm((current) => ({
      ...current,
      availableCities: current.availableCities.includes(cityName)
        ? current.availableCities.filter((c: string) => c !== cityName)
        : [...current.availableCities, cityName],
    }));
  };

  // ── Occasions Helpers ──
  const allOccasions = React.useMemo(() => {
    return occasions.filter((o: any) => o && o._id);
  }, [occasions]);

  const isAllOccasionsSelected =
    allOccasions.length > 0 &&
    allOccasions.every((o: any) =>
      form.occasions.some((id: any) => String(id) === String(o._id))
    );

  const handleToggleAllOccasions = () => {
    setForm((current) => ({
      ...current,
      occasions: isAllOccasionsSelected
        ? []
        : allOccasions.map((o: any) => String(o._id)),
    }));
  };

  const handleToggleOccasion = (id: string) => {
    const stringId = String(id);
    setForm((current) => ({
      ...current,
      occasions: current.occasions.some((item: any) => String(item) === stringId)
        ? current.occasions.filter((item: any) => String(item) !== stringId)
        : [...current.occasions, stringId],
    }));
  };

  // ── Variant row helpers (shared shape for weight & flower-count lists) ──
  const addVariantRow = (setter: React.Dispatch<React.SetStateAction<VariantRow[]>>, label = "") => {
    setter((current) => {
      if (current.length > 0) {
        const first = current[0];
        return [...current, { ...first, label }];
      }
      return [...current, emptyVariantRow(label)];
    });
  };

  const updateVariantRow = (
    setter: React.Dispatch<React.SetStateAction<VariantRow[]>>,
    index: number,
    field: keyof VariantRow,
    value: string
  ) => {
    setter((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      
      // Auto-calculate salePrice if pricing fields change
      if (["price", "discount"].includes(field)) {
        const row = next[index];
        const p = Number(row.price) || 0;
        const d = Number(row.discount) || 0;
        const discAmt = p * (d / 100);
        const sale = Math.round(p - discAmt);
        next[index].salePrice = String(sale);
      }
      
      return next;
    });
  };

  const removeVariantRow = (setter: React.Dispatch<React.SetStateAction<VariantRow[]>>, index: number) => {
    setter((current) => current.filter((_, i) => i !== index));
  };

  const addPreset = (
    setter: React.Dispatch<React.SetStateAction<VariantRow[]>>,
    rows: VariantRow[],
    preset: string
  ) => {
    if (rows.some((r) => r.label === preset)) return; // don't add the same option twice
    addVariantRow(setter, preset);
  };

  const handleGenericPricingChange = (field: string, value: string) => {
    setForm(current => {
      const next = { ...current, [field]: value };
      
      if (["price", "discount"].includes(field)) {
        const p = Number(next.price) || 0;
        const d = Number(next.discount) || 0;
        const discAmt = p * (d / 100);
        const sale = Math.round(p - discAmt);
        next.salePrice = String(sale);
      }
      
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedWeightOptions = weightOptions
      .filter((v) => v.label.trim() && v.price !== "")
      .map((v) => ({
        weight: v.label.trim(),
        price: Number(v.price) || 0,
        salePrice: v.salePrice !== "" ? Number(v.salePrice) : undefined,
        discount: Number(v.discount) || 0,
        tax: Number(v.tax) || 0,
        shippingCost: Number(v.shippingCost) || 0,
      }));

    const cleanedFlowerCountOptions = flowerCountOptions
      .filter((v) => v.label.trim() && v.price !== "")
      .map((v) => ({
        flowerCount: v.label.trim(),
        price: Number(v.price) || 0,
        salePrice: v.salePrice !== "" ? Number(v.salePrice) : undefined,
        discount: Number(v.discount) || 0,
        tax: Number(v.tax) || 0,
        shippingCost: Number(v.shippingCost) || 0,
      }));

    if (isCakeCategory && cleanedWeightOptions.length === 0) {
      showToast("Add at least one weight variant with a price", "error");
      return;
    }
    if (isFlowerCategory && cleanedFlowerCountOptions.length === 0 && !form.flowerCount?.trim()) {
      showToast("Please enter a flower count or add at least one flower-count variant", "error");
      return;
    }
    if (isFlowerCategory && cleanedFlowerCountOptions.length === 0 && !form.price) {
      showToast("List Price is required when not using variants", "error");
      return;
    }
    if (isGenericCategory && !form.price) {
      showToast("List Price is required", "error");
      return;
    }

    setSaving(true);
    try {
      // Root-level price fields stay in sync with the cheapest variant so
      // listing/search pages (which show a single "from ₹X") keep working —
      // but the actual cart/checkout price always comes from the specific
      // variant the buyer picks.
      let rootPrice = Number(form.price) || 0;
      let rootSalePrice: number | undefined = form.salePrice ? Number(form.salePrice) : undefined;
      let rootDiscount = Number(form.discount) || 0;
      let rootTax = Number(form.tax) || 0;
      let rootShippingCost = Number(form.shippingCost) || 0;

      if (isCakeCategory) {
        const cheapest = [...cleanedWeightOptions].sort(
          (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
        )[0];
        rootPrice = cheapest.price;
        rootSalePrice = cheapest.salePrice;
        rootDiscount = cheapest.discount;
        rootTax = cheapest.tax;
        rootShippingCost = cheapest.shippingCost;
      } else if (isFlowerCategory) {
        if (cleanedFlowerCountOptions.length > 0) {
          const cheapest = [...cleanedFlowerCountOptions].sort(
            (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
          )[0];
          rootPrice = cheapest.price;
          rootSalePrice = cheapest.salePrice;
          rootDiscount = cheapest.discount;
          rootTax = cheapest.tax;
          rootShippingCost = cheapest.shippingCost;
        } else {
          rootPrice = Number(form.price) || 0;
          rootSalePrice = form.salePrice ? Number(form.salePrice) : undefined;
          rootDiscount = Number(form.discount) || 0;
          rootTax = Number(form.tax) || 0;
          rootShippingCost = Number(form.shippingCost) || 0;
        }
      }

      const payload: any = {
        name: form.name,
        description: form.description,
        image: form.image,
        images: form.images,
        category: form.category,
        isCodAvailable: form.isCodAvailable,
        hasEgglessOption: isCakeCategory ? form.hasEgglessOption : false,
        flavor: isCakeCategory ? (form.flavor || undefined) : undefined,
        deliveryTime: form.deliveryTime,
        expectedDeliveryDate: form.expectedDeliveryDate,
        availableCities: form.availableCities,
        price: rootPrice,
        salePrice: rootSalePrice,
        discount: rootDiscount,
        tax: rootTax,
        shippingCost: rootShippingCost,
        occasions: form.occasions,
        weightOptions: isCakeCategory ? cleanedWeightOptions : [],
        flowerCount: isFlowerCategory
          ? (form.flowerCount?.trim() || (cleanedFlowerCountOptions[0]?.flowerCount || undefined))
          : undefined,
        flowerCountOptions: isFlowerCategory ? cleanedFlowerCountOptions : [],
        stock: Math.max(0, parseInt(form.stock, 10) || 0),
        sku: form.sku.trim() || undefined,
        lowStockThreshold: Math.max(0, parseInt(form.lowStockThreshold, 10) || 5),
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

  // Renders one editable variant row (weight or flower-count) — the row's
  // own price/salePrice/discount/tax/shippingCost, fully independent of
  // every other row.
  const renderVariantRow = (
    row: VariantRow,
    index: number,
    setter: React.Dispatch<React.SetStateAction<VariantRow[]>>,
    labelPlaceholder: string
  ) => (
    <div key={index} className="rounded-xl border border-border-theme p-4 mb-3 bg-hover-theme/20">
      <div className="flex items-center justify-between mb-3">
        <input
          value={row.label}
          onChange={(e) => updateVariantRow(setter, index, "label", e.target.value)}
          placeholder={labelPlaceholder}
          className="w-1/2 rounded-lg border border-border-theme bg-background px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => removeVariantRow(setter, index)}
          className="text-red-400 hover:text-red-600 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">List Price (₹)</label>
          <input
            value={row.price}
            onChange={(e) => updateVariantRow(setter, index, "price", e.target.value)}
            type="number"
            className="w-full rounded-lg border border-border-theme bg-background px-2 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. 999"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Sale Price (₹)</label>
          <input
            value={row.salePrice}
            onChange={(e) => updateVariantRow(setter, index, "salePrice", e.target.value)}
            type="number"
            className="w-full rounded-lg border border-border-theme bg-background px-2 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. 799"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Discount (%)</label>
          <input
            value={row.discount}
            onChange={(e) => updateVariantRow(setter, index, "discount", e.target.value)}
            type="number"
            className="w-full rounded-lg border border-border-theme bg-background px-2 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Tax (%)</label>
          <input
            value={row.tax}
            onChange={(e) => updateVariantRow(setter, index, "tax", e.target.value)}
            type="number"
            className="w-full rounded-lg border border-border-theme bg-background px-2 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Shipping (₹)</label>
          <input
            value={row.shippingCost}
            onChange={(e) => updateVariantRow(setter, index, "shippingCost", e.target.value)}
            type="number"
            className="w-full rounded-lg border border-border-theme bg-background px-2 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-card rounded-[1.2rem] border border-border-theme shadow-1xl mx-auto overflow-hidden animate-in zoom-in-95 duration-200 w-full flex flex-col">
      <div className="p-6 border-b border-border-theme flex justify-between items-center bg-hover-theme/50 flex-shrink-0">
        <h2 className="text-lg font-bold text-foreground">
          {product?._id ? "Edit Product" : "Add New Product"}
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
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {isCakeCategory && "Cake fields (weight variants, flavor, eggless) will show below."}
                {isFlowerCategory && "Bouquet & Flower fields (flower count, bouquet variants) will show below."}
                {isGenericCategory && form.category && "Simple single-price form will show below."}
              </p>
            </div>

            {isCakeCategory && (
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Cake Flavor (Optional)</label>
                <select
                  value={form.flavor}
                  onChange={(e) => setForm({ ...form, flavor: e.target.value })}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Flavor</option>
                  {flavors.map((f: any) => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
            )}

            {/* ── Available Cities (Locations) ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-500">
                  Available Cities / Locations{" "}
                  <span className="font-normal text-slate-400 text-xs">
                    (leave empty = available everywhere)
                  </span>
                </label>
                {allCities.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {form.availableCities.length}/{allCities.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleAllCities}
                      className="text-xs font-bold text-primary hover:underline transition cursor-pointer"
                    >
                      {isAllCitiesSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto rounded-xl border border-border-theme bg-background p-3">
                {allCities.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No cities added yet — add some from the Cities section.</span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleAllCities}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                        isAllCitiesSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
                      }`}
                    >
                      <span>{isAllCitiesSelected ? "✓ All Selected" : "✓ Select All"}</span>
                    </button>
                    {allCities.map((cityName: string) => {
                      const active = form.availableCities.includes(cityName);
                      return (
                        <button
                          key={cityName}
                          type="button"
                          onClick={() => handleToggleCity(cityName)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                            active
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
                          }`}
                        >
                          {cityName}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* ── Occasions ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-500">
                  Occasions <span className="font-normal text-slate-400 text-xs">(optional)</span>
                </label>
                {allOccasions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {form.occasions.length}/{allOccasions.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleAllOccasions}
                      className="text-xs font-bold text-primary hover:underline transition cursor-pointer"
                    >
                      {isAllOccasionsSelected ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto rounded-xl border border-border-theme bg-background p-3">
                {allOccasions.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No occasions added yet.</span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleAllOccasions}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                        isAllOccasionsSelected
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
                      }`}
                    >
                      <span>{isAllOccasionsSelected ? "✓ All Selected" : "✓ Select All"}</span>
                    </button>
                    {allOccasions.map((o: any) => {
                      const active = form.occasions.some((id: any) => String(id) === String(o._id));
                      return (
                        <button
                          key={o._id}
                          type="button"
                          onClick={() => handleToggleOccasion(o._id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                            active
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
                          }`}
                        >
                          {o.name}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* ── Category-specific pricing ── */}
            {isCakeCategory && (
              <div className="border-t border-border-theme pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-bold text-foreground">Weight Variants (Cakes)</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {WEIGHT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => addPreset(setWeightOptions, weightOptions, preset)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-primary text-primary hover:bg-primary/10 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {weightOptions.length === 0 && (
                  <p className="text-xs text-slate-400 italic mb-3">No weight variants yet — click a preset above or "Add Weight" below.</p>
                )}
                {weightOptions.map((row, idx) => renderVariantRow(row, idx, setWeightOptions, "e.g. 500g, 1kg"))}

                <button
                  type="button"
                  onClick={() => addVariantRow(setWeightOptions)}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition"
                >
                  <Plus size={16} /> Add Weight Variant
                </button>

                <div className="flex items-center gap-3 mt-6">
                  <input
                    type="checkbox"
                    id="hasEgglessOption"
                    checked={form.hasEgglessOption}
                    onChange={(e) => setForm({ ...form, hasEgglessOption: e.target.checked })}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="hasEgglessOption" className="text-sm font-bold text-slate-700">Has Eggless Option</label>
                </div>
              </div>
            )}

            {isFlowerCategory && (
              <div className="border-t border-border-theme pt-4 mt-4 space-y-5">
                <div>
                  <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                    🌸 Bouquet Flower Count & Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Specify the number of flowers / stems in this bouquet (e.g. 10 Roses, 12 Flowers, or 20).
                  </p>
                </div>

                {/* Primary Flower Count field */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-border-theme space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Flower Count / Number of Stems
                    </label>
                    <input
                      value={form.flowerCount}
                      onChange={(e) => setForm({ ...form, flowerCount: e.target.value })}
                      type="text"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 10 Roses, 12 Flowers, 24 Lilies"
                    />
                  </div>

                  {/* Preset quick chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
                    {FLOWER_COUNT_NAME_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setForm({ ...form, flowerCount: preset })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                          form.flowerCount === preset
                            ? "bg-primary text-white border-primary"
                            : "border-border-theme bg-background hover:border-primary/50 text-foreground"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing: If no variants are added, show standard pricing so single bouquet can be priced */}
                {flowerCountOptions.length === 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-border-theme space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">Bouquet Pricing</h4>
                      <span className="text-xs text-slate-400">Single Price (No size variants)</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">List Price (MRP ₹)</label>
                        <input
                          value={form.price}
                          onChange={(e) => handleGenericPricingChange("price", e.target.value)}
                          type="number"
                          className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 999"
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
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Discount (%)</label>
                        <input
                          value={form.discount}
                          onChange={(e) => handleGenericPricingChange("discount", e.target.value)}
                          type="number"
                          className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Tax (%)</label>
                        <input
                          value={form.tax}
                          onChange={(e) => handleGenericPricingChange("tax", e.target.value)}
                          type="number"
                          className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 18"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-500 mb-2">Shipping Cost (₹)</label>
                        <input
                          value={form.shippingCost}
                          onChange={(e) => handleGenericPricingChange("shippingCost", e.target.value)}
                          type="number"
                          className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. 50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Multi-Size Flower Count Variants (Optional) */}
                <div className="border-t border-border-theme/70 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-foreground">
                      Multi-Size Variants (Optional)
                    </h4>
                    <span className="text-xs text-slate-400">Add if bouquet comes in multiple selectable sizes</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {FLOWER_COUNT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addPreset(setFlowerCountOptions, flowerCountOptions, `${preset} Roses`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-primary text-primary hover:bg-primary/10 transition"
                      >
                        + {preset} Roses
                      </button>
                    ))}
                  </div>

                  {flowerCountOptions.map((row, idx) => renderVariantRow(row, idx, setFlowerCountOptions, "e.g. 10 Roses, 20 Roses"))}

                  <button
                    type="button"
                    onClick={() => addVariantRow(setFlowerCountOptions)}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition mt-2"
                  >
                    <Plus size={16} /> Add Flower Count Variant
                  </button>
                </div>
              </div>
            )}

            {isGenericCategory && (
              <div className="border-t border-border-theme pt-4 mt-4">
                <h3 className="text-md font-bold text-foreground mb-4">Pricing</h3>
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">List Price (MRP ₹)</label>
                    <input
                      value={form.price}
                      onChange={(e) => handleGenericPricingChange("price", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 999"
                      required={isGenericCategory}
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
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Discount (%)</label>
                    <input
                      value={form.discount}
                      onChange={(e) => handleGenericPricingChange("discount", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Tax (%)</label>
                    <input
                      value={form.tax}
                      onChange={(e) => handleGenericPricingChange("tax", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 18"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 mb-2">Shipping Cost (₹)</label>
                    <input
                      value={form.shippingCost}
                      onChange={(e) => handleGenericPricingChange("shippingCost", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-border-theme pt-4">
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
                    <button type="button" onClick={() => setShowMediaModal("main")} className="cursor-pointer bg-white text-slate-900 px-6 py-2 rounded-xl font-bold shadow-lg text-sm">
                      Update Main Image
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => setShowMediaModal("main")} className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <span className="text-primary font-bold">Select Main Image</span>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">JPG, PNG allowed</p>
                  </div>
                </button>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter mb-2">Gallery Images (Optional, multiple)</label>
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
                <button type="button" onClick={() => setShowMediaModal("gallery")} className="w-24 h-24 rounded-xl border-2 border-dashed border-border-theme flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary cursor-pointer transition">
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-border-theme pt-6">
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

            {/* ── Inventory & Stock Tracking ── */}
            <div className="rounded-2xl border border-border-theme bg-background/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>📦</span>
                  <span>Inventory & Stock Control</span>
                </h4>
                <span className="text-[11px] font-semibold text-primary">Warehouse Tracking</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Stock Units <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                    className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. 5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full rounded-xl border border-border-theme bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. GC-CAK-001"
                  />
                </div>
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
            disabled={saving}
            className="w-full sm:w-auto bg-primary text-white px-16 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Saving..." : product?._id ? "Update Product" : "Save Product"}
          </button>
        </div>
      </form>
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={handleMediaSelect}
          multiple={showMediaModal === "gallery"}
        />
      )}
    </section>
  );
}
