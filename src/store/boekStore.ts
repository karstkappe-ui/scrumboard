import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export type BoekFrequency =
  | 'eenmalig'
  | 'per_rit'
  | 'wekelijks'
  | 'maandelijks'
  | 'per_kwartaal'
  | 'jaarlijks';

export interface BoekEntry {
  id: string;
  title: string;
  category: string;
  frequency: BoekFrequency | '';
  hoeBoeken: string;
  waarom: string;
  notes: string;
  createdAt: string;
}

interface BoekStore {
  entries: BoekEntry[];
  addEntry: (entry: Omit<BoekEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (id: string, updates: Partial<Omit<BoekEntry, 'id' | 'createdAt'>>) => void;
  deleteEntry: (id: string) => void;
}

const SEED: BoekEntry[] = [
  {
    id: 'boek-seed-1',
    title: 'Wegenbelasting (privé betaald)',
    category: 'Vergeet niet! 🔔',
    frequency: 'per_kwartaal',
    hoeBoeken: 'Boek als "Privé storting" op de zakelijke rekening, of verwerk via de privérekening-module. Verdeel zakelijk gebruik op basis van km-registratie.',
    waarom: 'Betaal je de wegenbelasting privé maar gebruik je de auto ook zakelijk, dan kun je het zakelijke deel aftrekken. Houd een rittenregistratie bij.',
    notes: 'Vergeet dit niet per kwartaal! Komt automatisch via automatische incasso van privérekening.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'boek-seed-2',
    title: 'Zakelijke kilometers (eigen auto)',
    category: 'Reiskosten',
    frequency: 'maandelijks',
    hoeBoeken: 'Declareer €0,23 per zakelijke kilometer. Boek als "Reiskosten" (grootboekrekening 4710). Gebruik een rittenregistratie-app of Excel.',
    waarom: 'De belastingdienst staat een vaste vergoeding van €0,23/km toe voor zakelijk gebruik van je privéauto — ongeacht de werkelijke autokosten.',
    notes: 'Houd altijd datum, bestemming, doel en km bij. Zonder rittenregistratie geen aftrek.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'boek-seed-3',
    title: 'Telefoon & internet (gemengd gebruik)',
    category: 'Vaste lasten',
    frequency: 'maandelijks',
    hoeBoeken: 'Schat zakelijk gebruik (bijv. 75%). Boek 75% als zakelijke kosten (telecomkosten), 25% als privéopname. Verwerk elke maand via memoriaalpost.',
    waarom: 'Gemengd gebruik moet je splitsen. Het zakelijke deel is aftrekbaar als bedrijfskosten; het privédeel niet.',
    notes: 'Documenteer je schatting eenmalig goed (bijv. in dit handboek) en pas die elk jaar aan als het gebruik verandert.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'boek-seed-4',
    title: 'Representatiekosten (zakelijk etentje)',
    category: 'Representatie',
    frequency: 'per_rit',
    hoeBoeken: 'Boek als "Representatiekosten" (gr. 4600). Bewaar de bon én noteer op de bon: datum, namen aanwezigen, zakelijk doel.',
    waarom: 'Zakelijke etentjes zijn voor 80% aftrekbaar. Zonder omschrijving op de bon risico bij controle.',
    notes: 'Tip: foto van de bon meteen opslaan in je boekhoudapp — bonnen vervagen snel.',
    createdAt: new Date().toISOString(),
  },
];

export const useBoekStore = create<BoekStore>()(
  persist(
    (set, get) => ({
      entries: SEED,

      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            { ...entry, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'boek-store' },
  ),
);
