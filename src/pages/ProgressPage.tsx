import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PlusCircle,
  History
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { creditAPI } from '../services/api';
import { CreditScoreSummary, CreditScoreRecord } from '../types';
import { useTheme } from '../context/ThemeContext';

export const ProgressPage: React.FC = () => {
  const [current, setCurrent] = useState<CreditScoreSummary | null>(null);
  const [history, setHistory] = useState<CreditScoreRecord[]>([]);
  const [newScore, setNewScore] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { config, isDark } = useTheme();
  const isPink = config.preset === 'light-pink' || config.preset === 'dark-rose-pink';

  const loadData = async () => {
    try {
      const res = await creditAPI.getHistory();
      setCurrent(res.current);
      setHistory(res.history);
    } catch (err) {
      console.error('Failed to load credit history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const scoreNum = Number(newScore);
    if (!scoreNum || scoreNum < 300 || scoreNum > 900) {
      setError('Please enter a valid CIBIL score between 300 and 900.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedSummary = await creditAPI.addScore(scoreNum, 'user_update');
      setCurrent(updatedSummary);
      setSuccess(`Credit score of ${scoreNum} logged successfully!`);
      setNewScore('');
      await loadData();
    } catch (err: any) {
      setError('Failed to record new credit score.');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = history.map((item) => ({
    date: new Date(item.recorded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    score: item.credit_score,
    source: item.source
  }));

  const chartStroke = isPink ? '#ec4899' : '#a855f7';
  const chartDot = isPink ? '#fb7185' : '#06b6d4';

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-3 border-pink-500 dark:border-purple-500 border-t-rose-400 dark:border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(244,114,182,0.5)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold theme-title font-['Outfit']">
          Credit Score Progress & History
        </h2>
        <p className="text-xs theme-muted">
          Track your score trajectory over time and monitor delta improvements as you optimize debt and payments.
        </p>
      </div>

      {/* Delta Banner */}
      {current && (
        <div className="theme-card rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 dark:from-purple-600 dark:to-cyan-500 text-white flex flex-col items-center justify-center font-['Outfit'] shadow-md">
              <span className="text-xl font-black leading-none">{current.current_score || '--'}</span>
              <span className="text-[9px] uppercase font-bold text-pink-100 dark:text-cyan-100 mt-0.5">Score</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold theme-title">Current Rating: {current.category}</span>
                {current.delta !== null && current.delta !== 0 && (
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      current.delta > 0
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {current.delta > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                    {current.delta > 0 ? `+${current.delta}` : current.delta} points since your previous update
                  </span>
                )}
              </div>
              <p className="text-xs theme-muted mt-1 max-w-lg">
                {current.interpretation}
              </p>
            </div>
          </div>

          <div className="text-right text-xs theme-muted shrink-0">
            {current.recorded_at && (
              <span>Last logged: {new Date(current.recorded_at).toLocaleDateString('en-IN')}</span>
            )}
          </div>
        </div>
      )}

      {/* Line Chart */}
      <div className="theme-card rounded-3xl p-6">
        <h3 className="text-base font-bold theme-title font-['Outfit'] mb-4">
          CIBIL Score Trend (Historical Timeline)
        </h3>

        <div className="h-64 sm:h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(244, 114, 182, 0.15)'} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: isDark ? '#c4b5fd' : '#831843', fontSize: 11 }} axisLine={{ stroke: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(244, 114, 182, 0.3)' }} />
                <YAxis domain={[300, 900]} tick={{ fill: isDark ? '#c4b5fd' : '#831843', fontSize: 11 }} axisLine={{ stroke: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(244, 114, 182, 0.3)' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} pts`, 'Score']}
                  contentStyle={{
                    backgroundColor: isDark ? '#130b24' : '#fff5f9',
                    borderRadius: '16px',
                    color: isDark ? '#fff' : '#371b3e',
                    fontSize: '12px',
                    border: isDark ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(244, 114, 182, 0.4)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={chartStroke}
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: chartDot, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs theme-muted">
              No historical scores recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Log New Score Form & History Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="theme-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
              <PlusCircle className="w-4 h-4" />
              <span>Log Newly Obtained Score</span>
            </div>
            <h4 className="text-sm font-bold theme-title">
              Update Bureau Record
            </h4>
            <p className="text-xs theme-muted mt-1">
              Obtained a new report from CIBIL or your bank app? Record it here to update your trajectory.
            </p>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleAddScore} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold theme-muted uppercase tracking-wider mb-1">
                  New Score (300–900)
                </label>
                <input
                  type="number"
                  min="300"
                  max="900"
                  required
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 710"
                  className="block w-full px-3.5 py-2.5 text-base font-bold theme-title bg-purple-950/30 border border-purple-800/60 rounded-2xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden font-['Outfit']"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-2xl theme-btn-primary font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Recording...' : 'Record New Score'}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-900/40 text-[11px] theme-muted">
            Records are timestamped and preserved in your database history.
          </div>
        </div>

        {/* History Table */}
        <div className="md:col-span-2 theme-card rounded-3xl p-6 overflow-hidden flex flex-col">
          <div className="flex items-center space-x-2 theme-title font-bold text-sm mb-4">
            <History className="w-4 h-4 text-purple-400" />
            <span>Score History Log</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-purple-950/40 text-purple-300/80 border-b border-purple-900/40 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30 text-slate-300">
                {history.length > 0 ? (
                  history.slice().reverse().map((h) => {
                    const sc = h.credit_score;
                    const cat = sc >= 750 ? 'Very Good' : sc >= 670 ? 'Good' : sc >= 580 ? 'Fair' : 'Poor';
                    return (
                      <tr key={h.id} className="hover:bg-purple-900/20">
                        <td className="py-2.5 px-3 font-medium">
                          {new Date(h.recorded_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold theme-title font-['Outfit']">
                          {h.credit_score}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-900/40 text-cyan-300 border border-purple-500/30">
                            {cat}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 theme-muted capitalize">
                          {h.source.replace('_', ' ')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center theme-muted">
                      No records logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
