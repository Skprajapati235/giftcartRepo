"use client";

import React, { useEffect, useState } from "react";
import {
  Bot,
  FileCode,
  ExternalLink,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
} from "lucide-react";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

export default function RobotsSitemapManager() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sitemapData, setSitemapData] = useState<any>(null);
  const [robotsData, setRobotsData] = useState<any>(null);
  const [customRobots, setCustomRobots] = useState("");
  const [savingRobots, setSavingRobots] = useState(false);
  const [pinging, setPinging] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitemapRes, robotsRes, globalRes] = await Promise.all([
        service.getSitemapData(),
        service.getRobotsData(),
        service.getSeoGlobal(),
      ]);

      if (sitemapRes) setSitemapData(sitemapRes);
      if (robotsRes) setRobotsData(robotsRes);
      if (globalRes?.data?.robotsCustomRules !== undefined) {
        setCustomRobots(globalRes.data.robotsCustomRules || "");
      }
    } catch (err: any) {
      showToast("Failed to load sitemap and robots information", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRobots = async () => {
    setSavingRobots(true);
    try {
      await service.updateSeoGlobal({ robotsCustomRules: customRobots });
      showToast("Robots.txt custom directives saved!", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to save robots rules", "error");
    } finally {
      setSavingRobots(false);
    }
  };

  const handlePingGoogle = async () => {
    setPinging(true);
    try {
      const sitemapUrl = sitemapData?.baseUrl
        ? `${sitemapData.baseUrl}/sitemap.xml`
        : "https://giftfestive.com/sitemap.xml";

      // Open Google Search Console ping in a new tab
      window.open(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        "_blank"
      );
      showToast("Google Search Console ping initiated!", "success");
    } catch (err) {
      showToast("Failed to ping search engine", "error");
    } finally {
      setPinging(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const generatedRobotsContent = `# Dynamic Robots.txt for GiftFestive
User-agent: *
Allow: /
Disallow: /checkout
Disallow: /checkout/
Disallow: /cart
Disallow: /cart/
Disallow: /profile
Disallow: /profile/
Disallow: /orders
Disallow: /orders/
Disallow: /login
Disallow: /register
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /checkout
Disallow: /cart
Disallow: /profile
Disallow: /orders
Disallow: /login
Disallow: /register

Sitemap: ${sitemapData?.baseUrl || "https://giftfestive.com"}/sitemap.xml
Host: ${sitemapData?.baseUrl || "https://giftfestive.com"}

${customRobots ? `# Custom Rules:\n${customRobots}` : ""}`.trim();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Bot className="text-primary" size={28} /> Robots.txt & Sitemap Tools
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor dynamic XML sitemap generation, verify indexable URLs, and customize crawler instructions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePingGoogle}
            disabled={pinging}
            className="flex items-center gap-2 bg-card border border-border-theme hover:bg-hover-theme text-foreground px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <Send size={16} className="text-primary" />
            Ping Google
          </button>
          <a
            href={`${sitemapData?.baseUrl || "https://giftfestive.com"}/sitemap.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            <ExternalLink size={16} />
            View Live Sitemap
          </a>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Total Indexed URLs
          </div>
          <div className="text-3xl font-extrabold text-foreground">
            {sitemapData?.totalUrls || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Generated dynamically from your active pages, products & categories.
          </p>
        </div>

        <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Sitemap Frequency
          </div>
          <div className="text-3xl font-extrabold text-primary">Daily / Hourly</div>
          <p className="text-xs text-muted-foreground mt-2">
            Updated automatically when products or pages are published.
          </p>
        </div>

        <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Crawler Health
          </div>
          <div className="text-3xl font-extrabold text-emerald-500 flex items-center gap-2">
            <CheckCircle2 size={26} /> Valid
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Standard Next.js MetadataRoute with Googlebot compatibility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Robots.txt Editor & Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-theme pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileCode size={18} className="text-primary" /> Active Robots.txt Output
              </h3>
              <button
                onClick={() => copyToClipboard(generatedRobotsContent)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Copy size={13} /> Copy
              </button>
            </div>
            <pre className="bg-background border border-border-theme rounded-xl p-4 text-xs font-mono text-muted-foreground overflow-x-auto max-h-72 leading-relaxed">
              {generatedRobotsContent}
            </pre>
          </div>

          <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2 border-b border-border-theme pb-3">
              <Bot size={18} className="text-primary" /> Custom Robots.txt Directives
            </h3>
            <p className="text-xs text-muted-foreground">
              Add any custom Disallow, Allow, or Crawl-Delay rules here:
            </p>
            <textarea
              rows={5}
              value={customRobots}
              onChange={(e) => setCustomRobots(e.target.value)}
              className="w-full bg-background border border-border-theme rounded-xl p-3.5 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
              placeholder={`User-agent: YandexBot\nDisallow: /admin\n\nUser-agent: *\nCrawl-delay: 10`}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveRobots}
                disabled={savingRobots}
                className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {savingRobots ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                {savingRobots ? "Saving..." : "Save Custom Rules"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sitemap URL Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border-theme rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-theme pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileCode size={18} className="text-primary" /> Dynamic Sitemap URLs
              </h3>
              <span className="text-xs font-bold text-muted-foreground">
                Showing {Math.min(50, sitemapData?.routes?.length || 0)} of {sitemapData?.totalUrls || 0}
              </span>
            </div>

            <div className="overflow-y-auto max-h-[500px] divide-y divide-border-theme rounded-xl border border-border-theme bg-background">
              {sitemapData?.routes?.slice(0, 50).map((r: any, idx: number) => (
                <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-hover-theme/30 transition">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-foreground truncate">{r.url}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Lastmod: {new Date(r.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-md text-[10px]">
                      P: {r.priority}
                    </span>
                    <span className="ml-1 text-[10px] text-muted-foreground capitalize">
                      {r.changeFrequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
