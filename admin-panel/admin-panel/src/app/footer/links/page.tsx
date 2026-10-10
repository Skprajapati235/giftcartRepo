"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import FooterNavTabs from "../../components/footer/FooterNavTabs";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  X,
  Layers,
  FolderPlus,
} from "lucide-react";

export default function FooterLinksPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<any[]>([]);

  // Column Modal
  const [showColModal, setShowColModal] = useState(false);
  const [editingCol, setEditingCol] = useState<any>(null);
  const [colForm, setColForm] = useState({ title: "", sortOrder: 1, isActive: true });
  const [colSaving, setColSaving] = useState(false);

  // Link Modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [activeColId, setActiveColId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [linkForm, setLinkForm] = useState({
    label: "",
    url: "",
    badge: "",
    isExternal: false,
    sortOrder: 1,
    isActive: true,
  });
  const [linkSaving, setLinkSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data) {
        setColumns(res.data.columns || []);
      }
    } catch (err: any) {
      showToast("Failed to load footer navigation links", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Column Actions ---
  const openAddCol = () => {
    setEditingCol(null);
    setColForm({ title: "", sortOrder: columns.length + 1, isActive: true });
    setShowColModal(true);
  };

  const openEditCol = (col: any) => {
    setEditingCol(col);
    setColForm({ title: col.title || "", sortOrder: col.sortOrder || 1, isActive: col.isActive !== false });
    setShowColModal(true);
  };

  const handleSaveCol = async (e: React.FormEvent) => {
    e.preventDefault();
    setColSaving(true);
    try {
      if (editingCol && editingCol._id) {
        await service.updateFooterColumn(editingCol._id, colForm);
        showToast("Column updated successfully!", "success");
      } else {
        await service.addFooterColumn(colForm);
        showToast("Navigation column created!", "success");
      }
      setShowColModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save column", "error");
    } finally {
      setColSaving(false);
    }
  };

  const handleDeleteCol = async (id: string) => {
    if (!confirm("Are you sure? All links inside this column will also be deleted!")) return;
    try {
      await service.deleteFooterColumn(id);
      showToast("Column deleted", "success");
      loadData();
    } catch (err: any) {
      showToast("Failed to delete column", "error");
    }
  };

  // --- Link Actions ---
  const openAddLink = (colId: string, colLinksCount: number) => {
    setActiveColId(colId);
    setEditingLink(null);
    setLinkForm({
      label: "",
      url: "",
      badge: "",
      isExternal: false,
      sortOrder: colLinksCount + 1,
      isActive: true,
    });
    setShowLinkModal(true);
  };

  const openEditLink = (colId: string, link: any) => {
    setActiveColId(colId);
    setEditingLink(link);
    setLinkForm({
      label: link.label || "",
      url: link.url || "",
      badge: link.badge || "",
      isExternal: !!link.isExternal,
      sortOrder: link.sortOrder || 1,
      isActive: link.isActive !== false,
    });
    setShowLinkModal(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeColId) return;
    setLinkSaving(true);
    try {
      if (editingLink && editingLink._id) {
        await service.updateFooterLink(activeColId, editingLink._id, linkForm);
        showToast("Link updated successfully!", "success");
      } else {
        await service.addFooterLink(activeColId, linkForm);
        showToast("Link added successfully!", "success");
      }
      setShowLinkModal(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save link", "error");
    } finally {
      setLinkSaving(false);
    }
  };

  const handleDeleteLink = async (colId: string, linkId: string) => {
    if (!confirm("Remove this link from the column?")) return;
    try {
      await service.deleteFooterLink(colId, linkId);
      showToast("Link deleted", "success");
      loadData();
    } catch (err: any) {
      showToast("Failed to delete link", "error");
    }
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadData} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <LinkIcon className="text-blue-500" size={24} /> Navigation Columns &amp; Links
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organize your website footer menu into custom categories (e.g., &quot;Explore&quot;, &quot;Company &amp; Trust&quot;) with badges and direct URLs.
              </p>
            </div>

            <button
              onClick={openAddCol}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-xl transition shadow-md shadow-pink-500/20"
            >
              <FolderPlus size={16} />
              <span>Create Column</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <div className="space-y-6">
              {columns.map((col: any, cIdx: number) => (
                <div
                  key={col._id || cIdx}
                  className="bg-card-theme border border-border-theme rounded-2xl p-5 shadow-sm space-y-4"
                >
                  {/* Column Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-theme pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs">
                        {col.sortOrder || cIdx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-foreground text-base">{col.title}</h3>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                              col.isActive !== false
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-gray-500/15 text-gray-400"
                            }`}
                          >
                            {col.isActive !== false ? "Active Column" : "Hidden"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {col.links?.length || 0} links configured • Order #{col.sortOrder || cIdx + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => openAddLink(col._id, col.links?.length || 0)}
                        className="flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        <Plus size={13} /> Add Link
                      </button>
                      <button
                        onClick={() => openEditCol(col)}
                        className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition"
                        title="Edit Column"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCol(col._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete Column"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Links Table */}
                  {col.links?.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No links inside this column. Click &quot;Add Link&quot; above.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {col.links.map((link: any, lIdx: number) => (
                        <div
                          key={link._id || lIdx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                            link.isActive !== false
                              ? "bg-muted/30 border-border-theme"
                              : "bg-muted/10 border-border-theme opacity-50"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground truncate">{link.label}</span>
                              {link.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-pink-500/20 text-pink-500">
                                  {link.badge}
                                </span>
                              )}
                              {link.isExternal && <ExternalLink size={10} className="text-muted-foreground" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{link.url}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditLink(col._id, link)}
                              className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(col._id, link._id)}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {columns.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border-theme rounded-2xl bg-muted/10">
                  <Layers size={36} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-foreground">No navigation columns configured</p>
                  <p className="text-xs text-muted-foreground mt-1">Click &quot;Create Column&quot; to start organizing links</p>
                </div>
              )}
            </div>
          )}

          {/* Add / Edit Column Modal */}
          {showColModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-card-theme border border-border-theme rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-theme pb-3">
                  <h3 className="font-extrabold text-foreground text-sm">
                    {editingCol ? "Edit Column" : "Create Column"}
                  </h3>
                  <button onClick={() => setShowColModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveCol} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Column Title</label>
                    <input
                      type="text"
                      required
                      value={colForm.title}
                      onChange={(e) => setColForm({ ...colForm, title: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="e.g. Explore or Support"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Sort Order</label>
                    <input
                      type="number"
                      value={colForm.sortOrder}
                      onChange={(e) => setColForm({ ...colForm, sortOrder: parseInt(e.target.value) || 1 })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={colForm.isActive}
                      onChange={(e) => setColForm({ ...colForm, isActive: e.target.checked })}
                      className="rounded accent-pink-500"
                    />
                    <span>Active Column</span>
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme">
                    <button
                      type="button"
                      onClick={() => setShowColModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={colSaving}
                      className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
                    >
                      {colSaving ? "Saving..." : editingCol ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add / Edit Link Modal */}
          {showLinkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-card-theme border border-border-theme rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-theme pb-3">
                  <h3 className="font-extrabold text-foreground text-sm">
                    {editingLink ? "Edit Link" : "Add Link to Column"}
                  </h3>
                  <button onClick={() => setShowLinkModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSaveLink} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Link Label</label>
                    <input
                      type="text"
                      required
                      value={linkForm.label}
                      onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="e.g. Moments Gallery"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Target URL / Route</label>
                    <input
                      type="text"
                      required
                      value={linkForm.url}
                      onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="/gallery or https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Badge (Optional)</label>
                      <input
                        type="text"
                        value={linkForm.badge}
                        onChange={(e) => setLinkForm({ ...linkForm, badge: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                        placeholder="e.g. New"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Sort Order</label>
                      <input
                        type="number"
                        value={linkForm.sortOrder}
                        onChange={(e) => setLinkForm({ ...linkForm, sortOrder: parseInt(e.target.value) || 1 })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.isExternal}
                        onChange={(e) => setLinkForm({ ...linkForm, isExternal: e.target.checked })}
                        className="rounded accent-pink-500"
                      />
                      <span>External Link</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.isActive}
                        onChange={(e) => setLinkForm({ ...linkForm, isActive: e.target.checked })}
                        className="rounded accent-pink-500"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-theme">
                    <button
                      type="button"
                      onClick={() => setShowLinkModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={linkSaving}
                      className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
                    >
                      {linkSaving ? "Saving..." : editingLink ? "Update Link" : "Add Link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
