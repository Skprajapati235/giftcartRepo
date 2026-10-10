"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import FooterNavTabs from "../../components/footer/FooterNavTabs";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import { FileText, Save, RefreshCw, Plus, X, CreditCard, Sparkles } from "lucide-react";

export default function FooterBottomPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bottom, setBottom] = useState({
    copyrightText: "© {year} GiftFestive. All rights reserved. Founded with love for celebrations.",
    paymentMethods: ["UPI", "Cards", "NetBanking", "Cash on Delivery"],
    taglineBadge: "100% Safe & Secure • Made with ❤️",
  });

  const [newPayment, setNewPayment] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data && res.data.bottomStrip) {
        setBottom({
          copyrightText:
            res.data.bottomStrip.copyrightText ||
            "© {year} GiftFestive. All rights reserved. Founded with love for celebrations.",
          paymentMethods: res.data.bottomStrip.paymentMethods || ["UPI", "Cards", "NetBanking", "Cash on Delivery"],
          taglineBadge: res.data.bottomStrip.taglineBadge || "100% Safe & Secure • Made with ❤️",
        });
      }
    } catch (err: any) {
      showToast("Failed to load bottom strip settings", "error");
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
      await service.updateFooterBottom(bottom);
      showToast("Bottom strip & legal settings updated!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save bottom settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const addPaymentMethod = () => {
    if (!newPayment.trim()) return;
    if (bottom.paymentMethods.includes(newPayment.trim())) {
      showToast("Payment method already listed", "warning");
      return;
    }
    setBottom({
      ...bottom,
      paymentMethods: [...bottom.paymentMethods, newPayment.trim()],
    });
    setNewPayment("");
  };

  const removePaymentMethod = (idx: number) => {
    setBottom({
      ...bottom,
      paymentMethods: bottom.paymentMethods.filter((_, i) => i !== idx),
    });
  };

  const previewCopyright = (bottom.copyrightText || "").replace("{year}", new Date().getFullYear().toString());

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadData} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <FileText className="text-emerald-500" size={24} /> Bottom Strip &amp; Legal Metadata
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize copyright text, accepted payment badge tags, and security badges shown at the very bottom of the storefront.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Copyright & Tagline Card */}
              <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={16} /> Copyright &amp; Legal Line
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Copyright Text Template</label>
                  <input
                    type="text"
                    required
                    value={bottom.copyrightText}
                    onChange={(e) => setBottom({ ...bottom, copyrightText: e.target.value })}
                    className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                    placeholder="© {year} GiftFestive. All rights reserved."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Use <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{`{year}`}</code> to dynamically insert the current calendar year automatically.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Security / Trust Badge Line</label>
                  <input
                    type="text"
                    value={bottom.taglineBadge}
                    onChange={(e) => setBottom({ ...bottom, taglineBadge: e.target.value })}
                    className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                    placeholder="100% Safe & Secure • Made with ❤️"
                  />
                </div>
              </div>

              {/* Payment Methods Badges */}
              <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="text-blue-500" size={16} /> Accepted Payment Badges
                </h3>
                <p className="text-xs text-muted-foreground">
                  Badges displayed on the bottom right corner of the website footer (e.g. UPI, Cards, NetBanking, COD).
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {bottom.paymentMethods.map((pm, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted/60 border border-border-theme text-foreground"
                    >
                      <span>{pm}</span>
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(idx)}
                        className="text-muted-foreground hover:text-rose-500 transition"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm pt-2">
                  <input
                    type="text"
                    value={newPayment}
                    onChange={(e) => setNewPayment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPaymentMethod();
                      }
                    }}
                    placeholder="e.g. Razorpay, EMI, Wallets"
                    className="flex-1 bg-muted/40 border border-border-theme rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={addPaymentMethod}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                  >
                    <Plus size={14} /> Add Badge
                  </button>
                </div>
              </div>

              {/* Live Preview Bar */}
              <div className="bg-[#14020d] border border-white/10 rounded-2xl p-4 text-white space-y-2 shadow-xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live Footer Bottom Preview</p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 pt-1">
                  <p>{previewCopyright}</p>
                  <div className="flex items-center gap-2 font-medium">
                    {bottom.paymentMethods.map((pm, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]">
                        {pm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? "Saving..." : "Save Bottom Strip Settings"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
