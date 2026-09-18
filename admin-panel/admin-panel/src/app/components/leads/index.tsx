"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/leadService";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";
import AddEditLead from "./addEditLead";
import LeadList from "./leadList";

export default function LeadView() {
  const {
    data: leads,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getAllLeads, "data"); // response.data is where list is

  const [editingLead, setEditingLead] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingLead(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLead(null);
    refresh();
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const triggerDelete = (lead: any) => {
    setLeadToDelete(lead);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      await service.deleteLead(leadToDelete._id);
      showToast("Lead deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (error) {
      showToast("Failed to delete lead", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground mt-1">Leads Management</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add Lead
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditLead lead={editingLead} onClose={closeForm} />
      ) : (
        <LeadList
          leads={leads}
          loading={loading}
          total={total}
          totalPages={totalPages}
          currentPage={params.page}
          searchTerm={params.search}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onEdit={handleEdit}
          onDelete={triggerDelete}
        />
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lead"
        itemName={leadToDelete?.name}
        isLoading={deleting}
      />
    </>
  );
}
