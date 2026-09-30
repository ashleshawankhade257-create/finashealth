import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreGaugeProps {
  score: number | null;
  previousScore?: number | null;
  delta?: number | null;
  category?: string;
  categoryColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  previousScore,
  delta,
  category = 'Not Available',
  categoryColor = 'pink',
  size = 'md',
}) => {
  // Score normalization: 300 to 900 range maps to 0% to 100%
  const minScore = 300;
  const maxScore = 900;
  const effectiveScore = score ? Math.min(Math.max(score, minScore), maxScore) : minScore;
  const percentage = score ? ((effectiveScore - minScore) / (maxScore - minScore)) * 100 : 0;

  // Arc calculation for SVG semi-circle (180 degrees)
  const radius = size === 'lg' ? 95 : size === 'md' ? 80 : 60;
  const strokeWidth = size === 'lg' ? 14 : size === 'md' ? 12 : 10;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Category styles
  const getBadgeClass = () => {
    switch (categoryColor) {
      case 'rose':
      case 'pink':
        return 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-400/40 shadow-xs';
      case 'amber':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/40 shadow-xs';
      case 'blue':
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-400/40 shadow-xs';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/40 shadow-xs';
      case 'violet':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/40 shadow-xs';
      default:
        return 'bg-pink-100 dark:bg-pink-950/40 text-pink-800 dark:text-slate-300 border-pink-300/40';
    }
  };

  const getGradientId = `gauge-grad-${size}`;

  return (
    <div className="flex flex-col items-center justify-center relative p-2">
      <div className="relative flex items-center justify-center">
        <svg
          width={radius * 2 + strokeWidth * 2}
          height={radius + strokeWidth * 2 + 10}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="55%" stopColor="#fb7185" />
              <stop offset="80%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f472b6" floodOpacity="0.4"/>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={`M ${strokeWidth}, ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
              radius * 2 + strokeWidth
            } ${radius + strokeWidth}`}
            fill="none"
            stroke="rgba(244, 114, 182, 0.2)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active progress arc */}
          {score !== null && (
            <path
              d={`M ${strokeWidth}, ${radius + strokeWidth} A ${radius} ${radius} 0 0 1 ${
                radius * 2 + strokeWidth
              } ${radius + strokeWidth}`}
              fill="none"
              stroke={`url(#${getGradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              filter="url(#gauge-glow)"
            />
          )}
        </svg>

        {/* Center score readout */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2 flex flex-col items-center">
          <span className="text-4xl md:text-5xl font-extrabold tracking-tight theme-title font-['Outfit'] drop-shadow-xs">
            {score !== null ? score : '--'}
          </span>
          <span className="text-xs uppercase font-semibold tracking-wider theme-muted mt-0.5">
            CIBIL Score
          </span>
        </div>
      </div>

      {/* Scale markers */}
      <div className="w-full flex justify-between px-4 -mt-2 text-[11px] font-medium theme-muted">
        <span>300 (Min)</span>
        <span>900 (Max)</span>
      </div>

      {/* Category badge & Delta indicator */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeClass()}`}>
          {category}
        </span>

        {delta !== undefined && delta !== null && delta !== 0 && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
              delta > 0
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/30'
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
            )}
            {delta > 0 ? `+${delta}` : delta} pts since last update
          </span>
        )}

        {delta === 0 && (
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-pink-100/60 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border border-pink-300/40">
            <Minus className="w-3 h-3 mr-1" /> Unchanged
          </span>
        )}
      </div>
    </div>
  );
};
