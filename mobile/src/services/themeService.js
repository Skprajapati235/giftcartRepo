import api, { handleApiError } from '../api/apiClient';

export const DEFAULT_THEME = {
  key: "storefront_theme",
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
};

const themeService = {
  getStoreTheme: async () => {
    try {
      const response = await api.get('/store-settings/theme');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return DEFAULT_THEME;
    } catch (error) {
      console.warn('Could not fetch mobile store theme:', error?.message);
      return DEFAULT_THEME;
    }
  },
};

export default themeService;
