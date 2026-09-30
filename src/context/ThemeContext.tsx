import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemePreset =
  | 'light-pink'       // Primary Light Pink Theme (Sakura Blossom & Rose Quartz)
  | 'dark-rose-pink'   // Dark Velvet Rose & Neon Pink Mode
  | 'mystic-violet'    // Enchanted Violet & Cyan Path Mode
  | 'mystic-light'     // Ethereal Mist & Lilac Light Mode
  | 'cyber-neon'       // Cyberpunk Neon Magenta & Electric Cyan
  | 'midnight-indigo'  // Deep Midnight Indigo & Electric Blue
  | 'emerald-aurora'   // Enchanted Forest Emerald & Cyan
  | 'classic-light';   // Clean Financial Slate & Indigo

export type AccentColor = 'pink' | 'rose' | 'violet' | 'cyan' | 'fuchsia' | 'emerald' | 'indigo' | 'amber';

export interface ThemeConfig {
  preset: ThemePreset;
  wallpaperEnabled: boolean;
  wallpaperOpacity: number; // 0 to 100
  wallpaperBlur: number;    // 0 to 20 px
  glassmorphism: boolean;
  glowEffects: boolean;
  accentColor: AccentColor;
  floatingParticles: boolean;
}

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'light-pink',
  wallpaperEnabled: true,
  wallpaperOpacity: 25,
  wallpaperBlur: 1,
  glassmorphism: true,
  glowEffects: true,
  accentColor: 'pink',
  floatingParticles: true,
};

interface ThemeContextType {
  config: ThemeConfig;
  isDark: boolean;
  themeMode: 'light' | 'dark';
  toggleThemeMode: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setPreset: (preset: ThemePreset) => void;
  setWallpaperEnabled: (enabled: boolean) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setWallpaperBlur: (blur: number) => void;
  setGlassmorphism: (glass: boolean) => void;
  setGlowEffects: (glow: boolean) => void;
  setAccentColor: (accent: AccentColor) => void;
  setFloatingParticles: (particles: boolean) => void;
  resetTheme: () => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'credit_assistant_theme_config_v3';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load saved theme:', e);
    }
    return DEFAULT_THEME_CONFIG;
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const isDark =
    config.preset === 'mystic-violet' ||
    config.preset === 'cyber-neon' ||
    config.preset === 'midnight-indigo' ||
    config.preset === 'emerald-aurora' ||
    config.preset === 'dark-rose-pink';

  const themeMode: 'light' | 'dark' = isDark ? 'dark' : 'light';

  // Apply theme attributes to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', config.preset);
    root.setAttribute('data-glass', config.glassmorphism ? 'true' : 'false');
    root.setAttribute('data-glow', config.glowEffects ? 'true' : 'false');
    root.setAttribute('data-accent', config.accentColor);
    
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Save to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to persist theme config:', e);
    }
  }, [config, isDark]);

  const setPreset = (preset: ThemePreset) => {
    setConfig((prev) => ({
      ...prev,
      preset,
      accentColor:
        preset === 'light-pink'
          ? 'pink'
          : preset === 'dark-rose-pink'
          ? 'rose'
          : prev.accentColor
    }));
  };

  const setThemeMode = (mode: 'light' | 'dark') => {
    if (mode === 'light' && isDark) {
      // Switch from dark to light
      if (config.preset === 'dark-rose-pink') {
        setPreset('light-pink');
      } else if (config.preset === 'mystic-violet') {
        setPreset('mystic-light');
      } else if (config.preset === 'midnight-indigo' || config.preset === 'classic-light') {
        setPreset('classic-light');
      } else {
        setPreset('light-pink');
      }
    } else if (mode === 'dark' && !isDark) {
      // Switch from light to dark
      if (config.preset === 'light-pink') {
        setPreset('dark-rose-pink');
      } else if (config.preset === 'mystic-light') {
        setPreset('mystic-violet');
      } else if (config.preset === 'classic-light') {
        setPreset('midnight-indigo');
      } else {
        setPreset('dark-rose-pink');
      }
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const setWallpaperEnabled = (wallpaperEnabled: boolean) => {
    setConfig((prev) => ({ ...prev, wallpaperEnabled }));
  };

  const setWallpaperOpacity = (wallpaperOpacity: number) => {
    setConfig((prev) => ({ ...prev, wallpaperOpacity }));
  };

  const setWallpaperBlur = (wallpaperBlur: number) => {
    setConfig((prev) => ({ ...prev, wallpaperBlur }));
  };

  const setGlassmorphism = (glassmorphism: boolean) => {
    setConfig((prev) => ({ ...prev, glassmorphism }));
  };

  const setGlowEffects = (glowEffects: boolean) => {
    setConfig((prev) => ({ ...prev, glowEffects }));
  };

  const setAccentColor = (accentColor: AccentColor) => {
    setConfig((prev) => ({ ...prev, accentColor }));
  };

  const setFloatingParticles = (floatingParticles: boolean) => {
    setConfig((prev) => ({ ...prev, floatingParticles }));
  };

  const resetTheme = () => {
    setConfig(DEFAULT_THEME_CONFIG);
  };

  return (
    <ThemeContext.Provider
      value={{
        config,
        isDark,
        themeMode,
        toggleThemeMode,
        setThemeMode,
        setPreset,
        setWallpaperEnabled,
        setWallpaperOpacity,
        setWallpaperBlur,
        setGlassmorphism,
        setGlowEffects,
        setAccentColor,
        setFloatingParticles,
        resetTheme,
        isCustomizerOpen,
        setIsCustomizerOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
