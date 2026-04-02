"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";
import { useAdmin } from "../context/AdminContext";
import * as service from "../services/adminService";
import { Search, LayoutGrid, List, Plus, MoreHorizontal, Trash2, Edit3, Box, Upload, X } from "lucide-react";

export default function ProductsPage() {
  const { products, categories, loading, error, createProduct, updateProduct, deleteProduct } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    salePrice: "",
    description: "",
    image: "",
    category: "",
    weight: "",
    flowers: "",
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ 
        name: "", 
        price: "", 
        salePrice: "", 
        description: "", 
        image: "", 
        category: "", 
        weight: "", 
        flowers: "" 
    });
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const file = event.target.files[0];
      const data = await service.uploadImage(file);
      setForm((current) => ({ ...current, image: data.url }));
    } catch (err: any) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setShowForm(true);
    setOpenMenuId(null);
    setForm({
      name: product.name || "",
      price: String(product.price || ""),
      salePrice: String(product.salePrice || ""),
      description: product.description || "",
      image: product.image || "",
      category: product.category?._id || "",
      weight: product.weight || "",
      flowers: String(product.flowers || ""),
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
        setOpenMenuId(null);
        await deleteProduct(id);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        price: Number(form.price), 
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        flowers: form.flowers ? Number(form.flowers) : undefined
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      closeForm();
    } catch (err) {
      console.error("Error saving product.", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Catalog Management</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">Products</h1>
          </div>
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

        {showForm ? (
             <section className="bg-card rounded-[2.5rem] border border-border-theme shadow-2xl max-w-5xl mx-auto overflow-hidden">
                <div className="p-6 border-b border-border-theme flex justify-between items-center bg-hover-theme/50">
                    <h2 className="text-lg font-bold text-foreground">Add New Product</h2>
                    <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
                </div>
                
                <form className="p-8" onSubmit={handleSubmit}>
                    <div className="grid gap-10 lg:grid-cols-2">
                        {/* Left Side: Inputs */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Enter product title..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Write a brief description..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Number of Flowers</label>
                                    <input
                                        value={form.flowers}
                                        onChange={(e) => setForm({ ...form, flowers: e.target.value })}
                                        type="number"
                                        className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. 12"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Weight of Cake</label>
                                    <input
                                        value={form.weight}
                                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                        className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. 1kg, 500gm"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">List Price (MRP ₹)</label>
                                    <input
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        type="number"
                                        className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. 999"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Sale Price (Offer ₹)</label>
                                    <input
                                        value={form.salePrice}
                                        onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                                        type="number"
                                        className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="e.g. 799"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Image Upload */}
                        <div className="space-y-6">
                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-tighter">Product Image</label>
                            <div className="relative aspect-square w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group">
                                {form.image ? (
                                    <>
                                        <img src={form.image} className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <label className="cursor-pointer bg-white text-slate-900 px-6 py-2 rounded-xl font-bold shadow-lg text-sm">Update Image</label>
                                            <input type="file" onChange={handleFileUpload} className="hidden" />
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-4">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                                            <Upload size={32} />
                                        </div>
                                        <div className="text-center">
                                           <span className="text-blue-600 font-bold">Select Image</span>
                                           <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">JPG, PNG allowed</p>
                                        </div>
                                        <input type="file" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                )}
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                        <p className="text-blue-600 font-bold">Uploading...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border-theme flex justify-end">
                        <button
                            disabled={saving || uploadingImage}
                            className="bg-primary text-white px-16 py-4 rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : editingId ? "Update Product" : "Save Product"}
                        </button>
                    </div>
                </form>
             </section>
        ) : (
          <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden min-h-[400px]">
            {/* Table Header Filter Bar */}
            <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded-lg transition ${viewMode === "card" ? "bg-card shadow-md text-primary" : "text-slate-400 hover:text-foreground"}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-card shadow-md text-primary" : "text-slate-400 hover:text-foreground"}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-20 text-center text-slate-500 font-medium font-sans">Fetching your products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-20 text-center text-slate-400 italic">No products found for your search.</div>
            ) : viewMode === "list" ? (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                      <th className="px-6 py-4 w-[35%]">Name</th>
                      <th className="px-6 py-4 w-[25%]">Description</th>
                      <th className="px-6 py-4 w-[20%]">Created At</th>
                      <th className="px-6 py-4 w-[12%]">Price</th>
                      <th className="px-6 py-4 w-[8%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {currentProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50">
                        <td className="px-6 py-5 overflow-hidden">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl border border-border-theme bg-hover-theme overflow-hidden shrink-0">
                              {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Box className="h-full w-full p-3 text-slate-300" />}
                            </div>
                             <span className="font-bold text-foreground truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-slate-500 text-sm truncate">{p.description}</p>
                        </td>
                        <td className="px-6 py-5 text-slate-500 text-sm">
                          {new Date(p.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5">
                           <span className="bg-hover-theme text-foreground/80 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap">
                            ₹{p.salePrice || p.price}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === p._id ? null : p._id)}
                             className="p-2 text-slate-400 hover:text-foreground transition rounded-xl"
                          >
                             <MoreHorizontal size={20} />
                          </button>
                          
                          {openMenuId === p._id && (
                             <div 
                                ref={menuRef}
                                 className="absolute right-6 top-14 w-40 bg-card rounded-2xl shadow-2xl border border-border-theme py-2 z-50 animate-in fade-in zoom-in duration-200"
                             >
                                <button 
                                    onClick={() => handleEdit(p)}
                                     className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                                >
                                    <Edit3 size={16} className="text-blue-600" />
                                    Edit Product
                                </button>
                                <button 
                                    onClick={() => handleDelete(p._id)}
                                     className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-500/10 transition"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                             </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Card View Mode */
               <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 bg-background/50">
                {currentProducts.map((p) => (
                   <div key={p._id} className="bg-card rounded-3xl p-4 border border-border-theme shadow-lg hover:shadow-primary/5 transition hover:-translate-y-1">
                    <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-50 mb-4">
                      {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <Box className="p-10 text-slate-200" />}
                    </div>
                    <div className="px-1">
                       <h4 className="font-bold text-foreground truncate">{p.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">{p.category?.name || "No Category"}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-blue-600 font-extrabold">₹{p.salePrice || p.price}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Edit3 size={16} /></button>
                          <button onClick={() => deleteProduct(p._id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

             <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filteredProducts.length)} of {filteredProducts.length}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
