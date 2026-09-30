import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  status: string;
  statusColor?: string;
  explanation: string;
  actionText: string;
  icon?: ReactNode;
  isPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  status,
  statusColor = 'pink',
  explanation,
  actionText,
  icon,
}) => {
  const getBadgeColor = () => {
    switch (statusColor) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30';
      case 'rose':
      case 'pink':
        return 'bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-400/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/30';
      case 'blue':
      case 'cyan':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/30';
      case 'violet':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-400/30';
      default:
        return 'bg-pink-500/10 text-pink-700 dark:text-slate-300 border-pink-300/30';
    }
  };

  return (
    <div className="theme-card rounded-3xl p-5 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold theme-muted uppercase tracking-wider">
            {title}
          </span>
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-pink-100/60 dark:bg-pink-950/50 border border-pink-300/50 dark:border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-300 shadow-xs">
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-extrabold theme-title font-['Outfit']">
            {value}
          </span>
          {subValue && (
            <span className="text-xs theme-muted font-medium">
              {subValue}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center">
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeColor()}`}>
            {statusColor === 'emerald' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {statusColor === 'rose' && <ShieldAlert className="w-3 h-3 mr-1" />}
            {statusColor === 'amber' && <AlertCircle className="w-3 h-3 mr-1" />}
            {status}
          </span>
        </div>

        <p className="mt-2.5 text-xs text-[#5a2c49] dark:text-slate-300 leading-relaxed line-clamp-2">
          {explanation}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-pink-200/80 dark:border-pink-900/40">
        <div className="flex items-start text-xs font-medium">
          <span className="text-pink-600 dark:text-pink-400 font-bold mr-1.5 shrink-0">Tip:</span>
          <span className="text-[#5a2c49] dark:text-slate-300/90 leading-normal">{actionText}</span>
        </div>
      </div>
    </div>
  );
};
