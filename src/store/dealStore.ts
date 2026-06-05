import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export type DealStatus = 'concept' | 'actief' | 'verlopen' | 'afgerond';

export interface DealItem {
  id: string;
  description: string;
  note?: string;
}

export interface Deal {
  id: string;
  title: string;
  partner: string;
  status: DealStatus;
  startDate: string;
  endDate: string;
  duration: string;
  notes: string;
  obligations: DealItem[];
  receivables: DealItem[];
  createdAt: string;
  projectId: string;
}

interface DealStore {
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDeal: (id: string, updates: Partial<Omit<Deal, 'id' | 'createdAt' | 'projectId'>>) => void;
  deleteDeal: (id: string) => void;
}

export const useDealStore = create<DealStore>()(
  persist(
    (set) => ({
      deals: [],

      addDeal: (deal) =>
        set((state) => ({
          deals: [
            ...state.deals,
            { ...deal, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateDeal: (id, updates) =>
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      deleteDeal: (id) =>
        set((state) => ({ deals: state.deals.filter((d) => d.id !== id) })),
    }),
    { name: 'deal-store' },
  ),
);
