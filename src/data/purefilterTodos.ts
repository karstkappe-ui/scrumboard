import type { TodoCategory, TodoLabel } from '@/store/todoStore';

export const PUREFILTER_PROJECT_ID = 'proj-4';

/**
 * Starting board for Purefilter. Seeded once per user, the first time they open
 * the Purefilter todo board with an empty list. Ids are fixed so a re-run can
 * never duplicate a card.
 */
export const PUREFILTER_TODOS: {
  id: string;
  title: string;
  category: TodoCategory;
  label: TodoLabel;
}[] = [
  {
    id: 'todo-pf-tracking',
    title: 'Tracking goed zetten — conversie, add-to-cart, checkout, aankopen, CAC en abonnementen meten',
    category: 'done',
    label: 'operationeel',
  },
  {
    id: 'todo-pf-productpagina',
    title: 'Productpagina verbeteren — wat het filter doet, verschil met andere filters/RO, installatie, filterduur, abonnement en meer reviews',
    category: 'done',
    label: 'groei',
  },
  {
    id: 'todo-pf-google-ads',
    title: 'Google Ads optimaliseren (Karst) — zoektermen analyseren, slechte zoekwoorden uitsluiten, goede opschalen, eventueel aparte landingspagina’s',
    category: 'todo',
    label: 'groei',
  },
  {
    id: 'todo-pf-seo',
    title: 'SEO opbouwen (Jesper) — sterke pagina’s rond waterfilter thuis, PFAS, microplastics, kraanwater filteren en waterfilter onder aanrecht',
    category: 'todo',
    label: 'groei',
  },
  {
    id: 'todo-pf-email',
    title: 'E-mailmarketing automatiseren — welcome flow, verlaten winkelwagen, verlaten checkout, reviewmail en herinnering filtervervanging',
    category: 'todo',
    label: 'groei',
  },
  {
    id: 'todo-pf-abonnement',
    title: 'Abonnement optimaliseren (Jesper) — besparing duidelijk tonen en zoveel mogelijk klanten richting het filterabonnement krijgen',
    category: 'todo',
    label: 'groei',
  },
  {
    id: 'todo-pf-content',
    title: 'Content verzamelen — installatievideo’s, UGC, reviews, productuitleg en vergelijking-content',
    category: 'todo',
    label: 'groei',
  },
  {
    id: 'todo-pf-kanalen',
    title: 'Nieuwe kanalen testen (Karst) — Meta Ads, influencers/affiliates en referral',
    category: 'todo',
    label: 'groei',
  },
];
