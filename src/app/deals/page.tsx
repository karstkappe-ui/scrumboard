'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, Pencil, X, Check, ArrowRight, ArrowLeft,
  CalendarDays, FileText, ChevronDown,
} from 'lucide-react';
import { useDealStore, type Deal, type DealStatus, type DealItem } from '@/store/dealStore';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

const ICEO_PROJECT_ID = 'proj-1';
const KARST_USER_ID = 'user-1';

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string; bg: string; dot: string }> = {
  concept:  { label: 'Concept',  color: 'text-gray-600',   bg: 'bg-gray-100',   dot: 'bg-gray-400'   },
  actief:   { label: 'Actief',   color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  verlopen: { label: 'Verlopen', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-400'  },
  afgerond: { label: 'Afgerond', color: 'text-blue-700',   bg: 'bg-blue-100',   dot: 'bg-blue-500'   },
};

const NL_DATE = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function DealsPage() {
  const router = useRouter();
  const { currentUserId } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const { deals, addDeal, updateDeal, deleteDeal } = useDealStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAuthorized = currentUserId === KARST_USER_ID && activeProjectId === ICEO_PROJECT_ID;

  useEffect(() => {
    if (currentUserId && !isAuthorized) router.replace('/');
  }, [currentUserId, isAuthorized, router]);

  if (!currentUserId || !isAuthorized) return null;

  const iceoDeals = deals.filter((d) => d.projectId === ICEO_PROJECT_ID);
  const selectedDeal = iceoDeals.find((d) => d.id === selectedId) ?? (iceoDeals[0] ?? null);

  function openCreate() {
    setEditDeal(null);
    setModalOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditDeal(deal);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setDeleteConfirm(null);
    if (selectedId === id) setSelectedId(null);
    deleteDeal(id);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="🤝 Deals · ICEO"
        subtitle="Samenwerkingen en partnerships bijhouden"
        actions={
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
            Nieuwe deal
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Left panel: deal list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col overflow-hidden bg-gray-50/50">
          <div className="p-3 overflow-y-auto flex-1 space-y-2">
            {iceoDeals.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-3xl mb-3">🤝</div>
                <p className="text-sm font-medium text-gray-600">Nog geen deals</p>
                <p className="text-xs text-gray-400 mt-1">Klik op &ldquo;Nieuwe deal&rdquo; om te beginnen</p>
              </div>
            ) : (
              iceoDeals.map((deal) => {
                const status = STATUS_CONFIG[deal.status];
                const isSelected = selectedDeal?.id === deal.id;
                return (
                  <button
                    key={deal.id}
                    onClick={() => setSelectedId(deal.id)}
                    className={cn(
                      'w-full text-left rounded-xl border p-3 transition-all',
                      isSelected
                        ? 'border-indigo-300 bg-white shadow-sm ring-1 ring-indigo-100'
                        : 'border-gray-200 bg-white hover:bg-white hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className={cn(
                        'text-sm font-semibold leading-snug truncate',
                        isSelected ? 'text-indigo-900' : 'text-gray-900',
                      )}>
                        {deal.title}
                      </p>
                      <span className={cn(
                        'flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                        status.color, status.bg,
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', status.dot)} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{deal.partner}</p>
                    <div className="mt-2 flex gap-2.5 text-[11px] text-gray-400">
                      <span>{deal.obligations.length} verpl.</span>
                      <span>·</span>
                      <span>{deal.receivables.length} ontvangsten</span>
                      {deal.endDate && (
                        <>
                          <span>·</span>
                          <span>t/m {new Date(deal.endDate).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel: deal detail */}
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedDeal ? (
            <DealDetail
              deal={selectedDeal}
              onEdit={() => openEdit(selectedDeal)}
              onDelete={() => setDeleteConfirm(selectedDeal.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-3 opacity-40">🤝</div>
                <p className="text-sm">Selecteer een deal voor de details</p>
                <p className="text-xs mt-1">of maak een nieuwe deal aan</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / edit modal */}
      {modalOpen && (
        <DealFormModal
          deal={editDeal}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            if (editDeal) {
              updateDeal(editDeal.id, data);
            } else {
              addDeal({ ...data, projectId: ICEO_PROJECT_ID });
            }
            setModalOpen(false);
          }}
        />
      )}

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Deal verwijderen"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
              Annuleren
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm!)}>
              Verwijderen
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Weet je zeker dat je deze deal wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
        </p>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Deal detail panel                                                   */
/* ------------------------------------------------------------------ */

function DealDetail({ deal, onEdit, onDelete }: {
  deal: Deal;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_CONFIG[deal.status];

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{deal.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{deal.partner}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
            status.color, status.bg,
          )}>
            <span className={cn('h-2 w-2 rounded-full', status.dot)} />
            {status.label}
          </span>
          <button
            onClick={onEdit}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Bewerken"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Verwijderen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta row */}
      {(deal.startDate || deal.endDate || deal.duration) && (
        <div className="flex flex-wrap gap-4 mb-6 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
          {deal.startDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 text-xs">Start:</span>
              <span className="font-medium">{NL_DATE(deal.startDate)}</span>
            </div>
          )}
          {deal.startDate && deal.endDate && (
            <ArrowRight size={14} className="text-gray-300 self-center" />
          )}
          {deal.endDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs">Einde:</span>
              <span className="font-medium">{NL_DATE(deal.endDate)}</span>
            </div>
          )}
          {deal.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-200 pl-4 ml-auto">
              <span className="text-gray-400 text-xs">Duur:</span>
              <span className="font-medium">{deal.duration}</span>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {deal.notes && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText size={11} /> Notities
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            {deal.notes}
          </p>
        </div>
      )}

      {/* Two-column: obligations + receivables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Obligations */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ArrowRight size={11} className="text-rose-400" />
            Mijn verplichtingen
            <span className="ml-auto bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {deal.obligations.length}
            </span>
          </h3>
          <div className="space-y-2">
            {deal.obligations.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Geen verplichtingen vastgelegd</p>
            ) : (
              deal.obligations.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 bg-rose-50/30 hover:bg-rose-50/60 transition-colors">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <ArrowRight size={9} className="text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{item.description}</p>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{item.note}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Receivables */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ArrowLeft size={11} className="text-emerald-400" />
            Wat ik ontvang
            <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {deal.receivables.length}
            </span>
          </h3>
          <div className="space-y-2">
            {deal.receivables.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Geen ontvangsten vastgelegd</p>
            ) : (
              deal.receivables.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-100 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check size={9} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{item.description}</p>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{item.note}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Deal form modal (create + edit)                                     */
/* ------------------------------------------------------------------ */

type FormDeal = Omit<Deal, 'id' | 'createdAt' | 'projectId'>;

function emptyItem(): DealItem {
  return { id: generateId(), description: '', note: '' };
}

function DealFormModal({ deal, onClose, onSave }: {
  deal: Deal | null;
  onClose: () => void;
  onSave: (data: FormDeal) => void;
}) {
  const [title, setTitle] = useState(deal?.title ?? '');
  const [partner, setPartner] = useState(deal?.partner ?? '');
  const [status, setStatus] = useState<DealStatus>(deal?.status ?? 'actief');
  const [startDate, setStartDate] = useState(deal?.startDate ?? '');
  const [endDate, setEndDate] = useState(deal?.endDate ?? '');
  const [duration, setDuration] = useState(deal?.duration ?? '');
  const [notes, setNotes] = useState(deal?.notes ?? '');
  const [obligations, setObligations] = useState<DealItem[]>(
    deal?.obligations.length ? deal.obligations : [emptyItem()],
  );
  const [receivables, setReceivables] = useState<DealItem[]>(
    deal?.receivables.length ? deal.receivables : [emptyItem()],
  );

  const obligationsEndRef = useRef<HTMLDivElement>(null);
  const receivablesEndRef = useRef<HTMLDivElement>(null);

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      partner: partner.trim(),
      status,
      startDate,
      endDate,
      duration: duration.trim(),
      notes: notes.trim(),
      obligations: obligations.filter((o) => o.description.trim()),
      receivables: receivables.filter((r) => r.description.trim()),
    });
  }

  function addObligation() {
    setObligations((prev) => [...prev, emptyItem()]);
    setTimeout(() => obligationsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function addReceivable() {
    setReceivables((prev) => [...prev, emptyItem()]);
    setTimeout(() => receivablesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function updateItem(
    list: DealItem[],
    setList: React.Dispatch<React.SetStateAction<DealItem[]>>,
    id: string,
    field: keyof DealItem,
    value: string,
  ) {
    setList(list.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function removeItem(
    list: DealItem[],
    setList: React.Dispatch<React.SetStateAction<DealItem[]>>,
    id: string,
  ) {
    setList(list.filter((item) => item.id !== id));
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={deal ? 'Deal bewerken' : 'Nieuwe deal'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Annuleren</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!title.trim()}>
            {deal ? 'Opslaan' : 'Deal aanmaken'}
          </Button>
        </>
      }
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Naam deal *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="bijv. Partnership IJsbadmerk"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Partner / bedrijf</label>
            <input
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="bijv. CooldDown B.V."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DealStatus)}
                className="w-full appearance-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white pr-8"
              >
                {(Object.keys(STATUS_CONFIG) as DealStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Startdatum</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Einddatum</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Looptijd (vrij tekst)</label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="bijv. 1 jaar, dan evalueren"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notities / bijzonderheden</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="bijv. In vakanties gelden de weekelijkse verplichtingen niet…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-5 pt-1">
          {/* Obligations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Mijn verplichtingen
              </label>
              <button
                type="button"
                onClick={addObligation}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Plus size={12} /> Toevoegen
              </button>
            </div>
            <div className="space-y-2">
              {obligations.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onChange={(f, v) => updateItem(obligations, setObligations, item.id, f, v)}
                  onRemove={() => removeItem(obligations, setObligations, item.id)}
                  descPlaceholder="bijv. Wekelijks min. 3 verhalen met ijsbad"
                  notePlaceholder="bijv. Niet van toepassing in vakantie"
                />
              ))}
              <div ref={obligationsEndRef} />
            </div>
          </div>

          {/* Receivables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Wat ik ontvang
              </label>
              <button
                type="button"
                onClick={addReceivable}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Plus size={12} /> Toevoegen
              </button>
            </div>
            <div className="space-y-2">
              {receivables.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onChange={(f, v) => updateItem(receivables, setReceivables, item.id, f, v)}
                  onRemove={() => removeItem(receivables, setReceivables, item.id)}
                  descPlaceholder="bijv. 3 ijsbaden"
                  notePlaceholder="Optionele toelichting"
                />
              ))}
              <div ref={receivablesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ItemRow({ item, onChange, onRemove, descPlaceholder, notePlaceholder }: {
  item: DealItem;
  onChange: (field: keyof DealItem, value: string) => void;
  onRemove: () => void;
  descPlaceholder: string;
  notePlaceholder: string;
}) {
  const [showNote, setShowNote] = useState(!!item.note);

  return (
    <div className="group rounded-lg border border-gray-100 bg-gray-50 p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <input
          value={item.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder={descPlaceholder}
          className="flex-1 rounded border-0 bg-transparent px-0 py-0 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className={cn(
            'h-5 w-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 text-[10px] font-bold',
            showNote && 'text-gray-500',
          )}
          title={showNote ? 'Verberg toelichting' : 'Toelichting toevoegen'}
        >
          +
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="h-5 w-5 flex items-center justify-center rounded text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
        >
          <X size={11} />
        </button>
      </div>
      {showNote && (
        <input
          value={item.note ?? ''}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder={notePlaceholder}
          className="w-full rounded border-0 bg-transparent px-0 py-0 text-xs text-gray-400 placeholder-gray-300 focus:outline-none italic"
        />
      )}
    </div>
  );
}
