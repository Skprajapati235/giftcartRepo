"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelBottom,
  Phone,
  ShieldCheck,
  Link as LinkIcon,
  Mail,
  FileText,
  Globe,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

const NAV_TABS = [
  { key: "overview", label: "Overview", href: "/footer", icon: PanelBottom, badge: "Live" },
  { key: "brand", label: "Brand & Contact", href: "/footer/brand", icon: Phone },
  { key: "badges", label: "Trust Badges", href: "/footer/badges", icon: ShieldCheck },
  { key: "links", label: "Nav Columns & Links", href: "/footer/links", icon: LinkIcon },
  { key: "newsletter", label: "Club & Newsletter", href: "/footer/newsletter", icon: Mail },
  { key: "bottom", label: "Bottom Strip & Legal", href: "/footer/bottom", icon: FileText },
  { key: "seo", label: "Footer SEO & Schema", href: "/footer/seo", icon: Globe, badge: "SEO" },
];

interface FooterNavTabsProps {
  onRefresh?: () => void;
}

export default function FooterNavTabs({ onRefresh }: FooterNavTabsProps) {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await service.resetFooterDefaults();
      showToast("Footer restored to standard defaults successfully!", "success");
      setShowResetModal(false);
      if (onRefresh) onRefresh();
      else window.location.reload();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to reset footer defaults", "error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top Bar with Live Telemetry & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-cyan-500/10 border border-pink-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
            <PanelBottom size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-foreground flex items-center gap-1.5">
                Footer Management Studio
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <CheckCircle2 size={11} /> 100% Dynamic API
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage website footer brand info, trust badges, columns, newsletter, legal text &amp; Google SEO schema
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition border border-border-theme"
            title="Reset footer to standard original template"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition shadow-md shadow-pink-500/20"
          >
            <span>View Website</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Sub-Sidebar Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border-theme">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-pink-500/15 text-pink-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-theme border border-border-theme rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground text-base">Reset Footer Defaults?</h3>
                <p className="text-xs text-muted-foreground">This will restore the standard initial footer data</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure? All custom columns, trust badges, phone numbers, and custom SEO keywords will be reset to the original default setup.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-theme">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition shadow-md shadow-amber-500/20"
              >
                {resetting ? <RefreshCw className="animate-spin" size={14} /> : <RotateCcw size={14} />}
                <span>{resetting ? "Resetting..." : "Yes, Reset Defaults"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
