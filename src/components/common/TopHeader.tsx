import React from 'react';
import { Menu, Sparkles, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ThemeToggleButton } from './ThemeToggleButton';

interface TopHeaderProps {
  onMobileMenuToggle: () => void;
  title?: string;
  subtitle?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMobileMenuToggle,
  title,
  subtitle,
}) => {
  const { user } = useAuth();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <header className="h-16 theme-surface border-b theme-border sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-pink-600 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold theme-title leading-tight font-['Outfit']">
            {title || `${getGreeting()}, ${displayName}`}
          </h1>
          <p className="text-xs theme-muted hidden sm:block">
            {subtitle || 'Here is your real-time credit wellness and bureau metric breakdown.'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {/* Dynamic Theme Switcher Trigger */}
        <ThemeToggleButton />

        <Link
          to="/profile"
          className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border theme-border theme-title hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1 text-pink-500" />
          <span>Update Data</span>
        </Link>

        <Link
          to="/ai-advisor"
          className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl theme-btn-primary transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-white" />
          <span className="hidden sm:inline">AI</span> Advisor
        </Link>
      </div>
    </header>
  );
};
