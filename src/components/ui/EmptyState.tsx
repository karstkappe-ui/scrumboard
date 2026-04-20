import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6 px-4' : 'py-12 px-6',
        className,
      )}
    >
      {icon && (
        <div className={cn('text-gray-300 mb-3', compact ? 'text-2xl' : 'text-4xl')}>
          {icon}
        </div>
      )}
      <p className={cn('font-medium text-gray-500', compact ? 'text-sm' : 'text-base')}>{title}</p>
      {description && (
        <p className={cn('text-gray-400 mt-1', compact ? 'text-xs' : 'text-sm')}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
