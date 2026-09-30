import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Sliders,
  Check,
  RotateCcw,
  Wand2,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme, ThemePreset, AccentColor } from '../../context/ThemeContext';

export const ThemeCustomizerModal: React.FC = () => {
  const {
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
  } = useTheme();

  const [presetFilter, setPresetFilter] = useState<'all' | 'light' | 'dark'>('all');

  if (!isCustomizerOpen) return null;

  const isPinkTheme = config.preset === 'light-pink' || config.preset === 'dark-rose-pink';

  const presets: {
    id: ThemePreset;
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    isDark: boolean;
    featured?: boolean;
  }[] = [
    {
      id: 'light-pink',
      name: 'Sakura Light Pink',
      description: 'Airy blush pink, sakura tree canopy & rose quartz glassmorphism',
      primaryColor: '#f472b6',
      secondaryColor: '#fb7185',
      isDark: false,
      featured: true,
    },
    {
      id: 'dark-rose-pink',
      name: 'Velvet Rose & Plum (Dark)',
      description: 'Velvety dark plum background with radiant neon light pink highlights',
      primaryColor: '#f472b6',
      secondaryColor: '#fb7185',
      isDark: true,
    },
    {
      id: 'mystic-violet',
      name: 'Mystic Violet (Path Theme)',
      description: 'Enchanted violet canopy with glowing cyan path from provided image',
      primaryColor: '#a855f7',
      secondaryColor: '#06b6d4',
      isDark: true,
    },
    {
      id: 'mystic-light',
      name: 'Ethereal Mist (Light)',
      description: 'Bright lilac glow and cyan accents with frosted glassmorphic cards',
      primaryColor: '#9333ea',
      secondaryColor: '#0891b2',
      isDark: false,
    },
    {
      id: 'cyber-neon',
      name: 'Cyber Neon',
      description: 'High-contrast dark carbon with laser magenta & neon turquoise',
      primaryColor: '#e879f9',
      secondaryColor: '#22d3ee',
      isDark: true,
    },
    {
      id: 'midnight-indigo',
      name: 'Midnight Indigo',
      description: 'Deep navy blue & electric royal indigo financial theme',
      primaryColor: '#6366f1',
      secondaryColor: '#38bdf8',
      isDark: true,
    },
    {
      id: 'emerald-aurora',
      name: 'Emerald Aurora',
      description: 'Enchanted wealth forest with glowing emerald & teal path',
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
      isDark: true,
    },
    {
      id: 'classic-light',
      name: 'Classic Corporate',
      description: 'Clean slate and crisp minimalist corporate palette',
      primaryColor: '#4f46e5',
      secondaryColor: '#0284c7',
      isDark: false,
    },
  ];

  const filteredPresets = presets.filter((p) => {
    if (presetFilter === 'light') return !p.isDark;
    if (presetFilter === 'dark') return p.isDark;
    return true;
  });

  const accents: { id: AccentColor; label: string; bg: string; border: string }[] = [
    { id: 'pink', label: 'Light Pink', bg: 'bg-pink-400', border: 'border-pink-400' },
    { id: 'rose', label: 'Rose Blush', bg: 'bg-rose-400', border: 'border-rose-400' },
    { id: 'violet', label: 'Violet', bg: 'bg-purple-500', border: 'border-purple-400' },
    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', border: 'border-cyan-400' },
    { id: 'fuchsia', label: 'Fuchsia', bg: 'bg-fuchsia-500', border: 'border-fuchsia-400' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', border: 'border-emerald-400' },
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-400' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-500', border: 'border-amber-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => setIsCustomizerOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#fff5f9] dark:bg-[#1a0822] text-[#371b3e] dark:text-slate-100 rounded-3xl border border-pink-400/40 shadow-[0_0_60px_rgba(244,114,182,0.25)] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-200 dark:border-pink-900/40 bg-pink-100/50 dark:bg-pink-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1f1024] dark:text-white font-['Outfit'] flex items-center gap-2">
                Dynamic Theme & Atmosphere
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-400/40">
                  {themeMode.toUpperCase()} MODE
                </span>
              </h3>
              <p className="text-xs text-pink-700/80 dark:text-pink-200/70">
                Switch between Light & Dark themes, adjust wallpaper opacity, blur, and glow
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-white hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* PRIMARY LIGHT & DARK THEME MODE OPTION */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-pink-950/40 border border-pink-300/60 dark:border-pink-800/50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1f1024] dark:text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-1.5">
                  <span>Theme Mode Option</span>
                </h4>
                <p className="text-[11px] text-[#733d60] dark:text-pink-200/70">
                  Select your primary display mode: Crisp Light or Immersive Dark
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-400/30">
                Currently: {isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Light Mode Option Button */}
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 text-left ${
                  !isDark
                    ? 'border-pink-500 bg-pink-100/70 shadow-[0_0_20px_rgba(244,114,182,0.35)] ring-2 ring-pink-400 text-[#1f1024]'
                    : 'border-pink-200/70 dark:border-pink-900/40 bg-white/60 dark:bg-pink-950/20 text-slate-700 dark:text-slate-300 hover:border-pink-400 hover:bg-pink-50/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  !isDark ? 'bg-amber-400 text-slate-900 shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-amber-500'
                }`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-['Outfit']">Light Mode</span>
                    {!isDark && <Check className="w-3.5 h-3.5 text-pink-600 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-[#733d60] dark:text-slate-400 truncate">
                    Sakura Blush & Rose Quartz
                  </p>
                </div>
              </button>

              {/* Dark Mode Option Button */}
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 text-left ${
                  isDark
                    ? 'border-pink-400 bg-pink-900/50 shadow-[0_0_20px_rgba(244,114,182,0.35)] ring-2 ring-pink-400 text-white'
                    : 'border-pink-200/70 dark:border-pink-900/40 bg-white/60 dark:bg-pink-950/20 text-slate-700 dark:text-slate-300 hover:border-pink-400 hover:bg-pink-50/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-pink-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-pink-400'
                }`}>
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-['Outfit']">Dark Mode</span>
                    {isDark && <Check className="w-3.5 h-3.5 text-pink-400 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-[#733d60] dark:text-slate-400 truncate">
                    Velvet Rose & Mystic Night
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Theme Presets Gallery */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>Theme Presets Gallery</span>
              </label>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-pink-200/50 dark:bg-pink-950/60 p-1 rounded-xl border border-pink-300/40 dark:border-pink-800/40 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPresetFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    presetFilter === 'all'
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'text-pink-800 dark:text-pink-200 hover:text-pink-950'
                  }`}
                >
                  All ({presets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPresetFilter('light')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    presetFilter === 'light'
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'text-pink-800 dark:text-pink-200 hover:text-pink-950'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPresetFilter('dark')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    presetFilter === 'dark'
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'text-pink-800 dark:text-pink-200 hover:text-pink-950'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  Dark
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPresets.map((p) => {
                const isActive = config.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                      isActive
                        ? 'border-pink-400 bg-pink-100/60 dark:bg-pink-900/40 shadow-[0_0_20px_rgba(244,114,182,0.3)] ring-2 ring-pink-400'
                        : 'border-pink-200/80 dark:border-pink-900/40 bg-white/70 dark:bg-pink-950/20 hover:border-pink-300 hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-pink-200 shadow-xs"
                          style={{ backgroundColor: p.primaryColor }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-pink-200 shadow-xs -ml-2.5"
                          style={{ backgroundColor: p.secondaryColor }}
                        />
                        <span className="text-xs font-bold text-[#1f1024] dark:text-white font-['Outfit']">
                          {p.name}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                          p.isDark
                            ? 'bg-purple-950/60 text-purple-200 border border-purple-500/30'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {p.isDark ? 'Dark' : 'Light'}
                        </span>
                        {p.featured && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-xs">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#733d60] dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </p>

                    {/* Active Check */}
                    {isActive && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallpaper & Nature Path Atmosphere */}
          <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-pink-400/40 shrink-0 shadow-sm">
                  <img
                    src={isPinkTheme ? '/themes/light-pink-path.jpg' : '/themes/mystic-path.jpg'}
                    alt="Wallpaper"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1f1024] dark:text-white font-['Outfit'] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                    {isPinkTheme ? 'Sakura Light Pink Avenue Wallpaper' : 'Enchanted Nature Path Wallpaper'}
                  </h4>
                  <p className="text-[11px] text-[#733d60] dark:text-pink-200/60">
                    Render high-res nature canopy, cobblestone path, and mist
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setWallpaperEnabled(!config.wallpaperEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.wallpaperEnabled ? 'bg-gradient-to-r from-pink-400 to-rose-400' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.wallpaperEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.wallpaperEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-pink-200 dark:border-pink-900/40">
                {/* Opacity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-[#5a2c49] dark:text-pink-200">
                    <span>Wallpaper Opacity</span>
                    <span className="text-pink-600 dark:text-pink-400 font-bold">{config.wallpaperOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={config.wallpaperOpacity}
                    onChange={(e) => setWallpaperOpacity(parseInt(e.target.value, 10))}
                    className="w-full accent-pink-500 bg-pink-200 dark:bg-pink-900/60 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                {/* Blur Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-[#5a2c49] dark:text-pink-200">
                    <span>Wallpaper Soft Blur</span>
                    <span className="text-pink-600 dark:text-pink-400 font-bold">{config.wallpaperBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={config.wallpaperBlur}
                    onChange={(e) => setWallpaperBlur(parseInt(e.target.value, 10))}
                    className="w-full accent-pink-500 bg-pink-200 dark:bg-pink-900/60 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visual Effects Toggles */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-500" />
              <span>Atmosphere & Styling Effects</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Glassmorphism */}
              <button
                onClick={() => setGlassmorphism(!config.glassmorphism)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config.glassmorphism
                    ? 'border-pink-400 bg-pink-100/50 dark:bg-pink-900/40 shadow-xs'
                    : 'border-pink-200 dark:border-pink-900/30 bg-white/60 dark:bg-pink-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1f1024] dark:text-white">Glassmorphism</span>
                  <div className={`w-3 h-3 rounded-full ${config.glassmorphism ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </div>
                <span className="text-[10px] text-[#733d60] dark:text-slate-400 mt-1">
                  Translucent frosted cards
                </span>
              </button>

              {/* Neon Glow */}
              <button
                onClick={() => setGlowEffects(!config.glowEffects)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config.glowEffects
                    ? 'border-pink-400 bg-pink-100/50 dark:bg-pink-900/40 shadow-xs'
                    : 'border-pink-200 dark:border-pink-900/30 bg-white/60 dark:bg-pink-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1f1024] dark:text-white">Neon Aura Glow</span>
                  <div className={`w-3 h-3 rounded-full ${config.glowEffects ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </div>
                <span className="text-[10px] text-[#733d60] dark:text-slate-400 mt-1">
                  Luminescent borders & lights
                </span>
              </button>

              {/* Floating Particles */}
              <button
                onClick={() => setFloatingParticles(!config.floatingParticles)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config.floatingParticles
                    ? 'border-pink-400 bg-pink-100/50 dark:bg-pink-900/40 shadow-xs'
                    : 'border-pink-200 dark:border-pink-900/30 bg-white/60 dark:bg-pink-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1f1024] dark:text-white">Sakura Petals</span>
                  <div className={`w-3 h-3 rounded-full ${config.floatingParticles ? 'bg-rose-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </div>
                <span className="text-[10px] text-[#733d60] dark:text-slate-400 mt-1">
                  Floating petals & motes
                </span>
              </button>
            </div>
          </div>

          {/* Accent Color Override */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300 mb-3 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-pink-500" />
              <span>Accent Color Tint</span>
            </label>

            <div className="flex flex-wrap gap-2.5">
              {accents.map((acc) => {
                const isActive = config.accentColor === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => setAccentColor(acc.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
                      isActive
                        ? `${acc.border} bg-pink-100 dark:bg-pink-900/50 text-pink-900 dark:text-white shadow-sm ring-2 ring-pink-400`
                        : 'border-pink-200 dark:border-pink-900/40 text-[#733d60] dark:text-pink-200/70 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${acc.bg}`} />
                    <span>{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-pink-200 dark:border-pink-900/40 bg-pink-100/40 dark:bg-pink-950/40">
          <button
            onClick={resetTheme}
            className="inline-flex items-center text-xs font-semibold text-pink-700 dark:text-pink-300 hover:text-pink-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-pink-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset to Light Pink
          </button>

          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 text-white font-bold text-xs hover:opacity-90 shadow-lg shadow-pink-500/30 transition-all cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
