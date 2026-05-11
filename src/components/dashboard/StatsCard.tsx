import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex items-start gap-4',
        'hover:shadow-card-md hover:border-gray-200 transition-all duration-200',
        className,
      )}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 shadow-sm"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.08em]">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-0.5 mt-1.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
            trend.value >= 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600',
          )}>
            <span>{trend.value >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)} {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
