import { create } from 'zustand';
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
  todos: Todo[];
  _hydrate: (todos: Todo[]) => void;
  addTodo: (title: string, category: TodoCategory) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (id: string, category: TodoCategory) => void;
  editTodo: (id: string, title: string) => void;
  commitReorder: (newTodos: Todo[], originalTodos: Todo[]) => void;
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],

  _hydrate: (todos) => set({ todos }),

  addTodo: (title, category) => {
    const todos = get().todos;
    const newTodo: Todo = {
      id: generateId(),
      title,
      category,
      order: todos.filter((t) => t.category === category).length,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newTodo.id, title, category, order: newTodo.order }),
    }).catch(() => {});
  },

  deleteTodo: (id) => {
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
    fetch(`/api/todos/${id}`, { method: 'DELETE' }).catch(() => {});
  },

  moveTodo: (id, category) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, category } : t)),
    }));
    fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    }).catch(() => {});
  },

  editTodo: (id, title) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, title } : t)),
    }));
    fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }).catch(() => {});
  },

  commitReorder: (newTodos, originalTodos) => {
    // Assign order values based on position within each category
    const byCategory: Record<string, Todo[]> = {};
    for (const t of newTodos) {
      if (!byCategory[t.category]) byCategory[t.category] = [];
      byCategory[t.category].push(t);
    }
    const withOrders = newTodos.map((t) => ({
      ...t,
      order: byCategory[t.category].findIndex((x) => x.id === t.id),
    }));

    set({ todos: withOrders });

    // Fire PATCH only for items that changed category or order
    withOrders.forEach((t) => {
      const orig = originalTodos.find((o) => o.id === t.id);
      if (orig && (orig.category !== t.category || orig.order !== t.order)) {
        fetch(`/api/todos/${t.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: t.category, order: t.order }),
        }).catch(() => {});
      }
    });
  },
}));
