import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggleButton } from './ThemeToggleButton';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 theme-surface border-b theme-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <BrandLogo to="/" size="md" />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#5a2c49] dark:text-pink-200/80">
          <a href="#how-it-works" className="hover:text-pink-600 dark:hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#monitoring" className="hover:text-pink-600 dark:hover:text-white transition-colors">
            Credit Health
          </a>
          <a href="#ai-insights" className="hover:text-pink-600 dark:hover:text-white transition-colors">
            AI Advisor
          </a>
          <a href="#security" className="hover:text-pink-600 dark:hover:text-white transition-colors">
            Security & Privacy
          </a>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Quick Theme Switcher */}
          <ThemeToggleButton />

          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-semibold px-4 py-2 rounded-2xl theme-btn-primary transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold px-3.5 py-2 text-[#5a2c49] dark:text-pink-200 hover:text-pink-700 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center text-sm font-semibold px-4 py-2 rounded-2xl theme-btn-primary transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggleButton compact />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-pink-600 dark:text-pink-300 hover:text-pink-800 dark:hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden theme-surface border-b theme-border px-4 pt-2 pb-5 space-y-3">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium theme-title"
          >
            How It Works
          </a>
          <a
            href="#monitoring"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium theme-title"
          >
            Credit Health
          </a>
          <a
            href="#ai-insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium theme-title"
          >
            AI Advisor
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium theme-title"
          >
            Security & Privacy
          </a>
          <div className="pt-3 border-t theme-border flex flex-col space-y-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-2xl theme-btn-primary font-semibold text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 theme-title font-semibold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-2xl theme-btn-primary font-semibold text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
