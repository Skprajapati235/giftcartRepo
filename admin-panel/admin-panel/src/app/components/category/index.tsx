"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CategoryList from "./categoryList";
import AddEditCategory from "./addEditCategory";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";

export default function CategoryView() {
  const {
    data: categories,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getCategories, "categories");

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    refresh();
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const triggerDelete = (category: any) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await service.deleteCategory(categoryToDelete._id);
      showToast("Category deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (error) {
      showToast("Failed to delete category", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Categories</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage product departments, taxonomy, and store navigation</p>
        </div>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-95 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={18} />
            Create new
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditCategory category={editingCategory} onClose={closeForm} />
      ) : (
        <CategoryList
          categories={categories}
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
        title="Delete Category"
        itemName={categoryToDelete?.name}
        isLoading={deleting}
      />
    </>
  );
}
