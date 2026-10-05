// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Truck,
//   Bike,
//   UserCheck,
//   MapPin,
//   Phone,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Plus,
//   Send,
//   Navigation,
//   ShieldCheck,
//   Star,
//   Search,
// } from "lucide-react";
// import { useToast } from "../../../context/ToastContext";

// interface Rider {
//   id: string;
//   name: string;
//   phone: string;
//   vehicle: "Motorcycle" | "Electric Scooter" | "Delivery Van";
//   vehicleNumber: string;
//   status: "Available" | "En Route" | "Offline";
//   rating: number;
//   assignedOrders: number;
//   currentZone: string;
// }

// interface DispatchOrder {
//   id: string;
//   orderNumber: string;
//   customerName: string;
//   customerPhone: string;
//   address: string;
//   pincode: string;
//   deliverySlot: string;
//   items: string;
//   totalAmount: number;
//   assignedRiderId?: string;
//   status: "Waiting Assignment" | "Assigned" | "Out for Delivery" | "Delivered";
// }

// const INITIAL_RIDERS: Rider[] = [
//   {
//     id: "rider-1",
//     name: "Amit Kumar",
//     phone: "9818012345",
//     vehicle: "Motorcycle",
//     vehicleNumber: "HR-51-AB-1234",
//     status: "Available",
//     rating: 4.9,
//     assignedOrders: 0,
//     currentZone: "Sector 14 - 17, Faridabad",
//   },

//   {
//     id: "rider-2",
//     name: "Rajesh Singh",
//     phone: "9871123456",
//     vehicle: "Electric Scooter",
//     vehicleNumber: "HR-51-EF-5678",
//     status: "En Route",
//     rating: 4.8,
//     assignedOrders: 2,
//     currentZone: "NIT 1 - 5, Faridabad",
//   },
//   {
//     id: "rider-3",
//     name: "Sandeep Rawat",
//     phone: "9910987654",
//     vehicle: "Motorcycle",
//     vehicleNumber: "HR-51-KL-9012",
//     status: "Available",
//     rating: 5.0,
//     assignedOrders: 0,
//     currentZone: "Sector 21 - 28, Faridabad",
//   },
//   {
//     id: "rider-4",
//     name: "Mohit Chauhan",
//     phone: "9811567890",
//     vehicle: "Delivery Van",
//     vehicleNumber: "HR-51-CD-3456",
//     status: "Offline",
//     rating: 4.7,
//     assignedOrders: 0,
//     currentZone: "Greater Faridabad (Neharpar)",
//   },
// ];

// const INITIAL_ORDERS: DispatchOrder[] = [
//   {
//     id: "ord-1",
//     orderNumber: "ORD-9842",
//     customerName: "Kavita Rao",
//     customerPhone: "9818123400",
//     address: "House 245, Sector 15-A, Near Market",
//     pincode: "121007",
//     deliverySlot: "Midnight 11:30 PM - 12:30 AM",
//     items: "1x Belgian Chocolate Truffle (1Kg) + Sparklers",
//     totalAmount: 949,
//     status: "Waiting Assignment",
//   },
//   {
//     id: "ord-2",
//     orderNumber: "ORD-9840",
//     customerName: "Gaurav Malhotra",
//     customerPhone: "9910543200",
//     address: "Flat 402, Royal Palms, Sector 21C",
//     pincode: "121001",
//     deliverySlot: "Standard 8:00 PM - 9:00 PM",
//     items: "1x Red Velvet Heart Cake (500g) + 10 Red Roses",
//     totalAmount: 1199,
//     assignedRiderId: "rider-2",
//     status: "Out for Delivery",
//   },
//   {
//     id: "ord-3",
//     orderNumber: "ORD-9838",
//     customerName: "Pooja Verma",
//     customerPhone: "9871098700",
//     address: "Plot 89, Greenfields Colony, Faridabad",
//     pincode: "121003",
//     deliverySlot: "Standard 7:00 PM - 8:00 PM",
//     items: "1x Fresh Pineapple Blossom Cake (1Kg)",
//     totalAmount: 649,
//     assignedRiderId: "rider-2",
//     status: "Delivered",
//   },
// ];

// import { deliveryFleetService } from "../../services/deliveryFleetService";
// import { getAllOrders } from "../../services/adminService";

// export default function DeliveryFleetView() {
//   const { showToast } = useToast();
//   const [riders, setRiders] = useState<any[]>(INITIAL_RIDERS);
//   const [orders, setOrders] = useState<any[]>(INITIAL_ORDERS);
//   const [showAddRiderModal, setShowAddRiderModal] = useState(false);
//   const [newRiderName, setNewRiderName] = useState("");
//   const [newRiderPhone, setNewRiderPhone] = useState("");
//   const [newRiderVehicle, setNewRiderVehicle] = useState<any>("Motorcycle");
//   const [newRiderPlate, setNewRiderPlate] = useState("");
//   const [newRiderZone, setNewRiderZone] = useState("Sector 15, Faridabad");

//   useEffect(() => {
//     let isMounted = true;
//     async function loadData() {
//       try {
//         const [liveRiders, ordersRes] = await Promise.allSettled([
//           deliveryFleetService.getRiders(),
//           getAllOrders({ page: 1, limit: 15 }),
//         ]);

//         if (isMounted && liveRiders.status === "fulfilled" && liveRiders.value && liveRiders.value.length > 0) {
//           setRiders(
//             liveRiders.value.map((r: any) => ({
//               id: r._id || r.id,
//               name: r.name,
//               phone: r.phone,
//               vehicle: r.vehicle || "Motorcycle",
//               vehicleNumber: r.vehicleNumber || "HR-51-AB-1234",
//               status: r.status || "Available",
//               rating: r.rating || 5.0,
//               assignedOrders: r.activeOrders || 0,
//               currentZone: r.currentZone || "Sector 15, Faridabad",
//             }))
//           );
//         }

//         if (isMounted && ordersRes.status === "fulfilled" && ordersRes.value?.orders && ordersRes.value.orders.length > 0) {
//           const liveOrders = ordersRes.value.orders.map((o: any) => ({
//             id: o._id,
//             orderNumber: `ORD-${o._id.slice(-6).toUpperCase()}`,
//             customerName: o.user?.name || o.shippingAddress?.fullName || "Customer",
//             customerPhone: o.user?.mobileNumber || o.shippingAddress?.phone || "8400787712",
//             address: o.shippingAddress?.streetAddress || o.shippingAddress?.address || "Faridabad Urban Area",
//             pincode: o.shippingAddress?.postalCode || "121001",
//             deliverySlot: o.deliverySlot?.name || "Standard Delivery Slot",
//             items: (o.items || []).map((it: any) => `${it.quantity || 1}x ${it.name}`).join(", ") || "Celebration Cake",
//             totalAmount: o.totalAmount || 0,
//             assignedRiderId: o.assignedRider || undefined,
//             status: o.status === "Delivered" ? "Delivered" : o.assignedRider ? "Assigned" : "Waiting Assignment",
//           }));
//           setOrders(liveOrders);
//         }
//       } catch (e) {
//         console.error("Live fleet data fetch error:", e);
//       }
//     }
//     loadData();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const activeRidersCount = riders.filter((r) => r.status !== "Offline").length;
//   const inTransitCount = orders.filter((o) => o.status === "Out for Delivery" || o.status === "Assigned").length;
//   const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

//   const handleAssignRider = async (orderId: string, riderId: string) => {
//     const rider = riders.find((r) => r.id === riderId);
//     if (!rider) return;

//     setOrders((prev) =>
//       prev.map((o) =>
//         o.id === orderId
//           ? { ...o, assignedRiderId: riderId, status: "Assigned" }
//           : o
//       )
//     );

//     setRiders((prev) =>
//       prev.map((r) =>
//         r.id === riderId
//           ? { ...r, assignedOrders: (r.assignedOrders || 0) + 1, status: "En Route" }
//           : r
//       )
//     );

//     try {
//       await deliveryFleetService.assignRider(orderId, riderId);
//     } catch (_) {}

//     showToast(`Order assigned to ${rider.name}`, "success");
//   };

//   const handleDispatchWhatsApp = (order: DispatchOrder) => {
//     const rider = riders.find((r) => r.id === order.assignedRiderId);
//     if (!rider) {
//       showToast("Please assign a rider before dispatching!", "warning");
//       return;
//     }

//     const message = encodeURIComponent(
//       `🛵 *NEW DISPATCH ASSIGNMENT - GiftFestive*\n\n` +
//       `📦 *Order ID:* ${order.orderNumber}\n` +
//       `⏰ *Delivery Slot:* ${order.deliverySlot}\n` +
//       `👤 *Customer:* ${order.customerName} (+91 ${order.customerPhone})\n` +
//       `📍 *Address:* ${order.address}, Faridabad (${order.pincode})\n` +
//       `🎂 *Items:* ${order.items}\n` +
//       `💵 *Total Amount:* ₹${order.totalAmount} (Prepaid)\n\n` +
//       `Navigate on Google Maps: https://maps.google.com/?q=${encodeURIComponent(order.address + ", Faridabad")}\n\n` +
//       `Please ensure cake remains upright during transport!`
//     );

//     const waUrl = `https://wa.me/91${rider.phone}?text=${message}`;
//     window.open(waUrl, "_blank");

//     setOrders((prev) =>
//       prev.map((o) =>
//         o.id === order.id ? { ...o, status: "Out for Delivery" } : o
//       )
//     );

//     showToast(`Dispatch details sent to ${rider.name} on WhatsApp!`, "success");
//   };

//   const handleUpdateStatus = (orderId: string, status: DispatchOrder["status"]) => {
//     setOrders((prev) =>
//       prev.map((o) => (o.id === orderId ? { ...o, status } : o))
//     );
//     showToast(`Order status updated to ${status}`, "info");
//   };

//   const handleCreateRider = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newRiderName || !newRiderPhone) {
//       showToast("Please provide rider name and contact number", "error");
//       return;
//     }

//     try {
//       const created = await deliveryFleetService.createRider({
//         name: newRiderName,
//         phone: newRiderPhone,
//         vehicle: newRiderVehicle,
//         vehicleNumber: newRiderPlate || "HR-51-XX-0000",
//         currentZone: newRiderZone,
//       });

//       const newEntry = created || {
//         id: "rider-" + Date.now(),
//         name: newRiderName,
//         phone: newRiderPhone,
//         vehicle: newRiderVehicle,
//         vehicleNumber: newRiderPlate || "HR-51-XX-0000",
//         status: "Available",
//         rating: 5.0,
//         assignedOrders: 0,
//         currentZone: newRiderZone,
//       };

//       setRiders((prev) => [newEntry, ...prev]);
//       setShowAddRiderModal(false);
//       setNewRiderName("");
//       setNewRiderPhone("");
//       setNewRiderPlate("");
//       showToast(`Rider ${newRiderName} added to delivery fleet!`, "success");
//     } catch (err: any) {
//       showToast(err?.message || "Failed to add rider", "error");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
//               <Truck className="h-4 w-4" />
//             </span>
//             <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
//               Delivery Fleet & Logistics Management
//             </h1>
//           </div>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Real-time delivery fleet monitoring, rider assignment, and 1-click WhatsApp dispatch coordinates.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setShowAddRiderModal(true)}
//           className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition"
//         >
//           <Plus className="h-4 w-4" />
//           <span>Add Delivery Rider</span>
//         </button>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
//           <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Riders On Duty</span>
//           <p className="text-2xl font-black text-foreground mt-1">{activeRidersCount} Active</p>
//           <span className="text-[10px] text-emerald-500 font-semibold">● Faridabad Metro Zone</span>
//         </div>

//         <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
//           <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Orders In Transit</span>
//           <p className="text-2xl font-black text-pink-500 mt-1">{inTransitCount} En Route</p>
//           <span className="text-[10px] text-pink-500">Live GPS tracking active</span>
//         </div>

//         <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
//           <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered Today</span>
//           <p className="text-2xl font-black text-emerald-500 mt-1">{deliveredCount} Orders</p>
//           <span className="text-[10px] text-emerald-500 font-semibold">100% On-Time Delivery</span>
//         </div>

//         <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
//           <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Delivery Speed</span>
//           <p className="text-2xl font-black text-foreground mt-1">32 Mins</p>
//           <span className="text-[10px] text-slate-400">Midnight express benchmark</span>
//         </div>
//       </div>

//       {/* Two Column Layout: Active Riders on Left, Dispatch Pipeline on Right */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Active Riders Grid (5 Cols) */}
//         <div className="lg:col-span-5 space-y-4">
//           <div className="rounded-3xl border border-border-theme bg-card p-5 shadow-sm space-y-4">
//             <div className="flex items-center justify-between pb-3 border-b border-border-theme">
//               <h3 className="text-base font-bold text-foreground flex items-center gap-2">
//                 <Bike className="h-4 w-4 text-pink-500" />
//                 Fleet Riders Directory
//               </h3>
//               <span className="text-xs text-slate-400">{riders.length} Registered</span>
//             </div>

//             <div className="space-y-3">
//               {riders.map((rider) => (
//                 <div
//                   key={rider.id}
//                   className="rounded-2xl border border-border-theme bg-background p-3.5 space-y-2 hover:border-pink-500/40 transition"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2.5">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 font-black text-xs">
//                         {rider.name[0]}
//                       </div>
//                       <div>
//                         <p className="font-bold text-xs text-foreground">{rider.name}</p>
//                         <p className="text-[10px] text-slate-400 flex items-center gap-1">
//                           <Phone className="h-2.5 w-2.5" />
//                           +91 {rider.phone}
//                         </p>
//                       </div>
//                     </div>

//                     <span
//                       className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
//                         rider.status === "Available"
//                           ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
//                           : rider.status === "En Route"
//                           ? "bg-pink-500/10 text-pink-500 border border-pink-500/20"
//                           : "bg-slate-200 dark:bg-slate-800 text-slate-400"
//                       }`}
//                     >
//                       ● {rider.status}
//                     </span>
//                   </div>

//                   <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-border-theme/40">
//                     <div className="flex items-center gap-1">
//                       <Truck className="h-3 w-3 text-slate-400" />
//                       <span>{rider.vehicle} ({rider.vehicleNumber})</span>
//                     </div>

//                     <div className="flex items-center gap-1 text-amber-500 font-bold">
//                       <Star className="h-3 w-3 fill-current" />
//                       <span>{rider.rating}</span>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-[10px] text-slate-400">
//                     <span className="truncate max-w-[200px]">📍 {rider.currentZone}</span>
//                     <span className="font-bold text-pink-500">{rider.assignedOrders} Active Orders</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Live Dispatch Order Board (7 Cols) */}
//         <div className="lg:col-span-7 space-y-4">
//           <div className="rounded-3xl border border-border-theme bg-card p-5 shadow-sm space-y-4">
//             <div className="flex items-center justify-between pb-3 border-b border-border-theme">
//               <h3 className="text-base font-bold text-foreground flex items-center gap-2">
//                 <Navigation className="h-4 w-4 text-pink-500" />
//                 Live Dispatch Pipeline
//               </h3>
//               <span className="text-xs text-slate-400">{orders.length} Deliveries Tracked</span>
//             </div>

//             <div className="space-y-3">
//               {orders.map((order) => {
//                 const isMidnight = order.deliverySlot.toLowerCase().includes("midnight");
//                 const assignedRider = riders.find((r) => r.id === order.assignedRiderId);

//                 return (
//                   <div
//                     key={order.id}
//                     className={`rounded-2xl border p-4 space-y-3 transition ${
//                       isMidnight
//                         ? "border-purple-500/40 bg-purple-500/5 shadow-xs"
//                         : "border-border-theme bg-background"
//                     }`}
//                   >
//                     {/* Top Row: Order ID, Slot & Status */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="font-mono font-black text-xs text-foreground">
//                           {order.orderNumber}
//                         </span>
//                         {isMidnight && (
//                           <span className="rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
//                             🌙 Midnight Priority
//                           </span>
//                         )}
//                       </div>

//                       <span
//                         className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
//                           order.status === "Delivered"
//                             ? "bg-emerald-500/10 text-emerald-500"
//                             : order.status === "Out for Delivery"
//                             ? "bg-pink-500/10 text-pink-500 animate-pulse"
//                             : order.status === "Assigned"
//                             ? "bg-blue-500/10 text-blue-500"
//                             : "bg-amber-500/10 text-amber-500"
//                         }`}
//                       >
//                         {order.status}
//                       </span>
//                     </div>

//                     {/* Customer & Address Details */}
//                     <div>
//                       <p className="text-xs font-bold text-foreground">
//                         {order.customerName} <span className="text-slate-400">(+91 {order.customerPhone})</span>
//                       </p>
//                       <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
//                         <MapPin className="h-3 w-3 text-pink-500 shrink-0" />
//                         {order.address}, Faridabad ({order.pincode})
//                       </p>
//                       <p className="text-[11px] text-slate-400 mt-1 font-medium">
//                         🎂 {order.items} • <span className="font-bold text-foreground">₹{order.totalAmount}</span>
//                       </p>
//                     </div>

//                     {/* Rider Assignment & Action Bar */}
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border-theme/40">
//                       {/* Rider Dropdown */}
//                       <div className="flex items-center gap-2">
//                         <span className="text-[10px] font-bold text-slate-400">Rider:</span>
//                         <select
//                           value={order.assignedRiderId || ""}
//                           onChange={(e) => handleAssignRider(order.id, e.target.value)}
//                           className="rounded-xl border border-border-theme bg-card px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none"
//                         >
//                           <option value="">Select Rider...</option>
//                           {riders.map((r) => (
//                             <option key={r.id} value={r.id}>
//                               {r.name} ({r.status})
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="flex items-center gap-1.5">
//                         {order.status !== "Delivered" && (
//                           <>
//                             <button
//                               type="button"
//                               onClick={() => handleDispatchWhatsApp(order)}
//                               className="flex items-center gap-1 rounded-xl bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs hover:bg-emerald-600 active:scale-95 transition"
//                               title="Send address & order details to rider on WhatsApp"
//                             >
//                               <Send className="h-3 w-3" />
//                               <span>Dispatch WA</span>
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() => handleUpdateStatus(order.id, "Delivered")}
//                               className="flex items-center gap-1 rounded-xl bg-pink-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs hover:bg-pink-600 active:scale-95 transition"
//                             >
//                               <CheckCircle2 className="h-3 w-3" />
//                               <span>Mark Delivered</span>
//                             </button>
//                           </>
//                         )}

//                         {order.status === "Delivered" && (
//                           <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
//                             <CheckCircle2 className="h-3.5 w-3.5" />
//                             Completed
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add Rider Modal */}
//       {showAddRiderModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
//           <div className="w-full max-w-md rounded-3xl border border-border-theme bg-card p-6 shadow-2xl space-y-4">
//             <div className="flex items-center justify-between pb-3 border-b border-border-theme">
//               <h3 className="text-base font-bold text-foreground flex items-center gap-2">
//                 <Bike className="h-4 w-4 text-pink-500" />
//                 Register New Fleet Rider
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => setShowAddRiderModal(false)}
//                 className="text-slate-400 hover:text-foreground text-sm font-bold"
//               >
//                 ✕
//               </button>
//             </div>

//             <form onSubmit={handleCreateRider} className="space-y-3">
//               <div>
//                 <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Rider Full Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={newRiderName}
//                   onChange={(e) => setNewRiderName(e.target.value)}
//                   placeholder="e.g. Vikas Sharma"
//                   className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
//                 />
//               </div>

//               <div>
//                 <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Mobile Number (WhatsApp)</label>
//                 <input
//                   type="tel"
//                   required
//                   value={newRiderPhone}
//                   onChange={(e) => setNewRiderPhone(e.target.value)}
//                   placeholder="e.g. 9818000000"
//                   className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Vehicle Type</label>
//                   <select
//                     value={newRiderVehicle}
//                     onChange={(e) => setNewRiderVehicle(e.target.value as any)}
//                     className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
//                   >
//                     <option value="Motorcycle">Motorcycle</option>
//                     <option value="Electric Scooter">Electric Scooter</option>
//                     <option value="Delivery Van">Delivery Van</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Plate Number</label>
//                   <input
//                     type="text"
//                     value={newRiderPlate}
//                     onChange={(e) => setNewRiderPlate(e.target.value.toUpperCase())}
//                     placeholder="HR-51-AB-1234"
//                     className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Primary Faridabad Zone</label>
//                 <input
//                   type="text"
//                   value={newRiderZone}
//                   onChange={(e) => setNewRiderZone(e.target.value)}
//                   className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
//                 />
//               </div>

//               <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddRiderModal(false)}
//                   className="rounded-xl border border-border-theme bg-background px-4 py-2 text-xs font-bold text-slate-500 hover:bg-hover-theme"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600 shadow-xs"
//                 >
//                   Register Rider
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Truck,
  Bike,
  UserCheck,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Navigation,
  ShieldCheck,
  Star,
  Search,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";

type RiderStatus = "Available" | "En Route" | "Offline";
type DispatchStatus = "Waiting Assignment" | "Assigned" | "Out for Delivery" | "Delivered";

interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  status: RiderStatus;
  rating: number;
  assignedOrders: number;
  totalDelivered: number;
  currentZone: string;
}

interface DispatchOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  pincode: string;
  deliverySlot: string;
  items: string;
  totalAmount: number;
  isCod: boolean;
  assignedRiderId?: string;
  status: DispatchStatus;
}

import { deliveryFleetService } from "../../services/deliveryFleetService";

const mapRider = (r: any): Rider => ({
  id: String(r._id || r.id),
  name: r.name,
  phone: r.phone,
  vehicle: r.vehicle || "Motorcycle",
  vehicleNumber: r.vehicleNumber || "",
  status: (r.status as RiderStatus) || "Available",
  rating: r.rating ?? 5,
  assignedOrders: r.activeOrders || 0,
  totalDelivered: r.totalDeliveriesCompleted || 0,
  currentZone: r.currentZone || "",
});

const mapOrder = (o: any): DispatchOrder => {
  const a = o.shippingAddress || {};
  const address = [a.houseNo, a.street, a.landmark].filter(Boolean).join(", ") || a.address || "Address not available";
  const riderId = o.assignedRider ? String(o.assignedRider?._id || o.assignedRider) : undefined;
  let status: DispatchStatus = "Waiting Assignment";
  if (o.status === "Delivered") status = "Delivered";
  else if (o.status === "Out for Delivery" || o.status === "Shipping") status = "Out for Delivery";
  else if (riderId) status = "Assigned";

  return {
    id: String(o._id),
    orderNumber: `ORD-${String(o._id).slice(-6).toUpperCase()}`,
    customerName: a.fullName || o.user?.name || "Customer",
    customerPhone: a.phone || o.user?.mobileNumber || "",
    address,
    pincode: a.pinCode || "",
    deliverySlot: [o.deliverySlot?.slotName, o.deliverySlot?.timeRange, o.deliverySlot?.deliveryDate].filter(Boolean).join(" • ") || "Standard Delivery",
    items: (o.items || []).map((it: any) => `${it.quantity || 1}x ${it.name}`).join(", ") || "Order items",
    totalAmount: o.totalAmount || 0,
    isCod: o.paymentMethod === "COD",
    assignedRiderId: riderId,
    status,
  };
};

const ORDER_FILTERS: Array<"All" | DispatchStatus> = ["All", "Waiting Assignment", "Assigned", "Out for Delivery", "Delivered"];

export default function DeliveryFleetView() {
  const { showToast } = useToast();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<"All" | DispatchStatus>("All");
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [newRiderName, setNewRiderName] = useState("");
  const [newRiderPhone, setNewRiderPhone] = useState("");
  const [newRiderVehicle, setNewRiderVehicle] = useState<string>("Motorcycle");
  const [newRiderPlate, setNewRiderPlate] = useState("");
  const [newRiderZone, setNewRiderZone] = useState("Sector 15, Faridabad");

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [liveRiders, liveOrders] = await Promise.all([
        deliveryFleetService.getRiders(),
        deliveryFleetService.getDispatchOrders(),
      ]);
      setRiders(liveRiders.map(mapRider));
      setOrders(liveOrders.map(mapOrder));
      setLoadError("");
    } catch (e: any) {
      setLoadError(e?.message || "Data load nahi ho paaya");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const t = setInterval(() => loadData(true), 30000);
    return () => clearInterval(t);
  }, [loadData]);

  const activeRidersCount = riders.filter((r) => r.status !== "Offline").length;
  const availableCount = riders.filter((r) => r.status === "Available").length;
  const inTransitCount = orders.filter((o) => o.status === "Out for Delivery" || o.status === "Assigned").length;
  const waitingCount = orders.filter((o) => o.status === "Waiting Assignment").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const visibleOrders = orders.filter((o) => orderFilter === "All" || o.status === orderFilter);

  const runAction = async (id: string, fn: () => Promise<any>, okMsg: string) => {
    setBusyId(id);
    try {
      await fn();
      showToast(okMsg, "success");
      await loadData(true);
    } catch (err: any) {
      showToast(err?.message || "Action fail ho gaya", "error");
      await loadData(true);
    } finally {
      setBusyId(null);
    }
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    if (!riderId) {
      return runAction(orderId, () => deliveryFleetService.unassignRider(orderId), "Rider hata diya gaya");
    }
    const rider = riders.find((r) => r.id === riderId);
    return runAction(orderId, () => deliveryFleetService.assignRider(orderId, riderId), `Order ${rider?.name || "rider"} ko assign ho gaya`);
  };

  const handleDispatchWhatsApp = async (order: DispatchOrder) => {
    const rider = riders.find((r) => r.id === order.assignedRiderId);
    if (!rider) {
      showToast("Pehle rider assign karo, phir dispatch karo!", "warning");
      return;
    }

    const payLine = order.isCod ? `💵 *Collect (COD):* ₹${order.totalAmount}` : `💵 *Total Amount:* ₹${order.totalAmount} (Prepaid)`;
    const message = encodeURIComponent(
      `🛵 *NEW DISPATCH ASSIGNMENT - GiftFestive*\n\n` +
      `📦 *Order ID:* ${order.orderNumber}\n` +
      `⏰ *Delivery Slot:* ${order.deliverySlot}\n` +
      `👤 *Customer:* ${order.customerName} (+91 ${order.customerPhone})\n` +
      `📍 *Address:* ${order.address}, Faridabad (${order.pincode})\n` +
      `🎂 *Items:* ${order.items}\n` +
      `${payLine}\n\n` +
      `Navigate on Google Maps: https://maps.google.com/?q=${encodeURIComponent(order.address + ", Faridabad " + order.pincode)}\n\n` +
      `Please ensure cake remains upright during transport!`
    );

    // Popup blocker se bachne ke liye window pehle hi khol do
    const win = window.open("", "_blank");
    let dispatched = false;
    await runAction(
      order.id,
      async () => {
        await deliveryFleetService.dispatchOrder(order.id);
        dispatched = true;
        const url = `https://wa.me/91${String(rider.phone).replace(/\D/g, "").slice(-10)}?text=${message}`;
        if (win) win.location.href = url;
        else window.open(url, "_blank");
      },
      `Dispatch details ${rider.name} ko WhatsApp par bheje gaye`
    );
    if (!dispatched && win) win.close();
  };

  const handleMarkDelivered = (order: DispatchOrder) =>
    runAction(order.id, () => deliveryFleetService.completeDelivery(order.id), `${order.orderNumber} delivered mark ho gaya`);

  const handleRiderStatus = (rider: Rider, status: RiderStatus) => {
    if (status === rider.status) return;
    return runAction(rider.id, () => deliveryFleetService.updateStatus(rider.id, status), `${rider.name} ab ${status} hai`);
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName || !newRiderPhone) {
      showToast("Rider ka naam aur mobile number zaroori hai", "error");
      return;
    }

    try {
      await deliveryFleetService.createRider({
        name: newRiderName,
        phone: newRiderPhone,
        vehicle: newRiderVehicle as any,
        vehicleNumber: newRiderPlate || "HR-51-XX-0000",
        currentZone: newRiderZone,
      });
      setShowAddRiderModal(false);
      setNewRiderName("");
      setNewRiderPhone("");
      setNewRiderPlate("");
      showToast(`Rider ${newRiderName} fleet me add ho gaya!`, "success");
      await loadData(true);
    } catch (err: any) {
      showToast(err?.message || "Rider add nahi ho paaya", "error");
    }
  };

  const statusStyle = (st: RiderStatus) =>
    st === "Available"
      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      : st === "En Route"
      ? "bg-pink-500/10 text-pink-500 border border-pink-500/20"
      : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border-theme bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
              <Truck className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Delivery Fleet & Logistics Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Order ko rider assign karo, rider ka status badlo, aur 1-click WhatsApp dispatch bhejo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadData()}
            className="rounded-xl border border-border-theme bg-background px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:bg-hover-theme transition"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowAddRiderModal(true)}
            className="flex items-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-500/20 hover:bg-pink-600 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Delivery Rider</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* KPI Cards (sab real data) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Riders On Duty</span>
          <p className="text-2xl font-black text-foreground mt-1">{activeRidersCount} Active</p>
          <span className="text-[10px] text-emerald-500 font-semibold">● {availableCount} Available • {riders.length - activeRidersCount} Offline</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Waiting Assignment</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{waitingCount} Orders</p>
          <span className="text-[10px] text-amber-500">Inko rider assign karna hai</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Orders In Transit</span>
          <p className="text-2xl font-black text-pink-500 mt-1">{inTransitCount} Orders</p>
          <span className="text-[10px] text-pink-500">Assigned + Out for Delivery</span>
        </div>

        <div className="rounded-2xl border border-border-theme bg-card p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered Today</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{deliveredCount} Orders</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Aaj complete hue</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Riders directory */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-border-theme bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-theme">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bike className="h-4 w-4 text-pink-500" />
                Fleet Riders Directory
              </h3>
              <span className="text-xs text-slate-400">{riders.length} Registered</span>
            </div>

            <div className="space-y-3">
              {!loading && riders.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  Abhi koi rider registered nahi hai. Upar "Add Delivery Rider" se add karo.
                </p>
              )}

              {riders.map((rider) => (
                <div
                  key={rider.id}
                  className="rounded-2xl border border-border-theme bg-background p-3.5 space-y-2 hover:border-pink-500/40 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 font-black text-xs">
                        {rider.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{rider.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          +91 {rider.phone}
                        </p>
                      </div>
                    </div>

                    {/* Status badge + change control */}
                    <select
                      value={rider.status}
                      disabled={busyId === rider.id}
                      onChange={(e) => handleRiderStatus(rider, e.target.value as RiderStatus)}
                      title="Rider ka status yahan se badlo"
                      className={`rounded-full px-2 py-1 text-[10px] font-bold focus:outline-none cursor-pointer ${statusStyle(rider.status)}`}
                    >
                      <option value="Available">● Available</option>
                      <option value="En Route">● En Route</option>
                      <option value="Offline">● Offline</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-border-theme/40">
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3 text-slate-400" />
                      <span>{rider.vehicle} ({rider.vehicleNumber})</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{rider.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[200px]">📍 {rider.currentZone}</span>
                    <span className="font-bold text-pink-500">
                      {rider.assignedOrders} Active • {rider.totalDelivered} Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dispatch pipeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-border-theme bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-theme">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4 text-pink-500" />
                Live Dispatch Pipeline
              </h3>
              <span className="text-xs text-slate-400">{visibleOrders.length} / {orders.length} Orders</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ORDER_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setOrderFilter(f)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold border transition ${
                    orderFilter === f
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-background text-slate-500 border-border-theme hover:border-pink-500/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading && <p className="text-xs text-slate-400 text-center py-6">Loading...</p>}
              {!loading && visibleOrders.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Is filter me koi order nahi hai.</p>
              )}

              {visibleOrders.map((order) => {
                const isMidnight = order.deliverySlot.toLowerCase().includes("midnight");
                const busy = busyId === order.id;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border p-4 space-y-3 transition ${
                      isMidnight ? "border-purple-500/40 bg-purple-500/5" : "border-border-theme bg-background"
                    } ${busy ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs text-foreground">{order.orderNumber}</span>
                        {isMidnight && (
                          <span className="rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">
                            🌙 Midnight Priority
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black whitespace-nowrap ${
                          order.status === "Delivered"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : order.status === "Out for Delivery"
                            ? "bg-pink-500/10 text-pink-500"
                            : order.status === "Assigned"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {order.customerName} <span className="text-slate-400">(+91 {order.customerPhone})</span>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-pink-500 shrink-0 mt-0.5" />
                        <span>{order.address}, Faridabad ({order.pincode})</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        ⏰ {order.deliverySlot}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        🎂 {order.items} • <span className="font-bold text-foreground">₹{order.totalAmount}</span>
                        {order.isCod && <span className="ml-1 font-bold text-amber-500">(COD)</span>}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border-theme/40">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">Rider:</span>
                        <select
                          value={order.assignedRiderId || ""}
                          disabled={order.status === "Delivered"}
                          onChange={(e) => handleAssignRider(order.id, e.target.value)}
                          className="rounded-xl border border-border-theme bg-card px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none"
                        >
                          <option value="">Select Rider...</option>
                          {riders.map((r) => (
                            <option
                              key={r.id}
                              value={r.id}
                              disabled={r.status === "Offline" && r.id !== order.assignedRiderId}
                            >
                              {r.name} ({r.status}{r.assignedOrders ? `, ${r.assignedOrders} orders` : ""})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {order.status !== "Delivered" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDispatchWhatsApp(order)}
                              disabled={!order.assignedRiderId}
                              className="flex items-center gap-1 rounded-xl bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              title={order.assignedRiderId ? "Address & order details rider ko WhatsApp par bhejo" : "Pehle rider assign karo"}
                            >
                              <Send className="h-3 w-3" />
                              <span>Dispatch WA</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMarkDelivered(order)}
                              className="flex items-center gap-1 rounded-xl bg-pink-500 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-pink-600 active:scale-95 transition"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Mark Delivered</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Rider Modal */}
      {showAddRiderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-border-theme bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-theme">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bike className="h-4 w-4 text-pink-500" />
                Register New Fleet Rider
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRiderModal(false)}
                className="text-slate-400 hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRider} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Rider Full Name</label>
                <input
                  type="text"
                  required
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  placeholder="e.g. Vikas Sharma"
                  className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Mobile Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={newRiderPhone}
                  onChange={(e) => setNewRiderPhone(e.target.value)}
                  placeholder="e.g. 9818000000"
                  className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Vehicle Type</label>
                  <select
                    value={newRiderVehicle}
                    onChange={(e) => setNewRiderVehicle(e.target.value)}
                    className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Delivery Van">Delivery Van</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Plate Number</label>
                  <input
                    type="text"
                    value={newRiderPlate}
                    onChange={(e) => setNewRiderPlate(e.target.value.toUpperCase())}
                    placeholder="HR-51-AB-1234"
                    className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Primary Faridabad Zone</label>
                <input
                  type="text"
                  value={newRiderZone}
                  onChange={(e) => setNewRiderZone(e.target.value)}
                  className="w-full rounded-2xl border border-border-theme bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme">
                <button
                  type="button"
                  onClick={() => setShowAddRiderModal(false)}
                  className="rounded-xl border border-border-theme bg-background px-4 py-2 text-xs font-bold text-slate-500 hover:bg-hover-theme"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-pink-500 px-5 py-2 text-xs font-bold text-white hover:bg-pink-600"
                >
                  Register Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

