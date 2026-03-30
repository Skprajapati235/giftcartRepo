"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";
import { useAdmin } from "../context/AdminContext";
import * as service from "../services/adminService";

export default function ProductsPage() {
  const { products, categories, loading, error, createProduct, updateProduct, deleteProduct } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "", image: "", category: "" });
    setMessage(null);
    setImageError(null);
  };

  const openForm = () => {
    setShowForm(true);
    setEditingId(null);
    setForm({ name: "", price: "", description: "", image: "", category: "" });
    setMessage(null);
    setImageError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", price: "", description: "", image: "", category: "" });
    setMessage(null);
    setImageError(null);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.category?.name?.toLowerCase().includes(normalizedSearch)
      ),
    [products, normalizedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / 10));
  const currentProducts = filteredProducts.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    setUploadingImage(true);
    setImageError(null);

    try {
      const file = event.target.files[0];
      const data = await service.uploadImage(file);
      setForm((current) => ({ ...current, image: data.url }));
      setMessage("Image uploaded successfully.");
    } catch (err: any) {
      setImageError(err.response?.data?.message || err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setShowForm(true);
    setForm({
      name: product.name || "",
      price: String(product.price || ""),
      description: product.description || "",
      image: product.image || "",
      category: product.category?._id || "",
    });
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        image: form.image,
        category: form.category,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
        setMessage("Product updated successfully.");
      } else {
        await createProduct(payload);
        setMessage("Product created successfully.");
      }

      closeForm();
    } catch (err) {
      setMessage("Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteProduct(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <Sidebar />
        <main className="flex-1 p-10 space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Products</p>
            <h1 className="mt-2 text-3xl font-semibold">Product catalog</h1>
            <p className="mt-2 text-sm text-slate-600">Add, edit, or remove products that appear in the app.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={openForm}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add product
            </button>
            {!showForm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">View:</span>
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${viewMode === "card" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  List
                </button>
              </div>
            ) : null}
          </div>

          {showForm ? (
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit product" : "Add new product"}</h2>
              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    placeholder="Product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Price</label>
                  <input
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Image URL</label>
                  <input
                    value={form.image}
                    onChange={(event) => setForm({ ...form, image: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Upload image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  {uploadingImage && <p className="mt-2 text-sm text-slate-500">Uploading image...</p>}
                  {imageError && <p className="mt-2 text-sm text-rose-600">{imageError}</p>}
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="mt-3 h-36 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    rows={4}
                    placeholder="Product description"
                    required
                  />
                </div>

                {message ? (
                  <div className="sm:col-span-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</div>
                ) : null}

                <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingId ? "Update product" : "Create product"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          ) : loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Loading products...</div>
          ) : error ? (
            <div className="rounded-3xl bg-rose-50 p-8 text-rose-700 shadow-sm">{error}</div>
          ) : (
            <section className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Product list</h2>
                  <p className="mt-1 text-sm text-slate-600">Products visible to your front-end users.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search products or category"
                    className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("card")}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${viewMode === "card" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600">No products found.</div>
              ) : viewMode === "list" ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Price</th>
                        <th className="px-3 py-3">Created</th>
                        <th className="px-3 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product) => (
                        <tr key={product._id} className="border-b border-slate-100">
                          <td className="px-3 py-4 font-medium text-slate-900">{product.name}</td>
                          <td className="px-3 py-4 text-slate-600">{product.category?.name || "Unassigned"}</td>
                          <td className="px-3 py-4 text-slate-600">${product.price?.toFixed(2)}</td>
                          <td className="px-3 py-4 text-slate-600">{new Date(product.createdAt).toLocaleDateString()}</td>
                          <td className="px-3 py-4 space-x-2">
                            <button
                              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                              disabled={deleting === product._id}
                              onClick={() => handleDelete(product._id)}
                            >
                              {deleting === product._id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {currentProducts.map((product) => (
                    <div key={product._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="mb-4 h-40 w-full rounded-3xl object-cover" />
                      ) : (
                        <div className="mb-4 h-40 w-full rounded-3xl bg-slate-200" />
                      )}
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{product.category?.name || "Unassigned"}</p>
                      <p className="mt-2 text-sm text-slate-900 font-semibold">${product.price?.toFixed(2)}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                          disabled={deleting === product._id}
                          onClick={() => handleDelete(product._id)}
                        >
                          {deleting === product._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </section>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
