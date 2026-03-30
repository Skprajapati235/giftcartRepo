"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";
import { useAdmin } from "../context/AdminContext";

export default function CategoryPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useAdmin();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setMessage(null);
  };

  const openForm = () => {
    setShowForm(true);
    resetForm();
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.name?.toLowerCase().includes(normalizedSearch)
      ),
    [categories, normalizedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / 10));
  const currentCategories = filteredCategories.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      if (editingId) {
        await updateCategory(editingId, name);
        setMessage("Category updated successfully.");
      } else {
        await createCategory(name);
        setMessage("Category created successfully.");
      }
      closeForm();
    } catch (err) {
      setMessage("Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: any) => {
    setEditingId(category._id);
    setName(category.name);
    setMessage(null);
    setShowForm(true);
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Categories</p>
              {/* <h1 className="mt-2 text-3xl font-semibold">Manage categories</h1>
              <p className="mt-2 text-sm text-slate-600">Add, edit, or remove categories for your products.</p> */}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openForm}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create category
              </button>
              {showForm ? (
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>

          {showForm ? (
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit category" : "Create new category"}</h2>
              <p className="mt-2 text-sm text-slate-600">Add a category that products can be assigned to.</p>
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-slate-700">Category name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="e.g. Electronics"
                  required
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingId ? "Update category" : "Create category"}
                  </button>
                </div>
                {message ? <p className="text-sm text-slate-600">{message}</p> : null}
              </form>
            </section>
          ) : (
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Category list</h2>
                  <p className="mt-2 text-sm text-slate-600">Active categories available in the store.</p>
                </div>
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search categories"
                  className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
              {loading ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-slate-600">Loading categories...</div>
              ) : error ? (
                <div className="mt-6 rounded-3xl bg-rose-50 p-6 text-rose-700">{error}</div>
              ) : currentCategories.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-slate-600">No categories found.</div>
              ) : (
                <ul className="mt-6 space-y-3">
                  {currentCategories.map((category) => (
                    <li
                      key={category._id}
                      className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-slate-900">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          onClick={() => startEdit(category)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-2xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                          onClick={async () => await deleteCategory(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </section>
          )}
        </main>
    </ProtectedRoute>
  );
}
