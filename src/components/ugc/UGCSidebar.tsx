'use client';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  getUpcomingEvents,
  getEventsForMonth,
  type MarketingEvent,
} from '@/data/marketingEvents';
import { useUGCStore } from '@/store/ugcStore';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const NL_MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

function formatNlDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${NL_MONTHS[d.getMonth()]}`;
}

const CATEGORY_CHIP: Record<MarketingEvent['category'], string> = {
  feestdag:  'bg-rose-50 text-rose-700 border border-rose-200',
  seizoen:   'bg-amber-50 text-amber-700 border border-amber-200',
  commercial:'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

function getTip(events: MarketingEvent[]): string | null {
  const today = new Date();
  for (const ev of events) {
    const evDate = new Date(ev.date + 'T00:00:00');
    const diffDays = Math.ceil((evDate.getTime() - today.getTime()) / 86_400_000);
    if (diffDays > 0 && diffDays <= 42) {
      if (ev.name.includes('Black Friday') || ev.name.includes('Sinterklaas')) {
        return `${ev.name} is over ${diffDays} dagen — zorg voor 4-6 weken voorbereidingstijd voor je UGC creators.`;
      }
      if (ev.name.includes('Kerst')) {
        return `${ev.name} is over ${diffDays} dagen — plan festieve UGC content minimaal 3 weken van tevoren.`;
      }
      if (ev.category === 'commercial') {
        return `${ev.name} is over ${diffDays} dagen — een goede UGC video heeft 2-3 weken productietijd nodig.`;
      }
      if (ev.category === 'feestdag') {
        return `${ev.name} is over ${diffDays} dagen — zorg dat je content op tijd klaar is.`;
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface UGCSidebarProps {
  year: number;
  month: number; // 1-indexed
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function UGCSidebar({ year, month }: UGCSidebarProps) {
  const { getItemsByMonth } = useUGCStore();
  const items = getItemsByMonth(year, month);

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(new Date(), 30),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month],
  );

  const monthEvents = useMemo(
    () => getEventsForMonth(year, month),
    [year, month],
  );

  // Stats
  const total        = items.length;
  const published    = items.filter((i) => i.status === 'gepubliceerd').length;
  const inProduction = items.filter((i) => i.status === 'in_productie').length;
  const planned      = items.filter((i) => i.status === 'gepland').length;

  // Seasonal tip — check monthEvents first, then upcoming
  const tip = useMemo(() => getTip([...monthEvents, ...upcomingEvents]), [monthEvents, upcomingEvents]);

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col gap-4 sticky top-0 h-fit">

      {/* ---- Section 1: Komende evenementen ---- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Komende evenementen</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Volgende 30 dagen</p>
        </div>
        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">Geen evenementen gevonden.</p>
          ) : (
            upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5 flex-shrink-0">{ev.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{ev.name}</p>
                  <p className="text-[10px] text-gray-400">{formatNlDate(ev.date)}</p>
                </div>
                <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0', CATEGORY_CHIP[ev.category])}>
                  {ev.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---- Section 2: Content stats ---- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content stats</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Deze maand</p>
        </div>
        <div className="p-4 space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Totaal gepland</span>
            <span className="text-sm font-bold text-gray-900">{total}</span>
          </div>

          {/* Bars */}
          <StatBar label="Gepubliceerd" value={published}  total={total} color="bg-indigo-500" />
          <StatBar label="In productie" value={inProduction} total={total} color="bg-amber-500" />
          <StatBar label="Gepland"      value={planned}    total={total} color="bg-blue-500"   />

          {total === 0 && (
            <p className="text-[10px] text-gray-400 text-center pt-1">
              Nog geen items gepland voor deze maand.
            </p>
          )}
        </div>
      </div>

      {/* ---- Section 3: Seizoen tips ---- */}
      {tip && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">💡 Seizoen tip</p>
          <p className="text-xs text-amber-700 leading-relaxed">{tip}</p>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper sub-component                                                */
/* ------------------------------------------------------------------ */

function StatBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-500">{label}</span>
        <span className="text-[11px] font-semibold text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
