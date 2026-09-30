import React from 'react';
import { Sun, Moon, Palette, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleButtonProps {
  compact?: boolean;
  showModeOnly?: boolean;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  compact = false,
  showModeOnly = false,
}) => {
  const { config, isDark, toggleThemeMode, setIsCustomizerOpen } = useTheme();

  const getThemeLabel = () => {
    switch (config.preset) {
      case 'light-pink':
        return 'Sakura Pink';
      case 'dark-rose-pink':
        return 'Velvet Rose';
      case 'mystic-violet':
        return 'Mystic Path';
      case 'mystic-light':
        return 'Ethereal Mist';
      case 'cyber-neon':
        return 'Cyber Neon';
      case 'midnight-indigo':
        return 'Midnight Indigo';
      case 'emerald-aurora':
        return 'Emerald Aurora';
      case 'classic-light':
        return 'Classic';
      default:
        return 'Light Pink';
    }
  };

  if (showModeOnly) {
    return (
      <button
        onClick={toggleThemeMode}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="p-2 rounded-xl border border-pink-400/30 bg-white/80 dark:bg-pink-950/50 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white hover:bg-pink-100/70 dark:hover:bg-pink-900/60 transition-all shadow-xs group cursor-pointer flex items-center justify-center"
        aria-label="Toggle Light/Dark Theme"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
        ) : (
          <Moon className="w-4 h-4 text-pink-600 group-hover:-rotate-12 transition-transform" />
        )}
      </button>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5">
        {/* Quick Dark/Light Toggle */}
        <button
          onClick={toggleThemeMode}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl border border-pink-400/30 bg-white/80 dark:bg-pink-950/50 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white hover:bg-pink-100/70 dark:hover:bg-pink-900/60 transition-all shadow-xs group cursor-pointer"
          aria-label="Toggle Light/Dark Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-pink-600 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Modal Opener */}
        <button
          onClick={() => setIsCustomizerOpen(true)}
          title={`Theme: ${getThemeLabel()} (Click to customize)`}
          className="relative p-2 rounded-xl border border-pink-400/30 bg-pink-100/60 dark:bg-pink-950/40 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white hover:bg-pink-200/60 dark:hover:bg-pink-900/60 transition-all shadow-xs group cursor-pointer"
          aria-label="Customize Theme"
        >
          <Palette className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1.5">
      {/* Quick 1-Click Dark/Light Toggle */}
      <button
        onClick={toggleThemeMode}
        title={isDark ? 'Switch to Light Mode (Sakura Pink)' : 'Switch to Dark Mode (Velvet Rose)'}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-pink-400/40 bg-white/80 dark:bg-pink-950/50 hover:bg-pink-50 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white transition-all shadow-xs cursor-pointer group"
        aria-label="Toggle Light/Dark Theme Mode"
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden lg:inline text-[11px]">Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-pink-600 group-hover:-rotate-12 transition-transform" />
            <span className="hidden lg:inline text-[11px]">Dark</span>
          </>
        )}
      </button>

      {/* Full Theme Customizer Button */}
      <button
        onClick={() => setIsCustomizerOpen(true)}
        className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-pink-400/40 bg-white/70 dark:bg-pink-950/40 hover:bg-pink-50 dark:hover:bg-pink-900/50 hover:border-pink-500/60 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white transition-all shadow-xs group cursor-pointer"
        title="Customize Theme Presets & Visual Appearance"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 group-hover:rotate-12 transition-transform" />
        </div>
        <span className="hidden sm:inline font-medium text-slate-600 dark:text-slate-300">
          Theme:
        </span>
        <span className="font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
          {getThemeLabel()}
        </span>
        <Palette className="w-3 h-3 text-pink-500 opacity-80 group-hover:opacity-100" />
      </button>
    </div>
  );
};
