"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CityList from "./cityList";
import AddEditCity from "./addEditCity";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import DeleteModal from "../ui/DeleteModal";
import { useToast } from "../../../context/ToastContext";

export default function CityView() {
  const {
    data: cities,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getCities, "cities");

  const [editingCity, setEditingCity] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const openForm = () => {
    setEditingCity(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCity(null);
    refresh();
  };

  const handleEdit = (city: any) => {
    setEditingCity(city);
    setShowForm(true);
  };

  const triggerDelete = (city: any) => {
    setCityToDelete(city);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cityToDelete) return;
    setDeleting(true);
    try {
      await service.deleteCity(cityToDelete._id);
      showToast("City group deleted successfully", "success");
      refresh();
      setDeleteModalOpen(false);
    } catch (error) {
      showToast("Failed to delete city group", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground mt-1">Cities</h1>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add City Group
          </button>
        )}
      </div>

      {showForm ? (
        <AddEditCity city={editingCity} onClose={closeForm} />
      ) : (
        <CityList
          cities={cities}
          loading={loading}
          total={total}
          totalPages={totalPages}
          currentPage={params.page}
          searchTerm={params.search}
          onPageChange={onPageChange}
          onSearchChange={onSearchChange}
          onEdit={handleEdit}
          onDelete={triggerDelete}
        />
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete City Group"
        itemName={cityToDelete?.state}
        isLoading={deleting}
      />
    </>
  );
}
