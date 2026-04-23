'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  List,
  Columns3,
  Zap,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckSquare,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { MOCK_USERS } from '@/data/users';
import { Avatar } from '@/components/ui/Avatar';
import { ProjectSwitcher } from './ProjectSwitcher';
import { ChangePasswordModal } from './ChangePasswordModal';
import { signOut } from 'next-auth/react';

const BASE_NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/board', label: 'Board', icon: Columns3 },
  { href: '/backlog', label: 'Backlog', icon: List },
  { href: '/sprints', label: 'Sprints', icon: Zap },
  { href: '/team', label: 'Team', icon: Users },
];

const NEWMATE_PROJECT_ID = 'proj-3';
const KARST_USER_ID = 'user-1';

export function Sidebar() {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    currentUserId,
  } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const currentUser = MOCK_USERS.find((u) => u.id === currentUserId) ?? MOCK_USERS[0];
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const showMijnTaken = currentUserId === KARST_USER_ID && activeProjectId === NEWMATE_PROJECT_ID;
  const navItems = showMijnTaken
    ? [...BASE_NAV_ITEMS, { href: '/todo', label: 'Mijn taken', icon: CheckSquare }]
    : BASE_NAV_ITEMS;

  return (
    <aside
      id="mobile-sidebar"
      className={cn(
        'fixed inset-0 z-50 flex h-screen w-screen flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl transition-transform duration-300 ease-out flex-shrink-0 md:relative md:z-auto md:h-auto md:w-56 md:bg-white md:backdrop-blur-none md:shadow-none md:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isSidebarCollapsed ? 'md:w-14' : 'md:w-56',
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100/80 px-4 py-3 md:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400">Menu</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">Navigatie</p>
        </div>
        <button
          onClick={closeSidebar}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <div className="md:hidden px-4 pt-3">
        <div className="h-1.5 w-12 rounded-full bg-gray-200 mx-auto" />
      </div>

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
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all group',
                isSidebarCollapsed && 'justify-center px-0 py-2',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
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
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 bg-gray-50/70',
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
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <KeyRound size={13} className="text-gray-400 flex-shrink-0" />
            <span>Wachtwoord wijzigen</span>
          </button>
        )}
        {!isSidebarCollapsed && (
          <button
            onClick={() => {
              closeSidebar();
              signOut({ callbackUrl: '/login' });
            }}
            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <LogOut size={13} className="text-gray-400 flex-shrink-0" />
            <span>Uitloggen</span>
          </button>
        )}
        {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button
          onClick={closeSidebar}
          className="mt-1 flex md:hidden w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          Sluit menu
        </button>
      </div>
    </aside>
  );
}
