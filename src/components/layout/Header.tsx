'use client';
import { Menu, Search, Bell, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, actions, onMenuClick }: HeaderProps) {
  const { searchQuery, setSearchQuery, isSidebarOpen, openSidebar, closeSidebar } = useUIStore();

  const handleMenuClick = onMenuClick ?? (isSidebarOpen ? closeSidebar : openSidebar);

  return (
    <header className="flex items-center h-14 px-4 md:px-6 border-b border-gray-100 bg-white gap-3 flex-shrink-0">
      <button
        type="button"
        onClick={handleMenuClick}
        className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isSidebarOpen}
        aria-controls="mobile-sidebar"
      >
        {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-semibold text-gray-900 leading-tight truncate">{title}</h1>
          {subtitle && (
            <span className="hidden md:inline text-xs text-gray-400 font-normal truncate">{subtitle}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Global search */}
        <div className="relative hidden lg:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Zoeken…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'h-8 w-44 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 focus:bg-white focus:w-56 transition-all duration-200',
              searchQuery && 'pr-7',
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">{actions}</div>

        <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
