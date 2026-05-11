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
        'inline-flex items-center gap-1 rounded-full font-semibold tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        className,
      )}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        boxShadow: `inset 0 0 0 1px ${config.color}28`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
