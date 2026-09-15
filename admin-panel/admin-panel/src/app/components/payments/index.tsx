"use client";

import React, { useEffect, useState } from "react";
import { getOrderPayments } from "../../services/adminService";
import PaymentList from "./paymentList";
import ConfirmDialog from "../ui/ConfirmDialog";

interface Payment {
  _id: string;
  user: { name: string; mobileNumber?: string };
  totalAmount: number;
  razorpayPaymentId: string;
  createdAt: string;
  paymentStatus: string;
}

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchPayments = async () => {
    try {
      const response = await getOrderPayments();
      setPayments(response);
    } catch (error) {
      console.error("Fetch payments failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      // Payments are just orders, so we use deleteOrder
      const { deleteOrder } = await import("../../services/adminService");
      await deleteOrder(deleteId);
      await fetchPayments();
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(id => id !== deleteId));
    } catch (error) {
      alert("Failed to delete payment");
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
      await fetchPayments();
      setIsBulkDeleting(false);
      setSelectedIds([]);
    } catch (error) {
      alert("Failed to delete selected payments");
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
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Payment history</h1>
          <p className="mt-1 text-sm text-slate-500">Track successful transactions and payment IDs.</p>
        </div>
        
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

      <PaymentList 
        payments={payments} 
        loading={loading} 
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds} 
      />
      
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment and its associated order? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
      <ConfirmDialog
        isOpen={isBulkDeleting}
        title="Delete Selected Payments"
        message={`Are you sure you want to delete ${selectedIds.length} selected payment(s) and their associated orders? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={confirmBulkDelete}
        onCancel={() => setIsBulkDeleting(false)}
        isLoading={isDeleting}
      />
    </>
  );
}