'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  Columns3,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';
import { ProjectSwitcher } from './ProjectSwitcher';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/board', label: 'Board', icon: Columns3 },
  { href: '/backlog', label: 'Backlog', icon: List },
  { href: '/sprints', label: 'Sprints', icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, currentUserId } = useUIStore();
  const currentUser = MOCK_USERS.find((u) => u.id === currentUserId) ?? MOCK_USERS[0];

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0',
        isSidebarCollapsed ? 'w-14' : 'w-56',
      )}
    >
      {/* Project switcher */}
      <div className="border-b border-gray-100">
        <ProjectSwitcher collapsed={isSidebarCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {!isSidebarCollapsed && (
          <p className="px-2 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors group',
                isSidebarCollapsed && 'justify-center px-0 py-2',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
              title={isSidebarCollapsed ? label : undefined}
            >
              <Icon
                size={16}
                className={cn(
                  'flex-shrink-0',
                  isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600',
                )}
              />
              {!isSidebarCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-1">
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5',
            isSidebarCollapsed && 'justify-center px-0',
          )}
        >
          <Avatar user={currentUser} size="sm" />
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400 truncate capitalize">{currentUser.role}</p>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <LogOut size={13} className="text-gray-400 flex-shrink-0" />
            <span>Uitloggen</span>
          </button>
        )}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
