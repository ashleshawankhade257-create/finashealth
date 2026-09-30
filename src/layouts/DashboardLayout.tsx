import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { TopHeader } from '../components/common/TopHeader';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
        <p className="text-sm font-semibold text-purple-200">Loading your financial dashboard...</p>
      </div>
    );
  }

  // Protected route check
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Onboarding enforcement
  if (!user.has_profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Get custom page title & subtitle based on path
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/credit-health':
        return {
          title: 'Credit Health & Bureau Indicators',
          subtitle: 'Detailed analysis of your DTI, credit card utilization, and simulated adjustments.'
        };
      case '/ai-advisor':
        return {
          title: 'Gemini AI Credit Advisor',
          subtitle: 'Personalized 5-step roadmap generated using Google Gemini 2.5 Flash.'
        };
      case '/progress':
        return {
          title: 'Credit Score Progress & History',
          subtitle: 'Historical CIBIL score timeline and improvement milestones.'
        };
      case '/profile':
        return {
          title: 'Financial Profile & Parameters',
          subtitle: 'Manage and update your monthly income, liabilities, and debt records.'
        };
      case '/settings':
        return {
          title: 'Account Settings & Integrations',
          subtitle: 'Connected Google OAuth accounts, dynamic theme personalization, and session security.'
        };
      default:
        return {};
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen relative flex z-10">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopHeader
          onMobileMenuToggle={() => setMobileSidebarOpen(true)}
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
