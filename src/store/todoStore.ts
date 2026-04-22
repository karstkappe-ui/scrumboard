import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export type TodoCategory = 'today' | 'todo' | 'recurring' | 'done';

export interface Todo {
  id: string;
  title: string;
  category: TodoCategory;
  order: number;
  createdAt: string;
}

interface TodoStore {
  byUser: Record<string, Todo[]>;
  addTodo: (userId: string, title: string, category: TodoCategory) => void;
  deleteTodo: (userId: string, id: string) => void;
  moveTodo: (userId: string, id: string, category: TodoCategory) => void;
  editTodo: (userId: string, id: string, title: string) => void;
  getTodos: (userId: string) => Todo[];
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      byUser: {},

      addTodo: (userId, title, category) => {
        const todos = get().byUser[userId] ?? [];
        const newTodo: Todo = {
          id: generateId(),
          title,
          category,
          order: todos.filter((t) => t.category === category).length,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          byUser: { ...state.byUser, [userId]: [...(state.byUser[userId] ?? []), newTodo] },
        }));
      },

      deleteTodo: (userId, id) => {
        set((state) => ({
          byUser: { ...state.byUser, [userId]: (state.byUser[userId] ?? []).filter((t) => t.id !== id) },
        }));
      },

      moveTodo: (userId, id, category) => {
        set((state) => ({
          byUser: {
            ...state.byUser,
            [userId]: (state.byUser[userId] ?? []).map((t) =>
              t.id === id ? { ...t, category } : t,
            ),
          },
        }));
      },

      editTodo: (userId, id, title) => {
        set((state) => ({
          byUser: {
            ...state.byUser,
            [userId]: (state.byUser[userId] ?? []).map((t) =>
              t.id === id ? { ...t, title } : t,
            ),
          },
        }));
      },

      getTodos: (userId) => get().byUser[userId] ?? [],
    }),
    { name: 'scrumboard-todos' },
  ),
);
