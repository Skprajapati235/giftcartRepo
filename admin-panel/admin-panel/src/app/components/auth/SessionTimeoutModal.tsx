"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, LogOut, CheckCircle2, Clock } from "lucide-react";
import { WARNING_WINDOW_SECONDS } from "../../utils/sessionConfig";

export default function SessionTimeoutModal() {
  const { sessionWarning, remainingSeconds, stayLoggedIn, logout } = useAuth();

  if (!sessionWarning) return null;

  // Percentage for progress bar (remaining out of WARNING_WINDOW_SECONDS)
  const percent = Math.max(0, Math.min(100, (remainingSeconds / WARNING_WINDOW_SECONDS) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-card p-6 sm:p-8 shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)] transition-all animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          {/* Animated Shield Badge */}
          <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500/25 opacity-75" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-500 shadow-inner">
              <ShieldAlert className="h-8 w-8 animate-pulse text-amber-500" />
            </div>
          </div>

          {/* Heading */}
          <h2
            id="session-timeout-title"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            Session Inactivity Warning
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            For your security, your admin session will expire due to inactivity in:
          </p>

          {/* Countdown Clock Display */}
          <div className="my-5 flex items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-3">
            <Clock className="h-5 w-5 text-amber-500 animate-spin [animation-duration:4s]" />
            <span className="font-mono text-3xl font-extrabold text-amber-500 tracking-wider">
              00:{remainingSeconds.toString().padStart(2, "0")}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/80">
              sec
            </span>
          </div>

          {/* Depleting Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Move your mouse, touch the screen, or click below to stay logged in.
          </p>

          {/* Action Buttons */}
          <div className="flex w-full flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={stayLoggedIn}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Stay Signed In
            </button>

            <button
              type="button"
              onClick={() => logout("Manual sign out from inactivity notice")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-muted active:scale-[0.98] focus:outline-none"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
