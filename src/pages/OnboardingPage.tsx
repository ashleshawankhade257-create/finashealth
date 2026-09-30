import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Building,
  Target,
  AlertCircle
} from 'lucide-react';
import { financialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { BrandLogo } from '../components/common/BrandLogo';

export const OnboardingPage: React.FC = () => {
  const { updateUserLocal } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [goal, setGoal] = useState('Improve credit score');
  const [income, setIncome] = useState<number | ''>(60000);
  const [expenses, setExpenses] = useState<number | ''>(35000);
  const [creditScore, setCreditScore] = useState<number | ''>(680);
  const [debt, setDebt] = useState<number | ''>(180000);
  const [creditLimit, setCreditLimit] = useState<number | ''>(250000);
  const [emi, setEmi] = useState<number | ''>(12000);
  const [activeLoans, setActiveLoans] = useState<number | ''>(2);
  const [missedPayments, setMissedPayments] = useState<number | ''>(1);

  // Real-time calculations
  const numIncome = Number(income) || 0;
  const numExpenses = Number(expenses) || 0;
  const numDebt = Number(debt) || 0;
  const numLimit = Number(creditLimit) || 0;
  const numEmi = Number(emi) || 0;

  const calculatedDti = numIncome > 0 ? ((numEmi / numIncome) * 100).toFixed(1) : '0.0';
  const calculatedUtilization = numLimit > 0 ? ((Math.min(numDebt, numLimit) / numLimit) * 100).toFixed(1) : '0.0';
  const calculatedSavings = numIncome - numExpenses - numEmi;

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (step === 2) {
      if (numIncome <= 0) {
        setError('Please enter a valid monthly income greater than 0.');
        return false;
      }
    }
    if (step === 3) {
      if (numExpenses < 0) {
        setError('Monthly expenses cannot be negative.');
        return false;
      }
    }
    if (step === 4) {
      const score = Number(creditScore);
      if (score < 300 || score > 900) {
        setError('Please enter a valid CIBIL score between 300 and 900.');
        return false;
      }
    }
    if (step === 5 && numDebt < 0) {
      setError('Total debt cannot be negative.');
      return false;
    }
    if (step === 6 && numLimit < 0) {
      setError('Total credit limit cannot be negative.');
      return false;
    }
    if (step === 7 && numEmi < 0) {
      setError('Monthly EMI cannot be negative.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await financialAPI.createProfile({
        monthly_income: numIncome,
        monthly_expenses: numExpenses,
        total_debt: numDebt,
        monthly_debt_payment: numEmi,
        total_credit_limit: numLimit,
        active_loans: Number(activeLoans) || 0,
        missed_payments: Number(missedPayments) || 0,
        financial_goal: goal,
        credit_score: Number(creditScore) || undefined,
      });

      updateUserLocal({ has_profile: true });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to save financial profile. Please verify all inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="absolute top-6 right-6">
        <ThemeToggleButton />
      </div>

      <div className="max-w-xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo to="/" size="lg" className="mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold theme-title font-['Outfit']">
            Set Up Your Financial Profile
          </h2>
          <p className="mt-1 text-xs theme-muted">
            Step {step} of {totalSteps} • Essential for computing bureau indicators and Gemini AI analysis
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-purple-950/80 h-2 rounded-full mt-4 overflow-hidden border border-purple-900/50">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="theme-card rounded-3xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                What is your primary financial wellness goal?
              </h3>
              <p className="text-xs theme-muted mt-1">
                This helps our Gemini advisor tailor prioritized recommendations to your priorities.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { id: 'Improve credit score', label: 'Improve CIBIL / Credit Score', desc: 'Boost score toward 750+ for optimal lending rates.' },
                  { id: 'Reduce debt', label: 'Reduce Outstanding Debt', desc: 'Accelerate repayments using debt avalanche or snowball.' },
                  { id: 'Reduce credit utilization', label: 'Reduce Credit Card Utilization', desc: 'Keep balances strictly under 30% of total limit.' },
                  { id: 'Improve financial stability', label: 'Improve Financial Stability & Savings', desc: 'Build an emergency liquid cash buffer and manage cash flow.' }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`block p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      goal === opt.id
                        ? 'border-purple-400 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400'
                        : 'border-purple-900/40 bg-purple-950/20 hover:border-purple-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold theme-title">{opt.label}</span>
                      {goal === opt.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{opt.desc}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Income */}
          {step === 2 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                What is your monthly gross income?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Enter your total monthly take-home salary or net business revenue in INR (₹).
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Monthly Gross Income (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={income}
                  onChange={(e) => setIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="60000"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 3: Expenses */}
          {step === 3 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-amber-400 flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                What are your typical monthly living expenses?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Include rent, food, utilities, groceries, and household bills (exclude loan EMIs).
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Monthly Living Expenses (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35000"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 4: Credit Score */}
          {step === 4 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                What is your current reported CIBIL score?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Enter your latest 3-digit score between 300 and 900 (standard Indian bureau scale).
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  CIBIL / Experian Score (300–900)
                </label>
                <input
                  type="number"
                  min="300"
                  max="900"
                  value={creditScore}
                  onChange={(e) => setCreditScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="680"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 5: Total Debt */}
          {step === 5 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-rose-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                What is your total outstanding debt balance?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Total unpaid card balances plus outstanding personal or auto loan principals.
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Total Outstanding Debt (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="180000"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 6: Total Credit Card Limit */}
          {step === 6 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                What is the total combined credit limit on all your cards?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Sum of sanctioned limits across all your active credit cards.
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Total Sanctioned Card Limit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="250000"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 7: Monthly EMI */}
          {step === 7 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                How much do you pay in total loan EMIs every month?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Sum of all monthly loan installments deducted from your account.
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Monthly Total EMI Obligation (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={emi}
                  onChange={(e) => setEmi(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="12000"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 8: Active Loans */}
          {step === 8 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-slate-300 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                How many active loan accounts do you have?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Count personal loans, auto loans, educational loans, gold loans, and active credit cards.
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Number of Active Accounts
                </label>
                <input
                  type="number"
                  min="0"
                  value={activeLoans}
                  onChange={(e) => setActiveLoans(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 9: Missed Payments */}
          {step === 9 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-rose-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                Have you missed any payments in the last 12 months?
              </h3>
              <p className="text-xs theme-muted mt-1">
                Number of delayed EMI or credit card billing cycles past 30 days due.
              </p>
              <div className="mt-6">
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-2">
                  Missed / Delayed Payment Cycles
                </label>
                <input
                  type="number"
                  min="0"
                  value={missedPayments}
                  onChange={(e) => setMissedPayments(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1"
                  className="block w-full px-4 py-3 text-lg font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>
            </div>
          )}

          {/* Step 10: Confirmation & Calculation Summary */}
          {step === 10 && (
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold theme-title font-['Outfit']">
                Review Your Calculated Financial Indicators
              </h3>
              <p className="text-xs theme-muted mt-1">
                Here are the core indicators computed from your data before creating your profile.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                  <span className="text-[10px] uppercase font-bold text-cyan-300 block">Debt-to-Income (DTI)</span>
                  <span className="text-xl font-extrabold theme-title font-['Outfit'] mt-1 block">
                    {calculatedDti}%
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {Number(calculatedDti) <= 35 ? 'Healthy debt ratio' : 'High debt commitment'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                  <span className="text-[10px] uppercase font-bold text-purple-300 block">Credit Utilization</span>
                  <span className="text-xl font-extrabold theme-title font-['Outfit'] mt-1 block">
                    {calculatedUtilization}%
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {Number(calculatedUtilization) <= 30 ? 'Optimal utilization' : 'High credit dependence'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Monthly Savings</span>
                  <span className="text-xl font-extrabold theme-title font-['Outfit'] mt-1 block">
                    ₹{calculatedSavings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {calculatedSavings >= 0 ? 'Surplus cash flow' : 'Deficit cash flow'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-800/40">
                  <span className="text-[10px] uppercase font-bold text-amber-300 block">Reported Score</span>
                  <span className="text-xl font-extrabold theme-title font-['Outfit'] mt-1 block">
                    {creditScore}
                  </span>
                  <span className="text-[11px] text-slate-300">CIBIL rating track</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-purple-900/40 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center text-xs font-semibold px-4 py-2.5 rounded-2xl border border-purple-800/60 bg-purple-950/30 text-purple-200 hover:text-white hover:bg-purple-900/40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Previous
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="inline-flex items-center text-xs font-semibold px-6 py-2.5 rounded-2xl theme-btn-primary shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                'Saving Profile...'
              ) : step === totalSteps ? (
                'Complete & Launch Dashboard'
              ) : (
                <>
                  Next Step
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
