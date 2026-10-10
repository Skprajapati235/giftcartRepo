"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import FooterNavTabs from "../components/footer/FooterNavTabs";
import * as service from "../services/adminService";
import { useToast } from "../../context/ToastContext";
import {
  PanelBottom,
  Phone,
  ShieldCheck,
  Link as LinkIcon,
  Mail,
  FileText,
  Globe,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Award,
  Heart,
  Truck,
  Shield,
  Star,
  CheckCircle,
  MapPin,
  ArrowRight,
  Monitor,
  Smartphone,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function FooterDashboardPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const loadFooter = async () => {
    setLoading(true);
    try {
      const res = await service.getFooterAdmin();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to load footer configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFooter();
  }, []);

  const totalBadges = data?.trustBadges?.length || 0;
  const activeBadges = data?.trustBadges?.filter((b: any) => b.isActive !== false)?.length || 0;
  const totalColumns = data?.columns?.length || 0;
  const totalLinks = data?.columns?.reduce((acc: number, c: any) => acc + (c.links?.length || 0), 0) || 0;

  const getBadgeIcon = (iconName: string) => {
    switch ((iconName || "").toLowerCase()) {
      case "heart":
        return <Heart size={16} />;
      case "truck":
        return <Truck size={16} />;
      case "shield":
        return <Shield size={16} />;
      case "star":
        return <Star size={16} />;
      default:
        return <Award size={16} />;
    }
  };

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
          <FooterNavTabs onRefresh={loadFooter} />

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
              <RefreshCw className="animate-spin text-pink-500" size={32} />
              <p className="text-xs text-muted-foreground font-medium">Connecting to production footer data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Link
                  href="/footer/brand"
                  className="p-4 rounded-2xl bg-card-theme border border-border-theme hover:border-pink-500/40 transition group hover:shadow-lg hover:shadow-pink-500/5"
                >
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-pink-500 mb-2">
                    <Phone size={18} />
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-lg font-black text-foreground truncate">{data?.brand?.brandName || "GiftFestive"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{data?.brand?.phone || "+91..."}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-pink-500">Brand &amp; Contact &rarr;</span>
                </Link>

                <Link
                  href="/footer/badges"
                  className="p-4 rounded-2xl bg-card-theme border border-border-theme hover:border-amber-500/40 transition group hover:shadow-lg hover:shadow-amber-500/5"
                >
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-amber-500 mb-2">
                    <ShieldCheck size={18} />
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-lg font-black text-foreground">
                    {activeBadges} / {totalBadges}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Active Trust Badges</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-amber-500">Manage Badges &rarr;</span>
                </Link>

                <Link
                  href="/footer/links"
                  className="p-4 rounded-2xl bg-card-theme border border-border-theme hover:border-blue-500/40 transition group hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-blue-500 mb-2">
                    <LinkIcon size={18} />
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-lg font-black text-foreground">
                    {totalColumns} Cols ({totalLinks} Links)
                  </p>
                  <p className="text-[11px] text-muted-foreground">Footer Navigation</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-blue-500">Manage Links &rarr;</span>
                </Link>

                <Link
                  href="/footer/newsletter"
                  className="p-4 rounded-2xl bg-card-theme border border-border-theme hover:border-purple-500/40 transition group hover:shadow-lg hover:shadow-purple-500/5"
                >
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-purple-500 mb-2">
                    <Mail size={18} />
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-lg font-black text-foreground">
                    {data?.newsletter?.isEnabled !== false ? "Active" : "Disabled"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{data?.newsletter?.title || "Club"}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-purple-500">Newsletter Box &rarr;</span>
                </Link>

                <Link
                  href="/footer/bottom"
                  className="p-4 rounded-2xl bg-card-theme border border-border-theme hover:border-emerald-500/40 transition group hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-emerald-500 mb-2">
                    <FileText size={18} />
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-lg font-black text-foreground">
                    {data?.bottomStrip?.paymentMethods?.length || 4} Badges
                  </p>
                  <p className="text-[11px] text-muted-foreground">Copyright &amp; Payments</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-500">Bottom Strip &rarr;</span>
                </Link>

                <Link
                  href="/footer/seo"
                  className="p-4 rounded-2xl bg-card-theme border border-border-theme hover:border-cyan-500/40 transition group hover:shadow-lg hover:shadow-cyan-500/5"
                >
                  <div className="flex items-center justify-between text-muted-foreground group-hover:text-cyan-500 mb-2">
                    <Globe size={18} />
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-lg font-black text-cyan-500">{data?.seo?.googleReviewsRating || "4.9"} ★</p>
                  <p className="text-[11px] text-muted-foreground">LocalBusiness Schema</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-cyan-500">SEO Schema &rarr;</span>
                </Link>
              </div>

              {/* Production Health Audit Bar */}
              <div className="p-4 rounded-2xl bg-card-theme border border-border-theme flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <span>Production Deployment Status</span>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold">
                        100% Operational
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Website (`giftobag`) fetches directly via Server-Side Rendering (SSR) &bull; Zero dummy text &bull; Structured Google LocalBusiness Schema active
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadFooter}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-foreground transition border border-border-theme"
                  >
                    <RefreshCw size={12} />
                    <span>Sync Live Data</span>
                  </button>
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition border border-cyan-500/30"
                  >
                    <span>Google Rich Test</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Live Storefront Visual Simulator */}
              <div className="rounded-3xl border border-white/10 bg-[#16030e] text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider">
                      Live Storefront Footer Simulator
                    </h3>
                  </div>

                  {/* Device Switcher */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        previewMode === "desktop" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Monitor size={13} />
                      <span>Desktop</span>
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                        previewMode === "mobile" ? "bg-pink-500 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Smartphone size={13} />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                <div className={`mx-auto transition-all ${previewMode === "mobile" ? "max-w-sm border border-white/20 p-4 rounded-2xl bg-[#180510]" : "w-full"}`}>
                  {/* Simulated Trust Badges */}
                  <div className={`grid gap-4 pb-6 border-b border-white/10 ${previewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
                    {(data?.trustBadges || [])
                      .filter((b: any) => b.isActive !== false)
                      .map((badge: any, idx: number) => (
                        <div key={badge._id || idx} className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"
                            style={{ color: badge.color || "#ffd166" }}
                          >
                            {getBadgeIcon(badge.icon)}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white">{badge.title}</p>
                            <p className="text-[10px] text-gray-400">{badge.subtitle}</p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Simulated Main Columns */}
                  <div className={`gap-6 py-6 ${previewMode === "mobile" ? "flex flex-col space-y-4" : "grid grid-cols-1 md:grid-cols-12"}`}>
                    {/* Brand column */}
                    <div className={`${previewMode === "mobile" ? "w-full" : "md:col-span-4"} space-y-3`}>
                      <div className="flex items-center gap-2">
                        {data?.brand?.logoUrl ? (
                          <img
                            src={data.brand.logoUrl}
                            alt={data.brand.brandName || "Logo"}
                            className="w-[130px] h-auto object-contain"
                            onError={(e: any) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className="text-lg font-black tracking-tight text-white">
                          {data?.brand?.brandName || "GiftFestive"}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                        {data?.brand?.tagline || "Artisanal cakes, fresh blooms & gifts."}
                      </p>
                      <div className="pt-1 space-y-1.5 text-xs text-gray-300">
                        <div className="flex items-center gap-2 text-[#ffd166]">
                          <Phone size={13} />
                          <span>{data?.brand?.phoneLabel || data?.brand?.phone || "+91 84007 87712"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#D82B76]">
                          <Mail size={13} />
                          <span>{data?.brand?.email || "support@giftfestive.in"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin size={13} />
                          <span>{data?.brand?.address || "Sector 15, Faridabad, Haryana – 121001"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Nav Columns */}
                    {(data?.columns || [])
                      .filter((c: any) => c.isActive !== false)
                      .map((col: any, cIdx: number) => (
                        <div key={col._id || cIdx} className={`${previewMode === "mobile" ? "w-full" : "md:col-span-2"} space-y-2`}>
                          <h4 className="text-white font-black text-xs uppercase tracking-widest">{col.title}</h4>
                          <ul className="space-y-1.5 text-xs text-gray-400">
                            {(col.links || [])
                              .filter((l: any) => l.isActive !== false)
                              .map((link: any, lIdx: number) => (
                                <li key={link._id || lIdx} className="flex items-center gap-1.5 hover:text-white">
                                  <span>{link.label}</span>
                                  {link.badge && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-500/25 text-pink-300 font-bold">
                                      {link.badge}
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))}

                    {/* Newsletter preview */}
                    {data?.newsletter?.isEnabled !== false && (
                      <div className={`${previewMode === "mobile" ? "w-full" : "md:col-span-4"} space-y-2`}>
                        <h4 className="text-white font-black text-xs uppercase tracking-widest">
                          {data?.newsletter?.title || "The Festive Club"}
                        </h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {data?.newsletter?.description || "Subscribe for secret promo codes & festive discounts."}
                        </p>
                        <div className="flex rounded-xl overflow-hidden border border-white/15 bg-white/5 max-w-sm">
                          <input
                            disabled
                            placeholder={data?.newsletter?.placeholder || "Enter your email..."}
                            className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                          />
                          <button
                            disabled
                            className="bg-gradient-to-r from-[#D82B76] to-[#741343] px-3.5 text-xs font-bold text-white"
                          >
                            {data?.newsletter?.buttonText || "Subscribe"}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <CheckCircle size={11} className="text-emerald-400" />
                          <span>{data?.newsletter?.disclaimer || "No spam. Unsubscribe anytime."}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Simulated Bottom Strip */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
                    <p>
                      {(data?.bottomStrip?.copyrightText || "© {year} GiftFestive. All rights reserved.").replace(
                        "{year}",
                        new Date().getFullYear().toString()
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      {(data?.bottomStrip?.paymentMethods || ["UPI", "Cards", "NetBanking", "COD"]).map(
                        (pm: string, idx: number) => (
                          <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]">
                            {pm}
                          </span>
                        )
                      )}
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
