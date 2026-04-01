"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";
import { Search, ShoppingCart, MoreHorizontal, Eye, ChevronRight, X } from "lucide-react";

interface OrderItem {
    product: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    user: { name: string; email: string };
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("giftcartAdminToken");
            const response = await axios.get("http://localhost:5000/api/order/admin/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Fetch orders failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenuId(null);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem("giftcartAdminToken");
            await axios.put(`http://localhost:5000/api/order/admin/${orderId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredOrders = useMemo(
        () => orders.filter((order) =>
            order._id.toLowerCase().includes(normalizedSearch) ||
            order.user?.name?.toLowerCase().includes(normalizedSearch) ||
            order.status.toLowerCase().includes(normalizedSearch)
        ),
        [normalizedSearch, orders]
    );

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / 10));
    const pageOrders = filteredOrders.slice((currentPage - 1) * 10, currentPage * 10);

    return (
        <ProtectedRoute>
            <main className="flex-1 bg-background min-h-screen p-8">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Store Operations</p>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">Orders</h1>
                </div>

                <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[600px]">
                    <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search order ID or customer..."
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-background px-4 py-3 rounded-2xl border border-border-theme font-sans">
                           Total Orders: {filteredOrders.length}
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-slate-500 font-medium font-sans">Fetching orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 italic">No orders found.</div>
                    ) : (
                        <div className="overflow-x-auto min-h-[450px]">
                            <table className="w-full text-left table-fixed">
                                <thead>
                                    <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                                        <th className="px-6 py-4 w-[25%] font-sans">Order ID</th>
                                        <th className="px-6 py-4 w-[25%] font-sans">Customer</th>
                                        <th className="px-6 py-4 w-[20%] font-sans">Total Amount</th>
                                        <th className="px-6 py-4 w-[20%] font-sans">Status</th>
                                        <th className="px-6 py-4 w-[10%] text-right font-sans">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-theme">
                                    {pageOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                                        <ShoppingCart size={16} />
                                                    </div>
                                                    <span className="font-mono text-xs text-slate-400 uppercase font-bold tracking-widest">#{order._id.slice(-6)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="font-bold text-slate-900 truncate">{order.user?.name}</div>
                                                <div className="text-xs text-slate-400 truncate">{order.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="bg-pink-50 text-pink-600 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                                                  ₹{order.totalAmount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                    className={`rounded-xl border-none px-3 py-2 text-[10px] font-bold focus:ring-0 cursor-pointer uppercase tracking-wider ${
                                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-5 text-right relative">
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === order._id ? null : order._id)}
                                                    className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>
                                                
                                                {openMenuId === order._id && (
                                                    <div 
                                                        ref={menuRef}
                                                        className="absolute right-6 top-14 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200"
                                                    >
                                                        <Link 
                                                            href={`/orders/${order._id}`}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-white bg-primary hover:opacity-90 rounded-xl transition"
                                                        >
                                                            <div className="p-1.5 bg-white/20 text-white rounded-lg">
                                                              <Eye size={16} />
                                                            </div>
                                                            View Details
                                                        </Link>
                                                        <div className="mx-2 my-1 border-t border-slate-100" />
                                                        <button 
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                                                            onClick={() => alert("Printing functionality coming soon!")}
                                                        >
                                                            Print Invoice
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                           Showing {filteredOrders.length} Orders
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
