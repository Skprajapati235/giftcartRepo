"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import FooterNavTabs from "../../components/footer/FooterNavTabs";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import {
  Phone,
  Mail,
  MapPin,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Share2,
  Building,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function FooterBrandPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [brand, setBrand] = useState<any>({
    brandName: "GiftFestive",
    logoUrl: "/images/websitelogoimages.png",
    tagline: "Making celebrations unforgettable with artisanal cakes, farm-fresh flowers, and personalized gifts curated with pure warmth and care.",
    phone: "+91 84007 87712",
    phoneLabel: "+91 84007 87712 (WhatsApp / Call)",
    whatsappUrl: "https://wa.me/918400787712",
    email: "support@giftfestive.in",
    address: "Sector 15, Faridabad, Haryana – 121001",
    mapUrl: "https://maps.google.com/?q=Faridabad",
    socialLinks: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data && res.data.brand) {
        setBrand({
          ...res.data.brand,
          socialLinks: res.data.brand.socialLinks || [],
        });
      }
    } catch (err: any) {
      showToast("Failed to load brand & contact information", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await service.updateFooterBrand(brand);
      showToast("Brand & contact information saved successfully!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update brand information", "error");
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setBrand((prev: any) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "instagram", url: "https://instagram.com/giftfestive", icon: "instagram", isActive: true },
      ],
    }));
  };

  const updateSocialLink = (idx: number, field: string, val: any) => {
    setBrand((prev: any) => {
      const copy = [...prev.socialLinks];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, socialLinks: copy };
    });
  };

  const removeSocialLink = (idx: number) => {
    setBrand((prev: any) => {
      const copy = prev.socialLinks.filter((_: any, i: number) => i !== idx);
      return { ...prev, socialLinks: copy };
    });
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadData} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <Building className="text-pink-500" size={24} /> Brand &amp; Contact Details
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize the company identity, logo, phone, WhatsApp direct URL, email, address, and official social channels.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
                {/* Brand Identity Card */}
                <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="text-pink-500" size={16} /> Store Branding
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={brand.brandName || ""}
                        onChange={(e) => setBrand({ ...brand, brandName: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="GiftFestive"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Logo URL / Image Path</label>
                      <input
                        type="text"
                        value={brand.logoUrl || ""}
                        onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="/images/websitelogoimages.png"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Footer Brand Tagline / Pitch</label>
                    <textarea
                      rows={2}
                      value={brand.tagline || ""}
                      onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                      placeholder="Making celebrations unforgettable with artisanal cakes, farm-fresh flowers..."
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Short description displayed directly below the logo in the website footer.
                    </p>
                  </div>
                </div>

                {/* Direct Contact Channels Card */}
                <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Phone className="text-amber-500" size={16} /> Contact Information &amp; Direct Support
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Phone Number</label>
                      <input
                        type="text"
                        value={brand.phone || ""}
                        onChange={(e) => setBrand({ ...brand, phone: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="+91 84007 87712"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Phone Display Label</label>
                      <input
                        type="text"
                        value={brand.phoneLabel || ""}
                        onChange={(e) => setBrand({ ...brand, phoneLabel: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="+91 84007 87712 (WhatsApp / Call)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MessageCircle className="text-emerald-500" size={13} /> WhatsApp Direct Link
                      </label>
                      <input
                        type="text"
                        value={brand.whatsappUrl || ""}
                        onChange={(e) => setBrand({ ...brand, whatsappUrl: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="https://wa.me/918400787712"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Mail className="text-rose-500" size={13} /> Support Email
                      </label>
                      <input
                        type="email"
                        value={brand.email || ""}
                        onChange={(e) => setBrand({ ...brand, email: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="support@giftfestive.in"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="text-cyan-500" size={13} /> Store Address / City
                      </label>
                      <input
                        type="text"
                        value={brand.address || ""}
                        onChange={(e) => setBrand({ ...brand, address: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="Sector 15, Faridabad, Haryana – 121001"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Google Maps URL</label>
                      <input
                        type="text"
                        value={brand.mapUrl || ""}
                        onChange={(e) => setBrand({ ...brand, mapUrl: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500 transition"
                        placeholder="https://maps.google.com/?q=Faridabad"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links Card */}
                <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="text-purple-500" size={16} /> Official Social Channels
                    </h3>
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="flex items-center gap-1.5 text-xs font-bold text-pink-500 hover:text-pink-600 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-xl transition"
                    >
                      <Plus size={14} /> Add Social Link
                    </button>
                  </div>

                  {brand.socialLinks?.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">No social media links configured yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {brand.socialLinks.map((s: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border-theme"
                        >
                          <select
                            value={s.platform || "instagram"}
                            onChange={(e) => updateSocialLink(idx, "platform", e.target.value)}
                            className="w-full sm:w-36 bg-card-theme border border-border-theme rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="youtube">YouTube</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="pinterest">Pinterest</option>
                          </select>

                          <input
                            type="url"
                            value={s.url || ""}
                            onChange={(e) => updateSocialLink(idx, "url", e.target.value)}
                            placeholder="https://..."
                            className="flex-1 w-full bg-card-theme border border-border-theme rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none"
                          />

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                              <input
                                type="checkbox"
                                checked={s.isActive !== false}
                                onChange={(e) => updateSocialLink(idx, "isActive", e.target.checked)}
                                className="rounded accent-pink-500"
                              />
                              <span>Active</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => removeSocialLink(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                              title="Remove link"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>{saving ? "Saving..." : "Save Brand Information"}</span>
                  </button>
                </div>
              </form>

              {/* Real-time Visual Brand Card Side Simulator */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#180510] border border-white/10 rounded-3xl p-6 text-white space-y-4 shadow-xl sticky top-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-black uppercase text-pink-400 tracking-wider">
                      Live Footer Brand Column
                    </span>
                    <span className="text-[10px] text-gray-400">Live Preview</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.brandName || "Logo"}
                          className="w-[130px] h-auto object-contain"
                          onError={(e: any) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="text-lg font-black tracking-tight text-white">
                        {brand.brandName || "GiftFestive"}
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed">
                      {brand.tagline || "Making celebrations unforgettable with artisanal cakes..."}
                    </p>

                    <div className="pt-2 border-t border-white/10 space-y-2 text-xs text-gray-300">
                      <a
                        href={brand.whatsappUrl || `https://wa.me/${(brand.phone || "").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-[#ffd166] transition-colors"
                      >
                        <Phone className="text-[#ffd166] shrink-0" size={14} />
                        <span className="font-semibold">{brand.phoneLabel || brand.phone || "+91 84007 87712"}</span>
                      </a>

                      <a
                        href={`mailto:${brand.email || "support@giftfestive.in"}`}
                        className="flex items-center gap-2 hover:text-[#ffd166] transition-colors"
                      >
                        <Mail className="text-[#D82B76] shrink-0" size={14} />
                        <span>{brand.email || "support@giftfestive.in"}</span>
                      </a>

                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="text-gray-500 shrink-0" size={14} />
                        <span>{brand.address || "Sector 15, Faridabad, Haryana – 121001"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
