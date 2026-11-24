'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function checkExistingSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session?.user) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('active')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;

      if (profile?.active) {
        router.replace('/admin');
        return;
      }

      await supabase.auth.signOut();
      setChecking(false);
    }

    checkExistingSession();
    return () => { active = false; };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setErrorMessage(error?.message || 'Unable to sign in.');
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile?.active) {
      await supabase.auth.signOut();
      setErrorMessage('This account does not have active staff access.');
      setLoading(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#08090b] text-white">
        <Wrench className="h-9 w-9 animate-pulse text-red-500" />
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#08090b] px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-[0_14px_45px_rgba(220,38,38,.28)]">
            <Wrench size={25} strokeWidth={2.4} />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight">J1 Motors Staff</h1>
          <p className="mt-2 text-sm text-white/40">Sign in to Workshop OS</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-[#0d0f12] p-6 shadow-2xl sm:p-8">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">Email</label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={18} />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm outline-none transition placeholder:text-white/20 focus:border-red-500/60"
              placeholder="staff@j1motors.com"
            />
          </div>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-white/35">Password</label>
          <div className="relative mt-2">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={18} />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm outline-none transition placeholder:text-white/20 focus:border-red-500/60"
              placeholder="Password"
            />
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-2xl bg-red-600 text-sm font-black shadow-[0_12px_35px_rgba(220,38,38,.20)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-white/25">
            Staff access only. Contact an administrator if you cannot access your account.
          </p>
        </form>
      </div>
    </main>
  );
}