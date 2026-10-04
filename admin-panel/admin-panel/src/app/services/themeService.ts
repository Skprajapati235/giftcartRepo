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
  category: "Festivals" | "Luxury" | "Pastels" | "Vibrant" | "Dark Mode" | "Gourmet";
  tagline: string;
  previewGradient: string;
  config: Partial<StoreThemeConfig>;
}> = [
  {
    id: "festive-pink",
    name: "Festive Pink (Signature)",
    category: "Festivals",
    tagline: "Vibrant Celebration & Signature Gifting",
    previewGradient: "from-pink-500 via-rose-500 to-amber-400",
    config: {
      presetId: "festive-pink",
      presetName: "Festive Pink (Signature)",
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
    category: "Luxury",
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
    id: "emerald-luxury",
    name: "Imperial Emerald & Gold",
    category: "Luxury",
    tagline: "High-Society Weddings & Prestigious Gala Treats",
    previewGradient: "from-emerald-700 via-teal-600 to-amber-400",
    config: {
      presetId: "emerald-luxury",
      presetName: "Imperial Emerald & Gold",
      primaryColor: "#047857",
      secondaryColor: "#E0B858",
      brandBerry: "#064E3B",
      brandGold: "#FDE68A",
      brandCream: "#F0FDF4",
      backgroundColor: "#ffffff",
      textColor: "#06281E",
      announcementBar: {
        enabled: true,
        text: "⚜️ Imperial Collection: Handcrafted 3-Tier Luxury Cakes with Gold Leafing",
        bgColor: "#064E3B",
        textColor: "#FDE68A",
        link: "/categories",
      },
      storeTagline: "Elegance Defined in Every Royal Bite",
      badgeText: "👑 Artisanal 24k Gold Accents",
    },
  },
  {
    id: "valentine-red",
    name: "Valentine Romantic Red",
    category: "Festivals",
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
    category: "Festivals",
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
    id: "lavender-dream",
    name: "Korean Lilac & Lavender",
    category: "Pastels",
    tagline: "Aesthetic Bento Cakes & Dreamy Pastel Vibes",
    previewGradient: "from-purple-500 via-violet-400 to-pink-300",
    config: {
      presetId: "lavender-dream",
      presetName: "Korean Lilac & Lavender",
      primaryColor: "#8B5CF6",
      secondaryColor: "#EC4899",
      brandBerry: "#4C1D95",
      brandGold: "#DDD6FE",
      brandCream: "#F5F3FF",
      backgroundColor: "#ffffff",
      textColor: "#2E1065",
      announcementBar: {
        enabled: true,
        text: "🌸 Aesthetic Bento Cakes & Flower Hampers: Trending Korean Pastels!",
        bgColor: "#4C1D95",
        textColor: "#DDD6FE",
        link: "/categories",
      },
      storeTagline: "Cute, Aesthetic & Irresistibly Delicious Cakes",
      badgeText: "🧁 Instagram-Worthy Bento Delights",
    },
  },
  {
    id: "sunset-coral",
    name: "Sunset Coral & Tangerine",
    category: "Vibrant",
    tagline: "Tropical Energy, Zesty Citrus & Summer Euphoria",
    previewGradient: "from-orange-500 via-amber-500 to-rose-400",
    config: {
      presetId: "sunset-coral",
      presetName: "Sunset Coral & Tangerine",
      primaryColor: "#EA580C",
      secondaryColor: "#F59E0B",
      brandBerry: "#7C2D12",
      brandGold: "#FDE68A",
      brandCream: "#FFFBEB",
      backgroundColor: "#ffffff",
      textColor: "#451A03",
      announcementBar: {
        enabled: true,
        text: "☀️ Summer Glow Fest: Free Mango Gelato cup with all Fruit Cakes!",
        bgColor: "#7C2D12",
        textColor: "#FDE68A",
        link: "/categories",
      },
      storeTagline: "Zesty Flavors & Sun-Drenched Gifting",
      badgeText: "🥭 Fresh Alphonso Mango Infused",
    },
  },
  {
    id: "ocean-cyan",
    name: "Aqua Marine & Cyan Wave",
    category: "Vibrant",
    tagline: "Cool Ocean Breeze, Ice Blue & Serene Elegance",
    previewGradient: "from-cyan-500 via-blue-500 to-indigo-600",
    config: {
      presetId: "ocean-cyan",
      presetName: "Aqua Marine & Cyan Wave",
      primaryColor: "#0284C7",
      secondaryColor: "#06B6D4",
      brandBerry: "#0C4A6E",
      brandGold: "#BAE6FD",
      brandCream: "#F0F9FF",
      backgroundColor: "#ffffff",
      textColor: "#082F49",
      announcementBar: {
        enabled: true,
        text: "🌊 Cool Celebrations: Get 20% OFF on all Blueberry & Ice Cheesecakes!",
        bgColor: "#0C4A6E",
        textColor: "#BAE6FD",
        link: "/categories",
      },
      storeTagline: "Refreshing Flavors Crafted for Unforgettable Moments",
      badgeText: "❄️ Chilled Dessert Perfection",
    },
  },
  {
    id: "chocolate-caramel",
    name: "Belgian Cocoa & Salted Caramel",
    category: "Gourmet",
    tagline: "Rich Dark Truffle, Fudge & Decadent Indulgence",
    previewGradient: "from-amber-900 via-stone-800 to-amber-500",
    config: {
      presetId: "chocolate-caramel",
      presetName: "Belgian Cocoa & Salted Caramel",
      primaryColor: "#78350F",
      secondaryColor: "#D97706",
      brandBerry: "#451A03",
      brandGold: "#FCD34D",
      brandCream: "#FFFBEB",
      backgroundColor: "#ffffff",
      textColor: "#291506",
      announcementBar: {
        enabled: true,
        text: "🍫 Belgian Chocolate Month: Free Handmade Truffle Box with Chocolate Cakes",
        bgColor: "#451A03",
        textColor: "#FCD34D",
        link: "/categories",
      },
      storeTagline: "Pure Belgian Chocolate Pure Pleasure in Every Slice",
      badgeText: "🍫 70% Dark Couverture Chocolate",
    },
  },
  {
    id: "spring-teal",
    name: "Spring Meadow Teal",
    category: "Pastels",
    tagline: "Fresh Pastels, Organic Delights & Cheerful Vibe",
    previewGradient: "from-teal-500 via-emerald-400 to-amber-300",
    config: {
      presetId: "spring-teal",
      presetName: "Spring Meadow Teal",
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
  {
    id: "holi-celebration",
    name: "Holi Gulal & Saffron Festival",
    category: "Festivals",
    tagline: "Explosive Colors, Joyous Saffron & Festive Thandai",
    previewGradient: "from-pink-500 via-yellow-400 to-emerald-500",
    config: {
      presetId: "holi-celebration",
      presetName: "Holi Gulal & Saffron Festival",
      primaryColor: "#DB2777",
      secondaryColor: "#EAB308",
      brandBerry: "#831843",
      brandGold: "#FEF08A",
      brandCream: "#FEFCE8",
      backgroundColor: "#ffffff",
      textColor: "#1f1020",
      announcementBar: {
        enabled: true,
        text: "🎨 Holi Hai! Free Organic Herbal Gulal + Gujiya Box on all Party Orders!",
        bgColor: "#831843",
        textColor: "#FEF08A",
        link: "/categories",
      },
      storeTagline: "Spread Sweet Colors & Endless Happiness",
      badgeText: "🎉 Festive Party Bundles",
    },
  },
  {
    id: "christmas-holiday",
    name: "Christmas Velvet & Pine Holly",
    category: "Festivals",
    tagline: "Mulled Wine, Rum Plum Cakes & Winter Frost",
    previewGradient: "from-red-600 via-emerald-700 to-amber-400",
    config: {
      presetId: "christmas-holiday",
      presetName: "Christmas Velvet & Pine Holly",
      primaryColor: "#DC2626",
      secondaryColor: "#15803D",
      brandBerry: "#7F1D1D",
      brandGold: "#FEF08A",
      brandCream: "#FEF2F2",
      backgroundColor: "#ffffff",
      textColor: "#260606",
      announcementBar: {
        enabled: true,
        text: "🎄 Merry Christmas! Pre-order Authentic Aged Plum Cakes with Santa Treats",
        bgColor: "#7F1D1D",
        textColor: "#FEF08A",
        link: "/categories",
      },
      storeTagline: "Warm Winter Joy & Authentic Holiday Feasts",
      badgeText: "🎅 Authentic Spiced Plum Delights",
    },
  },
  {
    id: "midnight-dark",
    name: "Midnight Velvet Noir",
    category: "Dark Mode",
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
    id: "noir-ruby",
    name: "Gothic Noir & Electric Ruby",
    category: "Dark Mode",
    tagline: "Ultra-Premium Dark Luxury with Neon Ruby Glow",
    previewGradient: "from-zinc-900 via-rose-600 to-slate-950",
    config: {
      presetId: "noir-ruby",
      presetName: "Gothic Noir & Electric Ruby",
      primaryColor: "#E11D48",
      secondaryColor: "#F43F5E",
      brandBerry: "#18181B",
      brandGold: "#FDA4AF",
      brandCream: "#FFF1F2",
      backgroundColor: "#ffffff",
      textColor: "#09090b",
      announcementBar: {
        enabled: true,
        text: "⚡ VIP Midnight Club: Priority Jet Delivery in 20 Minutes Flat!",
        bgColor: "#18181B",
        textColor: "#FDA4AF",
        link: "/delivery-hours",
      },
      storeTagline: "High-Octane Luxury & Lightning Midnight Deliveries",
      badgeText: "🖤 VIP Midnight Exclusive",
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
