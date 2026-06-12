'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Pencil, Trash2, BookOpen, ChevronRight, ChevronDown,
  AlertCircle, Check, X,
} from 'lucide-react';
import { useBoekStore, type BoekEntry, type BoekFrequency } from '@/store/boekStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const NEWMATE_PROJECT_ID = 'proj-3';
const KARST_USER_ID = 'user-1';

const FREQ_CONFIG: Record<BoekFrequency | '', { label: string; color: string; bg: string }> = {
  '':             { label: '',              color: '',                   bg: ''              },
  eenmalig:       { label: 'Eenmalig',      color: 'text-gray-600',     bg: 'bg-gray-100'   },
  per_rit:        { label: 'Per rit/keer',  color: 'text-blue-700',     bg: 'bg-blue-100'   },
  wekelijks:      { label: 'Wekelijks',     color: 'text-violet-700',   bg: 'bg-violet-100' },
  maandelijks:    { label: 'Maandelijks',   color: 'text-indigo-700',   bg: 'bg-indigo-100' },
  per_kwartaal:   { label: 'Per kwartaal',  color: 'text-amber-700',    bg: 'bg-amber-100'  },
  jaarlijks:      { label: 'Jaarlijks',     color: 'text-emerald-700',  bg: 'bg-emerald-100'},
};

const CAT_PALETTE = [
  { bar: 'bg-rose-400',   header: 'text-rose-700',   headerBg: 'bg-rose-50',   border: 'border-rose-200'   },
  { bar: 'bg-amber-400',  header: 'text-amber-700',  headerBg: 'bg-amber-50',  border: 'border-amber-200'  },
  { bar: 'bg-indigo-400', header: 'text-indigo-700', headerBg: 'bg-indigo-50', border: 'border-indigo-200' },
  { bar: 'bg-teal-400',   header: 'text-teal-700',   headerBg: 'bg-teal-50',   border: 'border-teal-200'   },
  { bar: 'bg-violet-400', header: 'text-violet-700', headerBg: 'bg-violet-50', border: 'border-violet-200' },
  { bar: 'bg-sky-400',    header: 'text-sky-700',    headerBg: 'bg-sky-50',    border: 'border-sky-200'    },
  { bar: 'bg-pink-400',   header: 'text-pink-700',   headerBg: 'bg-pink-50',   border: 'border-pink-200'   },
  { bar: 'bg-lime-500',   header: 'text-lime-700',   headerBg: 'bg-lime-50',   border: 'border-lime-200'   },
];

const FREQ_OPTIONS: { value: BoekFrequency | ''; label: string }[] = [
  { value: '',             label: '— geen —'     },
  { value: 'eenmalig',    label: 'Eenmalig'      },
  { value: 'per_rit',     label: 'Per rit/keer'  },
  { value: 'wekelijks',   label: 'Wekelijks'     },
  { value: 'maandelijks', label: 'Maandelijks'   },
  { value: 'per_kwartaal',label: 'Per kwartaal'  },
  { value: 'jaarlijks',   label: 'Jaarlijks'     },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function BoekhoudingPage() {
  const router = useRouter();
  const { currentUserId } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const { entries, customCategories, addEntry, updateEntry, deleteEntry, addCategory, deleteCategory } = useBoekStore();

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<BoekEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const newCatRef = useRef<HTMLInputElement>(null);

  const isAuthorized = currentUserId === KARST_USER_ID && activeProjectId === NEWMATE_PROJECT_ID;

  useEffect(() => {
    if (currentUserId && !isAuthorized) router.replace('/');
  }, [currentUserId, isAuthorized, router]);

  // All categories: union of explicit + those from entries (in case of legacy data)
  const allCategories = useMemo(() => {
    const fromEntries = entries.map((e) => e.category);
    const seen = new Set<string>();
    const result: string[] = [];
    for (const c of [...customCategories, ...fromEntries]) {
      if (!seen.has(c)) { seen.add(c); result.push(c); }
    }
    return result;
  }, [customCategories, entries]);

  const catColorMap = useMemo(() => {
    const map = new Map<string, (typeof CAT_PALETTE)[number]>();
    allCategories.forEach((name, i) => map.set(name, CAT_PALETTE[i % CAT_PALETTE.length]));
    return map;
  }, [allCategories]);

  const entryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    return map;
  }, [entries]);

  const filtered = useMemo(
    () => (selectedCat ? entries.filter((e) => e.category === selectedCat) : entries),
    [selectedCat, entries],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, BoekEntry[]>();
    for (const cat of allCategories) {
      const catEntries = filtered.filter((e) => e.category === cat);
      if (catEntries.length > 0 || !selectedCat) map.set(cat, catEntries);
    }
    return map;
  }, [filtered, allCategories, selectedCat]);

  if (!currentUserId || !isAuthorized) return null;

  function handleAddCategory() {
    const name = newCatName.trim();
    if (name) { addCategory(name); setSelectedCat(name); }
    setNewCatName('');
    setAddingCat(false);
  }

  function handleDeleteCategory(name: string) {
    if ((entryCounts.get(name) ?? 0) > 0) return; // don't delete if has entries
    if (selectedCat === name) setSelectedCat(null);
    deleteCategory(name);
  }

  function openCreate(defaultCat?: string) {
    setEditEntry(null);
    if (defaultCat) setSelectedCat(defaultCat);
    setModalOpen(true);
  }

  function openEdit(entry: BoekEntry) {
    setEditEntry(entry);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setDeleteConfirm(null);
    if (expandedId === id) setExpandedId(null);
    deleteEntry(id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="📒 Boekhouding · New Mate"
        subtitle="Handboek — hoe en waarom je bepaalde posten inboekt"
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => openCreate(selectedCat ?? undefined)}>
            Nieuwe post
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Left: category list */}
        <div className="w-52 flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50 overflow-hidden">
          <div className="p-3 overflow-y-auto flex-1 space-y-0.5">
            {/* Header + add button */}
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.14em]">Categorieën</p>
              <button
                onClick={() => { setAddingCat(true); setTimeout(() => newCatRef.current?.focus(), 50); }}
                className="h-5 w-5 flex items-center justify-center rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Nieuwe categorie"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Inline new category input */}
            {addingCat && (
              <div className="flex items-center gap-1 px-1 pb-1">
                <input
                  ref={newCatRef}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                    if (e.key === 'Escape') { setAddingCat(false); setNewCatName(''); }
                  }}
                  placeholder="Naam categorie…"
                  className="flex-1 min-w-0 rounded-lg border border-indigo-300 px-2 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button onClick={handleAddCategory} className="h-6 w-6 flex items-center justify-center rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0">
                  <Check size={11} />
                </button>
                <button onClick={() => { setAddingCat(false); setNewCatName(''); }} className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-200 transition-colors flex-shrink-0">
                  <X size={11} />
                </button>
              </div>
            )}

            {/* All */}
            <button
              onClick={() => setSelectedCat(null)}
              className={cn(
                'w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedCat === null
                  ? 'bg-white shadow-sm text-indigo-700 border border-indigo-100'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900',
              )}
            >
              <span className="flex items-center gap-2">
                <BookOpen size={13} className="flex-shrink-0" />
                Alles
              </span>
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', selectedCat === null ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500')}>
                {entries.length}
              </span>
            </button>

            {/* Category list */}
            {allCategories.map((name) => {
              const color = catColorMap.get(name)!;
              const isActive = selectedCat === name;
              const count = entryCounts.get(name) ?? 0;
              const canDelete = count === 0;
              return (
                <div key={name} className="group/cat relative flex items-center">
                  <button
                    onClick={() => setSelectedCat(name)}
                    className={cn(
                      'flex-1 text-left flex items-center justify-between pl-2.5 pr-1 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white shadow-sm text-gray-900 border border-gray-200'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900',
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', color.bar)} />
                      <span className="truncate text-xs">{name}</span>
                    </span>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1', isActive ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500')}>
                      {count}
                    </span>
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteCategory(name)}
                      className="absolute right-0 h-6 w-6 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover/cat:opacity-100 mr-0.5"
                      title="Verwijder categorie"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: entries */}
        <div className="flex-1 overflow-y-auto p-5">
          {entries.length === 0 && allCategories.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-3">📒</div>
                <p className="text-sm font-medium text-gray-600">Handboek is leeg</p>
                <p className="text-xs mt-1">Maak eerst een categorie aan, dan kun je posts toevoegen</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {Array.from(grouped.entries()).map(([cat, catEntries]) => {
                const color = catColorMap.get(cat) ?? CAT_PALETTE[0];
                return (
                  <section key={cat}>
                    {/* Category header */}
                    <div className={cn('flex items-center justify-between px-3 py-1.5 rounded-lg mb-1', color.headerBg)}>
                      <div className="flex items-center gap-2">
                        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', color.bar)} />
                        <span className={cn('text-xs font-bold', color.header)}>{cat}</span>
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full opacity-70', color.headerBg, color.header)}>
                          {catEntries.length}
                        </span>
                      </div>
                      <button
                        onClick={() => openCreate(cat)}
                        className={cn('flex items-center gap-1 text-[10px] font-medium opacity-60 hover:opacity-100 transition-opacity', color.header)}
                      >
                        <Plus size={11} /> post
                      </button>
                    </div>

                    {/* Entry rows */}
                    {catEntries.length === 0 ? (
                      <p className="text-xs text-gray-400 italic px-3 py-2">
                        Nog geen posts — klik op &ldquo;+ post&rdquo; om er een toe te voegen
                      </p>
                    ) : (
                      <div className={cn('rounded-xl border overflow-hidden', color.border)}>
                        {catEntries.map((entry, idx) => (
                          <EntryRow
                            key={entry.id}
                            entry={entry}
                            color={color}
                            isExpanded={expandedId === entry.id}
                            isLast={idx === catEntries.length - 1}
                            onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            onEdit={() => openEdit(entry)}
                            onDelete={() => setDeleteConfirm(entry.id)}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create / edit modal */}
      {modalOpen && (
        <EntryFormModal
          entry={editEntry}
          defaultCategory={selectedCat ?? ''}
          allCategories={allCategories}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            if (editEntry) updateEntry(editEntry.id, data);
            else addEntry(data);
            setModalOpen(false);
          }}
        />
      )}

      {/* Delete confirm */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Post verwijderen"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Annuleren</Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm!)}>Verwijderen</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Weet je zeker dat je deze post wilt verwijderen?</p>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact entry row (accordion)                                       */
/* ------------------------------------------------------------------ */

function EntryRow({
  entry, color, isExpanded, isLast, onToggle, onEdit, onDelete,
}: {
  entry: BoekEntry;
  color: (typeof CAT_PALETTE)[number];
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const freq = entry.frequency ? FREQ_CONFIG[entry.frequency] : null;
  const isAlert = entry.category.toLowerCase().includes('vergeet');

  return (
    <div className={cn('bg-white', !isLast && 'border-b border-gray-100')}>
      {/* Compact header row */}
      <div className="group flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors">
        <button onClick={onToggle} className="flex-1 flex items-center gap-2 min-w-0 text-left">
          {isAlert && <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />}
          <span className="text-sm text-gray-800 font-medium truncate">{entry.title}</span>
          {freq && freq.label && (
            <span className={cn('flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full', freq.color, freq.bg)}>
              {freq.label}
            </span>
          )}
        </button>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Bewerken"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Verwijderen"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <button onClick={onToggle} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 space-y-2.5 bg-gray-50/50 border-t border-gray-100">
          {entry.hoeBoeken && (
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hoe boeken</p>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-blue-50 rounded-lg px-3 py-2">
                {entry.hoeBoeken}
              </p>
            </div>
          )}
          {entry.waarom && (
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Waarom</p>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap bg-indigo-50 rounded-lg px-3 py-2">
                {entry.waarom}
              </p>
            </div>
          )}
          {entry.notes && (
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notities</p>
              <p className="text-xs text-gray-600 leading-relaxed italic whitespace-pre-wrap bg-amber-50 rounded-lg px-3 py-2">
                {entry.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form modal                                                          */
/* ------------------------------------------------------------------ */

type FormData = Omit<BoekEntry, 'id' | 'createdAt'>;

function EntryFormModal({ entry, defaultCategory, allCategories, onClose, onSave }: {
  entry: BoekEntry | null;
  defaultCategory: string;
  allCategories: string[];
  onClose: () => void;
  onSave: (data: FormData) => void;
}) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [category, setCategory] = useState(entry?.category ?? defaultCategory);
  const [frequency, setFrequency] = useState<BoekFrequency | ''>(entry?.frequency ?? '');
  const [hoeBoeken, setHoeBoeken] = useState(entry?.hoeBoeken ?? '');
  const [waarom, setWaarom] = useState(entry?.waarom ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);

  const catSuggestions = allCategories.filter(
    (c) => !category || c.toLowerCase().includes(category.toLowerCase()),
  );

  function handleSave() {
    if (!title.trim() || !category.trim()) return;
    onSave({
      title: title.trim(),
      category: category.trim(),
      frequency,
      hoeBoeken: hoeBoeken.trim(),
      waarom: waarom.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={entry ? 'Post bewerken' : 'Nieuwe boekhoudpost'}
      description="Vul in hoe je deze post inboekt en waarom"
      size="xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuleren</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!title.trim() || !category.trim()}>
            {entry ? 'Opslaan' : 'Post aanmaken'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Naam / onderwerp *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="bijv. Wegenbelasting privé betaald"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">Categorie *</label>
            <input
              value={category}
              onChange={(e) => { setCategory(e.target.value); setShowCatSuggestions(true); }}
              onFocus={() => setShowCatSuggestions(true)}
              onBlur={() => setTimeout(() => setShowCatSuggestions(false), 150)}
              placeholder="bijv. Reiskosten"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            {showCatSuggestions && catSuggestions.length > 0 && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-36 overflow-y-auto">
                {catSuggestions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={() => { setCategory(c); setShowCatSuggestions(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Frequentie</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as BoekFrequency | '')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              {FREQ_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hoe boeken? <span className="text-gray-400 font-normal">— stappen, rekening, percentage</span>
          </label>
          <textarea
            value={hoeBoeken}
            onChange={(e) => setHoeBoeken(e.target.value)}
            rows={4}
            placeholder="bijv. Boek als 'Reiskosten' (gr. 4710). €0,23 per km. Bewaar rittenregistratie."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Waarom? <span className="text-gray-400 font-normal">— reden, fiscale grondslag</span>
          </label>
          <textarea
            value={waarom}
            onChange={(e) => setWaarom(e.target.value)}
            rows={3}
            placeholder="bijv. Fiscaal aftrekbaar voor zakelijk gebruik — zonder registratie geen aftrek."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Notities <span className="text-gray-400 font-normal">— tips, valkuilen, deadlines</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="bijv. Vergeet de bon te bewaren! Komt automatisch via automatische incasso."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
