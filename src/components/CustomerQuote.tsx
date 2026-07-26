'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function CustomerQuote({ token }: { token: string }) {
  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-[30px] border border-white/10 bg-[#0d0f12] p-8 text-center shadow-2xl sm:p-12">
        <FileText className="mx-auto h-14 w-14 text-white/25" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-red-400">Quote unavailable</p>
        <h1 className="mt-3 text-3xl font-black">No quote data is connected</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-white/45">Temporary quote information has been removed. Secure customer quotes will appear here after Supabase is connected.</p>
        <p className="mt-5 text-xs text-white/20">Reference token received: {token ? `${token.slice(0, 4)}••••` : 'none'}</p>
        <Link href="/" className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-bold text-white/60 hover:bg-white/5 hover:text-white">Return home</Link>
      </div>
    </main>
  );
}
