import { create } from 'zustand';
import { generateId } from '@/lib/utils';

export type TodoCategory = 'nazendingen' | 'today' | 'todo' | 'recurring' | 'done';
export type TodoPriority = 'none' | 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  category: TodoCategory;
  priority: TodoPriority;
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
  setPriority: (id: string, priority: TodoPriority) => void;
  commitReorder: (newTodos: Todo[], originalTodos: Todo[]) => void;
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],

  _hydrate: (todos) =>
    set({
      todos: todos.map((t) => ({ ...t, priority: (t.priority as TodoPriority) ?? 'none' })),
    }),

  addTodo: (title, category) => {
    const todos = get().todos;
    const newTodo: Todo = {
      id: generateId(),
      title,
      category,
      priority: 'none',
      order: todos.filter((t) => t.category === category).length,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
    fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newTodo.id, title, category, priority: 'none', order: newTodo.order }),
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

  setPriority: (id, priority) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, priority } : t)),
    }));
    fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    }).catch(() => {});
  },

  commitReorder: (newTodos, originalTodos) => {
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
