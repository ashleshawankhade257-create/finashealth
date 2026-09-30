import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Clock,
  Zap,
  Target,
  Info
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { AIAdviceResponse } from '../types';

export const AIAdvisorPage: React.FC = () => {
  const [advice, setAdvice] = useState<AIAdviceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customNote] = useState<string>('');

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latest = await aiAPI.getLatest();
        if (latest) {
          setAdvice(latest);
        }
      } catch (err) {
        console.warn('Could not fetch existing AI advice:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiAPI.analyze(customNote ? customNote : undefined);
      setAdvice(result);
    } catch (err: any) {
      console.error('Failed to run AI analysis:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate AI recommendations. Please check your financial profile parameters.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-cyan-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Google Gemini 2.5 Flash Engine</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold theme-title font-['Outfit']">
            Your AI Credit Advisor
          </h2>
          <p className="text-xs theme-muted">
            Intelligent financial diagnostics, bottleneck identification, and personalized 5-step roadmap.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl theme-btn-primary font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span>Analyzing your financial profile...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-200" />
              <span>{advice ? 'Re-Analyze My Credit Health' : 'Analyze My Credit Health'}</span>
            </>
          )}
        </button>
      </div>

      {/* Loading State Animation */}
      {loading && (
        <div className="theme-card rounded-3xl p-8 text-center">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
          <h3 className="text-base font-bold theme-title font-['Outfit']">
            Analyzing your financial profile...
          </h3>
          <p className="text-xs theme-muted mt-1 max-w-md mx-auto">
            Gemini is correlating your reported CIBIL score, Debt-to-Income ratio, card limits, and payment discipline against Indian lending benchmarks.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <span className="font-bold">Analysis Notice: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Advisory Content */}
      {!loading && advice && (
        <div className="space-y-6">
          {/* Overall Assessment Banner */}
          <div className="theme-card rounded-3xl p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-2">
              EXECUTIVE CREDIT SUMMARY
            </span>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
              {advice.overall_assessment}
            </p>
          </div>

          {/* Two-Column Risk vs Positive Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <div className="theme-card rounded-3xl p-6">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span>Top Risk Factors & Bottlenecks</span>
              </div>
              <ul className="space-y-3">
                {advice.risk_factors.map((risk, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You're Doing Well */}
            <div className="theme-card rounded-3xl p-6">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span>What You're Doing Well</span>
              </div>
              <ul className="space-y-3">
                {advice.positive_factors.map((pos, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Priority Actions Checklist */}
          <div className="theme-card rounded-3xl p-6">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-4">
              <Zap className="w-4 h-4" />
              <span>Immediate Priority Actions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {advice.priority_actions.map((act, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-lg bg-purple-900/60 text-cyan-300 border border-purple-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-200 font-medium leading-relaxed">
                    {act}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Step Improvement Roadmap (Timeline) */}
          <div className="theme-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 text-white font-bold text-base font-['Outfit']">
                <ListOrdered className="w-5 h-5 text-purple-400" />
                <span>Personalized 5-Step Improvement Plan</span>
              </div>
              <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                Tactical Milestones
              </span>
            </div>

            <div className="space-y-4">
              {advice.five_step_plan.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="p-4 rounded-2xl border border-purple-900/40 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md">
                      {stepItem.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold theme-title font-['Outfit']">{stepItem.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                        {stepItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
                    <span className="inline-flex items-center text-[10px] font-semibold text-purple-200 bg-purple-950/50 border border-purple-800/60 px-2.5 py-1 rounded-xl">
                      <Clock className="w-3 h-3 mr-1 text-cyan-400" />
                      {stepItem.target_timeline}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                        stepItem.impact_level === 'High'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {stepItem.impact_level} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Target Goals */}
          <div className="theme-card rounded-3xl p-6">
            <div className="flex items-center space-x-2 text-white font-bold text-base font-['Outfit'] mb-4">
              <Target className="w-5 h-5 text-cyan-400" />
              <span>Monthly Target Milestones</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advice.monthly_targets.map((tgt, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                  <span className="text-xs font-bold text-cyan-400 block">{tgt.month}</span>
                  <span className="text-xs font-bold theme-title block mt-1">{tgt.target_metric}</span>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{tgt.action_goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Safety Disclaimer */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-slate-300 text-xs flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <span className="font-bold text-white">Safety Notice: </span>
              {advice.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Initial Empty Prompt */}
      {!loading && !advice && !initialLoading && (
        <div className="theme-card rounded-3xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold theme-title font-['Outfit']">
            Ready for your AI Credit Wellness Diagnosis?
          </h3>
          <p className="text-xs theme-muted mt-1.5 max-w-md mx-auto leading-relaxed">
            Click the button below to feed your financial profile into Google Gemini 2.5 Flash and receive a custom roadmap with actionable steps.
          </p>
          <button
            onClick={handleRunAnalysis}
            className="mt-6 inline-flex items-center px-6 py-3 rounded-2xl theme-btn-primary font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-cyan-200" />
            Analyze My Credit Health
          </button>
        </div>
      )}
    </div>
  );
};
