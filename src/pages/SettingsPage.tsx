import React, { useState } from 'react';
import {
  Settings,
  User,
  Key,
  LogOut,
  CheckCircle2,
  Lock,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Check,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemePreset, AccentColor } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
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
    setIsCustomizerOpen
  } = useTheme();
  const navigate = useNavigate();
  const [presetFilter, setPresetFilter] = useState<'all' | 'light' | 'dark'>('all');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPinkTheme = config.preset === 'light-pink' || config.preset === 'dark-rose-pink';

  const presets: {
    id: ThemePreset;
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    isDark?: boolean;
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold theme-title font-['Outfit']">
          Account Settings & Atmosphere
        </h2>
        <p className="text-xs theme-muted">
          Manage Light and Dark theme modes, wallpaper opacity, connected Google OAuth credentials, and session privacy.
        </p>
      </div>

      {/* Dynamic Theme & Atmosphere Card */}
      <div className="theme-card rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-pink-500/20 dark:border-purple-900/40 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 dark:bg-purple-950/60 border border-pink-500/30 dark:border-purple-500/40 flex items-center justify-center text-pink-500 dark:text-cyan-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">
                Theme Appearance & Visual Mode
              </h3>
              <p className="text-xs theme-muted">
                {isDark ? 'Active: Dark Atmosphere 🌙' : 'Active: Light Atmosphere ☀️'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl theme-btn-primary"
          >
            Open Modal Customizer
          </button>
        </div>

        {/* PRIMARY THEME MODE (LIGHT / DARK) SELECTOR */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-purple-950/30 border border-pink-500/20 dark:border-purple-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider theme-title font-['Outfit'] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-cyan-400" />
                <span>Theme Mode Option</span>
              </h4>
              <p className="text-[11px] theme-muted">
                Toggle seamlessly between Light (Sakura & Mist) and Dark (Velvet & Night) modes
              </p>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-400/30">
              Currently: {isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Light Mode Button */}
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
                !isDark
                  ? 'border-pink-500 bg-pink-100/70 shadow-[0_0_20px_rgba(244,114,182,0.35)] ring-2 ring-pink-400'
                  : 'border-pink-500/15 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 hover:border-pink-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                !isDark ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-amber-500'
              }`}>
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold theme-title font-['Outfit']">Light Mode</span>
                  {!isDark && <Check className="w-4 h-4 text-pink-600 stroke-[3]" />}
                </div>
                <p className="text-[11px] theme-muted truncate">
                  Sakura Blush, Ethereal Mist & Clean Glass
                </p>
              </div>
            </button>

            {/* Dark Mode Button */}
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
                isDark
                  ? 'border-pink-400 dark:border-purple-400 bg-pink-900/40 dark:bg-purple-900/40 shadow-[0_0_20px_rgba(244,114,182,0.35)] ring-2 ring-pink-400 dark:ring-purple-400'
                  : 'border-pink-500/15 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 hover:border-pink-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDark ? 'bg-pink-600 dark:bg-purple-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-800 text-pink-400'
              }`}>
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold theme-title font-['Outfit']">Dark Mode</span>
                  {isDark && <Check className="w-4 h-4 text-pink-400 dark:text-cyan-400 stroke-[3]" />}
                </div>
                <p className="text-[11px] theme-muted truncate">
                  Velvet Plum, Mystic Canopy & Neon Night
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-cyan-400" />
              <span>Theme Presets Gallery</span>
            </label>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-pink-100/80 dark:bg-purple-950/60 p-1 rounded-xl border border-pink-300/40 dark:border-purple-800/40 text-[11px]">
              <button
                type="button"
                onClick={() => setPresetFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  presetFilter === 'all'
                    ? 'bg-pink-500 dark:bg-purple-600 text-white shadow-xs'
                    : 'theme-muted hover:text-pink-600 dark:hover:text-white'
                }`}
              >
                All ({presets.length})
              </button>
              <button
                type="button"
                onClick={() => setPresetFilter('light')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  presetFilter === 'light'
                    ? 'bg-pink-500 dark:bg-purple-600 text-white shadow-xs'
                    : 'theme-muted hover:text-pink-600 dark:hover:text-white'
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
                    ? 'bg-pink-500 dark:bg-purple-600 text-white shadow-xs'
                    : 'theme-muted hover:text-pink-600 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                Dark
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredPresets.map((p) => {
              const isActive = config.preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isActive
                      ? 'border-pink-500 dark:border-purple-400 bg-pink-500/10 dark:bg-purple-900/40 shadow-[0_0_20px_rgba(244,114,182,0.3)] ring-1 ring-pink-500 dark:ring-purple-400'
                      : 'border-pink-500/15 dark:border-purple-900/40 bg-white/40 dark:bg-purple-950/20 hover:border-pink-400 dark:hover:border-purple-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: p.primaryColor }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/20 -ml-2"
                        style={{ backgroundColor: p.secondaryColor }}
                      />
                      <span className="text-xs font-bold theme-title font-['Outfit'] ml-1">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className={`text-[8px] font-bold px-1 rounded ${
                        p.isDark
                          ? 'bg-purple-950 text-purple-200 border border-purple-500/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {p.isDark ? 'Dark' : 'Light'}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-pink-500 dark:text-cyan-400 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-[10px] theme-muted line-clamp-2">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallpaper Controls */}
        <div className="p-4 rounded-2xl bg-pink-500/5 dark:bg-purple-950/30 border border-pink-500/20 dark:border-purple-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-pink-500/40 dark:border-purple-500/40 shrink-0 shadow-sm">
                <img
                  src={isPinkTheme ? '/themes/light-pink-path.jpg' : '/themes/mystic-path.jpg'}
                  alt={isPinkTheme ? 'Sakura Pink Tree Path' : 'Mystic Tree Path'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold theme-title font-['Outfit'] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-500 dark:text-cyan-400" />
                  {isPinkTheme
                    ? 'Sakura Light Pink Avenue Wallpaper'
                    : 'Enchanted Purple Tree & Cyan Walkway Wallpaper'}
                </h4>
                <p className="text-[11px] theme-muted">
                  Toggle or fine-tune transparency and soft ambient blur
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => setWallpaperEnabled(!config.wallpaperEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                config.wallpaperEnabled
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400'
                  : 'bg-slate-300 dark:bg-slate-700'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-pink-500/15 dark:border-purple-900/40">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold theme-title">
                  <span>Wallpaper Opacity</span>
                  <span className="text-pink-500 dark:text-cyan-400">{config.wallpaperOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={config.wallpaperOpacity}
                  onChange={(e) => setWallpaperOpacity(parseInt(e.target.value, 10))}
                  className="w-full accent-pink-500 dark:accent-purple-500 bg-pink-100 dark:bg-purple-900/60 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold theme-title">
                  <span>Wallpaper Soft Blur</span>
                  <span className="text-pink-500 dark:text-cyan-400">{config.wallpaperBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.wallpaperBlur}
                  onChange={(e) => setWallpaperBlur(parseInt(e.target.value, 10))}
                  className="w-full accent-pink-500 dark:accent-cyan-400 bg-pink-100 dark:bg-purple-900/60 rounded-lg h-1.5 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Accent Tints & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold theme-muted mr-1">Accent:</span>
            {accents.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setAccentColor(acc.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                  config.accentColor === acc.id
                    ? `${acc.border} bg-pink-500/15 dark:bg-purple-900/60 theme-title ring-1 ring-pink-500 dark:ring-purple-400`
                    : 'border-pink-500/20 dark:border-purple-900/40 theme-muted hover:bg-pink-500/10 dark:hover:bg-purple-900/20'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${acc.bg}`} />
                <span>{acc.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={resetTheme}
            className="inline-flex items-center text-xs font-semibold theme-muted hover:text-pink-600 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-pink-500/10 dark:hover:bg-purple-900/30 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Theme
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="theme-card rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-muted uppercase tracking-wider mb-4 flex items-center space-x-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>User Profile</span>
        </h3>

        <div className="flex items-center space-x-4">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border border-purple-500/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xl uppercase font-['Outfit'] shadow-md">
              {user?.name ? user.name[0] : 'U'}
            </div>
          )}

          <div>
            <h4 className="text-base font-bold theme-title font-['Outfit']">{user?.name}</h4>
            <p className="text-xs theme-muted">{user?.email}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950/40 text-purple-200 border border-purple-500/30">
                Provider: {user?.auth_provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
              </span>
              {user?.auth_provider === 'google' && (
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified Identity
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google OAuth & Cloud Console Setup Guide */}
      <div className="theme-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Key className="w-4 h-4" />
          <span>Google OAuth 2.0 Setup Guide</span>
        </div>

        <h3 className="text-base font-bold theme-title font-['Outfit']">
          Configuring Real Google / Gmail Sign-In in Google Cloud Console
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">
          Credit Assistant implements official Google OAuth 2.0 authentication. To enable your custom Google Cloud client credentials for local or production use, follow these steps:
        </p>

        <div className="bg-purple-950/40 rounded-2xl p-4 border border-purple-800/40 text-xs text-slate-300 space-y-2">
          <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-300">
            <li>
              Navigate to the <span className="font-semibold text-white">Google Cloud Console</span> (console.cloud.google.com).
            </li>
            <li>
              Create a new project or select an existing project.
            </li>
            <li>
              Go to <span className="font-semibold text-white">APIs & Services &gt; OAuth consent screen</span> and configure the User Type (External or Internal).
            </li>
            <li>
              Add the minimal required scopes: <code className="bg-purple-900/60 px-1 py-0.5 rounded text-cyan-300">openid</code>, <code className="bg-purple-900/60 px-1 py-0.5 rounded text-cyan-300">email</code>, <code className="bg-purple-900/60 px-1 py-0.5 rounded text-cyan-300">profile</code>.
            </li>
            <li>
              Go to <span className="font-semibold text-white">Credentials &gt; Create Credentials &gt; OAuth client ID</span>. Choose "Web application".
            </li>
            <li>
              Add Authorized JavaScript origins:
              <div className="bg-[#0b0616] text-purple-300 font-mono text-[11px] p-2 rounded-xl mt-1 select-all border border-purple-900/60">
                http://localhost:3000<br />
                http://localhost:5173
              </div>
            </li>
            <li>
              Add Authorized redirect URIs:
              <div className="bg-[#0b0616] text-cyan-400 font-mono text-[11px] p-2 rounded-xl mt-1 select-all border border-cyan-900/60">
                http://localhost:8000/auth/google/callback<br />
                http://localhost:3000/auth/callback
              </div>
            </li>
            <li>
              Copy the <span className="font-semibold text-white">Client ID</span> and <span className="font-semibold text-white">Client Secret</span> into your <code className="bg-purple-900/60 px-1 py-0.5 rounded text-cyan-300">.env</code> file.
            </li>
          </ol>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 flex items-start space-x-2">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <span className="font-bold text-white">Security Standard:</span> The application never requests, reads, or stores Google passwords. Authentication happens directly on Google's consent screen.
          </span>
        </div>
      </div>

      {/* Session Controls */}
      <div className="theme-card rounded-3xl p-6 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold theme-title">Sign Out of Session</h4>
          <p className="text-xs theme-muted">Safely clear stored access tokens from your browser.</p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
