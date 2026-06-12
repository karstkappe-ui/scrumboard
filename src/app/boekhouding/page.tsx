'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Pencil, Trash2, BookOpen, ChevronRight, ChevronDown,
  X, Check, AlertCircle,
} from 'lucide-react';
import { useBoekStore, type BoekEntry, type BoekFrequency } from '@/store/boekStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

const NEWMATE_PROJECT_ID = 'proj-3';
const KARST_USER_ID = 'user-1';

/* ---- frequency config ---- */
const FREQ_CONFIG: Record<BoekFrequency | '', { label: string; color: string; bg: string }> = {
  '':             { label: '',              color: '',                  bg: ''                       },
  eenmalig:       { label: 'Eenmalig',      color: 'text-gray-600',    bg: 'bg-gray-100'            },
  per_rit:        { label: 'Per rit/keer',  color: 'text-blue-700',    bg: 'bg-blue-100'            },
  wekelijks:      { label: 'Wekelijks',     color: 'text-violet-700',  bg: 'bg-violet-100'          },
  maandelijks:    { label: 'Maandelijks',   color: 'text-indigo-700',  bg: 'bg-indigo-100'          },
  per_kwartaal:   { label: 'Per kwartaal',  color: 'text-amber-700',   bg: 'bg-amber-100'           },
  jaarlijks:      { label: 'Jaarlijks',     color: 'text-emerald-700', bg: 'bg-emerald-100'         },
};

/* ---- category colour palette (cycles) ---- */
const CAT_PALETTE = [
  { border: 'border-l-rose-400',   header: 'bg-rose-50',    badge: 'bg-rose-100 text-rose-700'   },
  { border: 'border-l-amber-400',  header: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700' },
  { border: 'border-l-indigo-400', header: 'bg-indigo-50',  badge: 'bg-indigo-100 text-indigo-700'},
  { border: 'border-l-teal-400',   header: 'bg-teal-50',    badge: 'bg-teal-100 text-teal-700'   },
  { border: 'border-l-violet-400', header: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700'},
  { border: 'border-l-sky-400',    header: 'bg-sky-50',     badge: 'bg-sky-100 text-sky-700'     },
];

/* ---- suggested categories ---- */
const SUGGESTED_CATS = [
  'Vergeet niet! 🔔',
  'Reiskosten',
  'Vaste lasten',
  'Representatie',
  'Privé → Zakelijk',
  'BTW',
  'Inkomen',
  'Personeel',
  'Overig',
];

/* ---- frequency options ---- */
const FREQ_OPTIONS: { value: BoekFrequency | ''; label: string }[] = [
  { value: '',             label: '— geen —'      },
  { value: 'eenmalig',    label: 'Eenmalig'       },
  { value: 'per_rit',     label: 'Per rit/keer'   },
  { value: 'wekelijks',   label: 'Wekelijks'      },
  { value: 'maandelijks', label: 'Maandelijks'    },
  { value: 'per_kwartaal',label: 'Per kwartaal'   },
  { value: 'jaarlijks',   label: 'Jaarlijks'      },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function BoekhoudingPage() {
  const router = useRouter();
  const { currentUserId } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const { entries, addEntry, updateEntry, deleteEntry } = useBoekStore();

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<BoekEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAuthorized = currentUserId === KARST_USER_ID && activeProjectId === NEWMATE_PROJECT_ID;

  useEffect(() => {
    if (currentUserId && !isAuthorized) router.replace('/');
  }, [currentUserId, isAuthorized, router]);

  if (!currentUserId || !isAuthorized) return null;

  /* ---- derived data ---- */
  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    for (const e of entries) {
      seen.set(e.category, (seen.get(e.category) ?? 0) + 1);
    }
    return Array.from(seen.entries()).map(([name, count]) => ({ name, count }));
  }, [entries]);

  const catColorMap = useMemo(() => {
    const map = new Map<string, (typeof CAT_PALETTE)[number]>();
    categories.forEach(({ name }, i) => {
      map.set(name, CAT_PALETTE[i % CAT_PALETTE.length]);
    });
    return map;
  }, [categories]);

  const filtered = selectedCat
    ? entries.filter((e) => e.category === selectedCat)
    : entries;

  function openCreate() {
    setEditEntry(null);
    setModalOpen(true);
  }

  function openEdit(entry: BoekEntry) {
    setEditEntry(entry);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setDeleteConfirm(null);
    setExpandedId(null);
    deleteEntry(id);
  }

  /* ---- group by category for display ---- */
  const grouped = useMemo(() => {
    const map = new Map<string, BoekEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.category)) map.set(e.category, []);
      map.get(e.category)!.push(e);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="📒 Boekhouding · New Mate"
        subtitle="Handboek — hoe en waarom je bepaalde posten inboekt"
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
            Nieuwe post
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Left: category list */}
        <div className="w-52 flex-shrink-0 border-r border-gray-100 flex flex-col bg-gray-50/50 overflow-hidden">
          <div className="p-3 overflow-y-auto flex-1 space-y-0.5">
            <p className="px-2 pb-2 text-[9px] font-semibold text-gray-400 uppercase tracking-[0.14em]">
              Categorieën
            </p>
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
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                selectedCat === null ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500',
              )}>
                {entries.length}
              </span>
            </button>

            {categories.map(({ name, count }) => {
              const color = catColorMap.get(name)!;
              const isActive = selectedCat === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedCat(name)}
                  className={cn(
                    'w-full text-left flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors border-l-2',
                    color.border,
                    isActive
                      ? 'bg-white shadow-sm text-gray-900 border border-gray-200 border-l-2'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 border-transparent',
                  )}
                >
                  <span className="truncate pr-1">{name}</span>
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', isActive ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: entries */}
        <div className="flex-1 overflow-y-auto p-5">
          {entries.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-3">📒</div>
                <p className="text-sm font-medium text-gray-600">Handboek is leeg</p>
                <p className="text-xs mt-1">Voeg je eerste boekhoudpost toe</p>
                <Button variant="primary" size="sm" className="mt-4" leftIcon={<Plus size={13} />} onClick={openCreate}>
                  Eerste post toevoegen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(grouped.entries()).map(([cat, catEntries]) => {
                const color = catColorMap.get(cat) ?? CAT_PALETTE[0];
                return (
                  <section key={cat}>
                    {/* Category header */}
                    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl mb-3', color.header)}>
                      <span className="text-sm font-bold text-gray-800">{cat}</span>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', color.badge)}>
                        {catEntries.length}
                      </span>
                    </div>

                    {/* Entries grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {catEntries.map((entry) => (
                        <EntryCard
                          key={entry.id}
                          entry={entry}
                          color={color}
                          isExpanded={expandedId === entry.id}
                          onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          onEdit={() => openEdit(entry)}
                          onDelete={() => setDeleteConfirm(entry.id)}
                        />
                      ))}
                    </div>
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
          existingCategories={categories.map((c) => c.name)}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            if (editEntry) {
              updateEntry(editEntry.id, data);
            } else {
              addEntry(data);
            }
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
/*  Entry card                                                          */
/* ------------------------------------------------------------------ */

function EntryCard({
  entry, color, isExpanded, onToggle, onEdit, onDelete,
}: {
  entry: BoekEntry;
  color: (typeof CAT_PALETTE)[number];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const freq = entry.frequency ? FREQ_CONFIG[entry.frequency] : null;
  const isAlert = entry.category.toLowerCase().includes('vergeet');

  return (
    <div className={cn(
      'group rounded-xl border bg-white border-l-4 shadow-sm transition-shadow hover:shadow-md overflow-hidden',
      color.border,
      isAlert && 'ring-1 ring-amber-200',
    )}>
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start gap-3 px-4 pt-4 pb-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {isAlert && <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />}
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{entry.title}</h3>
            </div>
            {freq && freq.label && (
              <span className={cn('flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full', freq.color, freq.bg)}>
                {freq.label}
              </span>
            )}
          </div>
          {/* Preview of hoeBoeken */}
          {!isExpanded && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{entry.hoeBoeken}</p>
          )}
        </div>
        <div className="flex-shrink-0 mt-0.5 text-gray-400">
          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {entry.hoeBoeken && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Hoe boeken</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-blue-50/60 rounded-lg px-3 py-2.5">
                {entry.hoeBoeken}
              </p>
            </div>
          )}
          {entry.waarom && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Waarom</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-indigo-50/50 rounded-lg px-3 py-2.5">
                {entry.waarom}
              </p>
            </div>
          )}
          {entry.notes && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Notities</p>
              <p className="text-sm text-gray-600 leading-relaxed italic whitespace-pre-wrap bg-amber-50/60 rounded-lg px-3 py-2.5">
                {entry.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className={cn(
        'flex items-center justify-end gap-1 px-3 py-2 border-t border-gray-50',
        isExpanded ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity',
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Pencil size={11} /> Bewerken
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={11} /> Verwijderen
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form modal                                                          */
/* ------------------------------------------------------------------ */

type FormData = Omit<BoekEntry, 'id' | 'createdAt'>;

function EntryFormModal({ entry, existingCategories, onClose, onSave }: {
  entry: BoekEntry | null;
  existingCategories: string[];
  onClose: () => void;
  onSave: (data: FormData) => void;
}) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [category, setCategory] = useState(entry?.category ?? '');
  const [frequency, setFrequency] = useState<BoekFrequency | ''>(entry?.frequency ?? '');
  const [hoeBoeken, setHoeBoeken] = useState(entry?.hoeBoeken ?? '');
  const [waarom, setWaarom] = useState(entry?.waarom ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);

  const catSuggestions = [
    ...SUGGESTED_CATS.filter((c) => !existingCategories.includes(c)),
    ...existingCategories,
  ].filter((c) => !category || c.toLowerCase().includes(category.toLowerCase()));

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
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Naam / onderwerp *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="bijv. Wegenbelasting privé betaald"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Category + Frequency */}
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
              <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-40 overflow-y-auto">
                {catSuggestions.slice(0, 8).map((c) => (
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

        {/* Hoe boeken */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hoe boeken?
            <span className="ml-1 text-gray-400 font-normal">— de stappen, rekening, percentage, etc.</span>
          </label>
          <textarea
            value={hoeBoeken}
            onChange={(e) => setHoeBoeken(e.target.value)}
            rows={4}
            placeholder="bijv. Boek als 'Reiskosten' (gr. 4710). €0,23 per km. Bewaar rittenregistratie."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Waarom */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Waarom?
            <span className="ml-1 text-gray-400 font-normal">— de reden, fiscale grondslag, etc.</span>
          </label>
          <textarea
            value={waarom}
            onChange={(e) => setWaarom(e.target.value)}
            rows={3}
            placeholder="bijv. Fiscaal aftrekbaar voor zakelijk gebruik — zonder registratie geen aftrek."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Notities / herinneringen
            <span className="ml-1 text-gray-400 font-normal">— tips, valkuilen, deadlines</span>
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
