'use client';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useUIStore();

  useEffect(() => {
    if (!isSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-gray-950/30 backdrop-blur-sm md:hidden"
        />
      )}
      <Sidebar />
      <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden', isSidebarOpen && 'md:ml-0')}>
        {children}
      </div>
    </div>
  );
}
