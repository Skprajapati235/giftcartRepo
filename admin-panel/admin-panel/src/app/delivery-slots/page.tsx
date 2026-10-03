// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Clock,
//   Plus,
//   ArrowLeft,
//   CheckCircle2,
//   AlertCircle,
//   RefreshCw,
//   Moon,
//   Sun,
//   Zap,
//   Sparkles,
//   Trash2,
//   Edit3,
//   DollarSign,
//   Save,
//   Eye,
//   Sliders,
//   ShieldCheck,
//   Calendar,
//   Image as ImageIcon,
//   Upload,
// } from "lucide-react";
// import ProtectedRoute from "../components/ProtectedRoute";
// import AdminMain from "../components/AdminMain";
// import MediaModal from "../components/ui/MediaModal";
// import {
//   getAdminDeliverySlots,
//   createDeliverySlot,
//   updateDeliverySlot,
//   deleteDeliverySlot,
//   DeliverySlotItem,
// } from "../services/giftingService";

// const SLOT_TYPES = [
//   {
//     id: "standard",
//     label: "Standard Delivery",
//     icon: Sun,
//     color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
//     desc: "Everyday scheduled delivery with zero or minimal fee",
//   },
//   {
//     id: "fixed",
//     label: "Fixed Time Slot",
//     icon: Clock,
//     color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
//     desc: "Customer selects exact 1-hour window (e.g. 4 PM - 5 PM)",
//   },
//   {
//     id: "midnight",
//     label: "Midnight Delivery",
//     icon: Moon,
//     color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
//     desc: "11:00 PM - 11:59 PM surprise delivery with premium surcharge",
//   },
//   {
//     id: "early_morning",
//     label: "Early Morning Slot",
//     icon: Zap,
//     color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
//     desc: "06:00 AM - 09:00 AM early morning birthday surprises",
//   },
// ];

// export default function DeliverySlotsPage() {
//   const [slots, setSlots] = useState<DeliverySlotItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingSlot, setEditingSlot] = useState<DeliverySlotItem | null>(null);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
//   const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
//   const [showMediaModal, setShowMediaModal] = useState(false);

//   // Form state
//   const [form, setForm] = useState<Partial<DeliverySlotItem>>({
//     name: "",
//     type: "standard",
//     timeRange: "09:00 AM - 09:00 PM",
//     startTime: "09:00",
//     endTime: "21:00",
//     extraCharge: 0,
//     image: "",
//     cutoffTime: "3 hours before slot",
//     badge: "",
//     maxOrdersPerDay: 50,
//     isActive: true,
//     sortOrder: 1,
//   });

//   const loadSlots = async () => {
//     try {
//       setLoading(true);
//       const data = await getAdminDeliverySlots();
//       setSlots(data);
//     } catch (err: any) {
//       console.error(err);
//       setMessage({ type: "error", text: "Failed to load delivery slots from server" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadSlots();
//   }, []);

//   const openCreateForm = () => {
//     setEditingSlot(null);
//     setForm({
//       name: "",
//       type: "standard",
//       timeRange: "09:00 AM - 09:00 PM",
//       startTime: "09:00",
//       endTime: "21:00",
//       extraCharge: 0,
//       image: "",
//       cutoffTime: "2 hours before",
//       badge: "Regular",
//       maxOrdersPerDay: 50,
//       isActive: true,
//       sortOrder: slots.length + 1,
//     });
//     setShowForm(true);
//   };

//   const openEditForm = (slot: DeliverySlotItem) => {
//     setEditingSlot(slot);
//     setForm({
//       name: slot.name,
//       type: slot.type,
//       timeRange: slot.timeRange,
//       startTime: slot.startTime,
//       endTime: slot.endTime,
//       extraCharge: slot.extraCharge,
//       image: slot.image || "",
//       cutoffTime: slot.cutoffTime || "",
//       badge: slot.badge || "",
//       maxOrdersPerDay: slot.maxOrdersPerDay || 50,
//       isActive: slot.isActive,
//       sortOrder: slot.sortOrder || 1,
//     });
//     setShowForm(true);
//   };

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.name?.trim()) {
//       setMessage({ type: "error", text: "Please enter a slot name." });
//       return;
//     }
//     if (!form.timeRange?.trim()) {
//       setMessage({ type: "error", text: "Please specify a time range description." });
//       return;
//     }

//     try {
//       setSaving(true);
//       if (editingSlot?._id) {
//         await updateDeliverySlot(editingSlot._id, form);
//         setMessage({ type: "success", text: `"${form.name}" updated successfully!` });
//       } else {
//         await createDeliverySlot(form);
//         setMessage({ type: "success", text: `"${form.name}" created successfully!` });
//       }
//       setShowForm(false);
//       setEditingSlot(null);
//       await loadSlots();
//       setTimeout(() => setMessage(null), 4000);
//     } catch (err: any) {
//       setMessage({
//         type: "error",
//         text: err?.response?.data?.message || err?.message || "Failed to save delivery slot",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteDeliverySlot(id);
//       setSlots((prev) => prev.filter((s) => s._id !== id));
//       setDeleteConfirmId(null);
//       setMessage({ type: "success", text: "Delivery slot removed." });
//       setTimeout(() => setMessage(null), 3000);
//     } catch (err: any) {
//       setMessage({ type: "error", text: "Failed to delete slot" });
//     }
//   };

//   const getSlotIcon = (type: string) => {
//     switch (type) {
//       case "midnight":
//         return <Moon className="w-5 h-5 text-purple-400" />;
//       case "early_morning":
//         return <Zap className="w-5 h-5 text-emerald-400" />;
//       case "fixed":
//         return <Clock className="w-5 h-5 text-amber-400" />;
//       default:
//         return <Sun className="w-5 h-5 text-blue-400" />;
//     }
//   };

//   return (
//     <ProtectedRoute>
//       <AdminMain>
//         {/* Global Toast Alert */}
//         {message && (
//           <div
//             className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
//               message.type === "success"
//                 ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
//                 : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
//             }`}
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
//                   title="Back to Slots"
//                 >
//                   <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-foreground transition-transform group-hover:-translate-x-0.5" />
//                 </button>
//                 <div>
//                   <div className="flex items-center gap-2.5">
//                     <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
//                       {editingSlot ? "Edit Slot" : "New Delivery Rule"}
//                     </span>
//                   </div>
//                   <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
//                     {editingSlot ? `Edit: ${editingSlot.name}` : "Create Delivery Slot"}
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
//                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-700 hover:to-blue-700 transition cursor-pointer disabled:opacity-50"
//                 >
//                   {saving ? (
//                     <>
//                       <RefreshCw className="w-4 h-4 animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4" />
//                       {editingSlot ? "Update Delivery Slot" : "Publish Delivery Slot"}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* 2-Column Responsive Layout */}
//             <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//               {/* Left Column: Timing & Slot Rules (7 Cols) */}
//               <div className="lg:col-span-7 space-y-6">
//                 <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
//                   <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
//                     <Clock className="w-5 h-5 text-cyan-500" />
//                     <h2 className="text-base font-bold text-foreground">Schedule & Timing Settings</h2>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Slot Display Name <span className="text-rose-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                       placeholder="e.g. Midnight Surprise Delivery (11 PM - 12 AM)"
//                       className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
//                       Delivery Slot Category <span className="text-rose-500">*</span>
//                     </label>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       {SLOT_TYPES.map((st) => {
//                         const Icon = st.icon;
//                         const isSelected = form.type === st.id;
//                         return (
//                           <button
//                             key={st.id}
//                             type="button"
//                             onClick={() => {
//                               let defaultName = form.name;
//                               let defaultRange = form.timeRange;
//                               let defaultCharge = form.extraCharge;
//                               if (st.id === "midnight") {
//                                 defaultRange = "11:00 PM - 11:59 PM";
//                                 if (!form.name || form.name.includes("Delivery")) defaultName = "Midnight Surprise Delivery";
//                                 defaultCharge = 250;
//                               } else if (st.id === "early_morning") {
//                                 defaultRange = "06:00 AM - 09:00 AM";
//                                 if (!form.name || form.name.includes("Delivery")) defaultName = "Early Morning Delivery";
//                                 defaultCharge = 200;
//                               } else if (st.id === "fixed") {
//                                 defaultRange = "Exact 1-Hour Window";
//                                 defaultCharge = 150;
//                               }
//                               setForm({
//                                 ...form,
//                                 type: st.id as any,
//                                 name: defaultName,
//                                 timeRange: defaultRange,
//                                 extraCharge: defaultCharge,
//                               });
//                             }}
//                             className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
//                               isSelected
//                                 ? "bg-cyan-500/10 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30"
//                                 : "bg-background border-border-theme hover:border-slate-400"
//                             }`}
//                           >
//                             <div className={`p-2 rounded-xl shrink-0 ${st.color}`}>
//                               <Icon className="w-5 h-5" />
//                             </div>
//                             <div>
//                               <p className="text-xs font-bold text-foreground">{st.label}</p>
//                               <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{st.desc}</p>
//                             </div>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Customer Facing Time Range Label <span className="text-rose-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={form.timeRange}
//                       onChange={(e) => setForm({ ...form, timeRange: e.target.value })}
//                       placeholder="e.g. 11:00 PM - 11:59 PM"
//                       className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                         Start Time (24h)
//                       </label>
//                       <input
//                         type="time"
//                         value={form.startTime}
//                         onChange={(e) => setForm({ ...form, startTime: e.target.value })}
//                         className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                         End Time (24h)
//                       </label>
//                       <input
//                         type="time"
//                         value={form.endTime}
//                         onChange={(e) => setForm({ ...form, endTime: e.target.value })}
//                         className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Cutoff Notice / Order Lead Time
//                     </label>
//                     <input
//                       type="text"
//                       value={form.cutoffTime}
//                       onChange={(e) => setForm({ ...form, cutoffTime: e.target.value })}
//                       placeholder="e.g. Must order before 8:00 PM for midnight delivery"
//                       className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column: Pricing, Capacity & Live Customer Preview (5 Cols) */}
//               <div className="lg:col-span-5 space-y-6">
//                 <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
//                   <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
//                     <Sliders className="w-5 h-5 text-amber-500" />
//                     <h2 className="text-base font-bold text-foreground">Surcharge & Limits</h2>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Extra Slot Surcharge (₹)
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
//                         ₹
//                       </span>
//                       <input
//                         type="number"
//                         min={0}
//                         value={form.extraCharge}
//                         onChange={(e) => setForm({ ...form, extraCharge: Number(e.target.value) })}
//                         placeholder="0 for free standard slot"
//                         className="w-full pl-8 pr-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-bold text-foreground transition"
//                       />
//                     </div>
//                     <p className="text-[11px] text-slate-500 mt-1.5">
//                       This fee is automatically added to cart total at checkout.
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                         Max Orders/Day
//                       </label>
//                       <input
//                         type="number"
//                         min={1}
//                         value={form.maxOrdersPerDay}
//                         onChange={(e) => setForm({ ...form, maxOrdersPerDay: Number(e.target.value) })}
//                         className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                         Badge Label
//                       </label>
//                       <input
//                         type="text"
//                         value={form.badge}
//                         onChange={(e) => setForm({ ...form, badge: e.target.value })}
//                         placeholder="e.g. Popular"
//                         className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
//                       Slot Image (Optional)
//                     </label>
//                     <div className="relative h-40 w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex items-center justify-center overflow-hidden group">
//                       {form.image ? (
//                         <>
//                           <img
//                             src={form.image}
//                             alt="Delivery slot preview"
//                             className="h-full w-full object-cover"
//                           />
//                           <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
//                             <button
//                               type="button"
//                               onClick={() => setShowMediaModal(true)}
//                               className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900"
//                             >
//                               <ImageIcon className="h-3.5 w-3.5" />
//                               Change Image
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
//                               className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
//                             >
//                               Remove
//                             </button>
//                           </div>
//                         </>
//                       ) : (
//                         <button
//                           type="button"
//                           onClick={() => setShowMediaModal(true)}
//                           className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 transition hover:bg-hover-theme/50"
//                         >
//                           <span className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-600">
//                             <Upload size={24} />
//                           </span>
//                           <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
//                             Select Image from Media
//                           </span>
//                           <span className="text-[11px] text-slate-400">
//                             Browse the library or upload a new image
//                           </span>
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border-theme">
//                     <div>
//                       <p className="text-sm font-bold text-foreground flex items-center gap-2">
//                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
//                         Slot Active
//                       </p>
//                       <p className="text-xs text-slate-500 mt-0.5">Enable slot on checkout screen</p>
//                     </div>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={form.isActive}
//                         onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
//                         className="sr-only peer"
//                       />
//                       <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Live Checkout Selector Simulation */}
//                 <div className="bg-card border border-border-theme rounded-3xl p-6 shadow-xs space-y-4">
//                   <div className="flex items-center justify-between pb-3 border-b border-border-theme">
//                     <div className="flex items-center gap-2">
//                       <Eye className="w-4 h-4 text-cyan-500" />
//                       <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
//                         Customer Checkout Preview
//                       </h3>
//                     </div>
//                     <span className="text-[10px] font-bold text-slate-400">Interactive Simulation</span>
//                   </div>

//                   <div className="p-4 rounded-2xl bg-background border border-cyan-500/30 ring-2 ring-cyan-500/20 shadow-xs flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
//                         {getSlotIcon(form.type || "standard")}
//                       </div>
//                       <div>
//                         <div className="flex items-center gap-2">
//                           <p className="text-xs font-bold text-foreground">
//                             {form.name || "Slot Name Here"}
//                           </p>
//                           {form.badge && (
//                             <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
//                               {form.badge}
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-[11px] text-slate-500 mt-0.5">{form.timeRange}</p>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <span className="text-xs font-black text-foreground">
//                         {form.extraCharge && form.extraCharge > 0 ? `+₹${form.extraCharge}` : "FREE"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </form>
//           </div>
//         ) : (
//           /* ═══════════════════════════════════════════════════════════════════
//               MODE B: MAIN LIST VIEW
//           ═══════════════════════════════════════════════════════════════════ */
//           <div className="space-y-6">
//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
//               <div>
//                 <p className="text-xs uppercase tracking-[0.3em] font-bold text-cyan-500">
//                   Fulfillment Scheduling
//                 </p>
//                 <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
//                   Delivery Slots Configuration
//                 </h1>
//                 <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
//                   Configure midnight delivery, early morning, fixed-hour, and standard delivery windows with custom surcharges
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={loadSlots}
//                   className="p-2.5 rounded-xl border border-border-theme hover:bg-hover-theme text-slate-500 hover:text-foreground transition cursor-pointer"
//                   title="Refresh Slots"
//                 >
//                   <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//                 </button>
//                 <button
//                   onClick={openCreateForm}
//                   className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-700 hover:to-blue-700 transition cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add Delivery Slot
//                 </button>
//               </div>
//             </div>

//             {/* Content Cards Grid */}
//             {loading ? (
//               <div className="flex flex-col items-center justify-center p-16 text-slate-400">
//                 <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
//                 <p className="text-sm font-semibold">Loading delivery slots...</p>
//               </div>
//             ) : slots.length === 0 ? (
//               <div className="text-center py-20 bg-card border border-border-theme rounded-3xl p-8">
//                 <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-4">
//                   <Clock className="w-8 h-8" />
//                 </div>
//                 <h3 className="text-lg font-bold text-foreground">No Delivery Slots Configured</h3>
//                 <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
//                   Set up delivery slots like Midnight Delivery (+₹250) or Standard Free Shipping.
//                 </p>
//                 <button
//                   onClick={openCreateForm}
//                   className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md hover:opacity-95"
//                 >
//                   Create First Slot
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {slots.map((slot) => (
//                   <div
//                     key={slot._id}
//                     className={`bg-card border rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:border-cyan-500/40 ${
//                       slot.isActive ? "border-border-theme" : "border-border-theme/40 opacity-60"
//                     }`}
//                   >
//                     <div>
//                       {slot.image && (
//                         <img
//                           src={slot.image}
//                           alt={slot.name}
//                           className="mb-4 h-36 w-full rounded-2xl object-cover"
//                         />
//                       )}
//                       {/* Card Top Pill & Icon */}
//                       <div className="flex items-start justify-between gap-3 mb-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-3 rounded-2xl bg-background border border-border-theme shadow-xs">
//                             {getSlotIcon(slot.type)}
//                           </div>
//                           <div>
//                             <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500">
//                               {slot.type.replace("_", " ")}
//                             </span>
//                             <h3 className="font-bold text-foreground text-base leading-tight mt-0.5">
//                               {slot.name}
//                             </h3>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-1.5 shrink-0">
//                           <button
//                             type="button"
//                             onClick={async () => {
//                               if (!slot._id) return;
//                               try {
//                                 await updateDeliverySlot(slot._id, { isActive: !slot.isActive });
//                                 setSlots((prev) => prev.map((s) => (s._id === slot._id ? { ...s, isActive: !s.isActive } : s)));
//                                 setMessage({ type: "success", text: `"${slot.name}" set to ${!slot.isActive ? "Active" : "Disabled"}` });
//                                 setTimeout(() => setMessage(null), 2500);
//                               } catch (e) {
//                                 setMessage({ type: "error", text: "Failed to update slot status" });
//                               }
//                             }}
//                             className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border cursor-pointer transition ${
//                               slot.isActive
//                                 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
//                                 : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
//                             }`}
//                             title="Click to toggle status"
//                           >
//                             {slot.isActive ? "Active" : "Disabled"}
//                           </button>
//                           {slot.badge && (
//                             <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
//                               {slot.badge}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Time & Cutoff info */}
//                       <div className="space-y-2.5 py-4 border-y border-border-theme text-xs">
//                         <div className="flex items-center justify-between">
//                           <span className="text-slate-500 font-medium">Time Window:</span>
//                           <span className="font-bold text-foreground">{slot.timeRange}</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <span className="text-slate-500 font-medium">Extra Charge:</span>
//                           <span className="font-black text-rose-500">
//                             {slot.extraCharge > 0 ? `+₹${slot.extraCharge}` : "FREE"}
//                           </span>
//                         </div>
//                         {slot.cutoffTime && (
//                           <div className="flex items-center justify-between">
//                             <span className="text-slate-500 font-medium">Order Cutoff:</span>
//                             <span className="text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[180px]">
//                               {slot.cutoffTime}
//                             </span>
//                           </div>
//                         )}
//                         <div className="flex items-center justify-between">
//                           <span className="text-slate-500 font-medium">Max Daily Orders:</span>
//                           <span className="font-semibold text-slate-600 dark:text-slate-400">
//                             {slot.maxOrdersPerDay || 50} orders
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Bottom Actions */}
//                     <div className="mt-5 pt-3 flex items-center justify-between gap-3">
//                       <button
//                         onClick={() => openEditForm(slot)}
//                         className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme hover:bg-hover-theme text-xs font-bold text-foreground transition cursor-pointer"
//                       >
//                         <Edit3 className="w-3.5 h-3.5 text-blue-500" />
//                         Edit Rules
//                       </button>

//                       {deleteConfirmId === slot._id ? (
//                         <div className="flex items-center gap-1.5">
//                           <button
//                             onClick={() => slot._id && handleDelete(slot._id)}
//                             className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
//                           >
//                             Confirm
//                           </button>
//                           <button
//                             onClick={() => setDeleteConfirmId(null)}
//                             className="px-2 py-2 text-xs font-bold text-slate-400"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => setDeleteConfirmId(slot._id || null)}
//                           className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
//                           title="Delete Slot"
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
//           />
//         )}
//       </AdminMain>
//     </ProtectedRoute>
//   );
// }



"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Moon,
  Sun,
  Zap,
  Sparkles,
  Trash2,
  Edit3,
  DollarSign,
  Save,
  Eye,
  Sliders,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import MediaModal from "../components/ui/MediaModal";
import {
  getAdminDeliverySlots,
  createDeliverySlot,
  updateDeliverySlot,
  deleteDeliverySlot,
  DeliverySlotItem,
} from "../services/giftingService";

const SLOT_TYPES = [
  {
    id: "standard",
    label: "Standard Delivery",
    icon: Sun,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    desc: "Everyday scheduled delivery with zero or minimal fee",
  },
  {
    id: "fixed",
    label: "Fixed Time Slot",
    icon: Clock,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    desc: "Customer selects exact 1-hour window (e.g. 4 PM - 5 PM)",
  },
  {
    id: "midnight",
    label: "Midnight Delivery",
    icon: Moon,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    desc: "11:00 PM - 11:59 PM surprise delivery with premium surcharge",
  },
  {
    id: "early_morning",
    label: "Early Morning Slot",
    icon: Zap,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    desc: "06:00 AM - 09:00 AM early morning birthday surprises",
  },
];

const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/;

const to12h = (hhmm?: string) => {
  if (!hhmm || !HHMM.test(hhmm)) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

/** "09:00" + "21:00" → "9:00 AM - 9:00 PM" (customer-facing label, auto-built) */
const buildRangeLabel = (start?: string, end?: string) =>
  to12h(start) && to12h(end) ? `${to12h(start)} - ${to12h(end)}` : "";

/** Effective "days before" — early-morning slots default to the evening before. */
const effectiveCutoffDays = (type?: string, days?: number | null) =>
  typeof days === "number" ? days : type === "early_morning" ? 1 : 0;

const describeCutoff = (slot: { type?: string; cutoffTime?: string; cutoffDaysBefore?: number | null }) => {
  const raw = (slot.cutoffTime || "").trim();
  if (!raw) return "";
  if (!HHMM.test(raw)) return raw; // legacy free-text value
  const days = effectiveCutoffDays(slot.type, slot.cutoffDaysBefore);
  const when = days === 0 ? "on delivery day" : days === 1 ? "the day before" : `${days} days before`;
  return `${to12h(raw)}, ${when}`;
};

export default function DeliverySlotsPage() {
  const [slots, setSlots] = useState<DeliverySlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DeliverySlotItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  // true once the admin edits the customer label by hand (stop auto-building it)
  const [rangeTouched, setRangeTouched] = useState(false);

  const emptyForm = (sortOrder: number): Partial<DeliverySlotItem> => ({
    name: "",
    type: "standard",
    startTime: "09:00",
    endTime: "21:00",
    timeRange: buildRangeLabel("09:00", "21:00"),
    extraCharge: 0,
    image: "",
    cutoffTime: "",
    cutoffDaysBefore: null,
    badge: "",
    maxOrdersPerDay: 50,
    isActive: true,
    sortOrder,
  });

  // Form state
  const [form, setForm] = useState<Partial<DeliverySlotItem>>(emptyForm(1));

  const setWindow = (patch: { startTime?: string; endTime?: string }) =>
    setForm((prev) => {
      const next = { ...prev, ...patch };
      return rangeTouched ? next : { ...next, timeRange: buildRangeLabel(next.startTime, next.endTime) };
    });

  const loadSlots = async () => {
    try {
      setLoading(true);
      const data = await getAdminDeliverySlots();
      setSlots(data);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load delivery slots from server" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const openCreateForm = () => {
    setEditingSlot(null);
    setRangeTouched(false);
    setForm(emptyForm(slots.length + 1));
    setShowForm(true);
  };

  const openEditForm = (slot: DeliverySlotItem) => {
    setEditingSlot(slot);
    setForm({
      name: slot.name,
      type: slot.type,
      timeRange: slot.timeRange,
      startTime: slot.startTime,
      endTime: slot.endTime,
      extraCharge: slot.extraCharge,
      image: slot.image || "",
      cutoffTime: slot.cutoffTime || "",
      cutoffDaysBefore: typeof slot.cutoffDaysBefore === "number" ? slot.cutoffDaysBefore : null,
      badge: slot.badge || "",
      maxOrdersPerDay: typeof slot.maxOrdersPerDay === "number" ? slot.maxOrdersPerDay : 50,
      isActive: slot.isActive,
      sortOrder: slot.sortOrder || 1,
    });
    setRangeTouched(true); // keep the label the admin already has
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setMessage({ type: "error", text: "Please enter a slot name." });
      return;
    }
    if (!form.timeRange?.trim()) {
      setMessage({ type: "error", text: "Please specify a time range description." });
      return;
    }

    if (form.startTime && form.endTime && form.startTime === form.endTime) {
      setMessage({ type: "error", text: "Start and end time can't be the same." });
      return;
    }
    if (form.cutoffTime?.trim() && !HHMM.test(form.cutoffTime.trim())) {
      setMessage({ type: "error", text: "Please pick the booking cutoff using the time field." });
      return;
    }

    try {
      setSaving(true);
      if (editingSlot?._id) {
        await updateDeliverySlot(editingSlot._id, form);
        setMessage({ type: "success", text: `"${form.name}" updated successfully!` });
      } else {
        await createDeliverySlot(form);
        setMessage({ type: "success", text: `"${form.name}" created successfully!` });
      }
      setShowForm(false);
      setEditingSlot(null);
      await loadSlots();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Failed to save delivery slot",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeliverySlot(id);
      setSlots((prev) => prev.filter((s) => s._id !== id));
      setDeleteConfirmId(null);
      setMessage({ type: "success", text: "Delivery slot removed." });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: "Failed to delete slot" });
    }
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case "midnight":
        return <Moon className="w-5 h-5 text-purple-400" />;
      case "early_morning":
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case "fixed":
        return <Clock className="w-5 h-5 text-amber-400" />;
      default:
        return <Sun className="w-5 h-5 text-blue-400" />;
    }
  };

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
                  title="Back to Slots"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-foreground transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      {editingSlot ? "Edit Slot" : "New Delivery Rule"}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                    {editingSlot ? `Edit: ${editingSlot.name}` : "Create Delivery Slot"}
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-700 hover:to-blue-700 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingSlot ? "Update Delivery Slot" : "Publish Delivery Slot"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Timing & Slot Rules (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
                    <Clock className="w-5 h-5 text-cyan-500" />
                    <h2 className="text-base font-bold text-foreground">Schedule & Timing Settings</h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Slot Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Midnight Surprise Delivery (11 PM - 12 AM)"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      Delivery Slot Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SLOT_TYPES.map((st) => {
                        const Icon = st.icon;
                        const isSelected = form.type === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              // Only the time window is suggested — names and prices stay yours.
                              const windows: Record<string, { startTime: string; endTime: string }> = {
                                midnight: { startTime: "23:00", endTime: "23:59" },
                                early_morning: { startTime: "07:00", endTime: "09:00" },
                              };
                              const w = windows[st.id];
                              setForm((prev) => {
                                const next = { ...prev, type: st.id as any, ...(w || {}) };
                                return rangeTouched
                                  ? next
                                  : { ...next, timeRange: buildRangeLabel(next.startTime, next.endTime) };
                              });
                            }}
                            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${isSelected
                                ? "bg-cyan-500/10 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30"
                                : "bg-background border-border-theme hover:border-slate-400"
                              }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${st.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">{st.label}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{st.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Customer Facing Time Range Label <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.timeRange}
                      onChange={(e) => {
                        setRangeTouched(true);
                        setForm({ ...form, timeRange: e.target.value });
                      }}
                      placeholder="e.g. 11:00 PM - 11:59 PM"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Start Time (24h)
                      </label>
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={(e) => setWindow({ startTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        End Time (24h)
                      </label>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={(e) => setWindow({ endTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border-theme bg-background/60 p-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Booking Cutoff
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        After this time customers can no longer book this slot for that delivery date — the
                        website and apps disable it automatically (India time).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          Last booking time
                        </label>
                        <input
                          type="time"
                          value={HHMM.test((form.cutoffTime || "").trim()) ? (form.cutoffTime || "").trim() : ""}
                          onChange={(e) => setForm({ ...form, cutoffTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                          Counted from
                        </label>
                        <select
                          value={form.cutoffDaysBefore === null || form.cutoffDaysBefore === undefined ? "" : String(form.cutoffDaysBefore)}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              cutoffDaysBefore: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition cursor-pointer"
                        >
                          <option value="">Automatic (evening before for Early Morning, else same day)</option>
                          <option value="0">Same day as delivery</option>
                          <option value="1">The day before delivery</option>
                          <option value="2">2 days before delivery</option>
                          <option value="3">3 days before delivery</option>
                        </select>
                      </div>
                    </div>

                    {HHMM.test((form.cutoffTime || "").trim()) ? (
                      <p className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                        Customers must book by {describeCutoff(form)}.
                      </p>
                    ) : (form.cutoffTime || "").trim() ? (
                      <p className="text-[11px] font-semibold text-amber-600">
                        This slot still has an old text cutoff (“{form.cutoffTime}”). It is applied as written —
                        pick a time above to replace it.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        No cutoff — the slot stays bookable until its delivery window ends.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing, Capacity & Live Customer Preview (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border-theme">
                    <Sliders className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-bold text-foreground">Surcharge & Limits</h2>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Extra Slot Surcharge (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={form.extraCharge}
                        onChange={(e) => setForm({ ...form, extraCharge: Number(e.target.value) })}
                        placeholder="0 for free standard slot"
                        className="w-full pl-8 pr-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-bold text-foreground transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      This fee is automatically added to cart total at checkout.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Max Orders/Day <span className="normal-case font-medium text-slate-400">(0 = no limit)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.maxOrdersPerDay}
                        onChange={(e) => setForm({ ...form, maxOrdersPerDay: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={form.badge}
                        onChange={(e) => setForm({ ...form, badge: e.target.value })}
                        placeholder="e.g. Popular"
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border-theme focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-medium text-foreground transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Slot Image (Optional)
                    </label>
                    <div className="relative h-40 w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex items-center justify-center overflow-hidden group">
                      {form.image ? (
                        <>
                          <img
                            src={form.image}
                            alt="Delivery slot preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => setShowMediaModal(true)}
                              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900"
                            >
                              <ImageIcon className="h-3.5 w-3.5" />
                              Change Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowMediaModal(true)}
                          className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 transition hover:bg-hover-theme/50"
                        >
                          <span className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-600">
                            <Upload size={24} />
                          </span>
                          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            Select Image from Media
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Browse the library or upload a new image
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border-theme">
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Slot Active
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Enable slot on checkout screen</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>

                {/* Live Checkout Selector Simulation */}
                <div className="bg-card border border-border-theme rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-theme">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Customer Checkout Preview
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Interactive Simulation</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-background border border-cyan-500/30 ring-2 ring-cyan-500/20 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                        {getSlotIcon(form.type || "standard")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">
                            {form.name || "Slot Name Here"}
                          </p>
                          {form.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              {form.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{form.timeRange}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-foreground">
                        {form.extraCharge && form.extraCharge > 0 ? `+₹${form.extraCharge}` : "FREE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
              MODE B: MAIN LIST VIEW
          ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-theme">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-cyan-500">
                  Fulfillment Scheduling
                </p>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
                  Delivery Slots Configuration
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Configure midnight delivery, early morning, fixed-hour, and standard delivery windows with custom surcharges
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadSlots}
                  className="p-2.5 rounded-xl border border-border-theme hover:bg-hover-theme text-slate-500 hover:text-foreground transition cursor-pointer"
                  title="Refresh Slots"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-700 hover:to-blue-700 transition cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  Add Delivery Slot
                </button>
              </div>
            </div>

            {/* Content Cards Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mb-3" />
                <p className="text-sm font-semibold">Loading delivery slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border-theme rounded-3xl p-8">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No Delivery Slots Configured</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  No slots exist yet, so customers see no delivery time choice at checkout. Add your first slot to get started.
                </p>
                <button
                  onClick={openCreateForm}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-md hover:opacity-95"
                >
                  Create First Slot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {slots.map((slot) => (
                  <div
                    key={slot._id}
                    className={`bg-card border rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between hover:shadow-lg hover:border-cyan-500/40 ${slot.isActive ? "border-border-theme" : "border-border-theme/40 opacity-60"
                      }`}
                  >
                    <div>
                      {slot.image && (
                        <img
                          src={slot.image}
                          alt={slot.name}
                          className="mb-4 h-36 w-full rounded-2xl object-cover"
                        />
                      )}
                      {/* Card Top Pill & Icon */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-background border border-border-theme shadow-xs">
                            {getSlotIcon(slot.type)}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500">
                              {slot.type.replace("_", " ")}
                            </span>
                            <h3 className="font-bold text-foreground text-base leading-tight mt-0.5">
                              {slot.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!slot._id) return;
                              try {
                                await updateDeliverySlot(slot._id, { isActive: !slot.isActive });
                                setSlots((prev) => prev.map((s) => (s._id === slot._id ? { ...s, isActive: !s.isActive } : s)));
                                setMessage({ type: "success", text: `"${slot.name}" set to ${!slot.isActive ? "Active" : "Disabled"}` });
                                setTimeout(() => setMessage(null), 2500);
                              } catch (e) {
                                setMessage({ type: "error", text: "Failed to update slot status" });
                              }
                            }}
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border cursor-pointer transition ${slot.isActive
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                              }`}
                            title="Click to toggle status"
                          >
                            {slot.isActive ? "Active" : "Disabled"}
                          </button>
                          {slot.badge && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                              {slot.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time & Cutoff info */}
                      <div className="space-y-2.5 py-4 border-y border-border-theme text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Time Window:</span>
                          <span className="font-bold text-foreground">{slot.timeRange}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Extra Charge:</span>
                          <span className="font-black text-rose-500">
                            {slot.extraCharge > 0 ? `+₹${slot.extraCharge}` : "FREE"}
                          </span>
                        </div>
                        {describeCutoff(slot) && (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500 font-medium shrink-0">Order Cutoff:</span>
                            <span className="text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[200px]" title={describeCutoff(slot)}>
                              {describeCutoff(slot)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Max Daily Orders:</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            {slot.maxOrdersPerDay ? `${slot.maxOrdersPerDay} orders` : "Unlimited"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 flex items-center justify-between gap-3">
                      <button
                        onClick={() => openEditForm(slot)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-theme hover:bg-hover-theme text-xs font-bold text-foreground transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        Edit Rules
                      </button>

                      {deleteConfirmId === slot._id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => slot._id && handleDelete(slot._id)}
                            className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-2 text-xs font-bold text-slate-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(slot._id || null)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete Slot"
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
          />
        )}
      </AdminMain>
    </ProtectedRoute>
  );
}
