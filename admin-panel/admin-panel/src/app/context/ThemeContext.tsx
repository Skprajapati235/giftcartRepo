"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

export interface AdminColorPreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  primaryGradient: string;
  secondary: string;
  accent: string;
  previewColor: string;
}

export const ADMIN_COLOR_PRESETS: AdminColorPreset[] = [
  {
    id: "rose",
    name: "Festive Rose",
    description: "GiftFestive signature vibrant pink & rose gradient",
    primary: "#ec4899",
    primaryGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    secondary: "#f43f5e",
    accent: "#fb7185",
    previewColor: "#ec4899",
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "Elegant deep amethyst & neon purple gradient",
    primary: "#8b5cf6",
    primaryGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    secondary: "#a855f7",
    accent: "#c084fc",
    previewColor: "#8b5cf6",
  },
  {
    id: "emerald",
    name: "Emerald Luxury",
    description: "Premium rich jade & botanical green tones",
    primary: "#10b981",
    primaryGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    secondary: "#06b6d4",
    accent: "#34d399",
    previewColor: "#10b981",
  },
  {
    id: "ocean",
    name: "Ocean Cyan",
    description: "Crisp tropical teal & modern tech cyan",
    primary: "#0284c7",
    primaryGradient: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
    secondary: "#3b82f6",
    accent: "#38bdf8",
    previewColor: "#0284c7",
  },
  {
    id: "amber",
    name: "Midnight Gold",
    description: "Warm festive saffron & imperial amber gold",
    primary: "#f59e0b",
    primaryGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    secondary: "#ea580c",
    accent: "#fbbf24",
    previewColor: "#f59e0b",
  },
  {
    id: "sunset",
    name: "Sunset Flame",
    description: "Energetic tangerine, coral & fiery warmth",
    primary: "#f97316",
    primaryGradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    secondary: "#e11d48",
    accent: "#fb923c",
    previewColor: "#f97316",
  },
  {
    id: "indigo",
    name: "Classic Indigo",
    description: "Authoritative enterprise blue & deep navy",
    primary: "#4f46e5",
    primaryGradient: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
    secondary: "#6366f1",
    accent: "#818cf8",
    previewColor: "#4f46e5",
  },
  {
    id: "crimson",
    name: "Ruby Crimson",
    description: "Passionate cherry red & burgundy romance",
    primary: "#e11d48",
    primaryGradient: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
    secondary: "#9333ea",
    accent: "#f43f5e",
    previewColor: "#e11d48",
  },
  {
    id: "chocolate",
    name: "Warm Chocolate",
    description: "Artisan Belgian bakery cocoa & caramel tones",
    primary: "#b45309",
    primaryGradient: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
    secondary: "#d97706",
    accent: "#f59e0b",
    previewColor: "#b45309",
  },
  {
    id: "slate",
    name: "Monochrome Stealth",
    description: "Minimalist titanium & graphite slate aesthetic",
    primary: "#475569",
    primaryGradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    secondary: "#64748b",
    accent: "#94a3b8",
    previewColor: "#475569",
  },
];

interface ThemeContextState {
  theme: Theme;
  toggleTheme: () => void;
  adminColor: AdminColorPreset;
  setAdminColorPreset: (presetId: string) => void;
  setCustomAdminColor: (primary: string, secondary?: string) => void;
  syncWithWebsiteTheme: (websitePrimary: string, websiteSecondary?: string) => void;
  resetAdminTheme: () => void;
}

const ThemeContext = createContext<ThemeContextState | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [adminColor, setAdminColor] = useState<AdminColorPreset>(ADMIN_COLOR_PRESETS[0]);

  // Load theme and admin color from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem("giftcartAdminTheme") as Theme | null;
    const initialTheme =
      storedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    setTheme(initialTheme);

    try {
      const storedColor = window.localStorage.getItem("giftcartAdminColor");
      if (storedColor) {
        const parsed = JSON.parse(storedColor);
        if (parsed && parsed.primary) {
          setAdminColor(parsed);
        }
      }
    } catch (_) {}
  }, []);

  // Sync dark/light theme class and data-theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.dataset.theme = theme;
    window.localStorage.setItem("giftcartAdminTheme", theme);
  }, [theme]);

  // Apply admin palette CSS variables to document root
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    // Core palette
    root.style.setProperty("--primary", adminColor.primary);
    root.style.setProperty("--primary-gradient", adminColor.primaryGradient);
    root.style.setProperty("--secondary", adminColor.secondary);
    root.style.setProperty("--accent-color", adminColor.accent);

    // Track active preset on the html element for CSS attribute selectors
    root.dataset.adminTheme = adminColor.id;

    window.localStorage.setItem("giftcartAdminColor", JSON.stringify(adminColor));
  }, [adminColor]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const setAdminColorPreset = (presetId: string) => {
    const preset = ADMIN_COLOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setAdminColor(preset);
    }
  };

  const setCustomAdminColor = (primary: string, secondary?: string) => {
    const sec = secondary || primary;
    const customConfig: AdminColorPreset = {
      id: "custom",
      name: "Custom Palette",
      description: "Custom admin dashboard color theme",
      primary,
      primaryGradient: `linear-gradient(135deg, ${primary} 0%, ${sec} 100%)`,
      secondary: sec,
      accent: primary,
      previewColor: primary,
    };
    setAdminColor(customConfig);
  };

  const syncWithWebsiteTheme = (websitePrimary: string, websiteSecondary?: string) => {
    setCustomAdminColor(websitePrimary, websiteSecondary);
  };

  const resetAdminTheme = () => {
    setAdminColor(ADMIN_COLOR_PRESETS[0]);
    setTheme("light");
  };

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      adminColor,
      setAdminColorPreset,
      setCustomAdminColor,
      syncWithWebsiteTheme,
      resetAdminTheme,
    }),
    [theme, adminColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
