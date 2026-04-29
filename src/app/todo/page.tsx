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
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
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
  const { todos, addTodo, deleteTodo, editTodo, commitReorder } = useTodoStore();

  const [previewTodos, setPreviewTodos] = useState<Todo[] | null>(null);
  const originalRef = useRef<Todo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (currentUserId !== KARST_USER_ID || activeProjectId !== NEWMATE_PROJECT_ID) {
    redirect('/');
  }

  const displayTodos = previewTodos ?? todos;
  const activeTodo = activeId ? displayTodos.find((t) => t.id === activeId) : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
    originalRef.current = todos;
    setPreviewTodos([...todos]);
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over || !previewTodos) return;

    const draggingId = active.id as string;
    const overId = over.id as string;
    if (draggingId === overId) return;

    const dragging = previewTodos.find((t) => t.id === draggingId);
    if (!dragging) return;

    const isOverColumn = COLUMNS.some((c) => c.key === overId);
    const overTodo = previewTodos.find((t) => t.id === overId);

    if (isOverColumn) {
      const target = overId as TodoCategory;
      if (dragging.category !== target) {
        setPreviewTodos(previewTodos.map((t) => (t.id === draggingId ? { ...t, category: target } : t)));
      }
      return;
    }

    if (overTodo) {
      if (dragging.category === overTodo.category) {
        // Reorder within column
        const col = previewTodos.filter((t) => t.category === dragging.category);
        const rest = previewTodos.filter((t) => t.category !== dragging.category);
        const from = col.findIndex((t) => t.id === draggingId);
        const to = col.findIndex((t) => t.id === overId);
        setPreviewTodos([...rest, ...arrayMove(col, from, to)]);
      } else {
        // Move to different column, insert near overTodo
        const moved = previewTodos.map((t) =>
          t.id === draggingId ? { ...t, category: overTodo.category } : t,
        );
        const col = moved.filter((t) => t.category === overTodo.category);
        const rest = moved.filter((t) => t.category !== overTodo.category);
        const from = col.findIndex((t) => t.id === draggingId);
        const to = col.findIndex((t) => t.id === overId);
        setPreviewTodos([...rest, ...arrayMove(col, from, to)]);
      }
    }
  }

  function handleDragEnd(_e: DragEndEvent) {
    if (previewTodos) commitReorder(previewTodos, originalRef.current);
    setActiveId(null);
    setPreviewTodos(null);
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
            {COLUMNS.map((col) => {
              const colTodos = displayTodos.filter((t) => t.category === col.key);
              return (
                <DroppableColumn
                  key={col.key}
                  column={col}
                  todos={colTodos}
                  draggedId={activeId}
                  onAdd={(title) => addTodo(title, col.key)}
                  onDelete={(id) => deleteTodo(id)}
                  onEdit={(id, title) => editTodo(id, title)}
                />
              );
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTodo && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-indigo-300 bg-white shadow-xl cursor-grabbing">
                <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
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
  draggedId,
  onAdd,
  onDelete,
  onEdit,
}: {
  column: (typeof COLUMNS)[number];
  todos: Todo[];
  draggedId: string | null;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });
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
      className={cn(
        'flex flex-col rounded-xl border bg-white overflow-hidden transition-colors',
        isOver ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200',
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
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2.5 space-y-1 min-h-0">
        {todos.length === 0 && !adding && (
          <p className="text-sm text-gray-400 text-center py-8 px-2">{column.empty}</p>
        )}

        <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {todos.map((todo) => (
            <SortableTodoCard
              key={todo.id}
              todo={todo}
              isDone={isDone}
              isDragging={draggedId === todo.id}
              onDone={() => {/* handled via commitReorder on cross-column drag */}}
              onDelete={() => onDelete(todo.id)}
              onEdit={(title) => onEdit(todo.id, title)}
            />
          ))}
        </SortableContext>

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

function SortableTodoCard({
  todo,
  isDone,
  isDragging,
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(todo.title);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        'group flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-transparent transition-colors hover:border-gray-200 hover:bg-gray-50',
        isDone && 'opacity-50',
        isDragging && 'opacity-30 bg-gray-50 border-gray-200',
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        tabIndex={-1}
        className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <GripVertical size={14} />
      </button>

      {/* Checkbox */}
      <div
        className={cn(
          'mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0',
          isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300',
        )}
      >
        {isDone && <Check size={10} />}
      </div>

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
            'flex-1 text-sm text-gray-800 leading-snug cursor-text select-none',
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
