import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { AppShell } from '@/components/layout/AppShell';
import { IssueDetailWrapper } from '@/components/issue/IssueDetailWrapper';

export const metadata: Metadata = {
  title: 'ScrumBoard — Agile Project Management',
  description: 'A professional SCRUM board for agile teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
          <IssueDetailWrapper />
        </Providers>
      </body>
    </html>
  );
}
