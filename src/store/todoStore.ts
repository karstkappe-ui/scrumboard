import { create } from 'zustand';
import { generateId } from '@/lib/utils';

export type TodoCategory = 'nazendingen' | 'today' | 'todo' | 'done';
export type TodoPriority = 'none' | 'low' | 'medium' | 'high';
export type TodoLabel = 'none' | 'groei' | 'onderhoud' | 'operationeel';

export interface Todo {
  id: string;
  title: string;
  category: TodoCategory;
  priority: TodoPriority;
  label: TodoLabel;
  projectId: string;
  order: number;
  createdAt: string;
}

interface TodoStore {
  todos: Todo[];
  _hydrate: (todos: Todo[]) => void;
  addTodo: (title: string, category: TodoCategory, projectId: string) => void;
  deleteTodo: (id: string) => void;
  moveTodo: (id: string, category: TodoCategory) => void;
  editTodo: (id: string, title: string) => void;
  setPriority: (id: string, priority: TodoPriority) => void;
  setLabel: (id: string, label: TodoLabel) => void;
  commitReorder: (newTodos: Todo[], originalTodos: Todo[]) => void;
}

// Writes that the server has not confirmed yet. The board polls every few
// seconds, and a response that was already in flight when the user acted does
// not contain their change, so applying it would visibly undo what they just
// did. Hydration is skipped until the writes have landed.
let pendingWrites = 0;

function track(request: Promise<unknown>) {
  pendingWrites += 1;
  return request.catch(() => {}).finally(() => {
    pendingWrites -= 1;
  });
}

// Everything the board renders. Used to skip re-rendering on a poll that
// brought back nothing new, which is the common case.
function signature(todos: Todo[]) {
  return todos
    .map((t) => `${t.id} ${t.title} ${t.category} ${t.order} ${t.priority} ${t.label}`)
    .join('');
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],

  _hydrate: (todos) => {
    if (pendingWrites > 0) return;
    const next = todos.map((t) => ({
      ...t,
      priority: (t.priority as TodoPriority) ?? 'none',
      label: (t.label as TodoLabel) ?? 'none',
    }));
    if (signature(next) === signature(get().todos)) return;
    set({ todos: next });
  },

  addTodo: (title, category, projectId) => {
    const todos = get().todos;
    const newTodo: Todo = {
      id: generateId(),
      title,
      category,
      priority: 'none',
      label: 'none',
      projectId,
      order: todos.filter((t) => t.category === category).length,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ todos: [...state.todos, newTodo] }));
    track(
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newTodo.id,
          title,
          category,
          priority: 'none',
          label: 'none',
          projectId,
          order: newTodo.order,
        }),
      }),
    );
  },

  deleteTodo: (id) => {
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
    track(fetch(`/api/todos/${id}`, { method: 'DELETE' }));
  },

  moveTodo: (id, category) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, category } : t)),
    }));
    track(
      fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      }),
    );
  },

  editTodo: (id, title) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, title } : t)),
    }));
    track(
      fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }),
    );
  },

  setPriority: (id, priority) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, priority } : t)),
    }));
    track(
      fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      }),
    );
  },

  setLabel: (id, label) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, label } : t)),
    }));
    track(
      fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      }),
    );
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
        track(
          fetch(`/api/todos/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: t.category, order: t.order }),
          }),
        );
      }
    });
  },
}));
