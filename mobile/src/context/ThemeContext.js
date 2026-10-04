import React, { createContext, useContext, useState, useEffect } from 'react';
import themeService, { DEFAULT_THEME } from '../services/themeService';
import { colors } from '../constants/theme';

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  loading: false,
  refreshTheme: async () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const data = await themeService.getStoreTheme();
      if (data) {
        setTheme(data);
        // Synchronize base colors
        if (data.primaryColor) colors.primary = data.primaryColor;
        if (data.secondaryColor) colors.secondary = data.secondaryColor;
        if (data.brandBerry) colors.brandBerry = data.brandBerry;
        if (data.brandGold) colors.brandGold = data.brandGold;
        if (data.brandCream) colors.brandCream = data.brandCream;
      }
    } catch (e) {
      console.warn('Error loading mobile theme:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, loading, refreshTheme: fetchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useStoreTheme = () => useContext(ThemeContext);
