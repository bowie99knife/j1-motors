'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft, CalendarDays, CarFront, CheckCircle2, ChevronRight, CircleDollarSign, ClipboardList, Clock3, Edit3,
  FileText, Mail, MapPin, MessageSquareText, MoreHorizontal, Phone, Plus, ReceiptText, Search, Tag, UserRound, Wrench,
} from 'lucide-react';
import { ActivityType, CustomerActivity, CustomerStatus, getCustomer } from './customerData';

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const statusClass: Record<CustomerStatus, string> = {
  Active: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  'Follow-up': 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  Inactive: 'border-white/10 bg-white/[0.04] text-white/40',
};
const activityIcons: Record<ActivityType, typeof CalendarDays> = { booking: CalendarDays, job: Wrench, quote: FileText, invoice: ReceiptText, note: MessageSquareText };

export default function CustomerProfile({ id }: { id: string }) {
  const customer = getCustomer(id);
  const [tab, setTab] = useState<'activity' | 'vehicles' | 'notes'>('activity');
  const [activityFilter, setActivityFilter] = useState<'All' | ActivityType>('All');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState(customer.notes);
  const filteredActivity = useMemo(() => customer.activity.filter((item) => {
    const matchesType = activityFilter === 'All' || item.type === activityFilter;
    const haystack = `${item.title} ${item.detail} ${item.reference ?? ''}`.toLowerCase();
    return matchesType && (!search.trim() || haystack.includes(search.trim().toLowerCase()));
  }), [activityFilter, customer.activity, search]);

  return <div className="space-y-6 pb-14">
    <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 transition hover:text-white"><ArrowLeft size={17}/> Back to customers</Link>

    <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[#0f1115] shadow-[0_30px_80px_rgba(0,0,0,.22)]">
      <div className="relative border-b border-white/8 p-5 sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,.16),transparent_36%)]"/>
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] border border-red-500/20 bg-gradient-to-br from-red-500/20 to-red-950/20 text-lg font-black text-red-300">{customer.initials}</div>
            <div>
              <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{customer.name}</h1><span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${statusClass[customer.status]}`}>{customer.status}</span></div>
              <p className="mt-2 text-sm font-semibold text-white/35">{customer.id} · Customer since {customer.memberSince}</p>
              <div className="mt-3 flex flex-wrap gap-2">{customer.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 text-[10px] font-bold text-white/45"><Tag size={11}/>{tag}</span>)}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${customer.phone.replace(/\s/g, '')}`} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/9 bg-white/[0.035] px-4 text-sm font-bold text-white/65 hover:bg-white/[0.07] hover:text-white"><Phone size={16}/> Call</a>
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/9 bg-white/[0.035] px-4 text-sm font-bold text-white/65 hover:bg-white/[0.07] hover:text-white"><Edit3 size={16}/> Edit customer</button>
            <Link href="/admin/bookings" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-bold hover:bg-red-500"><Plus size={17}/> New booking</Link>
            <button aria-label="More customer actions" className="grid h-11 w-11 place-items-center rounded-2xl border border-white/9 bg-white/[0.035] text-white/45 hover:bg-white/[0.07] hover:text-white"><MoreHorizontal size={18}/></button>
          </div>
        </div>
      </div>
      <div className="grid divide-y divide-white/7 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        <Stat label="Lifetime spend" value={money.format(customer.lifetimeSpend)} icon={CircleDollarSign}/>
        <Stat label="Outstanding" value={money.format(customer.outstanding)} icon={ReceiptText} attention={customer.outstanding > 0}/>
        <Stat label="Workshop jobs" value={String(customer.jobs)} icon={ClipboardList}/>
        <Stat label="Last visit" value={customer.lastVisit} icon={Clock3}/>
      </div>
    </section>

    <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
      <div className="space-y-6">
        {customer.nextBooking && <section className="rounded-[26px] border border-violet-400/15 bg-gradient-to-br from-violet-400/[0.07] to-[#0f1115] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-300"><CalendarDays size={20}/></div><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">Upcoming booking</p><p className="mt-2 text-lg font-black">{customer.nextBooking}</p><p className="mt-1 text-sm text-white/35">Open the booking to confirm vehicle and requested work.</p></div></div><Link href="/admin/bookings" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-black">Open booking <ChevronRight size={15}/></Link></div></section>}

        <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1115]">
          <div className="flex gap-1 overflow-x-auto border-b border-white/8 p-3">
            {([['activity','Activity'],['vehicles',`Vehicles (${customer.vehicles.length})`],['notes','Workshop notes']] as const).map(([key,label]) => <button key={key} onClick={() => setTab(key)} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition ${tab === key ? 'bg-white text-black' : 'text-white/40 hover:bg-white/[0.05] hover:text-white'}`}>{label}</button>)}
          </div>

          {tab === 'activity' && <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-xl font-black">Customer timeline</h2><p className="mt-1 text-sm text-white/35">Bookings, job cards, quotes, invoices and workshop notes.</p></div><div className="relative w-full lg:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={15}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activity…" className="h-10 w-full rounded-xl border border-white/8 bg-white/[0.03] pl-9 pr-3 text-xs outline-none placeholder:text-white/20 focus:border-red-500/45"/></div></div>
            <div className="mt-4 flex flex-wrap gap-2">{(['All','booking','job','quote','invoice','note'] as const).map((filter) => <button key={filter} onClick={() => setActivityFilter(filter)} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] ${activityFilter === filter ? 'border-red-500/35 bg-red-500/10 text-red-300' : 'border-white/8 bg-white/[0.02] text-white/35 hover:text-white'}`}>{filter}</button>)}</div>
            <div className="mt-5 space-y-3">{filteredActivity.length ? filteredActivity.map((item) => <ActivityCard key={item.id} item={item}/>) : <EmptyState title="No matching activity" text="Try another search or clear the activity filter."/>}</div>
          </div>}

          {tab === 'vehicles' && <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">Linked vehicles</h2><p className="mt-1 text-sm text-white/35">Open a vehicle to see its complete service history.</p></div><button className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 text-xs font-bold text-white/55 hover:text-white"><Plus size={15}/> Add vehicle</button></div><div className="mt-5 grid gap-4 md:grid-cols-2">{customer.vehicles.map((vehicle) => <Link key={vehicle.id} href={`/admin/vehicles/${vehicle.id}`} className="group rounded-2xl border border-white/7 bg-white/[0.022] p-4 transition hover:border-red-500/25 hover:bg-white/[0.04]"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-500/10 text-red-400"><CarFront size={20}/></div><div><p className="font-black">{vehicle.year} {vehicle.make} {vehicle.model}</p><p className="mt-1 text-xs text-white/30">{vehicle.state} · {vehicle.registration}</p></div></div><ChevronRight className="text-white/20 transition group-hover:translate-x-0.5 group-hover:text-red-400" size={17}/></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-black/15 p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">Odometer</p><p className="mt-1 text-sm font-bold text-white/65">{vehicle.odometer.toLocaleString('en-AU')} km</p></div><div className="rounded-xl bg-black/15 p-3"><p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">Status</p><p className="mt-1 text-sm font-bold text-white/65">{vehicle.status}</p></div></div></Link>)}</div></div>}

          {tab === 'notes' && <div className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Workshop-only notes</h2><p className="mt-1 text-sm text-white/35">These notes are never shown to the customer.</p></div><MessageSquareText className="text-white/20"/></div><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={8} className="mt-5 w-full resize-none rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-sm leading-6 text-white/65 outline-none focus:border-red-500/50"/><div className="mt-3 flex justify-end"><button className="h-10 rounded-xl bg-white px-4 text-xs font-black text-black">Save notes</button></div></div>}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[28px] border border-white/8 bg-[#0f1115] p-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-500/10 text-red-400"><UserRound size={20}/></div><div><p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">Contact details</p><h2 className="mt-1 font-black">Customer information</h2></div></div><div className="mt-5 space-y-2"><ContactRow icon={Phone} text={customer.phone} href={`tel:${customer.phone.replace(/\s/g,'')}`}/><ContactRow icon={Mail} text={customer.email} href={`mailto:${customer.email}`}/><ContactRow icon={MapPin} text={`${customer.address}, ${customer.suburb}`}/></div><div className="mt-4 rounded-2xl border border-white/7 bg-white/[0.022] p-3"><p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/25">Preferred contact</p><p className="mt-1 text-sm font-bold text-white/65">{customer.preferredContact}</p></div></section>
        <section className="rounded-[28px] border border-white/8 bg-[#0f1115] p-5"><h2 className="font-black">Quick actions</h2><div className="mt-4 space-y-2"><QuickAction icon={CalendarDays} label="Create booking" href="/admin/bookings"/><QuickAction icon={ClipboardList} label="Create job card" href="/admin/job-cards/new"/><QuickAction icon={FileText} label="Create quote" href="/admin/quotes/new"/></div></section>
        <section className="rounded-[28px] border border-white/8 bg-[#0f1115] p-5"><div className="flex items-center justify-between"><h2 className="font-black">Account snapshot</h2><CircleDollarSign size={18} className="text-white/20"/></div><div className="mt-4 space-y-3"><Snapshot label="Vehicles" value={String(customer.vehicles.length)}/><Snapshot label="Completed jobs" value={String(customer.jobs)}/><Snapshot label="Lifetime spend" value={money.format(customer.lifetimeSpend)}/><Snapshot label="Outstanding" value={money.format(customer.outstanding)} attention={customer.outstanding > 0}/></div></section>
      </aside>
    </div>
  </div>;
}

function Stat({ label, value, icon: Icon, attention = false }: { label: string; value: string; icon: typeof CircleDollarSign; attention?: boolean }) { return <div className="p-5"><div className={`flex items-center gap-2 ${attention ? 'text-amber-300' : 'text-white/25'}`}><Icon size={15}/><p className="text-[10px] font-black uppercase tracking-[0.14em]">{label}</p></div><p className={`mt-2 text-xl font-black ${attention ? 'text-amber-200' : ''}`}>{value}</p></div>; }
function ContactRow({ icon: Icon, text, href }: { icon: typeof Phone; text: string; href?: string }) { const cls = 'flex items-start gap-3 rounded-2xl bg-white/[0.025] p-3 text-sm leading-5 text-white/55 hover:bg-white/[0.05] hover:text-white'; return href ? <a href={href} className={cls}><Icon size={16} className="mt-0.5 shrink-0"/><span className="break-all">{text}</span></a> : <div className={cls}><Icon size={16} className="mt-0.5 shrink-0"/><span>{text}</span></div>; }
function QuickAction({ icon: Icon, label, href }: { icon: typeof CalendarDays; label: string; href: string }) { return <Link href={href} className="flex h-11 items-center gap-3 rounded-2xl bg-white/[0.025] px-3 text-sm font-bold text-white/55 transition hover:bg-white/[0.06] hover:text-white"><Icon size={17}/>{label}<ChevronRight size={15} className="ml-auto text-white/20"/></Link>; }
function Snapshot({ label, value, attention = false }: { label: string; value: string; attention?: boolean }) { return <div className="flex items-center justify-between rounded-2xl border border-white/7 bg-white/[0.02] px-3 py-3"><span className="text-xs font-semibold text-white/35">{label}</span><span className={`text-sm font-black ${attention ? 'text-amber-300' : 'text-white/75'}`}>{value}</span></div>; }
function ActivityCard({ item }: { item: CustomerActivity }) { const Icon = activityIcons[item.type]; const content = <article className="rounded-2xl border border-white/7 bg-white/[0.022] p-4 transition hover:bg-white/[0.035]"><div className="flex gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-500/10 text-red-400"><Icon size={18}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-black">{item.title}</h3><p className="mt-1 text-xs text-white/30">{item.date}{item.time ? ` · ${item.time}` : ''}{item.reference ? ` · ${item.reference}` : ''}</p></div><div className="text-right">{item.amount !== undefined && <p className="text-sm font-black">{money.format(item.amount)}</p>}{item.status && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-300/75">{item.status}</p>}</div></div><p className="mt-3 text-sm leading-6 text-white/50">{item.detail}</p></div></div></article>; return item.href ? <Link href={item.href}>{content}</Link> : content; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center"><CheckCircle2 size={32} className="mx-auto text-white/15"/><h3 className="mt-3 font-black">{title}</h3><p className="mt-1 text-sm text-white/35">{text}</p></div>; }
