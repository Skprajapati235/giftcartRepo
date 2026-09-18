"use client";

import React from "react";
import {
  Gift,
  Sparkles,
  Share2,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function AuthHeroSection() {
  return (
    <div className="relative z-10 flex flex-col justify-center py-2 lg:py-4 px-2 sm:px-6 lg:px-8 text-slate-900 dark:text-white max-w-2xl">
      {/* 1. Top Brand Emblem */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-indigo-600 shadow-md shadow-pink-500/25 shrink-0">
          <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 dark:text-white">
              Gift Festive
            </span>
            <span className="rounded-full bg-pink-500/10 dark:bg-pink-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 border border-pink-500/20">
              Admin
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Premium Operations Dashboard
          </p>
        </div>
      </div>

      {/* 2. Status Pill */}
      <div className="inline-flex items-center gap-1.5 w-fit rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm mb-4">
        <Sparkles className="h-3.5 w-3.5 text-pink-500" />
        <span>Secure Admin Portal</span>
      </div>

      {/* 3. Main Headline */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1] mb-3">
        Manage Your Gifting Empire Seamlessly.
      </h2>

      {/* 4. Compact Description */}
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
        The all-in-one unified platform to oversee multi-channel orders, track live logistics, and scale your business effortlessly.
      </p>

      {/* 5. Sleek 3-Pillar Micro Badges (Uncluttered & Clean) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm p-2.5">
          <div className="rounded-lg bg-pink-500/10 p-1.5 text-pink-600 shrink-0">
            <Share2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Omnichannel CRM
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Insta, WhatsApp & Web
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm p-2.5">
          <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-600 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Delivery Cutoffs
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              24/7 Automated Slots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm p-2.5">
          <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Live Analytics
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Real-time Settlement
            </p>
          </div>
        </div>
      </div>

      {/* 6. Proof Metrics Strip */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-none">
              99.9%
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Accuracy
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-none">
              24/7
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Dispatch
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
              Razorpay
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Encrypted
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Role-based Access</span>
        </div>
      </div>
    </div>
  );
}

