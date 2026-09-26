"use client";

import React, { useState } from "react";
import { Plus, SlidersHorizontal, Eye, EyeOff } from "lucide-react";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import AddEditHeroSlide from "./addEditHeroSlide";
import HeroSlideList from "./heroSlideList";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";

export default function HeroSlideView() {
  const {
    data: slides,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh,
  } = useResource<any>(service.getHeroSlides, "heroSlides");

  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingSlide(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSlide(null);
    refresh();
  };

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    setShowForm(true);
  };

  const handleToggleActive = async (slide: any) => {
    try {
      const newStatus = slide.isActive === false ? true : false;
      await service.updateHeroSlide(slide._id, { isActive: newStatus });
      showToast(
        `Slide is now ${newStatus ? "visible on mobile" : "hidden"}`,
        "success"
      );
      refresh();
    } catch {
      showToast("Failed to update slide status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await service.deleteHeroSlide(deleteId);
      showToast("Hero slide deleted successfully", "success");
      refresh();
      setDeleteId(null);
    } catch {
      showToast("Failed to delete hero slide", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = slides.filter((s: any) => s.isActive !== false).length;
  const inactiveCount = slides.length - activeCount;

  return (
    <>
      {/* Header and Quick Stats */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <SlidersHorizontal className="text-primary" size={26} />
            Hero Slides
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage top promotional banners and featured carousels displayed on the Mobile App Home Screen.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus size={18} />
            Add New Slide
          </button>
        )}
      </div>

      {/* Quick KPI stats row */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-2xl border border-border-theme p-4 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Total Slides</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{total}</div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border-theme p-4 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Eye size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Active on App</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeCount}</div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border-theme p-4 flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
              <EyeOff size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Hidden / Inactive</div>
              <div className="text-xl font-extrabold text-slate-600 dark:text-slate-300">{inactiveCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main View: Form or List */}
      {showForm ? (
        <AddEditHeroSlide slide={editingSlide} onClose={closeForm} />
      ) : (
        <HeroSlideList
          slides={slides}
          loading={loading}
          total={total}
          totalPages={totalPages}
          currentPage={params.page}
          searchTerm={params.search}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteId}
        title="Delete Hero Slide"
        description="Are you sure you want to remove this hero slide? It will immediately stop appearing on the mobile app home screen."
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </>
  );
}
