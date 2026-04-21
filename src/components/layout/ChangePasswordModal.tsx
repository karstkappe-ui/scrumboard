'use client';
import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (next !== confirm) {
      setError('Nieuwe wachtwoorden komen niet overeen');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/user/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Er ging iets mis');
    } else {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-900">Wachtwoord wijzigen</h2>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400">
            <X size={15} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">Wachtwoord gewijzigd!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Huidig wachtwoord</label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nieuw wachtwoord</label>
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bevestig nieuw wachtwoord</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-1"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? 'Opslaan…' : 'Wachtwoord opslaan'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
