import { cn } from '@/lib/utils';
import type { IssueType } from '@/types';

interface IssueTypeIconProps {
  type: IssueType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const typeConfig: Record<IssueType, { symbol: string; bg: string; color: string; label: string }> = {
  epic: { symbol: '⚡', bg: '#F5F3FF', color: '#6D28D9', label: 'Epic' },
  story: { symbol: '📖', bg: '#EFF6FF', color: '#1D4ED8', label: 'Story' },
  task: { symbol: '✓', bg: '#F8FAFC', color: '#475569', label: 'Task' },
  bug: { symbol: '⬡', bg: '#FEF2F2', color: '#B91C1C', label: 'Bug' },
  subtask: { symbol: '↳', bg: '#F8FAFC', color: '#64748B', label: 'Subtask' },
};

const sizeStyles = {
  sm: 'h-4 w-4 text-[9px]',
  md: 'h-5 w-5 text-[10px]',
  lg: 'h-6 w-6 text-xs',
};

export function IssueTypeIcon({ type, size = 'sm', className }: IssueTypeIconProps) {
  const config = typeConfig[type];
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded flex-shrink-0 font-bold',
        sizeStyles[size],
        className,
      )}
      style={{ backgroundColor: config.bg, color: config.color }}
      title={config.label}
    >
      {config.symbol}
    </span>
  );
}
