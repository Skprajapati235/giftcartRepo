"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import ProductList from "./productList";
import AddEditProduct from "./addeditProduct";
import ProductDetailDialogue from "./productDetailDialogue";
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

  const openForm = () => {
    setEditingProduct(null);
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

  const handleDelete = async (id: string) => {
    try {
      await service.deleteProduct(id);
      refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground mt-1">Products</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

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
    </>
  );
}
