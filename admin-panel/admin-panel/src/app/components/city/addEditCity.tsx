"use client";

import React, { useState } from "react";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import * as service from "../../services/adminService";

interface AddEditCityProps {
  city: any;
  onClose: () => void;
}

export default function AddEditCity({ city, onClose }: AddEditCityProps) {
  const { createCity, updateCity } = useAdmin();
  const [stateName, setStateName] = useState(city?.state || "");
  const [image, setImage] = useState(city?.image || "");
  const [cityInputs, setCityInputs] = useState<string[]>(city?.cities?.length ? city.cities : [""]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      // Delete old image if exists
      if (image) {
        await service.deleteImage(image).catch(() => {});
      }
      const file = event.target.files[0];
      const data = await service.uploadImage(file);
      setImage(data.url);
    } catch (err: any) {
      console.error("Upload failed", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCityChange = (index: number, value: string) => {
    setCityInputs((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addCityField = () => {
    setCityInputs((prev) => [...prev, ""]);
  };

  const removeCityField = (index: number) => {
    setCityInputs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cities = cityInputs.map((value) => value.trim()).filter(Boolean);
    if (!stateName.trim() || cities.length === 0) return;
    setSaving(true);
    try {
      const payload = { state: stateName.trim(), cities, image };
      if (city?._id) {
        await updateCity(city._id, payload);
      } else {
        await createCity(payload);
      }
      onClose();
    } catch (err) {
      console.error("Error saving city group.", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card rounded-3xl border border-border-theme p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">{city?._id ? "Update City Group" : "New City Group"}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <form className="grid gap-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">State</label>
            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g. Rajasthan"
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">State Image</label>
            <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
              {image ? (
                <>
                  <img src={image} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold">
                      Change
                      <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400">
                  <Upload size={24} />
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">City list</p>
              <p className="text-xs text-slate-500">Add one or more cities for this state.</p>
            </div>
            <button type="button" onClick={addCityField} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition">
              <Plus size={16} />
              Add more
            </button>
          </div>

          <div className="space-y-4">
            {cityInputs.map((value, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  value={value}
                  onChange={(e) => handleCityChange(index, e.target.value)}
                  placeholder={`City ${index + 1}`}
                  className="flex-1 rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                  required
                />
                {cityInputs.length > 1 && (
                  <button type="button" onClick={() => removeCityField(index)} className="rounded-full border border-border-theme bg-white p-3 text-slate-500 hover:text-rose-600 transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto border border-border-theme text-slate-700 rounded-2xl px-6 py-4 font-bold hover:bg-hover-theme transition"
          >
            Cancel
          </button>
          <button
            disabled={saving || uploadingImage}
            className="w-full sm:flex-1 bg-primary text-white rounded-2xl py-4 font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Processing..." : city?._id ? "Update City Group" : "Create City Group"}
          </button>
        </div>
      </form>
    </section>
  );
}
