'use client';
import { useUIStore } from '@/store/uiStore';
import { IssueDetailPanel } from './IssueDetailPanel';

export function IssueDetailWrapper() {
  const { selectedIssueId } = useUIStore();
  if (!selectedIssueId) return null;
  return <IssueDetailPanel />;
}
