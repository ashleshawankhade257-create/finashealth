import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  PieChart as PieIcon,
  CreditCard,
  DollarSign,
  Building,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Palette
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardAPI, aiAPI } from '../services/api';
import { DashboardSummary, AnalyticsData, AIAdviceResponse } from '../types';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { MetricCard } from '../components/common/MetricCard';
import { useTheme } from '../context/ThemeContext';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [latestAi, setLatestAi] = useState<AIAdviceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { config, isDark, setIsCustomizerOpen } = useTheme();
  const isPink = config.preset === 'light-pink' || config.preset === 'dark-rose-pink';

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, analData, aiData] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getAnalytics(),
        aiAPI.getLatest().catch(() => null),
      ]);
      setSummary(sumData);
      setAnalytics(analData);
      setLatestAi(aiData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load real-time dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-3 border-pink-500 dark:border-purple-500 border-t-rose-400 dark:border-t-cyan-400 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(244,114,182,0.5)]" />
        <p className="text-sm font-semibold theme-muted">Gathering your financial health metrics...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="py-12">
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-3xl p-6 text-center max-w-lg mx-auto backdrop-blur-md">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold theme-title font-['Outfit']">Failed to Load Dashboard</h3>
          <p className="text-xs text-rose-400 mt-1">{error || 'Unknown error occurred.'}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 theme-btn-primary rounded-xl text-xs font-semibold cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { score, profile, metrics } = summary;

  // Dynamic Theme Colors for Charts
  const chartStroke = isPink ? '#ec4899' : '#a855f7';
  const chartDot = isPink ? '#fb7185' : '#06b6d4';
  const chartActiveDot = isPink ? '#f43f5e' : '#22d3ee';
  const PIE_COLORS = isPink ? ['#ec4899', '#fda4af'] : ['#a855f7', '#06b6d4'];

  // Custom Tooltip for Recharts LineChart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-[#130b24] text-slate-900 dark:text-white p-3 rounded-2xl shadow-2xl text-xs border border-pink-400/40 dark:border-purple-500/40 backdrop-blur-md">
          <p className="font-semibold text-pink-600 dark:text-purple-300">{label}</p>
          <p className="text-sm font-bold text-pink-500 dark:text-cyan-400 mt-1">
            Score: <span className="font-['Outfit']">{payload[0].value}</span>
          </p>
          <p className="text-[10px] theme-muted mt-0.5">Reported CIBIL Track</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500 dark:text-purple-400 animate-pulse" />
            FINANCIAL WELLNESS OVERVIEW
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold theme-title font-['Outfit'] mt-0.5">
            Credit Health Dashboard
          </h2>
          <p className="text-xs theme-muted">
            Real-time computed bureau indicators and Google Gemini 2.5 advisory
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center text-xs font-semibold px-3 py-2 rounded-xl border theme-border theme-title hover:bg-pink-500/10 dark:hover:bg-purple-900/30 shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-pink-500 dark:text-purple-400" />
            Refresh
          </button>
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="inline-flex items-center text-xs font-semibold px-3 py-2 rounded-xl border border-pink-500/30 dark:border-purple-500/40 bg-pink-500/10 dark:bg-purple-950/30 text-pink-700 dark:text-purple-200 hover:text-pink-900 dark:hover:text-white hover:bg-pink-500/20 dark:hover:bg-purple-900/50 shadow-xs transition-colors cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 mr-1.5 text-pink-500 dark:text-cyan-400" />
            Customize Theme
          </button>
          <Link
            to="/profile"
            className="inline-flex items-center text-xs font-semibold px-3.5 py-2 rounded-xl theme-btn-primary transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Update Data
          </Link>
        </div>
      </div>

      {/* Hero Cards Grid: Score Gauge + Primary Statuses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Credit Score Card */}
        <div className="theme-card rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold theme-muted uppercase tracking-wider">
              Current CIBIL Score
            </span>
            <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Scale: 300–900
            </span>
          </div>

          <div className="py-4">
            <ScoreGauge
              score={score.current_score}
              previousScore={score.previous_score}
              delta={score.delta}
              category={score.category}
              categoryColor={score.category_color}
              size="lg"
            />
          </div>

          <div className="pt-4 border-t border-purple-900/40 text-center">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {score.interpretation}
            </p>
          </div>
        </div>

        {/* Quick Indicators Grid (2 columns on medium) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            title="Credit Utilization"
            value={`${metrics.utilization.value}%`}
            subValue={`Limit: ₹${(profile?.total_credit_limit || 0).toLocaleString('en-IN')}`}
            status={metrics.utilization.status}
            statusColor={metrics.utilization.color}
            explanation="Proportion of credit card limits utilized. Keeping this below 30% strongly signals credit discipline."
            actionText={metrics.utilization.action}
            icon={<CreditCard className="w-4 h-4" />}
          />

          <MetricCard
            title="Debt-to-Income (DTI)"
            value={`${metrics.dti.value}%`}
            subValue={`EMI: ₹${(profile?.monthly_debt_payment || 0).toLocaleString('en-IN')}/mo`}
            status={metrics.dti.status}
            statusColor={metrics.dti.color}
            explanation="Monthly debt installments divided by gross monthly income. Lenders favor lower ratios."
            actionText={metrics.dti.action}
            icon={<PieIcon className="w-4 h-4" />}
          />

          <MetricCard
            title="Monthly Savings Surplus"
            value={`₹${metrics.savings.value.toLocaleString('en-IN')}`}
            subValue="Cash flow cushion"
            status={metrics.savings.status}
            statusColor={metrics.savings.color}
            explanation="Disposable income remaining each month after living expenses and debt payments."
            actionText={metrics.savings.action}
            icon={<DollarSign className="w-4 h-4" />}
          />

          <MetricCard
            title="Payment Track Record"
            value={metrics.missed_payments.value === 0 ? 'Clean Record' : `${metrics.missed_payments.value} Missed`}
            subValue={`${metrics.loans.value} Active Loan(s)`}
            status={metrics.missed_payments.status}
            statusColor={metrics.missed_payments.color}
            explanation="On-time payment consistency contributes roughly 35% to total credit bureau evaluations."
            actionText={metrics.missed_payments.action}
            icon={<Building className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Visual Analytics Section: Recharts LineChart + PieChart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts LineChart: Credit Score Progress */}
        <div className="lg:col-span-2 theme-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold theme-title font-['Outfit']">
                Credit Score Progress
              </h3>
              <p className="text-xs theme-muted">
                Historical timeline of reported CIBIL scores over time
              </p>
            </div>
            {score.delta !== null && score.delta !== 0 && (
              <span
                className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                  score.delta > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {score.delta > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {score.delta > 0 ? `+${score.delta}` : score.delta} pts change
              </span>
            )}
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            {analytics?.score_timeline && analytics.score_timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.score_timeline}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(168, 85, 247, 0.12)' : '#e2e8f0'} vertical={false} />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fill: isDark ? '#c4b5fd' : '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: isDark ? 'rgba(168, 85, 247, 0.2)' : '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[300, 900]}
                    tick={{ fill: isDark ? '#c4b5fd' : '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: isDark ? 'rgba(168, 85, 247, 0.2)' : '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={chartStroke}
                    strokeWidth={3.5}
                    dot={{ r: 4, fill: chartDot, stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: chartActiveDot, stroke: chartStroke, strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center theme-muted text-xs">
                <span>No historical score data yet.</span>
                <Link to="/progress" className="mt-2 text-pink-600 dark:text-cyan-400 font-bold hover:underline">
                  Log your first score entry
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recharts PieChart: Credit Utilization Breakdown */}
        <div className="theme-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold theme-title font-['Outfit']">
              Credit Utilization Breakdown
            </h3>
            <p className="text-xs theme-muted">
              Total Limit: ₹{(analytics?.total_credit_limit || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center relative">
            {analytics?.utilization_breakdown && analytics.utilization_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.utilization_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.utilization_breakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke={isDark ? '#140a28' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{
                      borderRadius: '16px',
                      fontSize: '12px',
                      backgroundColor: isDark ? '#130b24' : '#fff5f9',
                      color: isDark ? '#fff' : '#371b3e',
                      border: isDark ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(244, 114, 182, 0.4)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center theme-muted text-xs">
                No credit card limits recorded.
              </div>
            )}

            {/* Inner Percentage Center */}
            {analytics && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-2xl font-extrabold theme-title font-['Outfit'] block leading-none">
                  {analytics.utilization_percentage}%
                </span>
                <span className="text-[10px] theme-muted font-semibold uppercase tracking-wider">
                  Used
                </span>
              </div>
            )}
          </div>

          {/* Legend and Recommendations */}
          <div className="pt-3 border-t border-pink-500/20 dark:border-purple-900/40 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                  style={{ backgroundColor: PIE_COLORS[0] }}
                />
                <span className="theme-muted">Used Credit</span>
              </div>
              <span className="font-bold theme-title">
                ₹{((analytics?.utilization_breakdown?.[0]?.value) || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(251,113,133,0.8)]"
                  style={{ backgroundColor: PIE_COLORS[1] }}
                />
                <span className="theme-muted">Available Limit</span>
              </div>
              <span className="font-bold theme-title">
                ₹{((analytics?.utilization_breakdown?.[1]?.value) || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advisor Spotlight Banner */}
      <div className={`rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md relative overflow-hidden border ${
        isPink
          ? 'bg-gradient-to-r from-pink-950/80 via-rose-900/70 to-pink-900/80 border-pink-500/40'
          : 'bg-gradient-to-r from-purple-950/80 via-violet-900/60 to-cyan-950/80 border-purple-500/40'
      }`}>
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-pink-500/20 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-rose-500/20 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-500/20 dark:bg-purple-500/20 border border-pink-400/30 dark:border-purple-400/30 text-pink-200 dark:text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-pink-300 dark:text-purple-300 animate-pulse" />
            <span>Google Gemini 2.5 Flash Advisory</span>
          </div>
          <h3 className="text-xl font-bold font-['Outfit'] text-white">
            {latestAi ? 'Your AI Financial Roadmap is Ready' : 'Diagnose Your Credit Bottlenecks with AI'}
          </h3>
          <p className="text-xs text-pink-100/90 dark:text-purple-100/80 max-w-xl leading-relaxed">
            {latestAi
              ? latestAi.overall_assessment
              : 'Our intelligent system evaluates your DTI, credit utilization, and repayment records to produce a prioritized 5-step optimization plan.'}
          </p>
        </div>

        <Link
          to="/ai-advisor"
          className="shrink-0 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-extrabold text-xs hover:opacity-95 transition-all shadow-lg shadow-pink-500/25 flex items-center space-x-2 relative z-10"
        >
          <span>{latestAi ? 'View Full 5-Step Plan' : 'Run AI Analysis'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
