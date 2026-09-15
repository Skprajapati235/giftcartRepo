"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import ProductList from "./productList";
import AddEditProduct from "./addeditProduct";
import ProductDetailDialogue from "./productDetailDialogue";
import CategoryTabs from "./categoryTabs";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";

export default function ProductView() {
  const {
    data: products,
    loading,
    error,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    onCategoryChange,
    refresh
  } = useResource<any>(service.getProducts, "products");

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // "Add Product" always creates the product inside whichever category tab
  // is currently open (Cake tab -> new product starts as a Cake, etc.)
  // instead of one shared form with no category context.
  const openForm = () => {
    setEditingProduct(params.category ? { category: params.category } : null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    refresh(); // Refresh list after closing form (which might have created/edited)
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await service.deleteProduct(deleteId);
      refresh();
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Products</h1>
        {!showForm && !params.category && (
          <p className="text-xs font-semibold text-slate-400">Select a category tab below to add a product</p>
        )}
        {/* "Add Product" only makes sense once a specific category tab is
            open — on "All", we don't know which category the new product
            should be filed under, so the button is hidden there. */}
        {!showForm && params.category && (
          <button
            onClick={openForm}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      {!showForm && (
        <div className="mb-6">
          <CategoryTabs activeCategory={params.category} onChange={onCategoryChange} />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-3xl bg-rose-50 p-6 text-rose-700 font-bold border border-rose-200">
          {error}
        </div>
      )}

      {showForm ? (
        <AddEditProduct product={editingProduct} onClose={closeForm} />
      ) : (
        <ProductList
          products={products}
          loading={loading}
          total={total}
          totalPages={totalPages}
          currentPage={params.page}
          searchTerm={params.search}
          selectedCategory={params.category}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onCategoryChange={onCategoryChange}
          onEdit={handleEdit}
          onView={setViewingProduct}
          onDelete={handleDelete}
        />
      )}

      {viewingProduct && (
        <ProductDetailDialogue product={viewingProduct} onClose={() => setViewingProduct(null)} />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
