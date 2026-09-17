"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  SupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
  replySupportTicket,
  deleteSupportTicket,
  bulkDeleteSupportTickets,
} from "../../services/supportService";
import SupportStats from "./supportStats";
import SupportFilterBar from "./supportFilterBar";
import SupportTable from "./supportTable";
import SupportDetailModal from "./supportDetailModal";
import CustomerContactModal from "./customerContactModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useToast } from "../../../context/ToastContext";
import { LifeBuoy, Trash2 } from "lucide-react";

export default function SupportManagementView() {
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [counts, setCounts] = useState<{
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
  }>({ total: 0, pending: 0, in_progress: 0, resolved: 0 });

  // Filters
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "resolved" | "closed">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<boolean>(false);

  // Single Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modals
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSupportTickets({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter as any,
      });
      setTickets(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      console.error("Error fetching support tickets:", err);
      showToast("Failed to load support inquiries", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, priorityFilter, showToast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Clear selections on filter change
  useEffect(() => {
    setSelectedIds([]);
  }, [page, statusFilter, priorityFilter, debouncedSearch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTickets();
    setIsRefreshing(false);
    showToast("Support tickets refreshed", "success");
  };

  // Status update
  const handleUpdateStatus = async (id: string, status: string, priority?: string) => {
    try {
      await updateSupportTicketStatus(id, { status, priority });
      showToast("Ticket status updated", "success");
      fetchTickets();
      if (activeTicket && activeTicket._id === id) {
        setActiveTicket((prev) => (prev ? { ...prev, status: status as any } : null));
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
      throw err;
    }
  };

  // Send admin reply
  const handleSendReply = async (id: string, reply: string, markResolved: boolean) => {
    try {
      await replySupportTicket(id, { adminReply: reply, markResolved });
      showToast("Reply sent to customer successfully!", "success");
      fetchTickets();
      if (activeTicket && activeTicket._id === id) {
        setActiveTicket((prev) =>
          prev ? { ...prev, adminReply: reply, status: markResolved ? "resolved" : prev.status } : null
        );
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to send reply", "error");
      throw err;
    }
  };

  // Single delete
  const handleConfirmSingleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteSupportTicket(deleteId);
      showToast("Support ticket deleted", "success");
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      fetchTickets();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete ticket", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await bulkDeleteSupportTickets(selectedIds);
      showToast(`${selectedIds.length} tickets deleted successfully`, "success");
      setSelectedIds([]);
      setConfirmBulkDelete(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete selected tickets", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(tickets.map((t) => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Customer Support & Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage incoming support tickets, order inquiries, customer messages, and send resolutions.
            </p>
          </div>
        </div>

        {/* Selected Items Bulk Action */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-2 text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <SupportStats
        counts={counts}
        activeStatus={statusFilter}
        onSelectStatus={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        loading={loading}
      />

      {/* Filter and Search Bar */}
      <SupportFilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        priorityFilter={priorityFilter}
        onPriorityChange={(pr) => {
          setPriorityFilter(pr);
          setPage(1);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenTestModal={() => setIsContactModalOpen(true)}
        counts={counts}
      />

      {/* Tickets Table */}
      <SupportTable
        tickets={tickets}
        loading={loading}
        total={total}
        totalPages={totalPages}
        currentPage={page}
        limit={limit}
        onPageChange={setPage}
        onViewTicket={(ticket) => {
          setActiveTicket(ticket);
          setIsDetailOpen(true);
        }}
        onDeleteTicket={(id) => setDeleteId(id)}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />

      {/* Ticket Details & Reply Modal */}
      <SupportDetailModal
        ticket={activeTicket}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveTicket(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onSendReply={handleSendReply}
      />

      {/* Customer Contact Test Modal */}
      <CustomerContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={fetchTickets}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Support Ticket"
        message="Are you sure you want to delete this customer inquiry? This action cannot be undone."
        confirmText="Delete Ticket"
        cancelText="Cancel"
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        title="Delete Selected Tickets"
        message={`Are you sure you want to delete ${selectedIds.length} selected support tickets? This action cannot be undone.`}
        confirmText={`Delete (${selectedIds.length}) Tickets`}
        cancelText="Cancel"
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
