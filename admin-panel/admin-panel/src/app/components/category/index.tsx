"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CategoryList from "./categoryList";
import AddEditCategory from "./addEditCategory";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await service.deleteCategory(id);
        refresh();
      } catch (error) {
        alert("Failed to delete category");
      }
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Categories</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
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
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
