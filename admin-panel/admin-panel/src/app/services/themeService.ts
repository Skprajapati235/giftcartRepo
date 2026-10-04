import { api, authApi, baseURL } from "./apiClient";

export interface StoreThemeConfig {
  _id?: string;
  key?: string;
  presetId: string;
  presetName: string;
  primaryColor: string;
  secondaryColor: string;
  brandBerry: string;
  brandGold: string;
  brandCream: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  announcementBar: {
    enabled: boolean;
    text: string;
    bgColor: string;
    textColor: string;
    link?: string;
  };
  storeTagline: string;
  badgeText: string;
}

export const THEME_PRESETS: Array<{
  id: string;
  name: string;
  tagline: string;
  previewGradient: string;
  config: Partial<StoreThemeConfig>;
}> = [
  {
    id: "festive-pink",
    name: "Festive Pink (Default)",
    tagline: "Vibrant Celebration & Signature Gifting",
    previewGradient: "from-pink-500 via-rose-500 to-amber-400",
    config: {
      presetId: "festive-pink",
      presetName: "Festive Pink (Default)",
      primaryColor: "#D82B76",
      secondaryColor: "#FF6A3D",
      brandBerry: "#741343",
      brandGold: "#ffd166",
      brandCream: "#fffaf3",
      backgroundColor: "#ffffff",
      textColor: "#1a1a1a",
      announcementBar: {
        enabled: true,
        text: "🎉 Flat 15% OFF on Midnight Cake Deliveries! Use Code FESTIVE15",
        bgColor: "#741343",
        textColor: "#ffffff",
        link: "/categories",
      },
      storeTagline: "Faridabad's Most Trusted Online Cake & Gift Destination",
      badgeText: "✨ 100% Fresh & Eggless Available",
    },
  },
  {
    id: "royal-gold",
    name: "Royal Velvet & Gold",
    tagline: "Regal Luxury & High-end Gourmet Cakes",
    previewGradient: "from-amber-600 via-yellow-500 to-red-950",
    config: {
      presetId: "royal-gold",
      presetName: "Royal Velvet & Gold",
      primaryColor: "#800020",
      secondaryColor: "#D4AF37",
      brandBerry: "#4A0E17",
      brandGold: "#F3E5AB",
      brandCream: "#FFFDF7",
      backgroundColor: "#ffffff",
      textColor: "#1f1b14",
      announcementBar: {
        enabled: true,
        text: "👑 Royal Celebrations: Free Luxury Gift Wrap on all orders above ₹999",
        bgColor: "#4A0E17",
        textColor: "#F3E5AB",
        link: "/categories",
      },
      storeTagline: "Artisanal Celebrations with Royal Precision",
      badgeText: "⚜️ Gourmet Handcrafted Treats",
    },
  },
  {
    id: "valentine-red",
    name: "Valentine Romantic Red",
    tagline: "Love, Roses & Sweet Midnight Surprises",
    previewGradient: "from-rose-600 via-red-500 to-pink-400",
    config: {
      presetId: "valentine-red",
      presetName: "Valentine Romantic Red",
      primaryColor: "#E11D48",
      secondaryColor: "#F43F5E",
      brandBerry: "#881337",
      brandGold: "#FFE4E6",
      brandCream: "#FFF1F2",
      backgroundColor: "#ffffff",
      textColor: "#2a0812",
      announcementBar: {
        enabled: true,
        text: "❤️ Valentine Special: Free Rose Petal Packaging + Midnight Delivery!",
        bgColor: "#881337",
        textColor: "#ffffff",
        link: "/occasions",
      },
      storeTagline: "Make Every Heart Flutter with Love",
      badgeText: "🌹 Fresh Cut Roses & Heart Cakes",
    },
  },
  {
    id: "diwali-gold",
    name: "Diwali Sparkle & Purple",
    tagline: "Festive Lights, Mithai & Joyous Bundles",
    previewGradient: "from-purple-600 via-amber-500 to-yellow-400",
    config: {
      presetId: "diwali-gold",
      presetName: "Diwali Sparkle & Purple",
      primaryColor: "#7E22CE",
      secondaryColor: "#EAB308",
      brandBerry: "#3B0764",
      brandGold: "#FEF08A",
      brandCream: "#FEFCE8",
      backgroundColor: "#ffffff",
      textColor: "#1c102b",
      announcementBar: {
        enabled: true,
        text: "🪔 Diwali Special: Buy 1 Get 1 on Dry Fruit Hampers! Code DIWALIJOY",
        bgColor: "#3B0764",
        textColor: "#FEF08A",
        link: "/categories",
      },
      storeTagline: "Illuminate Every Celebration with Sweetness",
      badgeText: "🪔 Authentic Festive Hampers",
    },
  },
  {
    id: "midnight-dark",
    name: "Midnight Velvet Noir",
    tagline: "Sleek Dark Mode & Neon Cyber Aesthetics",
    previewGradient: "from-slate-900 via-sky-500 to-indigo-600",
    config: {
      presetId: "midnight-dark",
      presetName: "Midnight Velvet Noir",
      primaryColor: "#0284C7",
      secondaryColor: "#38BDF8",
      brandBerry: "#0F172A",
      brandGold: "#BAE6FD",
      brandCream: "#F0F9FF",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      announcementBar: {
        enabled: true,
        text: "🌙 Midnight Deliveries Guaranteed until 2:00 AM across Faridabad",
        bgColor: "#0F172A",
        textColor: "#38BDF8",
        link: "/delivery-hours",
      },
      storeTagline: "Faridabad's Premier Express Midnight Service",
      badgeText: "⚡ 30-Minute Express Dispatch",
    },
  },
  {
    id: "spring-teal",
    name: "Spring Bloom Teal",
    tagline: "Fresh Pastels, Organic Delights & Cheerful Vibe",
    previewGradient: "from-teal-500 via-emerald-400 to-amber-300",
    config: {
      presetId: "spring-teal",
      presetName: "Spring Bloom Teal",
      primaryColor: "#0D9488",
      secondaryColor: "#F97316",
      brandBerry: "#134E4A",
      brandGold: "#FED7AA",
      brandCream: "#F0FDFA",
      backgroundColor: "#ffffff",
      textColor: "#062826",
      announcementBar: {
        enabled: true,
        text: "🌿 Fresh Spring Cakes: 100% Organic Ingredients & Sugar-Free options!",
        bgColor: "#134E4A",
        textColor: "#FED7AA",
        link: "/categories",
      },
      storeTagline: "Freshness Handpicked from Nature to Your Table",
      badgeText: "🌱 Natural & Freshly Sourced",
    },
  },
];

export const themeService = {
  getTheme: async (): Promise<StoreThemeConfig> => {
    try {
      const res = await api.get("/store-settings/theme");
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
      return THEME_PRESETS[0].config as StoreThemeConfig;
    } catch (err) {
      console.warn("Could not fetch remote theme, using local cached/preset", err);
      // Fallback to localStorage if available
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("giftfestive_storefront_theme");
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch (_) {}
        }
      }
      return THEME_PRESETS[0].config as StoreThemeConfig;
    }
  },

  updateTheme: async (themeData: StoreThemeConfig): Promise<{ success: boolean; message: string }> => {
    // 1. Broadcast to local storefront tabs instantly
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("giftfestive_storefront_theme", JSON.stringify(themeData));
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("giftfestive_store_theme");
          bc.postMessage({ type: "THEME_UPDATED", theme: themeData });
          bc.close();
        }
      } catch (e) {
        console.warn("Local broadcast error:", e);
      }
    }

    // 2. Persist to Backend API
    try {
      const res = await authApi().put("/store-settings/theme", themeData);
      return {
        success: true,
        message: res.data?.message || "Theme published to storefront successfully!",
      };
    } catch (err: any) {
      console.warn("Backend theme save warning:", err?.message);
      // Still consider success locally since broadcast and local storage updated
      return {
        success: true,
        message: "Theme applied locally and cached for storefront!",
      };
    }
  },
};
