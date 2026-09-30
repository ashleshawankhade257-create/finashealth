import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Palette
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BrandLogo } from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { user, loginWithGoogle } = useAuth();
  const { setIsCustomizerOpen } = useTheme();

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      alert(err.message || 'Google OAuth is not configured with client credentials yet.');
    }
  };

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-cyan-300 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>Empowered by Google Gemini 2.5 Flash & Dynamic Theme</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold theme-title tracking-tight font-['Outfit'] leading-[1.15]">
              Take Control of Your <span className="theme-gradient-text">Credit Health</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal">
              Understand your credit, identify financial bottlenecks, and build a personalized roadmap toward better financial health with real-time dynamic atmosphere.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-2xl theme-btn-primary font-bold text-sm transition-all"
                >
                  Enter Your Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-2xl theme-btn-primary font-bold text-sm transition-all"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-2xl border theme-border theme-surface theme-title font-bold text-sm hover:bg-purple-900/30 transition-all shadow-xs cursor-pointer"
                  >
                    {/* Official Google 'G' icon */}
                    <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </>
              )}

              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-purple-200 hover:text-white hover:bg-purple-900/50 font-bold text-sm transition-all shadow-xs cursor-pointer"
              >
                <Palette className="w-4 h-4 mr-2 text-cyan-400" />
                Customize Theme
              </button>
            </div>

            <p className="mt-4 text-xs theme-muted">
              No credit card required. 100% educational privacy-first guidance for Indian credit scoring.
            </p>
          </div>

          {/* Interactive Mock Dashboard Preview */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-3xl theme-card p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Score Preview */}
              <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex flex-col items-center justify-center">
                <span className="text-xs font-semibold theme-muted uppercase tracking-wider">
                  Reported CIBIL Score
                </span>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-5xl font-extrabold theme-title font-['Outfit']">680</span>
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    Fair
                  </span>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +24 points since previous update
                </div>
                <div className="w-full bg-purple-950/80 h-2 rounded-full mt-4 overflow-hidden border border-purple-900/50">
                  <div className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full w-[63%]" />
                </div>
                <div className="w-full flex justify-between text-[10px] theme-muted mt-1 font-medium">
                  <span>300</span>
                  <span>Target: 750+</span>
                  <span>900</span>
                </div>
              </div>

              {/* Key Indicators Preview */}
              <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold theme-muted uppercase tracking-wider">
                    Bureau Indicators
                  </span>
                  <div className="mt-3 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Credit Utilization</span>
                      <span className="font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-lg">72% (High)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Debt-to-Income (DTI)</span>
                      <span className="font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg">20% (Optimal)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Monthly Savings</span>
                      <span className="font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-lg">₹13,000</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-900/40 text-[11px] theme-muted">
                  Calculated using standard mathematical lending indicator formulas.
                </div>
              </div>

              {/* AI Roadmap Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 to-cyan-900/30 border border-purple-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI 5-Step Plan</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold theme-title">
                    Priority Bottleneck Detected
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Credit card utilization is at 72%. Reducing card balance to below 30% could boost your score trajectory significantly.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="mt-4 inline-flex items-center justify-between text-xs font-bold text-cyan-300 hover:text-cyan-200"
                >
                  <span>Generate Your Full Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 theme-surface border-y theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              SIMPLE 4-STEP PROCESS
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold theme-title font-['Outfit']">
              How Credit Assistant Works
            </h3>
            <p className="mt-3 theme-muted text-sm">
              We translate complex credit bureau terminology into actionable, prioritized financial steps.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Connect Financial Profile',
                description: 'Enter your monthly income, living expenses, existing loan EMIs, and reported CIBIL score.'
              },
              {
                step: '02',
                title: 'Calculate Bureau Indicators',
                description: 'Our system calculates Debt-to-Income (DTI), credit utilization, and disposable liquidity headroom.'
              },
              {
                step: '03',
                title: 'Receive Gemini AI Roadmap',
                description: 'Google Gemini 2.5 Flash analyzes your bottlenecks and outputs a prioritized 5-step action plan.'
              },
              {
                step: '04',
                title: 'Track & Improve',
                description: 'Update your metrics whenever debt is paid down to watch your charts and scores evolve.'
              }
            ].map((s) => (
              <div key={s.step} className="theme-card rounded-3xl p-6 relative">
                <span className="text-3xl font-black text-purple-400/40 font-['Outfit'] block">
                  {s.step}
                </span>
                <h4 className="mt-2 text-base font-bold theme-title">{s.title}</h4>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Health Monitoring Section */}
      <section id="monitoring" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                COMPREHENSIVE MONITORING
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold theme-title font-['Outfit']">
                Understand the Core Pillars of Credit Health
              </h2>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                Indian lenders and credit bureaus (CIBIL, Experian, Equifax, CRIF High Mark) evaluate multiple risk indicators when assessing creditworthiness. We help you monitor all of them.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'Debt-to-Income Ratio (DTI)',
                    desc: 'The proportion of your gross monthly earnings committed toward EMI and loan repayments.'
                  },
                  {
                    title: 'Credit Utilization Ratio',
                    desc: 'How much of your sanctioned revolving credit card limit is currently consumed. Keeping it under 30% is ideal.'
                  },
                  {
                    title: 'Payment Discipline & DPD',
                    desc: 'Tracking 30+ Days Past Due (DPD) events and ensuring every bill cycle is backed by auto-debit.'
                  },
                  {
                    title: 'Monthly Cash Flow Surplus',
                    desc: 'Ensuring your disposable income provides enough cushion to build emergency savings while paying debt.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5 p-3.5 rounded-2xl theme-card">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold theme-title">{item.title}</h4>
                      <p className="text-xs theme-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-tr from-[#140b28] to-[#1e0f3d] border border-purple-500/40 rounded-3xl p-8 text-white shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-6 border-b border-purple-900/50">
                <span className="text-xs font-bold tracking-wider uppercase text-cyan-300">
                  CIBIL Scoring Standard
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Scale: 300 – 900
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { range: '800 – 900', label: 'Excellent', color: 'bg-purple-400', desc: 'Lowest interest rates & prime cards' },
                  { range: '740 – 799', label: 'Very Good', color: 'bg-emerald-400', desc: 'Pre-approved loan eligibility' },
                  { range: '670 – 739', label: 'Good', color: 'bg-cyan-400', desc: 'Standard lending approval rates' },
                  { range: '580 – 669', label: 'Fair', color: 'bg-amber-400', desc: 'Higher interest or strict collateral' },
                  { range: '300 – 579', label: 'Poor', color: 'bg-rose-400', desc: 'Subprime / high rejection risk' }
                ].map((band) => (
                  <div key={band.label} className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${band.color}`} />
                      <span className="font-mono text-sm font-bold">{band.range}</span>
                      <span className="text-xs font-semibold text-purple-200">{band.label}</span>
                    </div>
                    <span className="text-[11px] theme-muted hidden sm:inline">{band.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights & Gemini Section */}
      <section id="ai-insights" className="py-20 theme-surface border-t theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              INTELLIGENT FINANCIAL ADVISORY
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold theme-title font-['Outfit']">
              AI Powered by Google Gemini 2.5 Flash
            </h2>
            <p className="mt-3 theme-muted text-sm">
              We never fabricate scores or claim access to unauthorized private bank vaults. Gemini evaluates your real reported metrics to deliver mathematically grounded insights.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="theme-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">Pinpoint Vulnerabilities</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Detect whether high credit card utilization, missed payment history, or elevated EMI commitments are dragging your rating down.
              </p>
            </div>

            <div className="theme-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">Personalized 5-Step Plan</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Receive prioritized, high-impact tactical advice with estimated timelines (e.g. debt snowball, auto-debit enablement).
              </p>
            </div>

            <div className="theme-card p-6 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">Monthly Targets</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Break long-term credit rebuilding into manageable Month 1, Month 2, and Month 3 milestones that are easy to maintain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-extrabold theme-title font-['Outfit']">
              Bank-Grade Security & User Privacy
            </h2>
            <p className="mt-3 theme-muted text-sm">
              We treat financial information with the highest confidentiality.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl theme-card">
              <h4 className="text-sm font-bold theme-title font-['Outfit']">Zero Password Storage for Google Users</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Google OAuth 2.0 authenticates you directly on accounts.google.com. We never ask for or store your Gmail password.
              </p>
            </div>

            <div className="p-6 rounded-3xl theme-card">
              <h4 className="text-sm font-bold theme-title font-['Outfit']">PBKDF2 Password Hashing</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                For email/password users, credentials are encrypted with 100,000 rounds of PBKDF2-HMAC-SHA256 and unique cryptographic salts.
              </p>
            </div>

            <div className="p-6 rounded-3xl theme-card">
              <h4 className="text-sm font-bold theme-title font-['Outfit']">Minimum OAuth Scopes</h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                We only request openid, email, and basic profile. We never ask for access to your private emails or Google Drive files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-purple-950 via-violet-900 to-cyan-950 border-y border-purple-500/40 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Ready to Build a Resilient Credit Profile?
          </h2>
          <p className="mt-4 text-purple-200 text-sm max-w-xl mx-auto">
            Join thousands taking control of their CIBIL score trajectory and optimizing their credit lines today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3.5">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl theme-btn-primary font-bold text-sm transition-all"
            >
              Get Started Now
            </Link>
            <button
              onClick={handleGoogleSignIn}
              className="px-6 py-3.5 rounded-2xl bg-purple-900/60 text-white font-semibold text-sm hover:bg-purple-900 border border-purple-400/40 transition-all cursor-pointer"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="theme-surface py-12 text-xs border-t theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <BrandLogo to="/" size="md" />

            <p className="text-center theme-muted max-w-md text-[11px] leading-relaxed">
              Disclaimer: finashealth is an educational financial wellness platform. It is not a credit bureau (CIBIL/Experian), bank, NBFC, or SEBI-registered investment advisor. Calculations are educational indicators.
            </p>

            <span className="theme-muted text-[11px]">
              © {new Date().getFullYear()} finashealth. Better Money • Healthier Future. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
