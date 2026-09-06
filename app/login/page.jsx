  // app/login/page.jsx
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { Shield, LogIn } from 'lucide-react';
  import { supabase } from '@/lib/supabase';

  export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <Shield className="w-14 h-14 text-[var(--primary)] mb-3" />
            <h1 className="text-2xl font-bold text-[var(--text-main)]">WORK 365</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">UAE PRO Pipeline Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@work365.com"
                className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }