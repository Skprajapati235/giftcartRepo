"use client";

import React from "react";

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Subtle Modern Dot Matrix Grid */}
      <div className="absolute inset-0 auth-dot-pattern opacity-60 dark:opacity-40" />

      {/* 2. Radiant Concentric Ambient Rings */}
      <div className="absolute -left-[10%] top-1/2 -translate-y-1/2 flex items-center justify-center opacity-70 dark:opacity-40">
        {/* Ring 1 (Outer) */}
        <div className="absolute h-[950px] w-[950px] rounded-full border border-primary/10 dark:border-primary/15 animate-spin-slow" />
        {/* Ring 2 (Dashed) */}
        <div className="absolute h-[740px] w-[740px] rounded-full border-2 border-dashed border-secondary/15 dark:border-secondary/20 animate-pulse-slow" />
        {/* Ring 3 */}
        <div className="absolute h-[540px] w-[540px] rounded-full border border-primary/15 dark:border-primary/25" />
        {/* Ring 4 (Dotted Accent) */}
        <div className="absolute h-[380px] w-[380px] rounded-full border-2 border-dotted border-fuchsia-500/20 dark:border-fuchsia-400/20" />
        {/* Ring 5 (Inner Core) */}
        <div className="absolute h-[220px] w-[220px] rounded-full border border-primary/20 dark:border-primary/30" />
      </div>

      {/* 3. Concentric Rings for Right Background (Subtle) */}
      <div className="absolute -right-[15%] -bottom-[10%] flex items-center justify-center opacity-40 dark:opacity-30">
        <div className="absolute h-[700px] w-[700px] rounded-full border border-primary/10 [border-style:dashed]" />
        <div className="absolute h-[500px] w-[500px] rounded-full border border-secondary/10" />
        <div className="absolute h-[320px] w-[320px] rounded-full border border-primary/15" />
      </div>

      {/* 4. Ambient Glowing Color Blobs (Blur 3XL) */}
      <div className="absolute top-0 -left-20 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-pink-500/15 via-fuchsia-500/10 to-transparent blur-[110px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-indigo-500/15 via-purple-500/10 to-transparent blur-[130px]" />
      <div className="absolute top-1/3 right-1/4 h-[350px] w-[350px] rounded-full bg-primary/10 blur-[100px]" />
    </div>
  );
}
