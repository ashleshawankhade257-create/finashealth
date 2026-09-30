import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (!user.has_profile) {
        navigate('/onboarding');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to log in. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google OAuth is currently initializing. Please try again or use the demo credentials below.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await login('demo@creditassistant.in', 'DemoPassword123!');
      if (!user.has_profile) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Unable to load demo account. Please try registering an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
      <div className="absolute top-6 right-6">
        <ThemeToggleButton />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <BrandLogo to="/" size="lg" className="mb-4" />
        <h2 className="text-2xl font-bold theme-title font-['Outfit']">
          Sign In to Your Dashboard
        </h2>
        <p className="mt-1 text-xs theme-muted">
          Monitor your credit score, CIBIL indicators, and AI wellness roadmap.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="theme-card py-8 px-6 sm:px-10 rounded-3xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Real Google OAuth 2.0 Sign-In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-purple-500/30 rounded-2xl bg-purple-950/40 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-purple-900/50 hover:border-purple-400/50 transition-all cursor-pointer shadow-xs"
            >
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
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-900/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-purple-950/60 text-purple-300/80 rounded-full">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-2xl theme-btn-primary font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Shortcut */}
          <div className="pt-2 border-t border-purple-900/40">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 rounded-2xl border border-dashed border-purple-500/40 bg-purple-950/20 hover:bg-purple-900/30 text-purple-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign in with 1-Click Demo Account</span>
            </button>
          </div>

          <div className="text-center text-xs theme-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-cyan-300 hover:text-cyan-200 hover:underline">
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
