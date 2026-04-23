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
    <header className="flex items-center h-12 sm:h-14 px-3 sm:px-4 md:px-6 border-b border-gray-100 bg-white gap-2 sm:gap-3 flex-shrink-0">
      <button
        type="button"
        onClick={handleMenuClick}
        className="md:hidden h-8 w-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isSidebarOpen}
        aria-controls="mobile-sidebar"
      >
        {isSidebarOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight truncate">{title}</h1>
        {subtitle && <p className="hidden md:block text-xs text-gray-500 leading-tight mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Global search */}
        <div className="relative hidden lg:block">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'h-8 w-48 rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:w-64 transition-all',
              searchQuery && 'pr-7',
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">{actions}</div>

        <button className="relative h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
