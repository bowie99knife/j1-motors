'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FilePenLine,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type QuoteStatus = 'Draft' | 'Sent' | 'Viewed' | 'Approved' | 'Declined' | 'Expired';

type QuoteRecord = {
  id: string;
  customer: string;
  phone: string;
  vehicle: string;
  registration: string;
  jobCard: string;
  status: QuoteStatus;
  createdAt: string;
  expiresAt: string;
  total: number;
  token: string;
};

const quotes: QuoteRecord[] = [
  { id: 'QT-00158', customer: 'Samantha Lee', phone: '0412 884 210', vehicle: '2018 Mazda CX-5 Touring', registration: '1GHT 382', jobCard: 'JC-00418', status: 'Viewed', createdAt: '25 Jul 2026', expiresAt: '1 Aug 2026', total: 1842.5, token: 'm7R2kP9xQ4' },
  { id: 'QT-00157', customer: 'Michael Chen', phone: '0438 207 991', vehicle: '2016 Toyota Hilux SR5', registration: '1EKK 019', jobCard: 'JC-00416', status: 'Approved', createdAt: '24 Jul 2026', expiresAt: '31 Jul 2026', total: 3275.8, token: 'b4L8vN2sT7' },
  { id: 'QT-00156', customer: 'Olivia Martin', phone: '0403 551 604', vehicle: '2014 Volkswagen Tiguan', registration: '1DRQ 744', jobCard: 'JC-00415', status: 'Sent', createdAt: '24 Jul 2026', expiresAt: '31 Jul 2026', total: 968.0, token: 'c8W5jH1yR6' },
  { id: 'QT-00155', customer: 'Daniel Wong', phone: '0421 790 335', vehicle: '2019 Ford Ranger Wildtrak', registration: '1HZX 226', jobCard: 'JC-00412', status: 'Draft', createdAt: '23 Jul 2026', expiresAt: '30 Jul 2026', total: 2156.2, token: 'q3F9aD7kM2' },
  { id: 'QT-00154', customer: 'Rachel Thompson', phone: '0491 112 783', vehicle: '2013 Hyundai i30', registration: '1CQA 591', jobCard: 'JC-00408', status: 'Declined', createdAt: '22 Jul 2026', expiresAt: '29 Jul 2026', total: 742.5, token: 'z6P1uG8eK5' },
  { id: 'QT-00153', customer: 'Aaron Singh', phone: '0408 628 019', vehicle: '2017 Subaru Forester XT', registration: '1FNM 808', jobCard: 'JC-00405', status: 'Expired', createdAt: '15 Jul 2026', expiresAt: '22 Jul 2026', total: 1295.4, token: 'n2X7sC4vB9' },
];

const statusStyle: Record<QuoteStatus, string> = {
  Draft: 'border-white/10 bg-white/[0.05] text-white/55',
  Sent: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  Viewed: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Approved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  Declined: 'border-red-400/20 bg-red-400/10 text-red-300',
  Expired: 'border-white/10 bg-white/[0.025] text-white/35',
};

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function QuotesManager() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | QuoteStatus>('All');
  const [copied, setCopied] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus = status === 'All' || quote.status === status;
      const matchesQuery = !needle || [quote.id, quote.customer, quote.phone, quote.vehicle, quote.registration, quote.jobCard].some((value) => value.toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);
  const pendingValue = quotes.filter((quote) => ['Sent', 'Viewed'].includes(quote.status)).reduce((sum, quote) => sum + quote.total, 0);
  const approvedCount = quotes.filter((quote) => quote.status === 'Approved').length;
  const decisionCount = quotes.filter((quote) => ['Approved', 'Declined'].includes(quote.status)).length;
  const approvalRate = decisionCount ? Math.round((approvedCount / decisionCount) * 100) : 0;

  async function copyLink(quote: QuoteRecord) {
    const link = `${window.location.origin}/q/${quote.token}`;
    await navigator.clipboard.writeText(link);
    setCopied(quote.id);
    window.setTimeout(() => setCopied(''), 1600);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,.8)]" />
            Sales workspace
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Quotes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">Build clear repair estimates, share secure approval links, and track every customer decision.</p>
        </div>
        <Link href="/admin/quotes/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold shadow-[0_14px_35px_rgba(220,38,38,.23)] transition hover:-translate-y-0.5 hover:bg-red-500">
          <Plus size={18} /> New quote
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total quoted" value={money.format(totalValue)} note={`${quotes.length} quotes`} icon={<FileText size={20} />} />
        <MetricCard label="Awaiting decision" value={money.format(pendingValue)} note="Sent or viewed" icon={<Clock3 size={20} />} />
        <MetricCard label="Approved" value={String(approvedCount)} note="Ready for repair" icon={<CheckCircle2 size={20} />} />
        <MetricCard label="Approval rate" value={`${approvalRate}%`} note="Approved decisions" icon={<ShieldCheck size={20} />} />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0d0f12] shadow-[0_24px_70px_rgba(0,0,0,.22)]">
        <div className="border-b border-white/8 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quote, customer, phone, rego or job card…" className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-red-500/50 focus:bg-white/[0.055]" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
              {(['All', 'Draft', 'Sent', 'Viewed', 'Approved', 'Declined', 'Expired'] as const).map((item) => (
                <button key={item} type="button" onClick={() => setStatus(item)} className={`h-10 shrink-0 rounded-xl border px-3.5 text-xs font-bold transition ${status === item ? 'border-red-500/40 bg-red-500/15 text-red-300' : 'border-white/8 bg-white/[0.025] text-white/40 hover:bg-white/[0.05] hover:text-white'}`}>{item}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden grid-cols-[1.35fr_1.1fr_.8fr_.65fr_.55fr] gap-4 border-b border-white/8 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 lg:grid">
          <span>Customer & vehicle</span><span>Quote</span><span>Status</span><span className="text-right">Total</span><span />
        </div>

        <div className="divide-y divide-white/7">
          {filtered.map((quote) => (
            <article key={quote.id} className="group grid gap-4 px-4 py-5 transition hover:bg-white/[0.025] sm:px-6 lg:grid-cols-[1.35fr_1.1fr_.8fr_.65fr_.55fr] lg:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/[0.04] text-sm font-black text-white/70">{quote.customer.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{quote.customer}</p>
                    <p className="mt-1 truncate text-xs text-white/40">{quote.vehicle} · <span className="font-semibold text-white/55">{quote.registration}</span></p>
                  </div>
                </div>
              </div>
              <div>
                <Link href={`/admin/quotes/${quote.id}`} className="inline-flex items-center gap-1.5 text-sm font-black tracking-wide hover:text-red-300">{quote.id}<ArrowUpRight size={14} /></Link>
                <p className="mt-1 text-xs text-white/35">{quote.jobCard} · {quote.createdAt}</p>
              </div>
              <div><span className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${statusStyle[quote.status]}`}>{quote.status}</span></div>
              <div className="text-left lg:text-right"><p className="text-base font-black">{money.format(quote.total)}</p><p className="mt-1 text-[11px] text-white/30">Expires {quote.expiresAt}</p></div>
              <div className="flex justify-end gap-2">
                {quote.status !== 'Draft' && <button type="button" onClick={() => copyLink(quote)} title="Copy secure link" className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 bg-white/[0.025] text-white/45 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white">{copied === quote.id ? <CheckCircle2 size={17} className="text-emerald-400" /> : <Copy size={17} />}</button>}
                <Link href={`/admin/quotes/${quote.id}`} title="Open quote" className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 bg-white/[0.025] text-white/45 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"><Eye size={17} /></Link>
                <button type="button" title="More actions" className="grid h-10 w-10 place-items-center rounded-xl border border-white/8 bg-white/[0.025] text-white/45 transition hover:bg-white/[0.06] hover:text-white"><MoreHorizontal size={17} /></button>
              </div>
            </article>
          ))}
          {!filtered.length && <div className="px-6 py-20 text-center"><FilePenLine size={32} className="mx-auto text-white/20" /><p className="mt-4 font-bold">No matching quotes</p><p className="mt-1 text-sm text-white/35">Try a different search or status filter.</p></div>}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <WorkflowCard icon={<FilePenLine size={20} />} title="Build" text="Create the estimate directly from a job card or start a standalone quote." />
        <WorkflowCard icon={<Send size={20} />} title="Share" text="Generate one secure link and send it by WhatsApp, SMS or email." />
        <WorkflowCard icon={<CheckCircle2 size={20} />} title="Approve" text="Customer decisions are timestamped and ready to sync with the job workflow." />
      </section>
    </div>
  );
}

function MetricCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: React.ReactNode }) {
  return <div className="rounded-[24px] border border-white/8 bg-[#0d0f12] p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-white/35">{label}</p><p className="mt-3 text-2xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs text-white/30">{note}</p></div><div className="grid h-10 w-10 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">{icon}</div></div></div>;
}

function WorkflowCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex gap-4 rounded-[22px] border border-white/8 bg-white/[0.02] p-5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.055] text-white/65">{icon}</div><div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-white/38">{text}</p></div></div>;
}
