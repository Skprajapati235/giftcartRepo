"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CrmList from "./crmList";
import AddEditCrm from "./addEditCrm";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/crmService";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";

export default function CrmView() {
  const {
    data: contacts,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getAllCrmContacts, "data");

  const [editingContact, setEditingContact] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingContact(null);
    refresh();
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const triggerDelete = (contact: any) => {
    setContactToDelete(contact);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setDeleting(true);
    try {
      await service.deleteCrmContact(contactToDelete._id);
      showToast("CRM Contact deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (error) {
      showToast("Failed to delete CRM contact", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground mt-1">CRM Contacts</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add Contact
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditCrm contact={editingContact} onClose={closeForm} />
      ) : (
        <CrmList
          contacts={contacts}
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
        title="Delete CRM Contact"
        itemName={contactToDelete?.name}
        isLoading={deleting}
      />
    </>
  );
}
