"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";
import { useAdmin } from "../context/AdminContext";
import * as service from "../services/adminService";
import { Search, Plus, MoreHorizontal, Trash2, Edit3, Tag, Upload, X } from "lucide-react";

export default function CategoryPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useAdmin();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    setName("");
    setImage("");
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const file = event.target.files[0];
      const data = await service.uploadImage(file);
      setImage(data.url);
    } catch (err: any) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = { name, image };
      if (editingId) {
        await updateCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      closeForm();
    } catch (err) {
      console.error("Error saving category.", err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: any) => {
    setEditingId(category._id);
    setName(category.name);
    setImage(category.image || "");
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
        setOpenMenuId(null);
        await deleteCategory(id);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Catalog Management</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Categories</h1>
          </div>
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
             <section className="bg-card rounded-3xl border border-border-theme p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">{editingId ? "Update Category" : "New Category"}</h2>
                    <button onClick={closeForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <form className="grid gap-8 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Name</label>
                             <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                                placeholder="e.g. Electronics, Fashion..."
                                required
                            />
                        </div>
                        <div className="pt-4">
                            <button
                                disabled={saving || uploadingImage}
                                className="w-full bg-primary text-white rounded-2xl py-4 font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {saving ? "Processing..." : editingId ? "Update Category" : "Create Category"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Image</label>
                        <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
                           {image ? (
                                <>
                                    <img src={image} className="h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                       <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold">Change</label>
                                       <input type="file" onChange={handleFileUpload} className="hidden" />
                                    </div>
                                </>
                           ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload size={24} className="text-slate-300" />
                                    <span className="text-xs font-bold text-blue-600">Upload Image</span>
                                    <input type="file" onChange={handleFileUpload} className="hidden" />
                                </label>
                           )}
                           {uploadingImage && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                   <p className="text-xs font-bold text-blue-600">Uploading...</p>
                                </div>
                           )}
                        </div>
                    </div>
                </form>
             </section>
        ) : (
          <div className="bg-card rounded-3xl border border-border-theme shadow-sm overflow-hidden">
             <div className="p-6 border-b border-border-theme bg-card relative z-10">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
             </div>

             {loading ? (
                <div className="p-20 text-center text-slate-500 font-medium">Fetching categories...</div>
             ) : filteredCategories.length === 0 ? (
                <div className="p-20 text-center text-slate-400 italic">No categories found.</div>
             ) : (
                <div className="overflow-x-auto min-h-[350px]">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                                <th className="px-6 py-4 w-[15%]">Image</th>
                                <th className="px-6 py-4 w-[45%]">Name</th>
                                <th className="px-6 py-4 w-[30%]">Created At</th>
                                <th className="px-6 py-4 w-[10%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-theme">
                            {currentCategories.map((c) => (
                                <tr key={c._id} className="hover:bg-hover-theme transition-all duration-300 group border-b border-border-theme/50">
                                    <td className="px-6 py-5">
                                        <div className="h-10 w-14 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                                            {c.image ? <img src={c.image} className="h-full w-full object-cover" /> : <Tag className="h-full w-full p-3 text-slate-200" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-bold text-slate-900">{c.name}</span>
                                    </td>
                                    <td className="px-6 py-5 text-slate-500 text-sm">
                                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-5 text-right relative">
                                        <button 
                                            onClick={() => setOpenMenuId(openMenuId === c._id ? null : c._id)}
                                            className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                        
                                        {openMenuId === c._id && (
                                            <div 
                                                ref={menuRef}
                                                className="absolute right-6 top-14 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200"
                                            >
                                                <button 
                                                    onClick={() => startEdit(c)}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                                                >
                                                    <Edit3 size={16} className="text-blue-600" />
                                                    Edit Category
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(c._id)}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
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
             )}

             <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                   Showing {filteredCategories.length} Categories
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
             </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
