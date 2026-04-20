import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface AvatarProps {
  user?: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

const sizeStyles = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-xs',
  md: 'h-7 w-7 text-xs',
  lg: 'h-8 w-8 text-sm',
};

export function Avatar({ user, size = 'sm', className }: AvatarProps) {
  if (!user) {
    return (
      <div
        className={cn(
          'rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0',
          sizeStyles[size],
          className,
        )}
      >
        <span className="text-gray-400">—</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white select-none',
        sizeStyles[size],
        className,
      )}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: AvatarProps['size'];
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((user) => (
        <Avatar key={user.id} user={user} size={size} className="ring-2 ring-white" />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 font-medium text-gray-600 ring-2 ring-white',
            sizeStyles[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
