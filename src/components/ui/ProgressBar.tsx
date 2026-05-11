import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'blue';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

const colorGradients = {
  indigo: 'from-indigo-400 to-indigo-500',
  emerald: 'from-emerald-400 to-emerald-500',
  amber: 'from-amber-400 to-amber-500',
  red: 'from-red-400 to-red-500',
  blue: 'from-blue-400 to-blue-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'indigo',
  showLabel,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-gray-100 overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
            colorGradients[color],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold text-gray-400 w-7 text-right tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
}
