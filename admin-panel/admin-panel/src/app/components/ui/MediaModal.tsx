"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Search, Image as ImageIcon, Trash2, Edit2, RefreshCw, Check, AlertCircle, Folder, FolderPlus, MoreVertical } from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import DeleteModal from "./DeleteModal";

interface MediaModalProps {
  onClose: () => void;
  onSelect: (urls: string | string[]) => void;
  multiple?: boolean;
}

export default function MediaModal({ onClose, onSelect, multiple = false }: MediaModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  
  // Folder Management State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  const [deleteFolderTarget, setDeleteFolderTarget] = useState<any>(null);
  const [deleteImageTarget, setDeleteImageTarget] = useState<any>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { showToast } = useToast();

  const fetchFolders = async () => {
    setLoadingFolders(true);
    try {
      const data = await service.getMediaFolders();
      if (data.success) {
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await service.getMediaList({ 
        limit: 100, 
        search,
        folderId: selectedFolderId 
      });
      if (data.success) {
        setMediaList(data.media || []);
      }
    } catch (error) {
      showToast("Failed to fetch media library", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (activeTab === "library") {
      fetchMedia();
    }
  }, [activeTab, search, selectedFolderId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return setIsCreatingFolder(false);
    try {
      await service.createMediaFolder(newFolderName.trim());
      showToast("Folder created", "success");
      setNewFolderName("");
      setIsCreatingFolder(false);
      fetchFolders();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to create folder", "error");
    }
  };

  const handleUpdateFolder = async () => {
    if (!editFolderName.trim() || !editingFolderId) return setEditingFolderId(null);
    try {
      await service.updateMediaFolder(editingFolderId, editFolderName.trim());
      showToast("Folder renamed", "success");
      setEditingFolderId(null);
      fetchFolders();
    } catch (err: any) {
      showToast("Failed to rename folder", "error");
    }
  };

  const triggerDeleteFolder = (folder: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteFolderTarget(folder);
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    setIsDeletingFolder(true);
    try {
      await service.deleteMediaFolder(deleteFolderTarget._id);
      showToast("Folder deleted", "success");
      if (selectedFolderId === deleteFolderTarget._id) setSelectedFolderId(null);
      fetchFolders();
      fetchMedia();
      setDeleteFolderTarget(null);
    } catch (err) {
      showToast("Failed to delete folder", "error");
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await service.syncCloudinaryMedia();
      showToast(`Synced ${res.importedCount} images from Cloudinary`, "success");
      fetchMedia();
    } catch (err) {
      showToast("Sync failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = (url: string) => {
    if (multiple) {
      if (selectedUrls.includes(url)) {
        setSelectedUrls((prev) => prev.filter((u) => u !== url));
      } else {
        setSelectedUrls((prev) => [...prev, url]);
      }
    } else {
      setSelectedUrls([url]);
    }
  };

  const confirmSelection = () => {
    if (selectedUrls.length === 0) {
      showToast("No image selected", "error");
      return;
    }
    if (multiple) {
      onSelect(selectedUrls);
    } else {
      onSelect(selectedUrls[0]);
    }
    onClose();
  };

  // Upload New Files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const filesArray = Array.from(files);
      const res = await service.uploadMediaFiles(filesArray, selectedFolderId);
      
      showToast(`Successfully uploaded ${res.count || 1} images`, "success");
      if (res.files) {
        const newUrls = res.files.map((f: any) => f.url);
        setSelectedUrls(multiple ? [...selectedUrls, ...newUrls] : [newUrls[0]]);
      } else if (res.url) {
        setSelectedUrls(multiple ? [...selectedUrls, res.url] : [res.url]);
      }
      
      setActiveTab("library");
      fetchMedia();
    } catch (err) {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Edit / Replace Image
  const handleReplaceImage = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await service.updateMedia(id, file);
      showToast("Image replaced successfully! Old image deleted.", "success");
      fetchMedia();
    } catch (err) {
      showToast("Failed to replace image", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const triggerDeleteImage = (media: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteImageTarget(media);
  };

  const confirmDeleteImage = async () => {
    if (!deleteImageTarget) return;
    setIsDeletingImage(true);
    try {
      await service.deleteMediaById(deleteImageTarget._id);
      showToast("Image deleted permanently", "success");
      if (selectedUrls.includes(deleteImageTarget.url)) {
        setSelectedUrls((prev) => prev.filter((u) => u !== deleteImageTarget.url));
      }
      fetchMedia();
      setDeleteImageTarget(null);
    } catch (err) {
      showToast("Failed to delete image", "error");
    } finally {
      setIsDeletingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-border-theme">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-theme bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Media Library</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-hover-theme transition text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar: Folders */}
          <div className="w-64 border-r border-border-theme bg-background flex flex-col hidden md:flex">
            <div className="p-4 border-b border-border-theme flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Folders</h3>
              <button 
                onClick={() => setIsCreatingFolder(true)} 
                className="p-1.5 hover:bg-hover-theme text-primary rounded-lg transition"
                title="New Folder"
              >
                <FolderPlus size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                  selectedFolderId === null ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-hover-theme"
                }`}
              >
                <Folder size={18} className={selectedFolderId === null ? "fill-primary/20" : ""} />
                All Images
              </button>

              {isCreatingFolder && (
                <div className="px-3 py-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Folder name..."
                    className="w-full text-sm border-b-2 border-primary outline-none bg-transparent py-1"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    onBlur={handleCreateFolder}
                  />
                </div>
              )}

              {folders.map(folder => (
                <div key={folder._id} className="group relative">
                  {editingFolderId === folder._id ? (
                    <div className="px-3 py-2">
                      <input
                        autoFocus
                        type="text"
                        className="w-full text-sm border-b-2 border-primary outline-none bg-transparent py-1"
                        value={editFolderName}
                        onChange={(e) => setEditFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder()}
                        onBlur={handleUpdateFolder}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedFolderId(folder._id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                        selectedFolderId === folder._id ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-hover-theme"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Folder size={18} className={selectedFolderId === folder._id ? "fill-primary/20 text-primary" : "text-slate-400"} />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 flex items-center">
                        <div 
                          className="p-1 hover:bg-primary/20 rounded text-primary transition mr-1"
                          onClick={(e) => { e.stopPropagation(); setEditFolderName(folder.name); setEditingFolderId(folder._id); }}
                        >
                          <Edit2 size={14} />
                        </div>
                        <div 
                          className="p-1 hover:bg-red-500/20 rounded text-red-500 transition"
                          onClick={(e) => triggerDeleteFolder(folder, e)}
                        >
                          <Trash2 size={14} />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background relative">
            
            {/* Tabs */}
            <div className="flex px-6 border-b border-border-theme">
              <button
                onClick={() => setActiveTab("library")}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition ${
                  activeTab === "library" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Library
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition ${
                  activeTab === "upload" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Upload New
              </button>
            </div>

            {/* Library Tab */}
            {activeTab === "library" && (
              <div className="flex flex-col h-full">
                {/* Toolbar */}
                <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-border-theme">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search images..."
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border-theme bg-card focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSync}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-border-theme rounded-xl hover:bg-hover-theme transition"
                      title="Import existing Cloudinary images"
                    >
                      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                      <span>Sync Cloudinary</span>
                    </button>
                  </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loading && mediaList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <RefreshCw size={32} className="animate-spin mb-4" />
                      <p className="font-medium">Loading media...</p>
                    </div>
                  ) : mediaList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <ImageIcon size={48} className="mb-4 opacity-50" />
                      <p className="font-medium">No images found in this folder</p>
                      <button onClick={() => setActiveTab("upload")} className="mt-4 px-6 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition">
                        Upload some images
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {mediaList.map((media) => {
                        const isSelected = selectedUrls.includes(media.url);
                        return (
                          <div
                            key={media._id}
                            onClick={() => handleSelectImage(media.url)}
                            className={`relative group aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition ${
                              isSelected ? "border-primary shadow-lg shadow-primary/20" : "border-border-theme hover:border-slate-300"
                            }`}
                          >
                            <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                            
                            {/* Selection Overlay */}
                            <div className={`absolute inset-0 transition-opacity ${isSelected ? "bg-primary/20" : "bg-black/40 opacity-0 group-hover:opacity-100"}`}>
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-md">
                                  <Check size={16} />
                                </div>
                              )}
                              
                              {/* Hover Actions */}
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <label
                                  className="flex-1 bg-white text-slate-900 p-2 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Replace Image (Deletes Old)"
                                >
                                  <Edit2 size={16} />
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleReplaceImage(media._id, e)} />
                                </label>
                                <button
                                  onClick={(e) => triggerDeleteImage(media, e)}
                                  className="flex-1 bg-red-500 text-white p-2 rounded-lg flex items-center justify-center hover:bg-red-600 shadow-sm"
                                  title="Delete Image"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                              <p className="text-[10px] text-white font-medium truncate">{media.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
                <div className="absolute top-6 text-sm font-bold text-slate-400">
                  Uploading to: <span className="text-primary">{selectedFolderId ? folders.find(f => f._id === selectedFolderId)?.name || 'Folder' : 'All Images (Root)'}</span>
                </div>
                <label className={`w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition mt-8 ${uploading ? "border-primary bg-primary/5 pointer-events-none" : "border-border-theme bg-hover-theme/30 hover:border-primary hover:bg-primary/5"}`}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    disabled={uploading}
                  />
                  
                  {uploading ? (
                    <div className="flex flex-col items-center text-primary">
                      <RefreshCw size={48} className="animate-spin mb-4" />
                      <h3 className="text-xl font-bold">Uploading...</h3>
                      <p className="text-sm font-medium mt-2">Please wait while your files are processed</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                        <Upload size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">Click or Drag images here</h3>
                      <p className="text-sm font-medium mt-2">Supports JPG, PNG, WEBP</p>
                    </div>
                  )}
                </label>
                <div className="mt-8 flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl max-w-2xl">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="text-sm font-medium">
                    Uploading new images will instantly add them to your selected folder. You can upload multiple images at once. To replace an existing image and delete the old one automatically, go to the Library tab and use the Edit button on an image.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-theme bg-background flex items-center justify-between z-10">
          <div className="text-sm font-bold text-slate-500">
            {selectedUrls.length} image{selectedUrls.length !== 1 && "s"} selected
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-hover-theme transition">
              Cancel
            </button>
            <button
              onClick={confirmSelection}
              disabled={selectedUrls.length === 0}
              className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {multiple ? "Insert Selected" : "Use Image"}
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={!!deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
        onConfirm={confirmDeleteFolder}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? Images inside it will be moved to 'All Images' (Root)."
        itemName={deleteFolderTarget?.name}
        isLoading={isDeletingFolder}
      />

      <DeleteModal
        isOpen={!!deleteImageTarget}
        onClose={() => setDeleteImageTarget(null)}
        onConfirm={confirmDeleteImage}
        title="Delete Image Permanently"
        description="Are you sure you want to permanently delete this image from Cloudinary? This action cannot be undone."
        itemName={deleteImageTarget?.name}
        isLoading={isDeletingImage}
      />
    </div>
  );
}
