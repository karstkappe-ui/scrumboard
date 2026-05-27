'use client';
import { useMemo } from 'react';
import {
  Film,
  LayoutGrid,
  FileImage,
  BookOpen,
  Video,
  Clapperboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEventsForDate } from '@/data/marketingEvents';
import { useUGCStore, type UGCItem, type UGCType, type UGCStatus } from '@/store/ugcStore';

/* ------------------------------------------------------------------ */
/*  Type colour + icon helpers                                          */
/* ------------------------------------------------------------------ */

const TYPE_STYLES: Record<UGCType, { bg: string; text: string; icon: React.ReactNode }> = {
  reel:      { bg: 'bg-rose-100',    text: 'text-rose-700',    icon: <Film         size={10} /> },
  carousel:  { bg: 'bg-blue-100',    text: 'text-blue-700',    icon: <LayoutGrid   size={10} /> },
  post:      { bg: 'bg-purple-100',  text: 'text-purple-700',  icon: <FileImage    size={10} /> },
  story:     { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: <BookOpen     size={10} /> },
  video:     { bg: 'bg-red-100',     text: 'text-red-700',     icon: <Video        size={10} /> },
  ugc_video: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <Clapperboard size={10} /> },
};

const STATUS_DOT: Record<UGCStatus, string> = {
  idee:        'bg-gray-400',
  gepland:     'bg-blue-500',
  in_productie:'bg-amber-500',
  klaar:       'bg-emerald-500',
  gepubliceerd:'bg-indigo-500',
};

/* ------------------------------------------------------------------ */
/*  Calendar helpers                                                    */
/* ------------------------------------------------------------------ */

/** Monday = 0 … Sunday = 6 (ISO week). JS: Sunday = 0, so shift. */
function isoWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildCalendarDays(year: number, month: number): Date[] {
  // month is 1-indexed
  const firstDay = new Date(year, month - 1, 1);
  const lastDay  = new Date(year, month, 0);

  const leadingBlanks = isoWeekday(firstDay); // 0 = Mon
  const trailingBlanks = 6 - isoWeekday(lastDay);

  const days: Date[] = [];
  for (let i = leadingBlanks; i > 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month - 1, d));
  }
  for (let i = 1; i <= trailingBlanks; i++) {
    const d = new Date(lastDay);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface UGCCalendarProps {
  year: number;
  month: number; // 1-indexed
  filterPlatform: string;
  filterType: string;
  filterStatus: string;
  onAddItem: (date: string) => void;
  onEditItem: (item: UGCItem) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const todayStr = toDateString(new Date());

export function UGCCalendar({
  year,
  month,
  filterPlatform,
  filterType,
  filterStatus,
  onAddItem,
  onEditItem,
}: UGCCalendarProps) {
  const { getItemsByMonth } = useUGCStore();

  const allItems = getItemsByMonth(year, month);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filterPlatform && item.platform !== filterPlatform) return false;
      if (filterType    && item.type     !== filterType)     return false;
      if (filterStatus  && item.status   !== filterStatus)   return false;
      return true;
    });
  }, [allItems, filterPlatform, filterType, filterStatus]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, UGCItem[]> = {};
    for (const item of filteredItems) {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    }
    return map;
  }, [filteredItems]);

  const days = useMemo(() => buildCalendarDays(year, month), [year, month]);

  return (
    <div className="flex-1 min-w-0 overflow-x-auto">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-xl overflow-hidden border border-gray-200">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="bg-gray-50 py-2 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wide"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-x border-b border-gray-200 rounded-b-xl overflow-hidden">
        {days.map((day, idx) => {
          const dateStr    = toDateString(day);
          const isCurrentMonth = day.getMonth() === month - 1;
          const isToday    = dateStr === todayStr;
          const events     = getEventsForDate(dateStr);
          const items      = itemsByDate[dateStr] ?? [];

          const visibleEvents = events.slice(0, 2);
          const extraEvents   = events.length - visibleEvents.length;
          const visibleItems  = items.slice(0, 3);
          const extraItems    = items.length - visibleItems.length;

          return (
            <div
              key={idx}
              onClick={() => onAddItem(dateStr)}
              className={cn(
                'relative bg-white min-h-[120px] p-1.5 flex flex-col gap-1 cursor-pointer',
                'hover:bg-gray-50 transition-colors group',
                !isCurrentMonth && 'bg-gray-50/60',
              )}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold leading-none',
                    isToday
                      ? 'bg-indigo-600 text-white'
                      : isCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-300',
                  )}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Marketing event badges */}
              <div className="flex flex-col gap-0.5">
                {visibleEvents.map((ev, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded px-1 py-px text-[9px] font-medium truncate',
                      ev.color,
                    )}
                    title={ev.name}
                  >
                    <span>{ev.emoji}</span>
                    <span className="truncate">{ev.name}</span>
                  </span>
                ))}
                {extraEvents > 0 && (
                  <span className="text-[9px] text-gray-400 px-1">+{extraEvents} meer</span>
                )}
              </div>

              {/* UGC item chips */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {visibleItems.map((item) => {
                  const style = TYPE_STYLES[item.type];
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); onEditItem(item); }}
                      className={cn(
                        'flex items-center gap-1 rounded px-1 py-px text-[9px] font-medium truncate w-full text-left',
                        style.bg,
                        style.text,
                        'hover:opacity-80 transition-opacity',
                      )}
                      title={item.title}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', STATUS_DOT[item.status])} />
                      <span className="flex-shrink-0">{style.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
                {extraItems > 0 && (
                  <span className="text-[9px] text-gray-400 px-1">+{extraItems} meer</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
