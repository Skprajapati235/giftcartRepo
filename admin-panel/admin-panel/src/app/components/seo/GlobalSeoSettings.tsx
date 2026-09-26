"use client";

import React, { useEffect, useState } from "react";
import {
  Globe,
  Share2,
  Search,
  Building2,
  Save,
  RefreshCw,
  Upload,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Bot,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";
import MediaModal from "../ui/MediaModal";
import SerpPreview from "./SerpPreview";
import SocialCardPreview from "./SocialCardPreview";

export default function GlobalSeoSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "social" | "analytics" | "organization" | "robots">("general");
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    siteName: "GiftFestive",
    defaultTitle: "",
    titleTemplate: "%s | GiftFestive",
    defaultDescription: "",
    defaultKeywords: [] as string[],
    keywordsInput: "",
    siteUrl: "https://giftfestive.com",
    defaultOgImage: "",
    twitterHandle: "@giftfestive",
    twitterCardType: "summary_large_image",
    googleSiteVerification: "",
    bingSiteVerification: "",
    pinterestVerification: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    robotsCustomRules: "",
    organization: {
      legalName: "GiftFestive",
      founder: "Sonu Prajapati",
      telephone: "+91-9999999999",
      email: "support@giftfestive.com",
      logoUrl: "https://giftfestive.com/icon-512.png",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      streetAddress: "Sector 15",
      addressLocality: "Faridabad",
      addressRegion: "Haryana",
      postalCode: "121001",
      addressCountry: "IN",
      geoLatitude: 28.4089,
      geoLongitude: 77.3178,
      openingHours: "Mo-Su 08:00-23:00",
      socialLinks: [] as string[],
      socialLinksInput: "",
    },
  });

  const fetchGlobal = async () => {
    setLoading(true);
    try {
      const res = await service.getSeoGlobal();
      if (res && res.data) {
        const data = res.data;
        setFormData({
          ...data,
          keywordsInput: Array.isArray(data.defaultKeywords) ? data.defaultKeywords.join(", ") : "",
          organization: {
            ...data.organization,
            socialLinksInput: Array.isArray(data.organization?.socialLinks)
              ? data.organization.socialLinks.join("\n")
              : "",
          },
        });
      }
    } catch (err: any) {
      showToast("Failed to load global SEO settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobal();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedKeywords = (formData.keywordsInput || "")
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean);

      const parsedSocial = (formData.organization?.socialLinksInput || "")
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        defaultKeywords: parsedKeywords,
        organization: {
          ...formData.organization,
          socialLinks: parsedSocial,
        },
      };

      await service.updateSeoGlobal(payload);
      showToast("Global SEO settings saved successfully!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update SEO settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Globe className="text-primary" size={28} /> Global SEO & Schema Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure global website meta defaults, search engine verification keys, OpenGraph cards, and Organization JSON-LD markup.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border-theme pb-3">
        {[
          { key: "general", label: "General Defaults", icon: Globe },
          { key: "social", label: "Social & OpenGraph", icon: Share2 },
          { key: "analytics", label: "Webmaster & Analytics", icon: Search },
          { key: "organization", label: "Organization Schema", icon: Building2 },
          { key: "robots", label: "Robots Directives", icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border-theme text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Form & Live Preview Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
                <Globe size={18} className="text-primary" /> Store Identity & Default Meta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Site Name
                  </label>
                  <input
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="e.g. GiftFestive"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Canonical Base URL
                  </label>
                  <input
                    value={formData.siteUrl}
                    onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="https://giftfestive.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Default Meta Title
                </label>
                <input
                  value={formData.defaultTitle}
                  onChange={(e) => setFormData({ ...formData, defaultTitle: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  placeholder="e.g. GiftFestive | Faridabad Most Trusted Online Gift Delivery"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Title Template
                </label>
                <input
                  value={formData.titleTemplate}
                  onChange={(e) => setFormData({ ...formData, titleTemplate: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  placeholder="%s | GiftFestive"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Use <code>%s</code> as placeholder for individual page/product titles.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.defaultDescription}
                  onChange={(e) => setFormData({ ...formData, defaultDescription: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                  placeholder="Briefly describe your store for search engines..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Default Focus Keywords (comma-separated)
                </label>
                <input
                  value={formData.keywordsInput}
                  onChange={(e) => setFormData({ ...formData, keywordsInput: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  placeholder="giftfestive, gift delivery faridabad, cake delivery, flowers online"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL & OPENGRAPH */}
          {activeTab === "social" && (
            <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
                <Share2 size={18} className="text-primary" /> OpenGraph & Social Sharing Defaults
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Default Social Share Image (OG Image)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    value={formData.defaultOgImage}
                    onChange={(e) => setFormData({ ...formData, defaultOgImage: e.target.value })}
                    className="flex-1 bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="https://giftfestive.com/opengraph-image.png"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaModal(true)}
                    className="bg-card border border-border-theme hover:bg-hover-theme px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Upload size={14} /> Select
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ideal image dimensions: 1200 × 630 pixels (Aspect ratio 1.91:1).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Twitter / X Handle
                  </label>
                  <input
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="@giftfestive"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Twitter Card Type
                  </label>
                  <select
                    value={formData.twitterCardType}
                    onChange={(e) => setFormData({ ...formData, twitterCardType: e.target.value })}
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  >
                    <option value="summary_large_image">Summary Large Image (Recommended)</option>
                    <option value="summary">Small Summary Card</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBMASTER & ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
                <Search size={18} className="text-primary" /> Webmaster Verification & Tracking Codes
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Google Search Console Verification Token
                </label>
                <input
                  value={formData.googleSiteVerification}
                  onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                  placeholder="e.g. vF9X... (only the token content inside content='...')"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Injects <code>&lt;meta name="google-site-verification" content="..." /&gt;</code> automatically into your website.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Bing Webmaster Verification Code
                </label>
                <input
                  value={formData.bingSiteVerification}
                  onChange={(e) => setFormData({ ...formData, bingSiteVerification: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                  placeholder="e.g. 7A1C9..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Google Analytics 4 (GA4) ID
                  </label>
                  <input
                    value={formData.googleAnalyticsId}
                    onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Google Tag Manager (GTM) Container ID
                  </label>
                  <input
                    value={formData.googleTagManagerId}
                    onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Facebook / Meta Pixel ID
                </label>
                <input
                  value={formData.facebookPixelId}
                  onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                  placeholder="e.g. 123456789012345"
                />
              </div>
            </div>
          )}

          {/* TAB 4: ORGANIZATION SCHEMA */}
          {activeTab === "organization" && (
            <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
                <Building2 size={18} className="text-primary" /> Schema.org Organization & LocalBusiness
              </h3>
              <p className="text-xs text-muted-foreground">
                Search engines use this structured JSON-LD to display your business in Google Knowledge Graph and Google Maps.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Legal Business Name
                  </label>
                  <input
                    value={formData.organization?.legalName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, legalName: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Founder / Owner Name
                  </label>
                  <input
                    value={formData.organization?.founder || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, founder: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Customer Support Phone
                  </label>
                  <input
                    value={formData.organization?.telephone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, telephone: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Support Email
                  </label>
                  <input
                    value={formData.organization?.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, email: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">City</label>
                  <input
                    value={formData.organization?.addressLocality || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, addressLocality: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">State</label>
                  <input
                    value={formData.organization?.addressRegion || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, addressRegion: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                    Postal Code
                  </label>
                  <input
                    value={formData.organization?.postalCode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: { ...formData.organization, postalCode: e.target.value },
                      })
                    }
                    className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Official Social Profile Links (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.organization?.socialLinksInput || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organization: { ...formData.organization, socialLinksInput: e.target.value },
                    })
                  }
                  className="w-full bg-background border border-border-theme rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition resize-none font-mono text-xs"
                  placeholder="https://www.instagram.com/giftfestive&#10;https://www.facebook.com/giftfestive"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ROBOTS DIRECTIVES */}
          {activeTab === "robots" && (
            <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
                <Bot size={18} className="text-primary" /> Robots.txt Custom Directives
              </h3>
              <p className="text-xs text-muted-foreground">
                Add custom crawl rules or disallow directives that will be appended to the dynamic robots.txt.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
                  Custom Robots Rules
                </label>
                <textarea
                  rows={6}
                  value={formData.robotsCustomRules || ""}
                  onChange={(e) => setFormData({ ...formData, robotsCustomRules: e.target.value })}
                  className="w-full bg-background border border-border-theme rounded-xl p-4 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                  placeholder={`User-agent: BadBot\nDisallow: /\n\nUser-agent: *\nCrawl-delay: 5`}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? "Saving Changes..." : "Save SEO Settings"}
            </button>
          </div>
        </div>

        {/* Right Column: Live Previews */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6 space-y-6">
            <SerpPreview
              title={formData.defaultTitle || formData.siteName}
              description={formData.defaultDescription}
              url={formData.siteUrl}
              siteName={formData.siteName}
            />

            <SocialCardPreview
              title={formData.defaultTitle || formData.siteName}
              description={formData.defaultDescription}
              image={formData.defaultOgImage}
              url={formData.siteUrl}
            />
          </div>
        </div>
      </form>

      {/* Media Picker Modal */}
      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            setFormData({ ...formData, defaultOgImage: url as string });
            setShowMediaModal(false);
          }}
          multiple={false}
        />
      )}
    </div>
  );
}
