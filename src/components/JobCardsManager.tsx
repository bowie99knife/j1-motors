'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  Plus,
  Search,
  UserRound,
  Wrench,
} from 'lucide-react';

type JobCard = { id: string; customer: string; vehicle: string; rego: string; complaint: string; stage: string; updated: string; tone: string };

const jobs: JobCard[] = [];

const filters = ['All', 'Inspection', 'Repairing', 'Waiting Parts', 'Final Inspection', 'Ready Collection'];

export default function JobCardsManager() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => jobs.filter((job) => {
    const matchesFilter = filter === 'All' || job.stage === filter;
    const haystack = `${job.id} ${job.customer} ${job.vehicle} ${job.rego} ${job.complaint}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [query, filter]);

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            <ClipboardList size={14} /> Workshop control centre
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Job Cards</h1>
          <p className="mt-2 text-sm text-white/42 sm:text-base">Open, document and control every repair from check-in to collection.</p>
        </div>
        <Link href="/admin/job-cards/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black shadow-[0_12px_35px_rgba(220,38,38,.24)] transition hover:bg-red-500">
          <Plus size={18} /> New job card
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Open jobs', String(jobs.length), ClipboardList, 'text-white', 'bg-white/5'],
          ['In inspection', String(jobs.filter((job) => job.stage === 'Inspection').length), Search, 'text-sky-300', 'bg-sky-400/10'],
          ['Repairing', String(jobs.filter((job) => job.stage === 'Repairing').length), Wrench, 'text-red-300', 'bg-red-400/10'],
          ['Ready collection', String(jobs.filter((job) => job.stage === 'Ready Collection').length), CheckCircle2, 'text-emerald-300', 'bg-emerald-400/10'],
        ].map(([label, value, Icon, tone, panel]) => {
          const I = Icon as typeof ClipboardList;
          return <article key={String(label)} className="rounded-[24px] border border-white/8 bg-[#101216] p-5">
            <div className={`grid h-10 w-10 place-items-center rounded-2xl ${panel} ${tone}`}><I size={19} /></div>
            <p className="mt-4 text-sm font-semibold text-white/40">{label as string}</p>
            <p className="mt-1 text-3xl font-black">{value as string}</p>
          </article>;
        })}
      </section>

      <section className="rounded-[28px] border border-white/8 bg-[#101216] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-4 focus-within:border-red-500/50">
            <Search size={18} className="text-white/28" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-white/22" placeholder="Search job, customer, registration or vehicle..." />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Filter size={16} className="shrink-0 text-white/30" />
            {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${filter === item ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-white/42 hover:bg-white/[0.07] hover:text-white'}`}>{item}</button>)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {filtered.map((job) => (
          <Link key={job.id} href={`/admin/job-cards/${job.id}`} className="group rounded-[26px] border border-white/8 bg-[#101216] p-5 transition hover:-translate-y-0.5 hover:border-red-500/30 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/28">{job.id}</p>
                <h2 className="mt-2 text-xl font-black">{job.vehicle}</h2>
                <p className="mt-1 text-sm font-bold text-white/40">WA · {job.rego}</p>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${job.tone}`}>{job.stage}</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.025] p-3">
                <UserRound size={17} className="text-white/25" />
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-white/25">Customer</p><p className="mt-1 text-sm font-bold">{job.customer}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.025] p-3">
                <Clock3 size={17} className="text-white/25" />
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-white/25">Updated</p><p className="mt-1 text-sm font-bold">{job.updated}</p></div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/7 bg-black/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">Customer complaint</p>
              <p className="mt-2 text-sm leading-6 text-white/55">{job.complaint}</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/7 pt-4 text-sm font-black text-white/42">
              Open job card <ArrowRight size={17} className="transition group-hover:translate-x-1 group-hover:text-red-400" />
            </div>
          </Link>
        ))}
      </section>

      {filtered.length === 0 && <div className="rounded-[26px] border border-dashed border-white/10 p-12 text-center text-white/35"><Car className="mx-auto mb-3" />No matching job cards.</div>}
    </div>
  );
}
