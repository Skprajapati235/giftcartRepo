"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateOrderStatusApi, deleteOrder as deleteOrderApi } from "../../services/adminService";
import { useResource } from "../../hooks/useResource";
import OrderList from "./orderList";
import ConfirmDialog from "../ui/ConfirmDialog";

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: { name: string; mobileNumber?: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  whatsappLogs?: Array<{
    event?: string;
    to?: string;
    sid?: string;
    success?: boolean;
    skipped?: boolean;
    reason?: string;
    createdAt?: string;
  }>;
}

export default function OrdersView() {
  const {
    data: orders,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<Order>(getAllOrders, "orders");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Clear selections when page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [params.page, params.search]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      refresh();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteOrderApi(deleteId);
      refresh();
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(id => id !== deleteId));
    } catch (error) {
      alert("Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const { deleteMultipleOrders } = await import("../../services/adminService");
      await deleteMultipleOrders(selectedIds);
      refresh();
      setIsBulkDeleting(false);
      setSelectedIds([]);
    } catch (error) {
      alert("Failed to delete selected orders");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  return (
    <>
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Orders</h1>
        
        {selectedIds.length > 0 && (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-200">
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>
      <OrderList
        orders={orders}
        loading={loading}
        total={total}
        totalPages={totalPages}
        currentPage={params.page}
        searchTerm={params.search}
        onPageChange={onPageChange}
        onSearchChange={onSearchChange}
        onUpdateStatus={updateStatus}
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
      <ConfirmDialog
        isOpen={isBulkDeleting}
        title="Delete Selected Orders"
        message={`Are you sure you want to delete ${selectedIds.length} selected order(s)? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleting(false)}
        isLoading={isDeleting}
      />
    </>
  );
}
