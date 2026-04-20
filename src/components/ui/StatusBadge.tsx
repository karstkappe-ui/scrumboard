import { cn } from '@/lib/utils';
import type { IssueStatus } from '@/types';
import { ISSUE_STATUSES } from '@/lib/constants';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = ISSUE_STATUSES.find((s) => s.value === status);
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className,
      )}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
