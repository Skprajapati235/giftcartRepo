"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
  X,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

export default function RedirectsManager() {
  const { showToast } = useToast();
  const [redirects, setRedirects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    fromPath: "",
    toPath: "",
    statusCode: 301,
    isActive: true,
    description: "",
  });

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const res = await service.getSeoRedirects({ page, limit: 15, search });
      if (res && res.data) {
        setRedirects(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: any) {
      showToast("Failed to fetch redirects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, [page, search]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      fromPath: "",
      toPath: "",
      statusCode: 301,
      isActive: true,
      description: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      fromPath: item.fromPath,
      toPath: item.toPath,
      statusCode: item.statusCode || 301,
      isActive: item.isActive !== false,
      description: item.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fromPath.trim() || !form.toPath.trim()) {
      showToast("Both source and destination URLs are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingItem?._id) {
        await service.updateSeoRedirect(editingItem._id, form);
        showToast("Redirect rule updated!", "success");
      } else {
        await service.createSeoRedirect(form);
        showToast("Redirect rule created!", "success");
      }
      setModalOpen(false);
      fetchRedirects();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save redirect", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      await service.updateSeoRedirect(item._id, { isActive: !item.isActive });
      showToast(`Redirect ${!item.isActive ? "activated" : "paused"}`, "success");
      fetchRedirects();
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await service.deleteSeoRedirect(id);
      showToast("Redirect deleted", "success");
      setDeleteConfirmId(null);
      fetchRedirects();
    } catch (err) {
      showToast("Failed to delete redirect", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ArrowRightLeft className="text-primary" size={28} /> URL Redirects Manager (301 / 302)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Map old or outdated URLs to new pages to eliminate 404 errors and preserve valuable SEO link equity.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Redirect Rule
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by source or destination URL..."
            className="w-full bg-card border border-border-theme rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Total Rules: <span className="font-bold text-foreground">{totalCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border-theme rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/80 border-b border-border-theme text-xs font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Source (From)</th>
                <th className="px-6 py-4">Destination (To)</th>
                <th className="px-6 py-4">Status Code</th>
                <th className="px-6 py-4">Hits</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <RefreshCw className="animate-spin mx-auto text-primary" size={24} />
                  </td>
                </tr>
              ) : redirects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No URL redirects created yet. Click "Add Redirect Rule" to map your first redirect!
                  </td>
                </tr>
              ) : (
                redirects.map((item) => (
                  <tr key={item._id} className="hover:bg-hover-theme/40 transition">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary">
                      {item.fromPath}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-foreground">
                      {item.toPath}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          item.statusCode === 301
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {item.statusCode === 301 ? "301 Permanent" : "302 Temporary"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                      {item.hits || 0} hits
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {item.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-background rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item._id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-background rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border-theme rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-6 border-b border-border-theme bg-background/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ArrowRightLeft className="text-primary" size={20} />
                {editingItem ? "Edit Redirect Rule" : "Create New Redirect Rule"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Source Path (From) <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.fromPath}
                  onChange={(e) => setForm({ ...form, fromPath: e.target.value })}
                  placeholder="e.g. /old-cake-category"
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Destination URL (To) <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.toPath}
                  onChange={(e) => setForm({ ...form, toPath: e.target.value })}
                  placeholder="e.g. /categories?category=cakes"
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Redirect Type
                  </label>
                  <select
                    value={form.statusCode}
                    onChange={(e) => setForm({ ...form, statusCode: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border-theme rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
                  >
                    <option value={301}>301 (Permanent Redirect)</option>
                    <option value={302}>302 (Temporary Redirect)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Active Status
                  </label>
                  <select
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                    className="w-full bg-background border border-border-theme rounded-xl px-3 py-2.5 text-sm font-semibold outline-none"
                  >
                    <option value="true">Enabled (Active)</option>
                    <option value="false">Disabled (Paused)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Optional Note / Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Renamed promotional campaign"
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border-theme">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-border-theme hover:bg-hover-theme"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-90 shadow-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingItem ? "Update Rule" : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border-theme rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Delete Redirect Rule?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this redirect? Users visiting the source URL may experience 404 errors.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border-theme hover:bg-hover-theme"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
