export type EventCategory = 'feestdag' | 'seizoen' | 'commercial';

export interface MarketingEvent {
  date: string; // YYYY-MM-DD
  name: string;
  emoji: string;
  color: string;
  category: EventCategory;
}

export const MARKETING_EVENTS: MarketingEvent[] = [
  // === 2025 ===
  { date: '2025-01-01', name: 'Nieuwjaar', emoji: '🎉', color: 'bg-yellow-100 text-yellow-800', category: 'feestdag' },
  { date: '2025-02-01', name: 'Valentijn prep', emoji: '💌', color: 'bg-pink-100 text-pink-800', category: 'commercial' },
  { date: '2025-02-14', name: 'Valentijnsdag', emoji: '❤️', color: 'bg-red-100 text-red-800', category: 'feestdag' },
  { date: '2025-04-20', name: 'Pasen', emoji: '🐣', color: 'bg-lime-100 text-lime-800', category: 'feestdag' },
  { date: '2025-04-21', name: 'Tweede Paasdag', emoji: '🐣', color: 'bg-lime-100 text-lime-800', category: 'feestdag' },
  { date: '2025-04-27', name: 'Koningsdag', emoji: '🧡', color: 'bg-orange-100 text-orange-800', category: 'feestdag' },
  { date: '2025-05-11', name: 'Moederdag', emoji: '🌸', color: 'bg-rose-100 text-rose-800', category: 'feestdag' },
  { date: '2025-06-08', name: 'Pinksteren', emoji: '🕊️', color: 'bg-purple-100 text-purple-800', category: 'feestdag' },
  { date: '2025-06-15', name: 'Vaderdag', emoji: '👔', color: 'bg-blue-100 text-blue-800', category: 'feestdag' },
  { date: '2025-06-21', name: 'Zomer', emoji: '☀️', color: 'bg-amber-100 text-amber-800', category: 'seizoen' },
  { date: '2025-07-01', name: 'Zomersale', emoji: '🛍️', color: 'bg-yellow-100 text-yellow-800', category: 'commercial' },
  { date: '2025-08-25', name: 'Back to School', emoji: '🎒', color: 'bg-indigo-100 text-indigo-800', category: 'commercial' },
  { date: '2025-10-31', name: 'Halloween', emoji: '🎃', color: 'bg-orange-100 text-orange-800', category: 'commercial' },
  { date: '2025-11-11', name: 'Singles Day', emoji: '1️⃣', color: 'bg-red-100 text-red-800', category: 'commercial' },
  { date: '2025-11-11', name: 'Sint Maarten', emoji: '🕯️', color: 'bg-yellow-100 text-yellow-800', category: 'feestdag' },
  { date: '2025-11-28', name: 'Black Friday', emoji: '🖤', color: 'bg-gray-900 text-white', category: 'commercial' },
  { date: '2025-12-01', name: 'Cyber Monday', emoji: '💻', color: 'bg-gray-800 text-white', category: 'commercial' },
  { date: '2025-12-05', name: 'Sinterklaasavond', emoji: '🎅', color: 'bg-red-100 text-red-800', category: 'feestdag' },
  { date: '2025-12-25', name: 'Eerste Kerstdag', emoji: '🎄', color: 'bg-green-100 text-green-800', category: 'feestdag' },
  { date: '2025-12-26', name: 'Tweede Kerstdag', emoji: '🎄', color: 'bg-green-100 text-green-800', category: 'feestdag' },
  { date: '2025-12-31', name: 'Oud & Nieuw', emoji: '🎆', color: 'bg-purple-100 text-purple-800', category: 'feestdag' },

  // === 2026 ===
  { date: '2026-01-01', name: 'Nieuwjaar', emoji: '🎉', color: 'bg-yellow-100 text-yellow-800', category: 'feestdag' },
  { date: '2026-02-01', name: 'Valentijn prep', emoji: '💌', color: 'bg-pink-100 text-pink-800', category: 'commercial' },
  { date: '2026-02-14', name: 'Valentijnsdag', emoji: '❤️', color: 'bg-red-100 text-red-800', category: 'feestdag' },
  { date: '2026-04-05', name: 'Pasen', emoji: '🐣', color: 'bg-lime-100 text-lime-800', category: 'feestdag' },
  { date: '2026-04-06', name: 'Tweede Paasdag', emoji: '🐣', color: 'bg-lime-100 text-lime-800', category: 'feestdag' },
  { date: '2026-04-27', name: 'Koningsdag', emoji: '🧡', color: 'bg-orange-100 text-orange-800', category: 'feestdag' },
  { date: '2026-05-10', name: 'Moederdag', emoji: '🌸', color: 'bg-rose-100 text-rose-800', category: 'feestdag' },
  { date: '2026-05-24', name: 'Pinksteren', emoji: '🕊️', color: 'bg-purple-100 text-purple-800', category: 'feestdag' },
  { date: '2026-06-21', name: 'Vaderdag', emoji: '👔', color: 'bg-blue-100 text-blue-800', category: 'feestdag' },
  { date: '2026-06-21', name: 'Zomer', emoji: '☀️', color: 'bg-amber-100 text-amber-800', category: 'seizoen' },
  { date: '2026-07-01', name: 'Zomersale', emoji: '🛍️', color: 'bg-yellow-100 text-yellow-800', category: 'commercial' },
  { date: '2026-08-25', name: 'Back to School', emoji: '🎒', color: 'bg-indigo-100 text-indigo-800', category: 'commercial' },
  { date: '2026-10-31', name: 'Halloween', emoji: '🎃', color: 'bg-orange-100 text-orange-800', category: 'commercial' },
  { date: '2026-11-11', name: 'Singles Day', emoji: '1️⃣', color: 'bg-red-100 text-red-800', category: 'commercial' },
  { date: '2026-11-11', name: 'Sint Maarten', emoji: '🕯️', color: 'bg-yellow-100 text-yellow-800', category: 'feestdag' },
  { date: '2026-11-27', name: 'Black Friday', emoji: '🖤', color: 'bg-gray-900 text-white', category: 'commercial' },
  { date: '2026-11-30', name: 'Cyber Monday', emoji: '💻', color: 'bg-gray-800 text-white', category: 'commercial' },
  { date: '2026-12-05', name: 'Sinterklaasavond', emoji: '🎅', color: 'bg-red-100 text-red-800', category: 'feestdag' },
  { date: '2026-12-25', name: 'Eerste Kerstdag', emoji: '🎄', color: 'bg-green-100 text-green-800', category: 'feestdag' },
  { date: '2026-12-26', name: 'Tweede Kerstdag', emoji: '🎄', color: 'bg-green-100 text-green-800', category: 'feestdag' },
  { date: '2026-12-31', name: 'Oud & Nieuw', emoji: '🎆', color: 'bg-purple-100 text-purple-800', category: 'feestdag' },
];

export function getEventsForDate(date: string): MarketingEvent[] {
  return MARKETING_EVENTS.filter((e) => e.date === date);
}

export function getEventsForMonth(year: number, month: number): MarketingEvent[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return MARKETING_EVENTS.filter((e) => e.date.startsWith(prefix));
}

export function getUpcomingEvents(fromDate: Date, days: number): MarketingEvent[] {
  const to = new Date(fromDate);
  to.setDate(to.getDate() + days);

  return MARKETING_EVENTS.filter((e) => {
    const d = new Date(e.date);
    return d >= fromDate && d <= to;
  }).sort((a, b) => a.date.localeCompare(b.date));
}
