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
  CalendarDays,
  Camera,
  Handshake,
  BookOpen,
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
  { href: '/calendar', label: 'Agenda', icon: CalendarDays },
];

const NEWMATE_PROJECT_ID = 'proj-3';
const ICEO_PROJECT_ID = 'proj-1';
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
  const showDeals = currentUserId === KARST_USER_ID && activeProjectId === ICEO_PROJECT_ID;

  const navItems = [
    ...BASE_NAV_ITEMS,
    ...(showMijnTaken ? [
      { href: '/todo',        label: 'Mijn taken',   icon: CheckSquare },
      { href: '/ugc',         label: 'UGC Planning', icon: Camera      },
      { href: '/boekhouding', label: 'Boekhouding',  icon: BookOpen    },
    ] : []),
    ...(showDeals ? [
      { href: '/deals', label: 'Deals', icon: Handshake },
    ] : []),
  ];

  return (
    <aside
      id="mobile-sidebar"
      className={cn(
        'fixed inset-0 z-50 flex h-screen w-screen flex-col bg-white border-r border-gray-100 shadow-panel transition-transform duration-300 ease-out flex-shrink-0',
        'md:relative md:z-auto md:h-auto md:shadow-none md:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isSidebarCollapsed ? 'md:w-14' : 'md:w-[216px]',
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Menu</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">Navigatie</p>
        </div>
        <button
          onClick={closeSidebar}
          className="h-8 w-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Sluit menu"
        >
          <X size={15} />
        </button>
      </div>

      {/* Project switcher */}
      <div className="border-b border-gray-100">
        <ProjectSwitcher collapsed={isSidebarCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-none">
        {!isSidebarCollapsed && (
          <p className="px-2 pb-2 text-[9px] font-semibold text-gray-400 uppercase tracking-[0.14em]">
            Navigatie
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
                'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-150 group',
                isSidebarCollapsed && 'justify-center px-0 py-2',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
              title={isSidebarCollapsed ? label : undefined}
            >
              <Icon
                size={15}
                className={cn(
                  'flex-shrink-0 transition-colors',
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
            'flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-gray-50',
            isSidebarCollapsed && 'justify-center px-0',
          )}
        >
          <Avatar user={currentUser} size="sm" />
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400 truncate capitalize">{currentUser.role}</p>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <KeyRound size={12} className="text-gray-400 flex-shrink-0" />
            <span>Wachtwoord wijzigen</span>
          </button>
        )}
        {!isSidebarCollapsed && (
          <button
            onClick={() => {
              closeSidebar();
              signOut({ callbackUrl: '/login' });
            }}
            className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <LogOut size={12} className="text-gray-400 flex-shrink-0" />
            <span>Uitloggen</span>
          </button>
        )}
        {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex w-full items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title={isSidebarCollapsed ? 'Uitklappen' : 'Inklappen'}
        >
          {isSidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
        <button
          onClick={closeSidebar}
          className="mt-1 flex md:hidden w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Sluit menu
        </button>
      </div>
    </aside>
  );
}
