"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Box,
  Tag,
  FileText,
  ArrowRightLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

export default function SeoAuditDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<any>(null);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await service.getSeoAudit();
      if (res && res.data) {
        setAudit(res.data);
      }
    } catch (err) {
      showToast("Failed to load SEO health audit", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const score = audit?.healthScore || 85;
  const getScoreColor = () => {
    if (score >= 80) return { text: "text-emerald-500", bg: "bg-emerald-500", label: "Excellent SEO Health" };
    if (score >= 60) return { text: "text-amber-500", bg: "bg-amber-500", label: "Good - Needs Minor Tuning" };
    return { text: "text-red-500", bg: "bg-red-500", label: "Action Needed" };
  };
  const scoreInfo = getScoreColor();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={28} /> SEO Health & Diagnostics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time audit of missing meta tags, incomplete product descriptions, and search optimization opportunities.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="flex items-center gap-2 bg-card border border-border-theme hover:bg-hover-theme text-foreground px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
        >
          <RefreshCw size={16} /> Re-scan Store
        </button>
      </div>

      {/* Main Score Banner */}
      <div className="bg-card border border-border-theme rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Overall Store SEO Score
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className={scoreInfo.text} size={30} /> {scoreInfo.label}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Calculated based on product meta coverage, OpenGraph assets, category search content, and active sitemap indexation.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-border-theme bg-background shadow-inner">
            <div className="text-center">
              <span className={`text-4xl font-black ${scoreInfo.text}`}>{score}</span>
              <span className="text-xs font-bold text-muted-foreground block">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Products */}
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Products</span>
            <Box size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {audit?.products?.total || 0}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missing SEO Title:</span>
              <span className={`font-bold ${audit?.products?.missingTitle ? "text-amber-500" : "text-emerald-500"}`}>
                {audit?.products?.missingTitle || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missing Meta Desc:</span>
              <span className={`font-bold ${audit?.products?.missingDescription ? "text-amber-500" : "text-emerald-500"}`}>
                {audit?.products?.missingDescription || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missing OG Image:</span>
              <span className={`font-bold ${audit?.products?.missingOgImage ? "text-amber-500" : "text-emerald-500"}`}>
                {audit?.products?.missingOgImage || 0}
              </span>
            </div>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-primary flex items-center gap-1 pt-2 hover:underline"
          >
            Manage Products <ArrowRight size={13} />
          </Link>
        </div>

        {/* Categories */}
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Categories</span>
            <Tag size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {audit?.categories?.total || 0}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missing SEO Title:</span>
              <span className={`font-bold ${audit?.categories?.missingTitle ? "text-amber-500" : "text-emerald-500"}`}>
                {audit?.categories?.missingTitle || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missing Bottom Text:</span>
              <span className={`font-bold ${audit?.categories?.missingBottomContent ? "text-amber-500" : "text-emerald-500"}`}>
                {audit?.categories?.missingBottomContent || 0}
              </span>
            </div>
          </div>
          <Link
            href="/category"
            className="text-xs font-bold text-primary flex items-center gap-1 pt-2 hover:underline"
          >
            Manage Categories <ArrowRight size={13} />
          </Link>
        </div>

        {/* Pages SEO */}
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Pages Configured</span>
            <FileText size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {audit?.pages?.totalConfigured || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Dedicated route metadata defined in Pages SEO manager.
          </p>
          <Link
            href="/seo/pages"
            className="text-xs font-bold text-primary flex items-center gap-1 pt-2 hover:underline"
          >
            Manage Pages <ArrowRight size={13} />
          </Link>
        </div>

        {/* Redirects */}
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">Active Redirects</span>
            <ArrowRightLeft size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {audit?.redirects?.total || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Active 301 and 302 rules preventing broken 404 links.
          </p>
          <Link
            href="/seo/redirects"
            className="text-xs font-bold text-primary flex items-center gap-1 pt-2 hover:underline"
          >
            Manage Redirects <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
          <Zap size={18} className="text-amber-500" /> SEO Optimization Recommendations
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3.5 bg-background rounded-xl border border-border-theme">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-foreground">Automatic Fallbacks Active:</span> Products and categories without custom SEO titles automatically fall back to their default names and descriptions, ensuring Google always receives clean metadata.
            </div>
          </div>

          {audit?.products?.missingTitle > 0 && (
            <div className="flex items-start gap-3 p-3.5 bg-background rounded-xl border border-border-theme">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-foreground">Boost Product Click-Through Rates:</span> Add tailored SEO Titles and Focus Keywords to your top-selling products in the Product Manager to highlight localized keywords like "Express Delivery in Faridabad".
              </div>
            </div>
          )}

          {audit?.categories?.missingBottomContent > 0 && (
            <div className="flex items-start gap-3 p-3.5 bg-background rounded-xl border border-border-theme">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-foreground">High-Value Category Ranking Content:</span> E-commerce search engines favor category pages with 100-200 words of rich content at the bottom of the page. Open Category Settings to add bottom content.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
