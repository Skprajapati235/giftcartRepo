// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import {
//   Gift,
//   Plus,
//   ArrowLeft,
//   CheckCircle2,
//   AlertCircle,
//   RefreshCw,
//   Sparkles,
//   Flame,
//   Trash2,
//   Edit3,
//   Image as ImageIcon,
//   Save,
//   Upload,
//   FolderOpen,
//   Pencil,
//   X,
// } from "lucide-react";
// import ProtectedRoute from "../components/ProtectedRoute";
// import AdminMain from "../components/AdminMain";
// import MediaModal from "../components/ui/MediaModal";
// import {
//   getAdminAddons,
//   createAddon,
//   updateAddon,
//   deleteAddon,
//   getAdminAddonCategories,
//   createAddonCategory,
//   updateAddonCategory,
//   deleteAddonCategory,
//   AddonItem,
//   AddonCategory,
//   ProductCategoryOption,
// } from "../services/giftingService";
// import { getCategories } from "../services/adminService";

// const PRESET_IMAGES: { label: string; url: string; category: string }[] = [
//   {
//     label: "Magic Sparkling Candles",
//     url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=80",
//     category: "candle",
//   },
//   {
//     label: "Handcrafted Luxury Birthday Card",
//     url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=80",
//     category: "card",
//   },
//   {
//     label: "Golden Party Confetti Popper",
//     url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
//     category: "popper",
//   },
//   {
//     label: "Ferrero Rocher Box (16 Pcs)",
//     url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80",
//     category: "chocolate",
//   },
// ];

// export default function AddonsPage() {
//   const [addons, setAddons] = useState<AddonItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [showForm, setShowForm] = useState(false);
//   const [editingAddon, setEditingAddon] = useState<AddonItem | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
//   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
//   const [addonCategories, setAddonCategories] = useState<AddonCategory[]>([]);
//   const [productCategories, setProductCategories] = useState<ProductCategoryOption[]>([]);
//   const [showCategoryManager, setShowCategoryManager] = useState(false);
//   const [categoryName, setCategoryName] = useState("");
//   const [editingCategory, setEditingCategory] = useState<AddonCategory | null>(null);
//   const [categorySaving, setCategorySaving] = useState(false);
//   const [deleteCategoryConfirmId, setDeleteCategoryConfirmId] = useState<string | null>(null);

//   // Media Modal state
//   const [showMediaModal, setShowMediaModal] = useState(false);

//   // Form state
//   const [form, setForm] = useState<Partial<AddonItem>>({
//     name: "",
//     category: "",
//     price: 99,
//     image: "",
//     description: "",
//     isPopular: false,
//     isActive: true,
//     productCategories: [],
//     sortOrder: 1,
//   });

//   const getTopSortOrder = () =>
//     addons.reduce((minSortOrder, addon) => Math.min(minSortOrder, addon.sortOrder ?? 0), 0) - 1;

//   const loadAddons = async () => {
//     try {
//       setLoading(true);
//       const data = await getAdminAddons();
//       setAddons(data);
//     } catch (err: any) {
//       console.error(err);
//       setMessage({ type: "error", text: "Failed to load add-ons from server" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const loadPageData = async () => {
//       await loadAddons();
//       await loadCategories();
//     };
//     loadPageData();
//   }, []);

//   const loadCategories = async () => {
//     const [addonCategoryResult, productCategoryResult] = await Promise.allSettled([
//       getAdminAddonCategories(),
//       getCategories({ page: 1, limit: 100 }),
//     ]);
//     if (addonCategoryResult.status === "fulfilled") {
//       setAddonCategories(addonCategoryResult.value);
//     } else {
//       console.error(addonCategoryResult.reason);
//       setMessage({ type: "error", text: "Failed to load add-on categories" });
//     }
//     if (productCategoryResult.status === "fulfilled") {
//       const response = productCategoryResult.value;
//       setProductCategories(Array.isArray(response) ? response : response?.data || []);
//     } else {
//       console.error(productCategoryResult.reason);
//       setMessage({ type: "error", text: "Failed to load product categories" });
//     }
//   };

//   const openCreateForm = () => {
//     setEditingAddon(null);
//     setForm({
//       name: "",
//       price: 99,
//       image: "",
//       description: "",
//       isPopular: false,
//       isActive: true,
//       productCategories: [],
//       category: addonCategories[0]?.slug || "",
//       sortOrder: getTopSortOrder(),
//     });
//     setShowForm(true);
//   };

//   const openEditForm = (addon: AddonItem) => {
//     setEditingAddon(addon);
//     setForm({
//       name: addon.name,
//       category: addon.category,
//       price: addon.price,
//       image: addon.image,
//       description: addon.description || "",
//       isPopular: addon.isPopular,
//       isActive: addon.isActive,
//       productCategories: (addon.productCategories || []).map((category) =>
//         typeof category === "string" ? category : category._id
//       ),
//       sortOrder: getTopSortOrder(),
//     });
//     setShowForm(true);
//   };

//   const saveAddonCategory = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const name = categoryName.trim();
//     if (!name) return;
//     try {
//       setCategorySaving(true);
//       if (editingCategory) {
//         await updateAddonCategory(editingCategory._id, name);
//         setMessage({ type: "success", text: "Add-on category updated." });
//       } else {
//         await createAddonCategory(name);
//         setMessage({ type: "success", text: "Add-on category created." });
//       }
//       setCategoryName("");
//       setEditingCategory(null);
//       await loadCategories();
//     } catch (err: any) {
//       setMessage({
//         type: "error",
//         text: err?.response?.data?.message || "Failed to save add-on category",
//       });
//     } finally {
//       setCategorySaving(false);
//     }
//   };

//   const removeAddonCategory = async (category: AddonCategory) => {
//     try {
//       await deleteAddonCategory(category._id);
//       setDeleteCategoryConfirmId(null);
//       if (selectedCategory === category.slug) setSelectedCategory("all");
//       setMessage({ type: "success", text: "Add-on category deleted." });
//       await loadCategories();
//     } catch (err: any) {
//       setMessage({
//         type: "error",
//         text: err?.response?.data?.message || "Failed to delete add-on category",
//       });
//     }
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.name?.trim()) {
//       setMessage({ type: "error", text: "Please enter an add-on item name." });
//       return;
//     }
//     if (!form.image?.trim()) {
//       setMessage({ type: "error", text: "Please provide an image for the add-on item." });
//       return;
//     }

//     try {
//       setSaving(true);
//       if (editingAddon?._id) {
//         await updateAddon(editingAddon._id, form);
//         setMessage({ type: "success", text: `"${form.name}" updated successfully!` });
//       } else {
//         await createAddon(form);
//         setMessage({ type: "success", text: `"${form.name}" created successfully!` });
//       }
//       setShowForm(false);
//       setEditingAddon(null);
//       await Promise.all([loadAddons(), loadCategories()]);
//       setTimeout(() => setMessage(null), 4000);
//     } catch (err: any) {
//       setMessage({
//         type: "error",
//         text: err?.response?.data?.message || err?.message || "Failed to save add-on item",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteAddon(id);
//       setAddons((prev) => prev.filter((a) => a._id !== id));
//       await loadCategories();
//       setDeleteConfirmId(null);
//       setMessage({ type: "success", text: "Add-on deleted successfully." });
//       setTimeout(() => setMessage(null), 3000);
//     } catch (err: any) {
//       setMessage({ type: "error", text: "Failed to delete add-on item" });
//     }
//   };

//   const filteredAddons =
//     selectedCategory === "all"
//       ? addons
//       : addons.filter((a) => a.category === selectedCategory);

//   return (
//     <ProtectedRoute>
//       <AdminMain>
//         {/* Global Toast Alert */}
//         {message && (
//           <div
//             className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${message.type === "success"
//                 ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
//                 : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
//               }`}
//           >
//             <div className="flex items-center gap-3">
//               {message.type === "success" ? (
//                 <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
//               ) : (
//                 <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
//               )}
//               <span className="text-sm font-semibold">{message.text}</span>
//             </div>
//             <button
//               onClick={() => setMessage(null)}
//               className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}

//         {/* ═══════════════════════════════════════════════════════════════════
//             MODE A: FULL-PAGE CREATE / EDIT FORM VIEW (NO MODAL!)
//         ═══════════════════════════════════════════════════════════════════ */}
//         {showForm ? (
//           <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
//             {/* Top Navigation & Action Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
//               <div className="flex items-center gap-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="flex items-center justify-center h-11 w-11 rounded-2xl border border-border-theme bg-card hover:bg-hover-theme transition-all shadow-xs cursor-pointer group"
//                   title="Back to Add-ons"
//                 >
//                   <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-foreground transition-transform group-hover:-translate-x-0.5" />
//                 </button>
//                 <div>
//                   <div className="flex items-center gap-2.5">
//                     <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
//                       {editingAddon ? "Edit Add-on" : "New Celebration Item"}
//                     </span>
//                   </div>
//                   <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
//                     {editingAddon ? `Edit: ${editingAddon.name}` : "Create Celebration Add-on"}
//                   </h1>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-5 py-2.5 rounded-xl border border-border-theme text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-pink-700 transition cursor-pointer disabled:opacity-50"
//                 >
//                   {saving ? (
//                     <>
//                       <RefreshCw className="w-4 h-4 animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4" />
//                       {editingAddon ? "Update Add-on" : "Publish Add-on"}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* 2-Column Responsive Layout */}
//             <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//               {/* Left Column: Form Details (5 Cols) */}
//               <div className="lg:col-span-5 space-y-6">
//                 <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
//                   <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
//                     <Gift className="w-5 h-5 text-rose-500" />
//                     <h2 className="text-base font-bold text-foreground">Item Information</h2>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Item Name <span className="text-rose-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                       placeholder="e.g. Magic Sparkling Candles (Pack of 5)"
//                       className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-sm font-medium text-foreground transition"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Add-on category <span className="text-rose-500">*</span>
//                     </label>
//                     <select
//                       required
//                       value={form.category || ""}
//                       onChange={(e) => setForm({ ...form, category: e.target.value })}
//                       className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme text-sm font-medium text-foreground"
//                     >
//                       <option value="" disabled>Select an add-on category</option>
//                       {addonCategories.map((category) => (
//                         <option key={category._id} value={category.slug}>{category.name}</option>
//                       ))}
//                     </select>
//                     {addonCategories.length === 0 && (
//                       <p className="mt-1.5 text-xs text-amber-600">Create an add-on category from Manage Categories before publishing an item.</p>
//                     )}
//                     <p className="mt-1.5 text-xs text-slate-500">These categories organize checkout extras; they are separate from product categories.</p>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Show with product categories <span className="font-normal normal-case">(optional)</span>
//                     </label>
//                     {productCategories.length === 0 ? (
//                       <p className="text-xs text-amber-600">Create product categories first to target this add-on.</p>
//                     ) : (
//                       <div className="max-h-40 overflow-y-auto space-y-2 rounded-2xl border border-border-theme p-3">
//                         {productCategories.map((category) => (
//                           <label key={category._id} className="flex items-center gap-2 text-sm text-foreground">
//                             <input
//                               type="checkbox"
//                               checked={(form.productCategories || []).includes(category._id)}
//                               onChange={(e) => {
//                                 const current = (form.productCategories || []).map((value) =>
//                                   typeof value === "string" ? value : value._id
//                                 );
//                                 setForm({
//                                   ...form,
//                                   productCategories: e.target.checked
//                                     ? [...current, category._id]
//                                     : current.filter((id) => id !== category._id),
//                                 });
//                               }}
//                               className="accent-rose-500"
//                             />
//                             {category.name}
//                           </label>
//                         ))}
//                       </div>
//                     )}
//                     <p className="mt-1.5 text-xs text-slate-500">
//                       No selection = show for every checkout. Selecting categories shows this add-on only when the cart contains a matching product.
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                         Selling Price (₹) <span className="text-rose-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
//                           ₹
//                         </span>
//                         <input
//                           type="number"
//                           required
//                           min={0}
//                           value={form.price}
//                           onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
//                           className="w-full pl-8 pr-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-sm font-bold text-foreground transition"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                         Sort Order
//                       </label>
//                       <input
//                         type="number"
//                         value={form.sortOrder}
//                         onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
//                         className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-sm font-medium text-foreground transition"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Description / Occasion Tag
//                     </label>
//                     <textarea
//                       rows={2}
//                       value={form.description}
//                       onChange={(e) => setForm({ ...form, description: e.target.value })}
//                       placeholder="e.g. Perfect for midnight celebrations, birthday surprises..."
//                       className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-xs font-medium text-foreground transition"
//                     />
//                   </div>

//                   <div className="pt-2 border-t border-border-theme space-y-3">
//                     <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border-theme">
//                       <div>
//                         <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
//                           <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
//                           Feature as Popular Upsell
//                         </p>
//                         <p className="text-[11px] text-slate-500">
//                           Shows highlighted "BESTSELLER" flame badge
//                         </p>
//                       </div>
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={form.isPopular}
//                           onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
//                           className="sr-only peer"
//                         />
//                         <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
//                       </label>
//                     </div>

//                     <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border-theme">
//                       <div>
//                         <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
//                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
//                           Active on Storefront
//                         </p>
//                         <p className="text-[11px] text-slate-500">
//                           Available for customers to add at checkout
//                         </p>
//                       </div>
//                       <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={form.isActive}
//                           onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
//                           className="sr-only peer"
//                         />
//                         <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column: Product Image Asset & Storefront Preview (7 Cols) */}
//               <div className="lg:col-span-7 space-y-6">
//                 <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
//                   <div className="flex items-center justify-between pb-4 border-b border-border-theme">
//                     <div className="flex items-center gap-2.5">
//                       <ImageIcon className="w-5 h-5 text-rose-500" />
//                       <h2 className="text-base font-bold text-foreground">Product Image Asset</h2>
//                     </div>
//                     {form.image && (
//                       <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
//                         <CheckCircle2 className="w-3 h-3" /> Image Selected
//                       </span>
//                     )}
//                   </div>

//                   {/* Standard Category / Product Image Picker Box */}
//                   <div>
//                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
//                       Item Image <span className="text-rose-500">*</span>
//                     </label>
//                     <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
//                       {form.image ? (
//                         <>
//                           <img src={form.image} alt="Addon image" className="h-full w-full object-contain p-2" />
//                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
//                             <button
//                               type="button"
//                               onClick={() => setShowMediaModal(true)}
//                               className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1.5"
//                             >
//                               <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
//                               Change Image
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setForm({ ...form, image: "" })}
//                               className="cursor-pointer bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition"
//                             >
//                               Remove
//                             </button>
//                           </div>
//                         </>
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={() => setShowMediaModal(true)}
//                           className="cursor-pointer flex flex-col items-center gap-2 p-8 w-full h-full justify-center hover:bg-hover-theme/50 transition"
//                         >
//                           <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
//                             <Upload size={24} />
//                           </div>
//                           <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Select Image from Media</span>
//                           <span className="text-[11px] text-slate-400">Browse library or upload new via Media Modal</span>
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Live Storefront Preview */}
//                   {form.image && (
//                     <div className="pt-4 border-t border-border-theme flex flex-col items-center justify-center">
//                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Storefront Card Preview</p>
//                       <div className="w-full max-w-[200px] aspect-square rounded-2xl border border-border-theme bg-card shadow-sm p-3 flex flex-col justify-between">
//                         <div className="flex items-center justify-between">
//                           <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-background border border-border-theme capitalize">
//                             {addonCategories.find((category) => category.slug === form.category)?.name || "Category"}
//                           </span>
//                           {form.isPopular && (
//                             <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
//                               BESTSELLER
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex-1 flex items-center justify-center p-2">
//                           <img src={form.image} alt="preview" className="max-h-24 object-contain" />
//                         </div>
//                         <div className="pt-2 border-t border-border-theme flex items-center justify-between">
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs font-bold truncate">{form.name || "Item Name"}</p>
//                             <p className="text-xs font-black text-rose-500">₹{form.price}</p>
//                           </div>
//                           <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px]">+ Add</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </form>
//           </div>
//         ) : (
//           /* ═══════════════════════════════════════════════════════════════════
//               MODE B: MAIN LIST VIEW
//           ═══════════════════════════════════════════════════════════════════ */
//           <div className="space-y-6">
//             {/* Page Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
//               <div>
//                 <p className="text-xs uppercase tracking-[0.3em] font-bold text-rose-500">
//                   Impulse Checkout Upsells
//                 </p>
//                 <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
//                   Gifting Add-ons Store
//                 </h1>
//                 <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
//                   Checkout extras. Add-on categories group these items; optional product-category targeting controls which orders see them.
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowCategoryManager((visible) => !visible)}
//                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme text-sm font-bold text-foreground hover:bg-hover-theme"
//                 >
//                   <FolderOpen className="w-4 h-4" />
//                   Manage Categories
//                 </button>
//                 <button
//                   onClick={loadAddons}
//                   className="p-2.5 rounded-xl border border-border-theme hover:bg-hover-theme text-slate-500 hover:text-foreground transition cursor-pointer"
//                   title="Refresh Add-ons"
//                 >
//                   <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//                 </button>
//                 <button
//                   onClick={openCreateForm}
//                   className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-pink-700 transition cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Create Add-on Item
//                 </button>
//               </div>
//             </div>

//             {/* Category Filter Pills */}
//             <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
//               {[
//                 { slug: "all", name: "All Add-ons" },
//                 ...addonCategories.map(({ slug, name }) => ({ slug, name })),
//               ].map((category) => (
//                 <button
//                   key={category.slug}
//                   onClick={() => setSelectedCategory(category.slug)}
//                   className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${selectedCategory === category.slug
//                       ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
//                       : "bg-card border border-border-theme text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
//                     }`}
//                 >
//                   {category.name}
//                 </button>
//               ))}
//             </div>

//             {showCategoryManager && (
//               <section className="rounded-3xl border border-border-theme bg-card p-5 space-y-4">
//                 <div>
//                   <h2 className="text-lg font-bold text-foreground">Add-on categories</h2>
//                   <p className="text-xs text-slate-500 mt-1">
//                     These are only for grouping checkout extras. Product categories are managed separately in Products.
//                   </p>
//                 </div>
//                 <form onSubmit={saveAddonCategory} className="flex flex-col sm:flex-row gap-2">
//                   <input
//                     value={categoryName}
//                     onChange={(e) => setCategoryName(e.target.value)}
//                     placeholder="e.g. Gift Wrap"
//                     required
//                     className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border-theme text-sm text-foreground"
//                   />
//                   <button
//                     type="submit"
//                     disabled={categorySaving}
//                     className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-50"
//                   >
//                     {categorySaving ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
//                   </button>
//                   {editingCategory && (
//                     <button
//                       type="button"
//                       onClick={() => { setEditingCategory(null); setCategoryName(""); }}
//                       className="p-2.5 rounded-xl border border-border-theme text-slate-500"
//                       aria-label="Cancel category edit"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   )}
//                 </form>
//                 <div className="divide-y divide-border-theme">
//                   {addonCategories.map((category) => (
//                     <div key={category._id} className="flex items-center justify-between gap-3 py-3">
//                       <div>
//                         <p className="font-semibold text-sm text-foreground">{category.name}</p>
//                         <p className="text-xs text-slate-500">{category.addonCount} add-on items</p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() => { setEditingCategory(category); setCategoryName(category.name); }}
//                           className="p-2 rounded-lg border border-border-theme text-slate-500 hover:text-foreground"
//                           aria-label={`Edit ${category.name}`}
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </button>
//                         {deleteCategoryConfirmId === category._id ? (
//                           <>
//                             <button
//                               type="button"
//                               onClick={() => removeAddonCategory(category)}
//                               disabled={category.addonCount > 0}
//                               title={category.addonCount > 0 ? "Move add-ons out of this category before deleting" : undefined}
//                               className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-40"
//                             >
//                               Confirm delete
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setDeleteCategoryConfirmId(null)}
//                               className="p-2 text-slate-500"
//                               aria-label="Cancel category deletion"
//                             >
//                               <X className="w-4 h-4" />
//                             </button>
//                           </>
//                         ) : (
//                           <button
//                             type="button"
//                             onClick={() => setDeleteCategoryConfirmId(category._id)}
//                             className="p-2 rounded-lg text-slate-400 hover:text-rose-500"
//                             aria-label={`Delete ${category.name}`}
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </section>
//             )}

//             {/* Content Cards Grid */}
//             {loading ? (
//               <div className="flex flex-col items-center justify-center p-16 text-slate-400">
//                 <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-3" />
//                 <p className="text-sm font-semibold">Loading celebration add-ons...</p>
//               </div>
//             ) : filteredAddons.length === 0 ? (
//               <div className="text-center py-20 bg-card border border-border-theme rounded-3xl p-8">
//                 <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
//                   <Gift className="w-8 h-8" />
//                 </div>
//                 <h3 className="text-lg font-bold text-foreground">No add-ons in this category</h3>
//                 <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
//                   Add high-margin celebration items like sparkling candles or customized cards to boost cart value.
//                 </p>
//                 <button
//                   onClick={openCreateForm}
//                   className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer"
//                 >
//                   Create First Item
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {filteredAddons.map((addon) => (
//                   <div
//                     key={addon._id}
//                     className={`bg-card border rounded-3xl overflow-hidden transition-all duration-200 group flex flex-col justify-between hover:shadow-lg hover:border-rose-500/40 ${addon.isActive ? "border-border-theme" : "border-border-theme/40 opacity-60"
//                       }`}
//                   >
//                     <div>
//                       {/* Product image container */}
//                       <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
//                         <img
//                           src={addon.image}
//                           alt={addon.name}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                         {addon.isPopular && (
//                           <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-md">
//                             <Flame className="w-3 h-3 fill-slate-950" />
//                             BESTSELLER
//                           </div>
//                         )}
//                         <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md capitalize">
//                           {addonCategories.find((category) => category.slug === addon.category)?.name || addon.category}
//                         </span>
//                       </div>

//                       <div className="p-5">
//                         <h3 className="font-bold text-base text-foreground group-hover:text-rose-500 transition line-clamp-1">
//                           {addon.name}
//                         </h3>
//                         {addon.description && (
//                           <p className="text-xs text-slate-500 mt-1 line-clamp-2">
//                             {addon.description}
//                           </p>
//                         )}
//                         <div className="mt-3 flex items-center justify-between">
//                           <div className="flex items-baseline gap-1">
//                             <span className="text-xl font-black text-rose-500">₹{addon.price}</span>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={async () => {
//                               if (!addon._id) return;
//                               try {
//                                 await updateAddon(addon._id, { isActive: !addon.isActive });
//                                 setAddons((prev) => prev.map((a) => (a._id === addon._id ? { ...a, isActive: !a.isActive } : a)));
//                                 setMessage({ type: "success", text: `"${addon.name}" is now ${!addon.isActive ? "Active" : "Disabled"}` });
//                                 setTimeout(() => setMessage(null), 2500);
//                               } catch (e) {
//                                 setMessage({ type: "error", text: "Failed to update add-on status" });
//                               }
//                             }}
//                             className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition ${
//                               addon.isActive
//                                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
//                                 : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
//                             }`}
//                             title="Click to toggle active status"
//                           >
//                             {addon.isActive ? "Active" : "Disabled"}
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Bottom Actions */}
//                     <div className="p-3 border-t border-border-theme bg-background/50 flex items-center justify-between gap-2">
//                       <button
//                         onClick={() => openEditForm(addon)}
//                         className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme hover:bg-hover-theme text-xs font-bold text-foreground transition cursor-pointer"
//                       >
//                         <Edit3 className="w-3.5 h-3.5 text-blue-500" />
//                         Edit Item
//                       </button>

//                       {deleteConfirmId === addon._id ? (
//                         <div className="flex items-center gap-1.5">
//                           <button
//                             onClick={() => addon._id && handleDelete(addon._id)}
//                             className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
//                           >
//                             Confirm
//                           </button>
//                           <button
//                             onClick={() => setDeleteConfirmId(null)}
//                             className="px-2 py-2 text-xs font-bold text-slate-400 hover:text-foreground cursor-pointer"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => setDeleteConfirmId(addon._id || null)}
//                           className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
//                           title="Delete Add-on"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Media Library / Upload Modal */}
//         {showMediaModal && (
//           <MediaModal
//             onClose={() => setShowMediaModal(false)}
//             onSelect={(urls) => {
//               const selectedUrl = Array.isArray(urls) ? urls[0] : urls;
//               if (selectedUrl) {
//                 setForm((prev) => ({ ...prev, image: selectedUrl }));
//               }
//               setShowMediaModal(false);
//             }}
//             multiple={false}
//           />
//         )}
//       </AdminMain>
//     </ProtectedRoute>
//   );
// }



"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Gift,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Flame,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Save,
  Upload,
  FolderOpen,
  Pencil,
  X,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import MediaModal from "../components/ui/MediaModal";
import {
  getAdminAddons,
  createAddon,
  updateAddon,
  deleteAddon,
  getAdminAddonCategories,
  createAddonCategory,
  updateAddonCategory,
  deleteAddonCategory,
  AddonItem,
  AddonCategory,
  ProductCategoryOption,
} from "../services/giftingService";
import { getCategories } from "../services/adminService";

export default function AddonsPage() {
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addonCategories, setAddonCategories] = useState<AddonCategory[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryOption[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<AddonCategory | null>(null);
  const [categorySaving, setCategorySaving] = useState(false);
  const [deleteCategoryConfirmId, setDeleteCategoryConfirmId] = useState<string | null>(null);

  // Media Modal state
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<AddonItem>>({
    name: "",
    category: "",
    price: 99,
    image: "",
    description: "",
    isPopular: false,
    isActive: true,
    productCategories: [],
    sortOrder: 1,
  });

  const getTopSortOrder = () =>
    addons.reduce((minSortOrder, addon) => Math.min(minSortOrder, addon.sortOrder ?? 0), 0) - 1;

  const loadAddons = async () => {
    try {
      setLoading(true);
      const data = await getAdminAddons();
      setAddons(data);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load add-ons from server" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      await loadAddons();
      await loadCategories();
    };
    loadPageData();
  }, []);

  const loadCategories = async () => {
    const [addonCategoryResult, productCategoryResult] = await Promise.allSettled([
      getAdminAddonCategories(),
      getCategories({ page: 1, limit: 100 }),
    ]);
    if (addonCategoryResult.status === "fulfilled") {
      setAddonCategories(addonCategoryResult.value);
    } else {
      console.error(addonCategoryResult.reason);
      setMessage({ type: "error", text: "Failed to load add-on categories" });
    }
    if (productCategoryResult.status === "fulfilled") {
      const response = productCategoryResult.value;
      setProductCategories(Array.isArray(response) ? response : response?.data || []);
    } else {
      console.error(productCategoryResult.reason);
      setMessage({ type: "error", text: "Failed to load product categories" });
    }
  };

  const openCreateForm = () => {
    setEditingAddon(null);
    setForm({
      name: "",
      price: 99,
      image: "",
      description: "",
      isPopular: false,
      isActive: true,
      productCategories: [],
      category: addonCategories[0]?.slug || "",
      sortOrder: getTopSortOrder(),
    });
    setShowForm(true);
  };

  const openEditForm = (addon: AddonItem) => {
    setEditingAddon(addon);
    setForm({
      name: addon.name,
      category: addon.category,
      price: addon.price,
      image: addon.image,
      description: addon.description || "",
      isPopular: addon.isPopular,
      isActive: addon.isActive,
      productCategories: (addon.productCategories || []).map((category) =>
        typeof category === "string" ? category : category._id
      ),
      sortOrder: getTopSortOrder(),
    });
    setShowForm(true);
  };

  const saveAddonCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    try {
      setCategorySaving(true);
      if (editingCategory) {
        await updateAddonCategory(editingCategory._id, name);
        setMessage({ type: "success", text: "Add-on category updated." });
      } else {
        await createAddonCategory(name);
        setMessage({ type: "success", text: "Add-on category created." });
      }
      setCategoryName("");
      setEditingCategory(null);
      await loadCategories();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to save add-on category",
      });
    } finally {
      setCategorySaving(false);
    }
  };

  const removeAddonCategory = async (category: AddonCategory) => {
    try {
      await deleteAddonCategory(category._id);
      setDeleteCategoryConfirmId(null);
      if (selectedCategory === category.slug) setSelectedCategory("all");
      setMessage({ type: "success", text: "Add-on category deleted." });
      await loadCategories();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete add-on category",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setMessage({ type: "error", text: "Please enter an add-on item name." });
      return;
    }
    if (!form.image?.trim()) {
      setMessage({ type: "error", text: "Please provide an image for the add-on item." });
      return;
    }

    try {
      setSaving(true);
      if (editingAddon?._id) {
        await updateAddon(editingAddon._id, form);
        setMessage({ type: "success", text: `"${form.name}" updated successfully!` });
      } else {
        await createAddon(form);
        setMessage({ type: "success", text: `"${form.name}" created successfully!` });
      }
      setShowForm(false);
      setEditingAddon(null);
      await Promise.all([loadAddons(), loadCategories()]);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Failed to save add-on item",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddon(id);
      setAddons((prev) => prev.filter((a) => a._id !== id));
      await loadCategories();
      setDeleteConfirmId(null);
      setMessage({ type: "success", text: "Add-on deleted successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to delete add-on item" });
    }
  };

  const filteredAddons =
    selectedCategory === "all"
      ? addons
      : addons.filter((a) => a.category === selectedCategory);

  return (
    <ProtectedRoute>
      <AdminMain>
        {/* Global Toast Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
              }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-semibold">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE A: FULL-PAGE CREATE / EDIT FORM VIEW (NO MODAL!)
        ═══════════════════════════════════════════════════════════════════ */}
        {showForm ? (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
            {/* Top Navigation & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex items-center justify-center h-11 w-11 rounded-2xl border border-border-theme bg-card hover:bg-hover-theme transition-all shadow-xs cursor-pointer group"
                  title="Back to Add-ons"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-foreground transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      {editingAddon ? "Edit Add-on" : "New Celebration Item"}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                    {editingAddon ? `Edit: ${editingAddon.name}` : "Create Celebration Add-on"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-border-theme text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-pink-700 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingAddon ? "Update Add-on" : "Publish Add-on"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Details (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
                    <Gift className="w-5 h-5 text-rose-500" />
                    <h2 className="text-base font-bold text-foreground">Item Information</h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Item Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Magic Sparkling Candles (Pack of 5)"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-sm font-medium text-foreground transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Add-on category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={form.category || ""}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme text-sm font-medium text-foreground"
                    >
                      <option value="" disabled>Select an add-on category</option>
                      {addonCategories.map((category) => (
                        <option key={category._id} value={category.slug}>{category.name}</option>
                      ))}
                    </select>
                    {addonCategories.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-600">Create an add-on category from Manage Categories before publishing an item.</p>
                    )}
                    <p className="mt-1.5 text-xs text-slate-500">These categories organize checkout extras; they are separate from product categories.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Show with product categories <span className="font-normal normal-case">(optional)</span>
                    </label>
                    {productCategories.length === 0 ? (
                      <p className="text-xs text-amber-600">Create product categories first to target this add-on.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 rounded-2xl border border-border-theme p-3">
                        {productCategories.map((category) => (
                          <label key={category._id} className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="checkbox"
                              checked={(form.productCategories || []).includes(category._id)}
                              onChange={(e) => {
                                const current = (form.productCategories || []).map((value) =>
                                  typeof value === "string" ? value : value._id
                                );
                                setForm({
                                  ...form,
                                  productCategories: e.target.checked
                                    ? [...current, category._id]
                                    : current.filter((id) => id !== category._id),
                                });
                              }}
                              className="accent-rose-500"
                            />
                            {category.name}
                          </label>
                        ))}
                      </div>
                    )}
                    <p className="mt-1.5 text-xs text-slate-500">
                      No selection = show for every checkout. Selecting categories shows this add-on only when the cart contains a matching product.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Selling Price (₹) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                          className="w-full pl-8 pr-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-sm font-bold text-foreground transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-sm font-medium text-foreground transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Description / Occasion Tag
                    </label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g. Perfect for midnight celebrations, birthday surprises..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-xs font-medium text-foreground transition"
                    />
                  </div>

                  <div className="pt-2 border-t border-border-theme space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border-theme">
                      <div>
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Feature as Popular Upsell
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Shows highlighted "BESTSELLER" flame badge
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isPopular}
                          onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border-theme">
                      <div>
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Active on Storefront
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Available for customers to add at checkout
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Product Image Asset & Storefront Preview (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-border-theme">
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className="w-5 h-5 text-rose-500" />
                      <h2 className="text-base font-bold text-foreground">Product Image Asset</h2>
                    </div>
                    {form.image && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Image Selected
                      </span>
                    )}
                  </div>

                  {/* Standard Category / Product Image Picker Box */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Item Image <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
                      {form.image ? (
                        <>
                          <img src={form.image} alt="Addon image" className="h-full w-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowMediaModal(true)}
                              className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition flex items-center gap-1.5"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                              Change Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, image: "" })}
                              className="cursor-pointer bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowMediaModal(true)}
                          className="cursor-pointer flex flex-col items-center gap-2 p-8 w-full h-full justify-center hover:bg-hover-theme/50 transition"
                        >
                          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                            <Upload size={24} />
                          </div>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Select Image from Media</span>
                          <span className="text-[11px] text-slate-400">Browse library or upload new via Media Modal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Storefront Preview */}
                  {form.image && (
                    <div className="pt-4 border-t border-border-theme flex flex-col items-center justify-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Storefront Card Preview</p>
                      <div className="w-full max-w-[200px] aspect-square rounded-2xl border border-border-theme bg-card shadow-sm p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-background border border-border-theme capitalize">
                            {addonCategories.find((category) => category.slug === form.category)?.name || "Category"}
                          </span>
                          {form.isPopular && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                              BESTSELLER
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex items-center justify-center p-2">
                          <img src={form.image} alt="preview" className="max-h-24 object-contain" />
                        </div>
                        <div className="pt-2 border-t border-border-theme flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{form.name || "Item Name"}</p>
                            <p className="text-xs font-black text-rose-500">₹{form.price}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px]">+ Add</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
              MODE B: MAIN LIST VIEW
          ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-rose-500">
                  Impulse Checkout Upsells
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                  Gifting Add-ons Store
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Checkout extras. Add-on categories group these items; optional product-category targeting controls which orders see them.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryManager((visible) => !visible)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-theme text-sm font-bold text-foreground hover:bg-hover-theme"
                >
                  <FolderOpen className="w-4 h-4" />
                  Manage Categories
                </button>
                <button
                  onClick={loadAddons}
                  className="p-2.5 rounded-xl border border-border-theme hover:bg-hover-theme text-slate-500 hover:text-foreground transition cursor-pointer"
                  title="Refresh Add-ons"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-pink-700 transition cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Create Add-on Item
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { slug: "all", name: "All Add-ons" },
                ...addonCategories.map(({ slug, name }) => ({ slug, name })),
              ].map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${selectedCategory === category.slug
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-card border border-border-theme text-slate-600 dark:text-slate-300 hover:bg-hover-theme"
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {showCategoryManager && (
              <section className="rounded-3xl border border-border-theme bg-card p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Add-on categories</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    These are only for grouping checkout extras. Product categories are managed separately in Products.
                  </p>
                </div>
                <form onSubmit={saveAddonCategory} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Gift Wrap"
                    required
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border-theme text-sm text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={categorySaving}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-50"
                  >
                    {categorySaving ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={() => { setEditingCategory(null); setCategoryName(""); }}
                      className="p-2.5 rounded-xl border border-border-theme text-slate-500"
                      aria-label="Cancel category edit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </form>
                <div className="divide-y divide-border-theme">
                  {addonCategories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{category.name}</p>
                        <p className="text-xs text-slate-500">{category.addonCount} add-on items</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setEditingCategory(category); setCategoryName(category.name); }}
                          className="p-2 rounded-lg border border-border-theme text-slate-500 hover:text-foreground"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteCategoryConfirmId === category._id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => removeAddonCategory(category)}
                              disabled={category.addonCount > 0}
                              title={category.addonCount > 0 ? "Move add-ons out of this category before deleting" : undefined}
                              className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-40"
                            >
                              Confirm delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCategoryConfirmId(null)}
                              className="p-2 text-slate-500"
                              aria-label="Cancel category deletion"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteCategoryConfirmId(category._id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Content Cards Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-3" />
                <p className="text-sm font-semibold">Loading celebration add-ons...</p>
              </div>
            ) : filteredAddons.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border-theme rounded-3xl p-8">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No add-ons in this category</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  Add high-margin celebration items like sparkling candles or customized cards to boost cart value.
                </p>
                <button
                  onClick={openCreateForm}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer"
                >
                  Create First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAddons.map((addon) => (
                  <div
                    key={addon._id}
                    className={`bg-card border rounded-3xl overflow-hidden transition-all duration-200 group flex flex-col justify-between hover:shadow-lg hover:border-rose-500/40 ${addon.isActive ? "border-border-theme" : "border-border-theme/40 opacity-60"
                      }`}
                  >
                    <div>
                      {/* Product image container */}
                      <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={addon.image}
                          alt={addon.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {addon.isPopular && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-md">
                            <Flame className="w-3 h-3 fill-slate-950" />
                            BESTSELLER
                          </div>
                        )}
                        <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md capitalize">
                          {addonCategories.find((category) => category.slug === addon.category)?.name || addon.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-base text-foreground group-hover:text-rose-500 transition line-clamp-1">
                          {addon.name}
                        </h3>
                        {addon.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {addon.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-rose-500">₹{addon.price}</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!addon._id) return;
                              try {
                                await updateAddon(addon._id, { isActive: !addon.isActive });
                                setAddons((prev) => prev.map((a) => (a._id === addon._id ? { ...a, isActive: !a.isActive } : a)));
                                setMessage({ type: "success", text: `"${addon.name}" is now ${!addon.isActive ? "Active" : "Disabled"}` });
                                setTimeout(() => setMessage(null), 2500);
                              } catch (e) {
                                setMessage({ type: "error", text: "Failed to update add-on status" });
                              }
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition ${addon.isActive
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                              }`}
                            title="Click to toggle active status"
                          >
                            {addon.isActive ? "Active" : "Disabled"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-3 border-t border-border-theme bg-background/50 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditForm(addon)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme hover:bg-hover-theme text-xs font-bold text-foreground transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        Edit Item
                      </button>

                      {deleteConfirmId === addon._id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => addon._id && handleDelete(addon._id)}
                            className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-2 text-xs font-bold text-slate-400 hover:text-foreground cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(addon._id || null)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Add-on"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media Library / Upload Modal */}
        {showMediaModal && (
          <MediaModal
            onClose={() => setShowMediaModal(false)}
            onSelect={(urls) => {
              const selectedUrl = Array.isArray(urls) ? urls[0] : urls;
              if (selectedUrl) {
                setForm((prev) => ({ ...prev, image: selectedUrl }));
              }
              setShowMediaModal(false);
            }}
            multiple={false}
          />
        )}
      </AdminMain>
    </ProtectedRoute>
  );
}
