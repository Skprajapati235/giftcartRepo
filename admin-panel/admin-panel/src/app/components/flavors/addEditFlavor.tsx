"use client";

import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import * as service from "../../services/adminService";
import { useAdmin } from "../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";

interface AddEditFlavorProps {
  flavor: any;
  onClose: () => void;
}

export default function AddEditFlavor({ flavor, onClose }: AddEditFlavorProps) {
  const { createFlavor, updateFlavor } = useAdmin();
  const { showToast } = useToast();
  const [name, setName] = useState(flavor?.name || "");
  const [image, setImage] = useState(flavor?.image || "");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      if (image) {
        await service.deleteImage(image).catch(() => {});
      }
      const file = event.target.files[0];
      const data = await service.uploadImage(file);
      setImage(data.url);
      showToast("Image uploaded!", "success");
    } catch (err: any) {
      showToast("Upload failed", "error");
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
      if (flavor?._id) {
        await updateFlavor(flavor._id, payload);
        showToast("Flavor updated!", "success");
      } else {
        await createFlavor(payload);
        showToast("Flavor created!", "success");
      }
      onClose();
    } catch (err) {
      showToast("Failed to save flavor", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-card rounded-3xl border border-border-theme p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">{flavor?._id ? "Update Flavor" : "New Flavor"}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <form className="grid gap-8 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Flavor Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="e.g. Chocolate, Vanilla, Red Velvet..."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Flavor Image (Optional)</label>
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

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 md:col-span-2">
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
            {saving ? "Processing..." : flavor?._id ? "Update Flavor" : "Create Flavor"}
          </button>
        </div>
      </form>
    </section>
  );
}
