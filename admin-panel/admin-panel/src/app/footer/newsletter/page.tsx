"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import FooterNavTabs from "../../components/footer/FooterNavTabs";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import { Mail, Save, RefreshCw, CheckCircle, Sparkles, AlertCircle } from "lucide-react";

export default function FooterNewsletterPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newsletter, setNewsletter] = useState({
    title: "The Festive Club",
    description: "Subscribe for secret promo codes, new arrivals & festive discounts.",
    placeholder: "Enter your email...",
    buttonText: "Subscribe",
    disclaimer: "No spam. Unsubscribe anytime.",
    isEnabled: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data && res.data.newsletter) {
        setNewsletter(res.data.newsletter);
      }
    } catch (err: any) {
      showToast("Failed to load newsletter settings", "error");
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
      await service.updateFooterNewsletter(newsletter);
      showToast("Newsletter configuration updated successfully!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update newsletter", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadData} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <Mail className="text-purple-500" size={24} /> The Festive Club &amp; Newsletter
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure the subscription box in the footer that captures customer leads and emails for promo codes.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? "Saving..." : "Save Newsletter"}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Settings Form */}
              <form onSubmit={handleSave} className="lg:col-span-7 space-y-4">
                <div className="bg-card-theme border border-border-theme rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border-theme pb-3">
                    <span className="text-xs font-black uppercase text-foreground">Newsletter Box Status</span>
                    <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newsletter.isEnabled}
                        onChange={(e) => setNewsletter({ ...newsletter, isEnabled: e.target.checked })}
                        className="rounded accent-pink-500 w-4 h-4"
                      />
                      <span>{newsletter.isEnabled ? "Enabled on Footer" : "Disabled / Hidden"}</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Club / Section Headline</label>
                    <input
                      type="text"
                      required
                      value={newsletter.title}
                      onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="e.g. The Festive Club"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Subtitle / Pitch</label>
                    <textarea
                      rows={2}
                      value={newsletter.description}
                      onChange={(e) => setNewsletter({ ...newsletter, description: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="Subscribe for secret promo codes, new arrivals & festive discounts."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Input Placeholder</label>
                      <input
                        type="text"
                        value={newsletter.placeholder}
                        onChange={(e) => setNewsletter({ ...newsletter, placeholder: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                        placeholder="Enter your email..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Button Text</label>
                      <input
                        type="text"
                        value={newsletter.buttonText}
                        onChange={(e) => setNewsletter({ ...newsletter, buttonText: e.target.value })}
                        className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                        placeholder="Subscribe"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Spam Disclaimer Note</label>
                    <input
                      type="text"
                      value={newsletter.disclaimer}
                      onChange={(e) => setNewsletter({ ...newsletter, disclaimer: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                      placeholder="No spam. Unsubscribe anytime."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? "Saving..." : "Save Newsletter Settings"}</span>
                </button>
              </form>

              {/* Live Preview Side Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#180510] border border-white/10 rounded-2xl p-6 text-white space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-black uppercase text-pink-400 tracking-wider">Storefront Preview</span>
                    <span className="text-[10px] text-gray-400">Dark Luxury Theme</span>
                  </div>

                  {newsletter.isEnabled ? (
                    <div className="space-y-3">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">{newsletter.title}</h4>
                      <p className="text-gray-400 text-xs leading-relaxed">{newsletter.description}</p>
                      <div className="flex rounded-xl overflow-hidden border border-white/15 bg-white/5">
                        <input
                          disabled
                          placeholder={newsletter.placeholder}
                          className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        />
                        <button
                          disabled
                          className="bg-gradient-to-r from-[#D82B76] to-[#741343] px-3.5 text-xs font-bold text-white shrink-0"
                        >
                          {newsletter.buttonText || "Subscribe"}
                        </button>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-gray-400">
                        <CheckCircle className="text-[#4ade80]" size={12} />
                        <span>{newsletter.disclaimer}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 space-y-2">
                      <AlertCircle className="mx-auto text-amber-400" size={24} />
                      <p className="text-xs font-bold">Newsletter is disabled and hidden from the website footer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
