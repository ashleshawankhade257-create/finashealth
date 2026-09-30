import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PieChart,
  Sliders
} from 'lucide-react';
import { financialAPI } from '../services/api';
import { FinancialProfile } from '../types';

export const CreditHealthPage: React.FC = () => {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulation state
  const [paydownAmount, setPaydownAmount] = useState<number>(25000);
  const [newLimitBoost, setNewLimitBoost] = useState<number>(50000);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await financialAPI.getProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
      </div>
    );
  }

  // Simulated calculations
  const currentDebt = profile?.total_debt || 0;
  const currentLimit = profile?.total_credit_limit || 0;
  const currentIncome = profile?.monthly_income || 1;
  const currentEmi = profile?.monthly_debt_payment || 0;

  const simulatedDebt = Math.max(0, currentDebt - paydownAmount);
  const simulatedLimit = currentLimit + newLimitBoost;

  const currentUtil = currentLimit > 0 ? (currentDebt / currentLimit) * 100 : 0;
  const simulatedUtil = simulatedLimit > 0 ? (simulatedDebt / simulatedLimit) * 100 : 0;

  // Assuming paying down debt saves proportional EMI (estimated 2.5% per month)
  const estimatedEmiSavings = Math.round(paydownAmount * 0.025);
  const simulatedEmi = Math.max(0, currentEmi - estimatedEmiSavings);
  const simulatedDti = currentIncome > 0 ? (simulatedEmi / currentIncome) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold theme-title font-['Outfit']">
          Credit Health & Bureau Indicators
        </h2>
        <p className="text-xs theme-muted">
          In-depth assessment of the mathematical parameters evaluated by Indian credit bureaus and lenders.
        </p>
      </div>

      {/* 2 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Credit Utilization */}
        <div className="theme-card rounded-3xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-rose-400 flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">
                Credit Utilization Ratio
              </h3>
              <span className="text-[11px] text-purple-300/70 font-semibold uppercase">
                Weight: ~30% of Bureau Score
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold theme-title font-['Outfit']">
              {profile ? `${profile.credit_utilization}%` : '--'}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                (profile?.credit_utilization || 0) <= 30
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              {(profile?.credit_utilization || 0) <= 30 ? 'Optimal (<=30%)' : 'Exceeds Recommended'}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Formula: <code className="bg-purple-950/60 px-1 py-0.5 rounded text-[11px] text-cyan-300">Outstanding Card Balances ÷ Total Sanctioned Limit × 100</code>. Lenders view cardholders with &gt;30% utilization as heavily reliant on short-term unsecured credit.
          </p>

          <div className="mt-4 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Outstanding Debt:</span>
              <span className="font-bold theme-title">₹{(profile?.total_debt || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Sanctioned Credit Limit:</span>
              <span className="font-bold theme-title">₹{(profile?.total_credit_limit || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Debt-to-Income (DTI) */}
        <div className="theme-card rounded-3xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-cyan-400 flex items-center justify-center shadow-xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">
                Debt-to-Income Ratio (DTI)
              </h3>
              <span className="text-[11px] text-purple-300/70 font-semibold uppercase">
                Underwriting Headroom Indicator
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold theme-title font-['Outfit']">
              {profile ? `${profile.dti_ratio}%` : '--'}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                (profile?.dti_ratio || 0) <= 35
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              {(profile?.dti_ratio || 0) <= 35 ? 'Comfortable (<=35%)' : 'High Debt Burden'}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Formula: <code className="bg-purple-950/60 px-1 py-0.5 rounded text-[11px] text-cyan-300">Monthly Debt EMIs ÷ Monthly Gross Income × 100</code>. When DTI exceeds 40-50%, banks reject new mortgage or personal loan applications due to fixed obligation limits.
          </p>

          <div className="mt-4 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex justify-between font-medium">
              <span>Monthly EMI Commitment:</span>
              <span className="font-bold theme-title">₹{(profile?.monthly_debt_payment || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Gross Monthly Income:</span>
              <span className="font-bold theme-title">₹{(profile?.monthly_income || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Simulator */}
      <div className="theme-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Sliders className="w-4 h-4" />
          <span>Interactive Financial Simulator</span>
        </div>
        <h3 className="text-xl font-bold theme-title font-['Outfit']">
          "What-If" Debt Paydown & Limit Optimization
        </h3>
        <p className="text-xs theme-muted mt-1">
          Adjust the sliders below to see how lump-sum repayments or bank limit enhancements instantly recalibrate your bureau indicators.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold theme-title">
                  Simulate Debt Paydown (₹)
                </label>
                <span className="text-xs font-extrabold text-cyan-400 font-['Outfit']">
                  ₹{paydownAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(currentDebt, 50000)}
                step="5000"
                value={paydownAmount}
                onChange={(e) => setPaydownAmount(Number(e.target.value))}
                className="w-full accent-purple-500 bg-purple-900/60 rounded-lg h-2 cursor-pointer"
              />
              <span className="text-[11px] theme-muted mt-1 block">
                Applying savings to clear card dues or loans
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold theme-title">
                  Simulate Card Limit Enhancement (₹)
                </label>
                <span className="text-xs font-extrabold text-purple-400 font-['Outfit']">
                  +₹{newLimitBoost.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="10000"
                value={newLimitBoost}
                onChange={(e) => setNewLimitBoost(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-purple-900/60 rounded-lg h-2 cursor-pointer"
              />
              <span className="text-[11px] theme-muted mt-1 block">
                Requesting a credit limit increase without increasing spending
              </span>
            </div>
          </div>

          {/* Results Comparison */}
          <div className="bg-purple-950/30 rounded-2xl p-5 border border-purple-800/40 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-4">
              Projected Recalculation
            </h4>

            <div className="space-y-4">
              {/* Utilization Comparison */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Projected Utilization:</span>
                  <div className="space-x-2">
                    <span className="line-through text-slate-500">{currentUtil.toFixed(1)}%</span>
                    <span className="font-extrabold text-emerald-400 text-sm font-['Outfit']">
                      {simulatedUtil.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-purple-950/80 h-2 rounded-full mt-1.5 overflow-hidden border border-purple-900/50">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, simulatedUtil)}%` }}
                  />
                </div>
              </div>

              {/* DTI Comparison */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Projected Debt-to-Income (DTI):</span>
                  <div className="space-x-2">
                    <span className="line-through text-slate-500">
                      {profile?.dti_ratio || 0}%
                    </span>
                    <span className="font-extrabold text-purple-300 text-sm font-['Outfit']">
                      {simulatedDti.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-purple-950/80 h-2 rounded-full mt-1.5 overflow-hidden border border-purple-900/50">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, simulatedDti)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-purple-900/40 text-[11px] text-slate-300 leading-relaxed">
              💡 <span className="font-bold text-cyan-300">Insight:</span> Reducing utilization from{' '}
              {currentUtil.toFixed(1)}% to {simulatedUtil.toFixed(1)}% is one of the fastest ways to improve credit risk modeling with Indian bureaus without requiring new loans.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
