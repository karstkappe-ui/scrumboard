import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { IssueDetailPanel } from '@/components/issue/IssueDetailPanel';
import { IssueDetailWrapper } from '@/components/issue/IssueDetailWrapper';

export const metadata: Metadata = {
  title: 'ScrumBoard — Agile Project Management',
  description: 'A professional SCRUM board for agile teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>
          {children}
        </AppShell>
        <IssueDetailWrapper />
      </body>
    </html>
  );
}
