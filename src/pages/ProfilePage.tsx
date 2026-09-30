import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  CreditCard,
  Building,
  Target
} from 'lucide-react';
import { financialAPI } from '../services/api';
import { FinancialProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [income, setIncome] = useState<number | ''>('');
  const [expenses, setExpenses] = useState<number | ''>('');
  const [debt, setDebt] = useState<number | ''>('');
  const [emi, setEmi] = useState<number | ''>('');
  const [creditLimit, setCreditLimit] = useState<number | ''>('');
  const [activeLoans, setActiveLoans] = useState<number | ''>('');
  const [missedPayments, setMissedPayments] = useState<number | ''>('');
  const [financialGoal, setFinancialGoal] = useState<string>('Improve credit score');
  const [newScore, setNewScore] = useState<number | ''>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await financialAPI.getProfile();
        if (data) {
          setProfile(data);
          setIncome(data.monthly_income);
          setExpenses(data.monthly_expenses);
          setDebt(data.total_debt);
          setEmi(data.monthly_debt_payment);
          setCreditLimit(data.total_credit_limit);
          setActiveLoans(data.active_loans);
          setMissedPayments(data.missed_payments);
          setFinancialGoal(data.financial_goal || 'Improve credit score');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numIncome = Number(income);
    const numExpenses = Number(expenses);
    const numDebt = Number(debt);
    const numEmi = Number(emi);
    const numLimit = Number(creditLimit);
    const numScore = newScore === '' ? undefined : Number(newScore);

    if (numIncome <= 0) {
      setError('Monthly income must be greater than 0.');
      return;
    }
    if (numExpenses < 0 || numDebt < 0 || numEmi < 0 || numLimit < 0) {
      setError('Financial amounts cannot be negative.');
      return;
    }
    if (numScore !== undefined && (numScore < 300 || numScore > 900)) {
      setError('Credit score must be between 300 and 900.');
      return;
    }

    setSaving(true);
    try {
      const updated = await financialAPI.updateProfile({
        monthly_income: numIncome,
        monthly_expenses: numExpenses,
        total_debt: numDebt,
        monthly_debt_payment: numEmi,
        total_credit_limit: numLimit,
        active_loans: Number(activeLoans) || 0,
        missed_payments: Number(missedPayments) || 0,
        financial_goal: financialGoal,
        credit_score: numScore
      });
      setProfile(updated);
      setSuccess('Financial information updated! Indicators and snapshot recalculation complete.');
      setNewScore('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update financial information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold theme-title font-['Outfit']">
          Financial Profile & Liabilities
        </h2>
        <p className="text-xs theme-muted">
          Keep your debt, income, and liabilities up to date to maintain accurate DTI and credit utilization indicators.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="theme-card rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Income & Expenses */}
        <div>
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Monthly Cash Flow</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Monthly Gross Income (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={income}
                onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Monthly Living Expenses (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={expenses}
                onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Debt & Credit Limits */}
        <div className="pt-4 border-t border-purple-900/40">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Liabilities & Credit Limits</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Total Outstanding Debt (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={debt}
                onChange={(e) => setDebt(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Monthly Total EMI (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={emi}
                onChange={(e) => setEmi(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Total Credit Card Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Loan Accounts & Payments */}
        <div className="pt-4 border-t border-purple-900/40">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Accounts & Discipline</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Active Loan Accounts
              </label>
              <input
                type="number"
                min="0"
                required
                value={activeLoans}
                onChange={(e) => setActiveLoans(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Missed Payments (Past 12 Mos)
              </label>
              <input
                type="number"
                min="0"
                required
                value={missedPayments}
                onChange={(e) => setMissedPayments(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Goals & Score Update */}
        <div className="pt-4 border-t border-purple-900/40">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span>Financial Goal & Score Logging</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                Financial Goal
              </label>
              <select
                value={financialGoal}
                onChange={(e) => setFinancialGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/50 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              >
                <option value="Improve credit score" className="bg-[#130b24] text-white">Improve CIBIL Score</option>
                <option value="Reduce debt" className="bg-[#130b24] text-white">Reduce Outstanding Debt</option>
                <option value="Reduce credit utilization" className="bg-[#130b24] text-white">Reduce Credit Card Utilization</option>
                <option value="Improve financial stability" className="bg-[#130b24] text-white">Improve Financial Stability & Savings</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1.5">
                New CIBIL Score (Optional)
              </label>
              <input
                type="number"
                min="300"
                max="900"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Leave blank if unchanged"
                className="w-full px-3.5 py-2.5 text-sm theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-purple-900/40 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 rounded-2xl theme-btn-primary font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Update Financial Information'}
          </button>
        </div>
      </form>
    </div>
  );
};
