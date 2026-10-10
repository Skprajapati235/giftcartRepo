"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import FooterNavTabs from "../../components/footer/FooterNavTabs";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import {
  Globe,
  Save,
  RefreshCw,
  Star,
  Building,
  MapPin,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code2,
  Sparkles,
} from "lucide-react";

export default function FooterSeoPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [seo, setSeo] = useState({
    organizationName: "GiftFestive",
    founderName: "Sonu Prajapati",
    telephone: "+91 98765 43210",
    email: "support@giftfestive.in",
    addressLocality: "Faridabad",
    addressRegion: "Haryana",
    postalCode: "121001",
    addressCountry: "IN",
    googleReviewsRating: "4.9",
    googleReviewsCount: "500+",
    googleReviewsUrl: "https://www.google.com/search?q=GiftFestive+Faridabad+Reviews",
    richSnippetsEnabled: true,
    seoKeywords: [
      "Online cake delivery Faridabad",
      "Surprise gift service",
      "Flower bouquet Faridabad",
      "Midnight cake delivery",
    ],
    keywordsInput: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data && res.data.seo) {
        const s = res.data.seo;
        setSeo({
          ...s,
          keywordsInput: Array.isArray(s.seoKeywords) ? s.seoKeywords.join(", ") : "",
        });
      }
    } catch (err: any) {
      showToast("Failed to load footer SEO metadata", "error");
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
      const parsedKeywords = seo.keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        ...seo,
        seoKeywords: parsedKeywords,
      };

      await service.updateFooterSeo(payload);
      showToast("Footer SEO & Schema settings saved successfully!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update footer SEO", "error");
    } finally {
      setSaving(false);
    }
  };

  // Generate dynamic JSON-LD representation
  const generatedJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seo.organizationName || "GiftFestive",
    founder: seo.founderName || "Sonu Prajapati",
    telephone: seo.telephone || "+91 98765 43210",
    email: seo.email || "support@giftfestive.in",
    address: {
      "@type": "PostalAddress",
      addressLocality: seo.addressLocality || "Faridabad",
      addressRegion: seo.addressRegion || "Haryana",
      postalCode: seo.postalCode || "121001",
      addressCountry: seo.addressCountry || "IN",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: seo.googleReviewsRating || "4.9",
      reviewCount: (seo.googleReviewsCount || "500").replace("+", ""),
      bestRating: "5",
      worstRating: "1",
    },
    url: "https://www.giftfestive.com",
    priceRange: "₹₹",
    servesCuisine: "Bakery & Desserts",
  };

  const copyJsonLd = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedJsonLd, null, 2));
    setCopied(true);
    showToast("Schema JSON-LD copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadData} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
                <Globe className="text-cyan-500" size={24} /> Footer SEO &amp; Schema Generator
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Optimize search engine visibility, Google LocalBusiness rich snippets, and Google Maps reviews rating integration.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? "Saving..." : "Save SEO Schema"}</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <RefreshCw className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Google Reviews Badge Settings */}
              <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Star className="text-amber-500" size={16} /> Google Reviews &amp; Rating Trust Snippet
                </h3>
                <p className="text-xs text-muted-foreground">
                  Displays in the footer navigation column linking visitors directly to your verified Google My Business customer reviews.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Rating Score (Out of 5)</label>
                    <input
                      type="text"
                      value={seo.googleReviewsRating}
                      onChange={(e) => setSeo({ ...seo, googleReviewsRating: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="4.9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Review Count Badge</label>
                    <input
                      type="text"
                      value={seo.googleReviewsCount}
                      onChange={(e) => setSeo({ ...seo, googleReviewsCount: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="500+"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Google Reviews Link</label>
                    <input
                      type="text"
                      value={seo.googleReviewsUrl}
                      onChange={(e) => setSeo({ ...seo, googleReviewsUrl: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-pink-500"
                      placeholder="https://www.google.com/search?q=..."
                    />
                  </div>
                </div>
              </div>

              {/* Organization & Location Schema */}
              <div className="bg-card-theme border border-border-theme rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Building className="text-cyan-500" size={16} /> LocalBusiness Structured Data Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Organization Legal Name</label>
                    <input
                      type="text"
                      value={seo.organizationName}
                      onChange={(e) => setSeo({ ...seo, organizationName: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Founder Name</label>
                    <input
                      type="text"
                      value={seo.founderName}
                      onChange={(e) => setSeo({ ...seo, founderName: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">City / Locality</label>
                    <input
                      type="text"
                      value={seo.addressLocality}
                      onChange={(e) => setSeo({ ...seo, addressLocality: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">State / Region</label>
                    <input
                      type="text"
                      value={seo.addressRegion}
                      onChange={(e) => setSeo({ ...seo, addressRegion: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Postal Code / PIN</label>
                    <input
                      type="text"
                      value={seo.postalCode}
                      onChange={(e) => setSeo({ ...seo, postalCode: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Country Code</label>
                    <input
                      type="text"
                      value={seo.addressCountry}
                      onChange={(e) => setSeo({ ...seo, addressCountry: e.target.value })}
                      className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-foreground">Target SEO Keywords (Comma Separated)</label>
                  <textarea
                    rows={2}
                    value={seo.keywordsInput}
                    onChange={(e) => setSeo({ ...seo, keywordsInput: e.target.value })}
                    className="w-full bg-muted/40 border border-border-theme rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none"
                    placeholder="Online cake delivery Faridabad, Surprise gift service, Midnight delivery"
                  />
                </div>
              </div>

              {/* Dynamic JSON-LD Live Preview */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl text-white space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="text-cyan-400" size={18} />
                    <span className="text-xs font-bold tracking-wider uppercase text-cyan-400">
                      Live Google Schema JSON-LD Code
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://search.google.com/test/rich-results"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-white transition"
                    >
                      <span>Google Rich Test</span>
                      <ExternalLink size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={copyJsonLd}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 transition text-white"
                    >
                      {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copied ? "Copied!" : "Copy JSON-LD"}</span>
                    </button>
                  </div>
                </div>

                <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 p-2 bg-black/40 rounded-xl leading-relaxed">
                  {JSON.stringify(generatedJsonLd, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md shadow-pink-500/20 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? "Saving..." : "Save Footer SEO & Schema"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}
