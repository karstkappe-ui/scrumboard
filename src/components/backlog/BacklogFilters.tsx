'use client';
import { Filter, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { MOCK_USERS } from '@/data/users';
import { PRIORITIES, ISSUE_TYPES, ISSUE_STATUSES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export function BacklogFilters() {
  const { filters, toggleFilter, resetFilters, hasActiveFilters } = useUIStore();
  const active = hasActiveFilters();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1 text-xs font-medium text-gray-500 flex-shrink-0">
        <Filter size={13} />
        Filter:
      </span>

      {/* Assignees */}
      <div className="flex items-center gap-1">
        {MOCK_USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => toggleFilter('assigneeIds', user.id)}
            title={user.name}
            className={cn(
              'rounded-full ring-2 ring-offset-1 transition-all',
              filters.assigneeIds.includes(user.id)
                ? 'ring-indigo-500 opacity-100'
                : 'ring-transparent opacity-50 hover:opacity-80',
            )}
          >
            <Avatar user={user} size="xs" />
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-gray-200" />

      {/* Priorities */}
      {PRIORITIES.map((p) => (
        <button
          key={p.value}
          onClick={() => toggleFilter('priorities', p.value)}
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
            filters.priorities.includes(p.value)
              ? 'text-white border-transparent'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
          )}
          style={filters.priorities.includes(p.value) ? { backgroundColor: p.color, borderColor: p.color } : {}}
        >
          {p.label}
        </button>
      ))}

      <div className="h-4 w-px bg-gray-200" />

      {/* Types */}
      {ISSUE_TYPES.filter((t) => t.value !== 'subtask').map((t) => (
        <button
          key={t.value}
          onClick={() => toggleFilter('types', t.value)}
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
            filters.types.includes(t.value)
              ? 'text-white border-transparent'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
          )}
          style={filters.types.includes(t.value) ? { backgroundColor: t.color, borderColor: t.color } : {}}
        >
          {t.label}
        </button>
      ))}

      {active && (
        <Button
          variant="ghost"
          size="xs"
          leftIcon={<X size={12} />}
          onClick={resetFilters}
          className="text-red-500 hover:bg-red-50"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
