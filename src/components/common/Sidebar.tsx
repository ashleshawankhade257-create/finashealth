import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  HeartPulse,
  Sparkles,
  TrendingUp,
  UserCheck,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { config, isDark, toggleThemeMode, setIsCustomizerOpen } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Credit Health', path: '/credit-health', icon: HeartPulse },
    { name: 'AI Advisor', path: '/ai-advisor', icon: Sparkles, badge: 'Gemini 2.5' },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Financial Profile', path: '/profile', icon: UserCheck },
    { name: 'Settings & Theme', path: '/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full theme-surface border-r theme-border">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b theme-border">
        <BrandLogo to="/dashboard" size="md" />

        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-pink-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider theme-muted">
            MAIN MENU
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/20 to-rose-400/20 text-pink-800 dark:text-white font-semibold border border-pink-400/50 shadow-xs'
                    : 'text-[#5a2c49] dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : 'theme-muted'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Quick Theme Switcher Trigger Card */}
      <div className="p-3.5 mx-3 mb-3 bg-pink-100/50 dark:bg-pink-950/40 rounded-2xl border border-pink-300 dark:border-pink-800/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2 text-pink-800 dark:text-pink-200 font-semibold text-xs">
            <Palette className="w-3.5 h-3.5 text-pink-500" />
            <span>Theme Mode</span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Direct Light/Dark Toggle */}
            <button
              onClick={toggleThemeMode}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1 rounded-lg bg-white/80 dark:bg-pink-900/50 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white border border-pink-300/40 cursor-pointer shadow-xs transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-pink-600" />}
            </button>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="text-[10px] font-bold text-pink-600 dark:text-pink-300 hover:underline cursor-pointer ml-1"
            >
              Customize
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#733d60] dark:text-slate-300/80">
          <span>Mode: <span className="font-bold text-pink-700 dark:text-pink-300">{isDark ? 'Dark 🌙' : 'Light ☀️'}</span></span>
          <span className="capitalize text-[10px] theme-muted truncate max-w-[90px]">{config.preset.replace('-', ' ')}</span>
        </div>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t theme-border bg-pink-50/40 dark:bg-pink-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-pink-400/50"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.name ? user.name[0] : 'U'}
              </div>
            )}
            <div className="truncate">
              <span className="text-xs font-semibold theme-title block truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] theme-muted block truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full theme-surface z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
