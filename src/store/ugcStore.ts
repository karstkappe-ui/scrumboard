import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export type UGCType = 'reel' | 'carousel' | 'post' | 'story' | 'video' | 'ugc_video';
export type UGCPlatform = 'instagram' | 'tiktok' | 'youtube' | 'alle';
export type UGCStatus = 'idee' | 'gepland' | 'in_productie' | 'klaar' | 'gepubliceerd';

export interface UGCItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: UGCType;
  platform: UGCPlatform;
  status: UGCStatus;
  creator?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface UGCStore {
  items: UGCItem[];
  addItem: (input: Omit<UGCItem, 'id' | 'createdAt' | 'updatedAt'>) => UGCItem;
  updateItem: (id: string, updates: Partial<Omit<UGCItem, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteItem: (id: string) => void;
  getItemsByDate: (date: string) => UGCItem[];
  getItemsByMonth: (year: number, month: number) => UGCItem[];
}

export const useUGCStore = create<UGCStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (input) => {
        const now = new Date().toISOString();
        const item: UGCItem = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ items: [...state.items, item] }));
        return item;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item,
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      getItemsByDate: (date) => {
        return get().items.filter((item) => item.date === date);
      },

      getItemsByMonth: (year, month) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return get().items.filter((item) => item.date.startsWith(prefix));
      },
    }),
    {
      name: 'ugc-planning',
    },
  ),
);
