"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import AddEditFlavor from "./addEditFlavor";
import FlavorList from "./flavorList";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";

export default function FlavorView() {
  const {
    data: flavors,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getFlavors, "flavors");

  const [editingFlavor, setEditingFlavor] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flavorToDelete, setFlavorToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingFlavor(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFlavor(null);
    refresh();
  };

  const handleEdit = (flavor: any) => {
    setEditingFlavor(flavor);
    setShowForm(true);
  };

  const triggerDelete = (flavor: any) => {
    setFlavorToDelete(flavor);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!flavorToDelete) return;
    setDeleting(true);
    try {
      await service.deleteFlavor(flavorToDelete._id);
      showToast("Flavor deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (error) {
      showToast("Failed to delete flavor", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Cake Flavors</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add New Flavor
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditFlavor flavor={editingFlavor} onClose={closeForm} />
      ) : (
        <FlavorList
          flavors={flavors}
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
        title="Delete Flavor"
        itemName={flavorToDelete?.name}
        isLoading={deleting}
      />
    </>
  );
}
