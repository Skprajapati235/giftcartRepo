"use client";

import React from "react";
import PartnerStoreView from "../components/stores";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import { Store, ShieldCheck, HeartHandshake } from "lucide-react";

export default function PartnerStoresPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <HeartHandshake size={16} />
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold">
                Managed Partner Network
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Tie-Up Stores & Fulfillment Hubs
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
              Save and manage local bakeries, florists, and gift partners. Directly dispatch orders via WhatsApp without holding inventory or taking return risks.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-2xl bg-surface border border-border-theme text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Zero Inventory • On-Demand</span>
          </div>
        </div>

        <PartnerStoreView />
      </AdminMain>
    </ProtectedRoute>
  );
}
