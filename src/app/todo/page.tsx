'use client';
import { useState, useRef } from 'react';
import { Plus, Trash2, Check, RefreshCw, Calendar, ClipboardList, CheckCircle2, Pencil, X } from 'lucide-react';
import { useTodoStore, type TodoCategory, type Todo } from '@/store/todoStore';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

const COLUMNS: {
  key: TodoCategory;
  label: string;
  icon: React.ReactNode;
  accent: string;
  header: string;
  empty: string;
}[] = [
  {
    key: 'today',
    label: 'Vandaag',
    icon: <Calendar size={14} />,
    accent: 'text-amber-600',
    header: 'bg-amber-50 border-amber-200',
    empty: 'Niets gepland voor vandaag',
  },
  {
    key: 'todo',
    label: 'Nog te doen',
    icon: <ClipboardList size={14} />,
    accent: 'text-indigo-600',
    header: 'bg-indigo-50 border-indigo-200',
    empty: 'Geen openstaande taken',
  },
  {
    key: 'recurring',
    label: 'Doorlopend',
    icon: <RefreshCw size={14} />,
    accent: 'text-blue-600',
    header: 'bg-blue-50 border-blue-200',
    empty: 'Geen doorlopende taken',
  },
  {
    key: 'done',
    label: 'Done',
    icon: <CheckCircle2 size={14} />,
    accent: 'text-emerald-600',
    header: 'bg-emerald-50 border-emerald-200',
    empty: 'Nog niets afgerond',
  },
];

export default function TodoPage() {
  const { todos, addTodo, deleteTodo, moveTodo, editTodo } = useTodoStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="📝 Mijn taken"
        subtitle="Persoonlijk dagelijks overzicht"
      />
      <div className="flex-1 overflow-hidden p-5">
        <div className="grid grid-cols-4 gap-4 h-full">
          {COLUMNS.map((col) => (
            <TodoColumn
              key={col.key}
              column={col}
              todos={todos.filter((t) => t.category === col.key)}
              onAdd={(title) => addTodo(title, col.key)}
              onDelete={(id) => deleteTodo(id)}
              onMove={(id, cat) => moveTodo(id, cat)}
              onEdit={(id, title) => editTodo(id, title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TodoColumn({
  column,
  todos,
  onAdd,
  onDelete,
  onMove,
  onEdit,
}: {
  column: typeof COLUMNS[number];
  todos: Todo[];
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, cat: TodoCategory) => void;
  onEdit: (id: string, title: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newTitle.trim()) { setAdding(false); return; }
    onAdd(newTitle.trim());
    setNewTitle('');
    inputRef.current?.focus();
  };

  const isDone = column.key === 'done';

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Column header */}
      <div className={cn('flex items-center justify-between px-3 py-2.5 border-b', column.header)}>
        <div className={cn('flex items-center gap-1.5 font-semibold text-sm', column.accent)}>
          {column.icon}
          {column.label}
        </div>
        <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/70', column.accent)}>
          {todos.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
        {todos.length === 0 && !adding && (
          <p className="text-xs text-gray-400 text-center py-6 px-2">{column.empty}</p>
        )}

        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            isDone={isDone}
            onDone={() => onMove(todo.id, isDone ? 'todo' : 'done')}
            onDelete={() => onDelete(todo.id)}
            onEdit={(title) => onEdit(todo.id, title)}
          />
        ))}

        {adding && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50">
            <div className="h-4 w-4 rounded border border-gray-300 flex-shrink-0" />
            <input
              ref={inputRef}
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
              }}
              onBlur={handleAdd}
              placeholder="Nieuwe taak…"
              className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Add button */}
      {!isDone && (
        <div className="border-t border-gray-100 p-2">
          <button
            onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className={cn(
              'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-50',
            )}
          >
            <Plus size={13} />
            Taak toevoegen
          </button>
        </div>
      )}
    </div>
  );
}

function TodoCard({
  todo,
  isDone,
  onDone,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  isDone: boolean;
  onDone: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(todo.title);

  const handleEditSave = () => {
    if (editVal.trim()) onEdit(editVal.trim());
    else setEditVal(todo.title);
    setEditing(false);
  };

  return (
    <div className={cn(
      'group flex items-start gap-2 px-2 py-2 rounded-lg transition-colors hover:bg-gray-50',
      isDone && 'opacity-60',
    )}>
      <button
        onClick={onDone}
        className={cn(
          'mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
          isDone
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 hover:border-emerald-400',
        )}
      >
        {isDone && <Check size={10} />}
      </button>

      {editing ? (
        <input
          autoFocus
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={handleEditSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEditSave();
            if (e.key === 'Escape') { setEditVal(todo.title); setEditing(false); }
          }}
          className="flex-1 text-xs bg-transparent border-b border-indigo-300 outline-none pb-0.5 text-gray-700"
        />
      ) : (
        <span
          className={cn('flex-1 text-xs text-gray-700 leading-relaxed cursor-text', isDone && 'line-through')}
          onDoubleClick={() => { setEditing(true); setEditVal(todo.title); }}
        >
          {todo.title}
        </span>
      )}

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!editing && (
          <button
            onClick={() => { setEditing(true); setEditVal(todo.title); }}
            className="h-5 w-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500"
          >
            <Pencil size={10} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="h-5 w-5 flex items-center justify-center rounded text-gray-300 hover:text-red-500"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}
