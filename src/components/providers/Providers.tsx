'use client';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { DataSync } from './DataSync';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 4000 } },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <DataSync>
          {children}
        </DataSync>
      </QueryClientProvider>
    </SessionProvider>
  );
}
