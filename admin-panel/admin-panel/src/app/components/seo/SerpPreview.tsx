"use client";

import React, { useState } from "react";
import { Monitor, Smartphone, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface SerpPreviewProps {
  title: string;
  description: string;
  url: string;
  siteName?: string;
}

export default function SerpPreview({
  title,
  description,
  url,
  siteName = "GiftFestive",
}: SerpPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const displayTitle = title || "Title not specified";
  const displayDesc =
    description || "Please enter a meta description to see how your page appears in Google search results.";
  const displayUrl = url || "https://giftfestive.com/page-url";

  const titleLength = (title || "").length;
  const descLength = (description || "").length;

  const getTitleStatus = () => {
    if (titleLength === 0) return { label: "Empty", color: "text-red-500", bg: "bg-red-500" };
    if (titleLength < 30) return { label: "Too Short", color: "text-amber-500", bg: "bg-amber-500" };
    if (titleLength <= 60) return { label: "Optimal", color: "text-emerald-500", bg: "bg-emerald-500" };
    return { label: "Too Long (will truncate)", color: "text-amber-500", bg: "bg-amber-500" };
  };

  const getDescStatus = () => {
    if (descLength === 0) return { label: "Empty", color: "text-red-500", bg: "bg-red-500" };
    if (descLength < 70) return { label: "Too Short", color: "text-amber-500", bg: "bg-amber-500" };
    if (descLength <= 160) return { label: "Optimal", color: "text-emerald-500", bg: "bg-emerald-500" };
    return { label: "Too Long (will truncate)", color: "text-amber-500", bg: "bg-amber-500" };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border-theme pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Google Search Preview (SERP)
          </span>
        </div>
        <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border-theme">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              device === "desktop"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              device === "mobile"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>
      </div>

      {/* Length meters */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-background/60 p-2.5 rounded-xl border border-border-theme">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-muted-foreground">Title Length:</span>
            <span className={`font-bold ${titleStatus.color}`}>
              {titleLength}/60 chars ({titleStatus.label})
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${titleStatus.bg} transition-all duration-300`}
              style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-background/60 p-2.5 rounded-xl border border-border-theme">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-muted-foreground">Description Length:</span>
            <span className={`font-bold ${descStatus.color}`}>
              {descLength}/160 chars ({descStatus.label})
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${descStatus.bg} transition-all duration-300`}
              style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Snippet Card */}
      <div
        className={`bg-white dark:bg-[#202124] text-[#4d5156] dark:text-[#bdc1c6] p-4 rounded-xl border border-slate-200 dark:border-neutral-800 font-sans transition-all ${
          device === "mobile" ? "max-w-md mx-auto shadow-md" : "w-full"
        }`}
      >
        {/* Favicon + URL Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
            GF
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#202124] dark:text-[#e8eaed] leading-none truncate">
              {siteName}
            </div>
            <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] truncate leading-tight">
              {displayUrl}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[#1a0dab] dark:text-[#8ab4f8] text-base md:text-lg font-normal leading-snug hover:underline cursor-pointer mb-1 line-clamp-2">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-xs md:text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
          {displayDesc}
        </p>
      </div>
    </div>
  );
}
