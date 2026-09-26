"use client";

import React, { useState } from "react";
import { X, Upload, Plus, Trash2, Globe } from "lucide-react";
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
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    seoKeywords: Array.isArray(product?.seoKeywords) ? product.seoKeywords.join(", ") : product?.seoKeywords || "",
    canonicalUrl: product?.canonicalUrl || "",
    ogImage: product?.ogImage || "",
    noIndex: !!product?.noIndex,
  });

  const [showSeo, setShowSeo] = useState(false);

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
        seoTitle: form.seoTitle?.trim() || undefined,
        seoDescription: form.seoDescription?.trim() || undefined,
        seoKeywords: (form.seoKeywords || "")
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean),
        canonicalUrl: form.canonicalUrl?.trim() || undefined,
        ogImage: form.ogImage?.trim() || undefined,
        noIndex: !!form.noIndex,
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
  // Renders one editable variant card (weight or flower-count) in a 2-column responsive grid
  const renderVariantRow = (
    row: VariantRow,
    index: number,
    setter: React.Dispatch<React.SetStateAction<VariantRow[]>>,
    labelPlaceholder: string
  ) => (
    <div
      key={index}
      className="rounded-2xl border border-border-theme p-4 bg-card/80 hover:border-primary/50 transition-all shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-border-theme/60">
        <div className="flex items-center gap-2 flex-1">
          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
            #{index + 1}
          </span>
          <input
            value={row.label}
            onChange={(e) => updateVariantRow(setter, index, "label", e.target.value)}
            placeholder={labelPlaceholder}
            className="flex-1 rounded-xl border border-border-theme bg-background px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={() => removeVariantRow(setter, index)}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer flex-shrink-0"
          title="Remove variant"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">List MRP (₹)</label>
          <input
            value={row.price}
            onChange={(e) => updateVariantRow(setter, index, "price", e.target.value)}
            type="number"
            className="w-full rounded-xl border border-border-theme bg-background px-3 py-1.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. 999"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">Sale Offer (₹)</label>
          <input
            value={row.salePrice}
            onChange={(e) => updateVariantRow(setter, index, "salePrice", e.target.value)}
            type="number"
            className="w-full rounded-xl border border-border-theme bg-background px-3 py-1.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. 799"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Discount (%)</label>
          <input
            value={row.discount}
            onChange={(e) => updateVariantRow(setter, index, "discount", e.target.value)}
            type="number"
            className="w-full rounded-xl border border-border-theme bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Tax (%)</label>
          <input
            value={row.tax}
            onChange={(e) => updateVariantRow(setter, index, "tax", e.target.value)}
            type="number"
            className="w-full rounded-xl border border-border-theme bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Shipping (₹)</label>
          <input
            value={row.shippingCost}
            onChange={(e) => updateVariantRow(setter, index, "shippingCost", e.target.value)}
            type="number"
            className="w-full rounded-xl border border-border-theme bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="0"
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
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <form className="p-8 flex-1 overflow-y-auto space-y-8" onSubmit={handleSubmit}>
        {/* Section 1: Basic Information & Media / Inventory (Balanced 2-Column Grid) */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Essential Details */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter product title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {isCakeCategory && "🎂 Cake pricing & weight options will configure below."}
                {isFlowerCategory && "🌸 Flower count & bouquet variant options will configure below."}
                {isGenericCategory && form.category && "Standard single-price options will configure below."}
              </p>
            </div>

            {isCakeCategory && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Cake Flavor (Optional)
                </label>
                <select
                  value={form.flavor}
                  onChange={(e) => setForm({ ...form, flavor: e.target.value })}
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Select Flavor</option>
                  {flavors.map((f: any) => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                placeholder="Write a brief description..."
                rows={4}
                required
              />
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

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isCodAvailable"
                checked={form.isCodAvailable}
                onChange={(e) => setForm({ ...form, isCodAvailable: e.target.checked })}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isCodAvailable" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Cash on Delivery (COD) Available
              </label>
            </div>
          </div>

          {/* Right Column: Media & Inventory */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Main Image <span className="text-rose-500">*</span>
              </label>
              <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-hover-theme/30 flex flex-col items-center justify-center overflow-hidden group">
                {form.image ? (
                  <>
                    <img src={form.image} className="h-full w-full object-cover" alt="Main product" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setShowMediaModal("main")}
                        className="cursor-pointer bg-white text-slate-900 px-5 py-2 rounded-xl font-bold shadow-lg text-xs hover:bg-slate-100 transition"
                      >
                        Change Main Image
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMediaModal("main")}
                    className="cursor-pointer flex flex-col items-center gap-3 p-6 text-center"
                  >
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                      <Upload size={26} />
                    </div>
                    <div>
                      <span className="text-primary font-bold text-sm">Select Main Image</span>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">JPG, PNG allowed</p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Gallery Images (Optional, multiple)
              </label>
              <div className="flex flex-wrap gap-3">
                {form.images.map((img: any, i: any) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border-theme group">
                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowMediaModal("gallery")}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border-theme flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary cursor-pointer transition gap-1"
                >
                  <Plus size={20} />
                  <span className="text-[10px] font-bold">Add</span>
                </button>
              </div>
            </div>

            {/* Inventory & Stock Tracking */}
            <div className="rounded-2xl border border-border-theme bg-card/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
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

        {/* Section 2: Pricing & Variants (FULL WIDTH - Spans evenly across both columns) */}
        {isCakeCategory && (
          <div className="rounded-3xl border border-border-theme bg-card/60 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>🎂</span>
                  <span>Weight Variants & Pricing (Cakes)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set prices per cake weight (e.g. 500g, 1kg). Cards are arranged in a balanced 2-column grid.
                </p>
              </div>
              <button
                type="button"
                onClick={() => addVariantRow(setWeightOptions)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <Plus size={15} /> Add Custom Weight
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
              {WEIGHT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addPreset(setWeightOptions, weightOptions, preset)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-primary/60 text-primary hover:bg-primary/10 transition cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {weightOptions.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border-theme p-8 text-center bg-background/50">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No weight variants added yet</p>
                <p className="text-xs text-slate-400 mt-1">Click a preset above (e.g. + 500g, + 1kg) or click "Add Custom Weight".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {weightOptions.map((row, idx) => renderVariantRow(row, idx, setWeightOptions, "e.g. 500g, 1kg"))}
              </div>
            )}

            {weightOptions.length > 0 && (
              <button
                type="button"
                onClick={() => addVariantRow(setWeightOptions)}
                className="w-full py-2 border-2 border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus size={16} /> Add Another Weight Variant
              </button>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-border-theme">
              <input
                type="checkbox"
                id="hasEgglessOption"
                checked={form.hasEgglessOption}
                onChange={(e) => setForm({ ...form, hasEgglessOption: e.target.checked })}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="hasEgglessOption" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Has Eggless Option Available
              </label>
            </div>
          </div>
        )}

        {isFlowerCategory && (
          <div className="rounded-3xl border border-border-theme bg-card/60 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🌸</span>
                <span>Bouquet Flower Count & Pricing</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify flower stems count and set pricing. Variants are laid out evenly in a 2-column grid.
              </p>
            </div>

            {/* Primary Flower Count field */}
            <div className="bg-background rounded-2xl border border-border-theme p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Primary Flower Count / Number of Stems
                </label>
                <input
                  value={form.flowerCount}
                  onChange={(e) => setForm({ ...form, flowerCount: e.target.value })}
                  type="text"
                  className="w-full rounded-xl border border-border-theme bg-card px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      form.flowerCount === preset
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-border-theme bg-card hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing: If no variants are added, show standard bouquet pricing */}
            {flowerCountOptions.length === 0 && (
              <div className="bg-background rounded-2xl border border-border-theme p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Standard Bouquet Pricing</h4>
                  <span className="text-xs text-slate-400">Single Price (No size variants)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">List Price (MRP ₹)</label>
                    <input
                      value={form.price}
                      onChange={(e) => handleGenericPricingChange("price", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">Sale Price (Offer ₹)</label>
                    <input
                      value={form.salePrice}
                      onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 799"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Discount (%)</label>
                    <input
                      value={form.discount}
                      onChange={(e) => handleGenericPricingChange("discount", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax (%)</label>
                    <input
                      value={form.tax}
                      onChange={(e) => handleGenericPricingChange("tax", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 18"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Shipping Cost (₹)</label>
                    <input
                      value={form.shippingCost}
                      onChange={(e) => handleGenericPricingChange("shippingCost", e.target.value)}
                      type="number"
                      className="w-full rounded-xl border border-border-theme bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Size Bouquet Variants */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Multi-Size Bouquet Variants (Optional)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Add if bouquet comes in multiple selectable sizes. Cards are organized across both columns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addVariantRow(setFlowerCountOptions)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <Plus size={15} /> Add Bouquet Variant
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
                {FLOWER_COUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addPreset(setFlowerCountOptions, flowerCountOptions, `${preset} Roses`)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-primary/60 text-primary hover:bg-primary/10 transition cursor-pointer"
                  >
                    + {preset} Roses
                  </button>
                ))}
              </div>

              {flowerCountOptions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {flowerCountOptions.map((row, idx) => renderVariantRow(row, idx, setFlowerCountOptions, "e.g. 10 Roses, 20 Roses"))}
                </div>
              )}

              {flowerCountOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => addVariantRow(setFlowerCountOptions)}
                  className="w-full py-2 border-2 border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus size={16} /> Add Another Bouquet Variant
                </button>
              )}
            </div>
          </div>
        )}

        {isGenericCategory && (
          <div className="rounded-3xl border border-border-theme bg-card/60 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Pricing & Charges</h3>
              <p className="text-xs text-slate-400">Set base price, discount, taxes and shipping.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">List Price (MRP ₹) *</label>
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
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">Sale Price (Offer ₹)</label>
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
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Discount (%)</label>
                <input
                  value={form.discount}
                  onChange={(e) => handleGenericPricingChange("discount", e.target.value)}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax (%)</label>
                <input
                  value={form.tax}
                  onChange={(e) => handleGenericPricingChange("tax", e.target.value)}
                  type="number"
                  className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. 18"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Shipping Cost (₹)</label>
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

        {/* Section 3: Availability & Occasions (Balanced 2-Column Grid) */}
        <div className="grid gap-6 lg:grid-cols-2 border-t border-border-theme pt-6">
          {/* Available Cities */}
          <div className="rounded-2xl border border-border-theme bg-card/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-foreground">
                  Available Cities / Locations
                </label>
                <p className="text-xs text-slate-400">Leave empty = available in all cities</p>
              </div>
              {allCities.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {form.availableCities.length}/{allCities.length}
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
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto rounded-xl border border-border-theme bg-background p-3">
              {allCities.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No cities added yet — add some from the Cities section.</span>
              ) : (
                allCities.map((cityName: string) => {
                  const active = form.availableCities.includes(cityName);
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => handleToggleCity(cityName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        active
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
                      }`}
                    >
                      {cityName}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Occasions */}
          <div className="rounded-2xl border border-border-theme bg-card/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-foreground">
                  Occasions <span className="font-normal text-slate-400 text-xs">(optional)</span>
                </label>
                <p className="text-xs text-slate-400">Tag occasions for better discovery</p>
              </div>
              {allOccasions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {form.occasions.length}/{allOccasions.length}
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
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto rounded-xl border border-border-theme bg-background p-3">
              {allOccasions.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No occasions added yet.</span>
              ) : (
                allOccasions.map((o: any) => {
                  const active = form.occasions.some((id: any) => String(id) === String(o._id));
                  return (
                    <button
                      key={o._id}
                      type="button"
                      onClick={() => handleToggleOccasion(o._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        active
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-card text-foreground border-border-theme hover:bg-hover-theme"
                      }`}
                    >
                      {o.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Collapsible SEO & Google Search Section */}
          <div className="rounded-2xl border border-border-theme bg-card/40 p-5 space-y-4">
            <div
              onClick={() => setShowSeo(!showSeo)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <span className="text-sm font-bold text-foreground">
                  SEO & Google Search Settings
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  (Optional - Click to {showSeo ? "collapse" : "expand"})
                </span>
              </div>
              <span className="text-xs font-bold text-primary">
                {showSeo ? "Hide ▲" : "Show ▼"}
              </span>
            </div>

            {showSeo && (
              <div className="pt-3 border-t border-border-theme space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Custom SEO Title
                    </label>
                    <input
                      value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                      placeholder={form.name ? `${form.name} | GiftFestive Faridabad` : "e.g. Delicious Chocolate Truffle Cake"}
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Defaults to product name if left blank.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Focus Keywords (comma-separated)
                    </label>
                    <input
                      value={form.seoKeywords}
                      onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })}
                      placeholder="e.g. chocolate cake, midnight delivery, faridabad"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                    placeholder="Search snippet summary (140-160 characters recommended)..."
                    className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
                      Canonical URL Override
                    </label>
                    <input
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      placeholder="Leave empty for standard product URL"
                      className="w-full rounded-xl border border-border-theme bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.noIndex}
                        onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span>NoIndex (Hide this product from Google search)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-border-theme flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-32 border border-border-theme text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2 text-sm font-bold hover:bg-hover-theme transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="w-full sm:w-32 bg-primary text-white px-4 py-2 text-sm rounded-xl font-bold hover:opacity-90 transition shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer text-center"
          >
            {saving ? "Saving..." : product?._id ? "Update" : "Save"}
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
