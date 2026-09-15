"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import AddEditOccasion from "./addEditOccasion";
import OccasionList from "./occasionList";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function OccasionView() {
  const {
    data: occasions,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getOccasions, "occasions");

  const [editingOccasion, setEditingOccasion] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openForm = () => {
    setEditingOccasion(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOccasion(null);
    refresh();
  };

  const handleEdit = (occasion: any) => {
    setEditingOccasion(occasion);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await service.deleteOccasion(deleteId);
      refresh();
      setDeleteId(null);
    } catch (error) {
      alert("Failed to delete occasion");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Occasions</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add New Occasion
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditOccasion occasion={editingOccasion} onClose={closeForm} />
      ) : (
        <OccasionList
          occasions={occasions}
          loading={loading}
          total={total}
          totalPages={totalPages}
          currentPage={params.page}
          searchTerm={params.search}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Occasion"
        message="Are you sure you want to delete this occasion? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
