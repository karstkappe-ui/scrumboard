'use client';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Seed DB on first visit so team accounts exist before first login
  useEffect(() => {
    fetch('/api/setup', { method: 'POST' }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Ongeldig e-mailadres of wachtwoord');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white text-2xl shadow-lg mb-4">
            📋
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ScrumBoard</h1>
          <p className="text-sm text-gray-500 mt-1">Inloggen op je team workspace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@scrumboard.dev"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Bezig met inloggen…' : 'Inloggen'}
            </button>
          </form>
        </div>

        {/* Team accounts hint */}
        <div className="mt-4 bg-white/70 border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Team accounts
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              ['karst@scrumboard.dev', 'Karst'],
              ['simon@scrumboard.dev', 'Simon'],
              ['jeroen@scrumboard.dev', 'Jeroen'],
              ['jesper@scrumboard.dev', 'Jesper'],
              ['bas@scrumboard.dev', 'Bas'],
              ['riccardo@scrumboard.dev', 'Riccardo'],
            ].map(([mail, name]) => (
              <button
                key={mail}
                type="button"
                onClick={() => { setEmail(mail); setPassword('scrumboard2026'); }}
                className="text-left px-2 py-1.5 rounded-md hover:bg-indigo-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700">{name}</span>
                <span className="block text-[10px] text-gray-400 truncate">{mail}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Wachtwoord: <span className="font-mono">scrumboard2026</span></p>
        </div>
      </div>
    </div>
  );
}
