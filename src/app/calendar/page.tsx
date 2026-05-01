'use client';
import { useState, useEffect } from 'react';
import { Settings2, ExternalLink, CalendarDays } from 'lucide-react';
import { Header } from '@/components/layout/Header';

const STORAGE_KEY = 'gcal-embed-url';

export default function CalendarPage() {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setEmbedUrl(saved);
    setShowSetup(!saved);
    setMounted(true);
  }, []);

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const match = trimmed.match(/src="([^"]+)"/);
    const url = match ? match[1] : trimmed;
    localStorage.setItem(STORAGE_KEY, url);
    setEmbedUrl(url);
    setShowSetup(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Agenda"
        subtitle="Google Calendar"
        actions={
          embedUrl && !showSetup ? (
            <button
              onClick={() => { setInputVal(embedUrl); setShowSetup(true); }}
              className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              title="Agenda-instellingen"
            >
              <Settings2 size={15} />
            </button>
          ) : undefined
        }
      />

      {showSetup ? (
        <SetupScreen
          inputVal={inputVal}
          setInputVal={setInputVal}
          onSave={handleSave}
          onCancel={embedUrl ? () => setShowSetup(false) : undefined}
        />
      ) : embedUrl ? (
        <iframe
          src={embedUrl}
          className="flex-1 w-full border-0"
          title="Google Calendar"
        />
      ) : null}
    </div>
  );
}

function SetupScreen({
  inputVal,
  setInputVal,
  onSave,
  onCancel,
}: {
  inputVal: string;
  setInputVal: (v: string) => void;
  onSave: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-sm p-7 space-y-6">

        {/* Icon + title */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <CalendarDays size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Google Calendar koppelen</h2>
            <p className="text-sm text-gray-400 mt-0.5">Voeg je agenda in met een embed-link</p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {[
            <>Open <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-medium">Google Calendar <ExternalLink size={11} /></a></>,
            <>Klik op het tandwiel (⚙) rechtsboven → <strong>Instellingen</strong></>,
            <>Kies links jouw kalender onder <strong>Mijn agenda&apos;s</strong></>,
            <>Scroll naar <strong>Agenda integreren</strong> en kopieer de <strong>insluitcode</strong></>,
            <>Plak de code hieronder</>,
          ].map((step, i) => (
            <div key={i} className="flex gap-3 text-sm text-gray-600">
              <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Insluitcode of URL
          </label>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={'<iframe src="https://calendar.google.com/calendar/embed?src=..." ...></iframe>'}
            rows={4}
            className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-300 transition-all"
          />
          <p className="text-xs text-gray-400">
            Je kunt de volledige &lt;iframe&gt;-code of alleen de URL plakken.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={onSave}
            disabled={!inputVal.trim()}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Agenda laden
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
