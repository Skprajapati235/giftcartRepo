"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import CategoryList from "./categoryList";
import AddEditCategory from "./addEditCategory";

export default function CategoryView() {
  const { categories, loading, deleteCategory } = useAdmin();
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
