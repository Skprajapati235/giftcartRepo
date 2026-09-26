"use client";

import React, { useState } from "react";
import { Share2, Image as ImageIcon } from "lucide-react";

interface SocialCardPreviewProps {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export default function SocialCardPreview({
  title,
  description,
  image,
  url,
}: SocialCardPreviewProps) {
  const [platform, setPlatform] = useState<"facebook" | "twitter">("facebook");

  const displayTitle = title || "Your Page Title";
  const displayDesc = description || "Your page description will appear here for social shares.";
  const displayUrl = url ? url.replace(/^https?:\/\//, "").split("/")[0] : "giftfestive.com";

  return (
    <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border-theme pb-3">
        <div className="flex items-center gap-2">
          <Share2 size={16} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Social Share Preview (OpenGraph / Twitter)
          </span>
        </div>
        <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border-theme">
          <button
            type="button"
            onClick={() => setPlatform("facebook")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              platform === "facebook"
                ? "bg-[#1877F2] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => setPlatform("twitter")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              platform === "twitter"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Twitter / X
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto rounded-xl overflow-hidden border border-border-theme bg-background shadow-md">
        {/* Preview Image */}
        <div className="relative aspect-[1200/630] w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon size={32} className="opacity-40" />
              <span className="text-xs font-semibold">No Image (1200 × 630 px recommended)</span>
            </div>
          )}
        </div>

        {/* Text Container */}
        <div className="p-3.5 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {displayUrl}
          </p>
          <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
            {displayTitle}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
