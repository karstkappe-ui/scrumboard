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

const colorStyles = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'indigo',
  showLabel,
  className,
  animated,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-gray-100 overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            colorStyles[color],
            animated && 'transition-all',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-gray-500 w-8 text-right">{percentage}%</span>}
    </div>
  );
}
