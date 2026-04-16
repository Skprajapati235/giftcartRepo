"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CityList from "./cityList";
import AddEditCity from "./addEditCity";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this city group?")) {
      try {
        await service.deleteCity(id);
        refresh();
      } catch (err) {
        alert("Failed to delete city group");
      }
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
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
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
