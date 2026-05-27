'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { UGCCalendar } from '@/components/ugc/UGCCalendar';
import { UGCItemModal } from '@/components/ugc/UGCItemModal';
import { UGCSidebar } from '@/components/ugc/UGCSidebar';
import { cn } from '@/lib/utils';
import type { UGCItem } from '@/store/ugcStore';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const NEWMATE_PROJECT_ID = 'proj-3';
const KARST_USER_ID      = 'user-1';

const NL_MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
];

const PLATFORM_FILTERS = [
  { value: '', label: 'Alle platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'alle',      label: 'Alle' },
];

const TYPE_FILTERS = [
  { value: '',          label: 'Alle types' },
  { value: 'reel',      label: 'Reel' },
  { value: 'carousel',  label: 'Carousel' },
  { value: 'post',      label: 'Post' },
  { value: 'story',     label: 'Story' },
  { value: 'video',     label: 'Video' },
  { value: 'ugc_video', label: 'UGC Video' },
];

const STATUS_FILTERS = [
  { value: '',             label: 'Alle statussen' },
  { value: 'idee',        label: 'Idee' },
  { value: 'gepland',     label: 'Gepland' },
  { value: 'in_productie',label: 'In productie' },
  { value: 'klaar',       label: 'Klaar' },
  { value: 'gepubliceerd', label: 'Gepubliceerd' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function UGCPage() {
  const router         = useRouter();
  const { currentUserId }  = useUIStore();
  const { activeProjectId } = useProjectStore();

  const isAuthorized = currentUserId === KARST_USER_ID && activeProjectId === NEWMATE_PROJECT_ID;

  useEffect(() => {
    if (currentUserId && !isAuthorized) {
      router.replace('/');
    }
  }, [currentUserId, isAuthorized, router]);

  // Initial month = today
  const today = useMemo(() => new Date(), []);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-indexed

  // Filters
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterType,     setFilterType]     = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');

  // Modal state
  const [modalOpen,      setModalOpen]      = useState(false);
  const [modalDate,      setModalDate]      = useState('');
  const [editItem,       setEditItem]       = useState<UGCItem | null>(null);

  if (!currentUserId || !isAuthorized) return null;

  /* ---- Month navigation ---- */
  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  /* ---- Modal helpers ---- */
  function openAdd(date: string) {
    setEditItem(null);
    setModalDate(date);
    setModalOpen(true);
  }
  function openEdit(item: UGCItem) {
    setEditItem(item);
    setModalDate(item.date);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditItem(null);
  }

  /* ---- Filter chip helper ---- */
  function FilterChips<T extends string>({
    options,
    value,
    onChange,
  }: {
    options: { value: T | ''; label: string }[];
    value: T | '';
    onChange: (v: T | '') => void;
  }) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value as T | '')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
              value === opt.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <Header
        title="📸 UGC Planning · New Mate"
        subtitle="Plan en beheer je User Generated Content"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => openAdd(new Date().toISOString().slice(0, 10))}
          >
            Nieuw item
          </Button>
        }
      />

      {/* Month nav + filters */}
      <div className="flex flex-col gap-2 px-5 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4">
          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Vorige maand"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-gray-900 w-32 text-center">
              {NL_MONTHS[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Volgende maand"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-gray-200" />

          {/* Filter chips */}
          <div className="flex flex-wrap gap-3 items-center">
            <FilterChips
              options={PLATFORM_FILTERS as { value: string; label: string }[]}
              value={filterPlatform}
              onChange={setFilterPlatform}
            />
            <div className="h-4 w-px bg-gray-200" />
            <FilterChips
              options={TYPE_FILTERS as { value: string; label: string }[]}
              value={filterType}
              onChange={setFilterType}
            />
            <div className="h-4 w-px bg-gray-200" />
            <FilterChips
              options={STATUS_FILTERS as { value: string; label: string }[]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
        </div>
      </div>

      {/* Main content: calendar + sidebar */}
      <div className="flex-1 overflow-auto p-5">
        <div className="flex gap-5 items-start min-h-full">
          {/* Calendar */}
          <UGCCalendar
            year={year}
            month={month}
            filterPlatform={filterPlatform}
            filterType={filterType}
            filterStatus={filterStatus}
            onAddItem={openAdd}
            onEditItem={openEdit}
          />

          {/* Sidebar */}
          <UGCSidebar year={year} month={month} />
        </div>
      </div>

      {/* Modal */}
      <UGCItemModal
        open={modalOpen}
        onClose={closeModal}
        defaultDate={modalDate}
        editItem={editItem}
      />
    </div>
  );
}
