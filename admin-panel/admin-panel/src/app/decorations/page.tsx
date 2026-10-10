"use client";

import React from "react";
import DecorationsManagerView from "../components/decorations";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import { Sparkles, Building, ShieldCheck } from "lucide-react";

export default function DecorationsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
                <Sparkles size={16} />
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-pink-500 font-bold">
                Experience & Venue Services
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Party & Hotel Room Decoration Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Manage hotel room setups, birthday balloon decor, cabana date nights, and surprise proposal bookings. Dispatch directly to local decorator partners via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <a
              href="/decoration-panel"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:from-pink-700 hover:to-purple-700 transition flex items-center gap-2"
            >
              <span>🎈 Launch Faridabad Decoration Studio</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <DecorationsManagerView />
      </AdminMain>
    </ProtectedRoute>
  );
}
