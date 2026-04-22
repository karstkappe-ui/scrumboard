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
}));
