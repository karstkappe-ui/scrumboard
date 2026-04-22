'use client';
import { useState, useRef } from 'react';
import { redirect } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Check, RefreshCw, Calendar, ClipboardList, CheckCircle2, Pencil, GripVertical } from 'lucide-react';
import { useTodoStore, type TodoCategory, type Todo } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

const NEWMATE_PROJECT_ID = 'proj-3';
const KARST_USER_ID = 'user-1';

const COLUMNS: {
  key: TodoCategory;
  label: string;
  icon: React.ReactNode;
  accent: string;
  headerBg: string;
  countBg: string;
  empty: string;
}[] = [
  {
    key: 'todo',
    label: 'Nog te doen',
    icon: <ClipboardList size={16} />,
    accent: 'text-indigo-700',
    headerBg: 'bg-indigo-50 border-indigo-200',
    countBg: 'bg-indigo-100 text-indigo-700',
    empty: 'Geen openstaande taken',
  },
  {
    key: 'today',
    label: 'Vandaag',
    icon: <Calendar size={16} />,
    accent: 'text-amber-700',
    headerBg: 'bg-amber-50 border-amber-200',
    countBg: 'bg-amber-100 text-amber-700',
    empty: 'Niets gepland voor vandaag',
  },
  {
    key: 'recurring',
    label: 'Doorlopend',
    icon: <RefreshCw size={16} />,
    accent: 'text-blue-700',
    headerBg: 'bg-blue-50 border-blue-200',
    countBg: 'bg-blue-100 text-blue-700',
    empty: 'Geen doorlopende taken',
  },
  {
    key: 'done',
    label: 'Done',
    icon: <CheckCircle2 size={16} />,
    accent: 'text-emerald-700',
    headerBg: 'bg-emerald-50 border-emerald-200',
    countBg: 'bg-emerald-100 text-emerald-700',
    empty: 'Nog niets afgerond',
  },
];

export default function TodoPage() {
  const { currentUserId } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const { todos, addTodo, deleteTodo, moveTodo, editTodo } = useTodoStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  if (currentUserId !== KARST_USER_ID || activeProjectId !== NEWMATE_PROJECT_ID) {
    redirect('/');
  }
  const [overColumn, setOverColumn] = useState<TodoCategory | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const activeTodo = activeId ? todos.find((t) => t.id === activeId) : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragOver(e: DragOverEvent) {
    const col = e.over?.id as TodoCategory | null;
    setOverColumn(col && COLUMNS.some((c) => c.key === col) ? col : null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const targetCol = over.id as TodoCategory;
      if (COLUMNS.some((c) => c.key === targetCol)) {
        const todo = todos.find((t) => t.id === active.id);
        if (todo && todo.category !== targetCol) {
          moveTodo(active.id as string, targetCol);
        }
      }
    }
    setActiveId(null);
    setOverColumn(null);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Mijn taken" subtitle="Persoonlijk dagelijks overzicht" />
      <div className="flex-1 overflow-hidden p-5">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-4 gap-4 h-full">
            {COLUMNS.map((col) => (
              <DroppableColumn
                key={col.key}
                column={col}
                todos={todos.filter((t) => t.category === col.key)}
                isOver={overColumn === col.key}
                draggedId={activeId}
                onAdd={(title) => addTodo(title, col.key)}
                onDelete={(id) => deleteTodo(id)}
                onMove={(id, cat) => moveTodo(id, cat)}
                onEdit={(id, title) => editTodo(id, title)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTodo && (
              <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl border border-indigo-300 bg-white shadow-lg opacity-95">
                <GripVertical size={14} className="mt-0.5 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-800 leading-snug">{activeTodo.title}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  todos,
  isOver,
  draggedId,
  onAdd,
  onDelete,
  onMove,
  onEdit,
}: {
  column: (typeof COLUMNS)[number];
  todos: Todo[];
  isOver: boolean;
  draggedId: string | null;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, cat: TodoCategory) => void;
  onEdit: (id: string, title: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.key });
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isDone = column.key === 'done';

  const handleAdd = () => {
    if (!newTitle.trim()) { setAdding(false); return; }
    onAdd(newTitle.trim());
    setNewTitle('');
    inputRef.current?.focus();
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border bg-white overflow-hidden transition-colors',
        isOver ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-200',
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', column.headerBg)}>
        <div className={cn('flex items-center gap-2 font-semibold text-sm', column.accent)}>
          {column.icon}
          {column.label}
        </div>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', column.countBg)}>
          {todos.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-0">
        {todos.length === 0 && !adding && (
          <p className="text-sm text-gray-400 text-center py-8 px-2">{column.empty}</p>
        )}

        {todos.map((todo) => (
          <DraggableTodoCard
            key={todo.id}
            todo={todo}
            isDone={isDone}
            isDragging={draggedId === todo.id}
            onDone={() => onMove(todo.id, isDone ? 'todo' : 'done')}
            onDelete={() => onDelete(todo.id)}
            onEdit={(title) => onEdit(todo.id, title)}
          />
        ))}

        {adding && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-indigo-300 bg-indigo-50/50">
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
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Add button */}
      {!isDone && (
        <div className="border-t border-gray-100 p-2.5">
          <button
            onClick={() => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Plus size={15} />
            Taak toevoegen
          </button>
        </div>
      )}
    </div>
  );
}

function DraggableTodoCard({
  todo,
  isDone,
  isDragging,
  onDone,
  onDelete,
  onEdit,
}: {
  todo: Todo;
  isDone: boolean;
  isDragging: boolean;
  onDone: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(todo.title);

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const handleEditSave = () => {
    if (editVal.trim()) onEdit(editVal.trim());
    else setEditVal(todo.title);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-transparent transition-all hover:border-gray-200 hover:bg-gray-50',
        isDone && 'opacity-50',
        isDragging && 'opacity-30',
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
        tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>

      {/* Checkbox */}
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

      {/* Title */}
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
          className="flex-1 text-sm bg-transparent border-b border-indigo-300 outline-none pb-0.5 text-gray-800"
        />
      ) : (
        <span
          className={cn(
            'flex-1 text-sm text-gray-800 leading-snug cursor-text',
            isDone && 'line-through text-gray-400',
          )}
          onDoubleClick={() => { setEditing(true); setEditVal(todo.title); }}
        >
          {todo.title}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
        {!editing && (
          <button
            onClick={() => { setEditing(true); setEditVal(todo.title); }}
            className="h-6 w-6 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 transition-colors"
          >
            <Pencil size={11} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="h-6 w-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
