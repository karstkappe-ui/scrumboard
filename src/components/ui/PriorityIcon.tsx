import { cn } from '@/lib/utils';
import type { Priority } from '@/types';

interface PriorityIconProps {
  priority: Priority;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

const configs: Record<Priority, { bars: [boolean, boolean, boolean, boolean]; color: string; label: string }> = {
  urgent: { bars: [true, true, true, true], color: '#DC2626', label: 'Urgent' },
  high: { bars: [true, true, true, false], color: '#EA580C', label: 'High' },
  medium: { bars: [true, true, false, false], color: '#D97706', label: 'Medium' },
  low: { bars: [true, false, false, false], color: '#16A34A', label: 'Low' },
};

export function PriorityIcon({ priority, size = 'sm', showLabel, className }: PriorityIconProps) {
  const config = configs[priority];
  const barWidth = size === 'sm' ? 2.5 : 3;
  const heights = size === 'sm' ? [3, 5, 7, 9] : [4, 6, 8, 10];

  return (
    <span className={cn('inline-flex items-end gap-[1.5px]', showLabel && 'gap-1.5', className)}>
      <span className="inline-flex items-end gap-[1.5px]" title={config.label}>
        {config.bars.map((active, i) => (
          <span
            key={i}
            className="rounded-[1px] flex-shrink-0"
            style={{
              width: barWidth,
              height: heights[i],
              backgroundColor: active ? config.color : '#D1D5DB',
            }}
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </span>
  );
}
