import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { AlertCircle } from 'lucide-react';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const err = searchParams.get('error');

      if (err) {
        setError(decodeURIComponent(err));
        return;
      }

      if (!token) {
        setError('No authentication token received from Google callback.');
        return;
      }

      try {
        localStorage.setItem('credit_token', token);
        const user = await authAPI.getMe();
        localStorage.setItem('credit_user', JSON.stringify(user));
        await refreshUser();

        if (!user.has_profile) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (e: any) {
        console.error('Failed to complete OAuth authentication:', e);
        setError('Failed to establish authenticated session.');
      }
    };

    processCallback();
  }, [searchParams, navigate, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="max-w-md w-full theme-card p-6 rounded-3xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold theme-title font-['Outfit']">Authentication Failed</h3>
          <p className="mt-2 text-xs text-slate-300">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full py-2.5 rounded-2xl theme-btn-primary font-semibold text-xs transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="w-12 h-12 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
      <h3 className="text-base font-bold theme-title font-['Outfit']">Authenticating with Google...</h3>
      <p className="text-xs theme-muted mt-1">Verifying your secure credentials and establishing session.</p>
    </div>
  );
};
