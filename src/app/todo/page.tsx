'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Plus, Trash2, Check, Calendar, ClipboardList, CheckCircle2, Pencil, GripVertical, Flag, Package, Tag } from 'lucide-react';
import { useTodoStore, type TodoCategory, type TodoPriority, type TodoLabel, type Todo } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils';

const KARST_USER_ID = 'user-1';
// Projects that have a personal todo board. Todos are stored per project, so
// each of these keeps its own set of cards.
const TODO_PROJECT_IDS = ['proj-3', 'proj-4'];

const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string; border: string; bg: string }[] = [
  { value: 'none',   label: 'Geen',   color: 'text-gray-300',  border: 'border-l-transparent', bg: 'bg-transparent'  },
  { value: 'low',    label: 'Laag',   color: 'text-sky-400',   border: 'border-l-sky-400',     bg: 'bg-sky-400'      },
  { value: 'medium', label: 'Middel', color: 'text-amber-400', border: 'border-l-amber-400',   bg: 'bg-amber-400'    },
  { value: 'high',   label: 'Hoog',   color: 'text-red-500',   border: 'border-l-red-500',     bg: 'bg-red-500'      },
];

const LABEL_OPTIONS: {
  value: TodoLabel;
  label: string;
  emoji: string;
  pill: string;
  pillText: string;
  cardBg: string;
}[] = [
  { value: 'none',         label: 'Geen label',   emoji: '',   pill: 'bg-gray-100 text-gray-400',         pillText: '',          cardBg: ''                    },
  { value: 'groei',        label: 'Groei',         emoji: '🌱', pill: 'bg-emerald-100 text-emerald-700',   pillText: 'Groei',     cardBg: 'bg-emerald-50/40'    },
  { value: 'onderhoud',    label: 'Onderhoud',     emoji: '🔧', pill: 'bg-orange-100 text-orange-700',     pillText: 'Onderhoud', cardBg: 'bg-orange-50/40'     },
  { value: 'operationeel', label: 'Operationeel',  emoji: '⚡', pill: 'bg-red-100 text-red-700',           pillText: 'Operatie.', cardBg: 'bg-red-50/40'        },
];

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
    key: 'nazendingen',
    label: 'Nazendingen',
    icon: <Package size={16} />,
    accent: 'text-rose-700',
    headerBg: 'bg-rose-50 border-rose-200',
    countBg: 'bg-rose-100 text-rose-700',
    empty: 'Geen nazendingen',
  },
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
  const router = useRouter();
  const { currentUserId } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const { todos, addTodo, deleteTodo, editTodo, setPriority, setLabel, commitReorder, moveTodo } = useTodoStore();

  const [previewTodos, setPreviewTodos] = useState<Todo[] | null>(null);
  const originalRef = useRef<Todo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [labelFilter, setLabelFilter] = useState<TodoLabel | 'all'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const isAuthorized =
    currentUserId === KARST_USER_ID && TODO_PROJECT_IDS.includes(activeProjectId);

  useEffect(() => {
    if (currentUserId && !isAuthorized) {
      router.replace('/');
    }
  }, [currentUserId, isAuthorized, router]);

  // While loading or unauthorized, render nothing
  if (!currentUserId || !isAuthorized) return null;

  const allTodos = previewTodos ?? todos;
  const displayTodos =
    labelFilter === 'all' ? allTodos : allTodos.filter((t) => t.label === labelFilter);
  const activeTodo = activeId ? displayTodos.find((t) => t.id === activeId) : null;

  const filters = LABEL_OPTIONS.filter((o) => o.value !== 'none').map((o) => ({
    ...o,
    count: allTodos.filter((t) => t.label === o.value).length,
  }));

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
      <div className="flex-1 overflow-hidden p-5 flex flex-col gap-3">
        {/* Label filter — narrows every column at once */}
        <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
          <button
            onClick={() => setLabelFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors',
              labelFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            )}
          >
            Alles ({allTodos.length})
          </button>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setLabelFilter(labelFilter === f.value ? 'all' : f.value)}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors',
                labelFilter === f.value
                  ? f.pill
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              )}
            >
              <span>{f.emoji}</span>
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            className="grid gap-4 flex-1 min-h-0"
            style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(0, 1fr))` }}
          >
            {COLUMNS.map((col) => {
              const colTodos = displayTodos.filter((t) => t.category === col.key);
              return (
                <DroppableColumn
                  key={col.key}
                  column={col}
                  todos={colTodos}
                  draggedId={activeId}
                  onAdd={(title) => addTodo(title, col.key, activeProjectId)}
                  onDelete={(id) => deleteTodo(id)}
                  onEdit={(id, title) => editTodo(id, title)}
                  onChangePriority={(id, p) => setPriority(id, p)}
                  onChangeLabel={(id, l) => setLabel(id, l)}
                  onToggleDone={(id, currentCategory) =>
                    moveTodo(id, currentCategory === 'done' ? 'todo' : 'done')
                  }
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
  onChangePriority,
  onChangeLabel,
  onToggleDone,
}: {
  column: (typeof COLUMNS)[number];
  todos: Todo[];
  draggedId: string | null;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onChangePriority: (id: string, p: TodoPriority) => void;
  onChangeLabel: (id: string, l: TodoLabel) => void;
  onToggleDone: (id: string, currentCategory: TodoCategory) => void;
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
              onDelete={() => onDelete(todo.id)}
              onEdit={(title) => onEdit(todo.id, title)}
              onChangePriority={(p) => onChangePriority(todo.id, p)}
              onChangeLabel={(l) => onChangeLabel(todo.id, l)}
              onToggleDone={() => onToggleDone(todo.id, todo.category)}
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
  onChangePriority,
  onChangeLabel,
  onToggleDone,
}: {
  todo: Todo;
  isDone: boolean;
  isDragging: boolean;
  onDelete: () => void;
  onEdit: (title: string) => void;
  onChangePriority: (p: TodoPriority) => void;
  onChangeLabel: (l: TodoLabel) => void;
  onToggleDone: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(todo.title);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);

  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === (todo.priority ?? 'none'))!;
  const labelMeta = LABEL_OPTIONS.find((l) => l.value === (todo.label ?? 'none'))!;

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
        'group relative rounded-lg border-l-2 border border-transparent transition-all hover:border-gray-200',
        priorityMeta.border,
        !isDone && labelMeta.value !== 'none' && labelMeta.cardBg,
        isDone && 'opacity-50',
        isDragging && 'opacity-30 bg-gray-50 border-gray-200',
      )}
    >
      {/* Label badge row — only shown when a label is set */}
      {labelMeta.value !== 'none' && !isDone && (
        <div className="px-2 pt-1.5 pb-0">
          <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold', labelMeta.pill)}>
            <span>{labelMeta.emoji}</span>
            {labelMeta.label}
          </span>
        </div>
      )}

      {/* Main row */}
      <div className="flex items-start gap-2 px-2 py-2">
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          tabIndex={-1}
          className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-200 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <GripVertical size={13} />
        </button>

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
          className={cn(
            'mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer hover:scale-110',
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50',
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
            className={cn('flex-1 text-sm text-gray-800 leading-snug cursor-text select-none', isDone && 'line-through text-gray-400')}
            onDoubleClick={() => { setEditing(true); setEditVal(todo.title); }}
          >
            {todo.title}
          </span>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          {/* Label button */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowLabelMenu((v) => !v); setShowPriorityMenu(false); }}
              title={`Label: ${labelMeta.label}`}
              className={cn(
                'h-6 w-6 flex items-center justify-center rounded transition-colors text-xs',
                labelMeta.value !== 'none'
                  ? labelMeta.pill
                  : 'text-gray-200 opacity-0 group-hover:opacity-100 hover:text-gray-400',
              )}
            >
              <Tag size={11} />
            </button>

            {showLabelMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLabelMenu(false)} />
                <div className="absolute right-0 top-7 z-50 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
                  {LABEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onChangeLabel(opt.value); setShowLabelMenu(false); }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 transition-colors text-left',
                        todo.label === opt.value && 'bg-gray-50 font-semibold',
                      )}
                    >
                      <span className="text-sm">{opt.emoji || '○'}</span>
                      <span className="text-gray-700">{opt.label}</span>
                      {todo.label === opt.value && <Check size={10} className="ml-auto text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Priority button */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPriorityMenu((v) => !v); setShowLabelMenu(false); }}
              title={`Prioriteit: ${priorityMeta.label}`}
              className={cn(
                'h-6 w-6 flex items-center justify-center rounded transition-colors',
                todo.priority !== 'none'
                  ? priorityMeta.color
                  : 'text-gray-200 opacity-0 group-hover:opacity-100 hover:text-gray-400',
              )}
            >
              <Flag size={11} />
            </button>

            {showPriorityMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPriorityMenu(false)} />
                <div className="absolute right-0 top-7 z-50 w-32 bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onChangePriority(opt.value); setShowPriorityMenu(false); }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 transition-colors text-left',
                        todo.priority === opt.value && 'bg-gray-50 font-semibold',
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', opt.value === 'none' ? 'bg-gray-200' : opt.bg)} />
                      <span className="text-gray-700">{opt.label}</span>
                      {todo.priority === opt.value && <Check size={10} className="ml-auto text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {!editing && (
            <button
              onClick={() => { setEditing(true); setEditVal(todo.title); }}
              className="h-6 w-6 flex items-center justify-center rounded text-gray-200 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Pencil size={11} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="h-6 w-6 flex items-center justify-center rounded text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
