'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type CustomerStatus = 'Active' | 'Follow-up' | 'Inactive';

type Customer = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  suburb: string;
  vehicles: { label: string; rego: string }[];
  jobs: number;
  lifetimeSpend: number;
  lastVisit: string;
  nextBooking?: string;
  status: CustomerStatus;
  note?: string;
};

const seedCustomers: Customer[] = [];

const currency = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

const statusStyles: Record<CustomerStatus, string> = {
  Active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  'Follow-up': 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Inactive: 'border-white/10 bg-white/[0.04] text-white/45',
};

export default function CustomersManager() {
  const [customers, setCustomers] = useState(seedCustomers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | CustomerStatus>('All');
  const [sort, setSort] = useState<'Recent' | 'Name' | 'Spend'>('Recent');
  const [view, setView] = useState<'cards' | 'compact'>('cards');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = customers.filter((customer) => {
      const haystack = [
        customer.name,
        customer.phone,
        customer.email,
        customer.suburb,
        customer.id,
        ...customer.vehicles.flatMap((vehicle) => [vehicle.label, vehicle.rego]),
      ]
        .join(' ')
        .toLowerCase();
      return (!normalizedQuery || haystack.includes(normalizedQuery)) && (status === 'All' || customer.status === status);
    });

    return [...result].sort((a, b) => {
      if (sort === 'Name') return a.name.localeCompare(b.name);
      if (sort === 'Spend') return b.lifetimeSpend - a.lifetimeSpend;
      return b.id.localeCompare(a.id);
    });
  }, [customers, query, sort, status]);

  const totalSpend = customers.reduce((sum, customer) => sum + customer.lifetimeSpend, 0);
  const activeCount = customers.filter((customer) => customer.status === 'Active').length;
  const followUpCount = customers.filter((customer) => customer.status === 'Follow-up').length;

  function addCustomer(formData: FormData) {
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    if (!name || !phone) return;

    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    setCustomers((current) => [
      {
        id: `CUS-${String(current.length + 125).padStart(5, '0')}`,
        name,
        initials,
        phone,
        email: String(formData.get('email') || '').trim() || 'No email recorded',
        suburb: String(formData.get('suburb') || '').trim() || 'Suburb not recorded',
        vehicles: [],
        jobs: 0,
        lifetimeSpend: 0,
        lastVisit: 'New customer',
        status: 'Active',
        note: String(formData.get('note') || '').trim() || undefined,
      },
      ...current,
    ]);
    setShowNewCustomer(false);
  }

  return (
    <div className="space-y-6 pb-16">
      <section className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_85%_15%,rgba(220,38,38,.16),transparent_28%),linear-gradient(145deg,#111419,#0b0d10)] p-6 shadow-2xl shadow-black/20 sm:p-8">
        <div className="absolute right-7 top-7 hidden h-28 w-28 rounded-full border border-red-500/10 bg-red-500/[0.025] lg:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400">
              <Users size={15} /> Customer management
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your customer base, in one place.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              Find contact details, vehicles and workshop history without digging through old job cards.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewCustomer(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(220,38,38,.24)] transition hover:-translate-y-0.5 hover:bg-red-500"
          >
            <Plus size={18} /> New customer
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Total customers" value={String(customers.length)} detail={`${activeCount} currently active`} />
        <MetricCard icon={CarFront} label="Vehicles linked" value={String(customers.reduce((sum, customer) => sum + customer.vehicles.length, 0))} detail="Across all customer profiles" />
        <MetricCard icon={CircleDollarSign} label="Lifetime revenue" value={currency.format(totalSpend)} detail="From recorded workshop jobs" />
        <MetricCard icon={Clock3} label="Needs follow-up" value={String(followUpCount)} detail="Quotes or repairs awaiting action" attention={followUpCount > 0} />
      </section>

      <section className="rounded-[28px] border border-white/8 bg-[#0d0f12] p-4 shadow-xl shadow-black/10 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, email, registration or vehicle…"
              className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-red-500/50 focus:bg-white/[0.055]"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-12 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${showFilters || status !== 'All' ? 'border-red-500/35 bg-red-500/10 text-red-300' : 'border-white/8 bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white'}`}
            >
              <Filter size={17} /> Filters {status !== 'All' && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">1</span>}
            </button>
            <label className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as 'Recent' | 'Name' | 'Spend')}
                className="h-12 appearance-none rounded-2xl border border-white/8 bg-white/[0.03] pl-4 pr-10 text-sm font-semibold text-white/60 outline-none hover:bg-white/[0.06]"
              >
                <option className="bg-[#111318]">Most recent</option>
                <option className="bg-[#111318]">Name</option>
                <option className="bg-[#111318]">Spend</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            </label>
            <div className="flex h-12 rounded-2xl border border-white/8 bg-white/[0.03] p-1">
              <button type="button" onClick={() => setView('cards')} className={`rounded-xl px-3 text-xs font-bold transition ${view === 'cards' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white'}`}>Cards</button>
              <button type="button" onClick={() => setView('compact')} className={`rounded-xl px-3 text-xs font-bold transition ${view === 'compact' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white'}`}>Compact</button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.16em] text-white/25">Customer status</span>
            {(['All', 'Active', 'Follow-up', 'Inactive'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${status === option ? 'border-red-500/40 bg-red-500/12 text-red-300' : 'border-white/8 bg-white/[0.025] text-white/45 hover:text-white'}`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-white/40">
          Showing <span className="font-bold text-white/75">{filteredCustomers.length}</span> customer{filteredCustomers.length === 1 ? '' : 's'}
        </p>
        <p className="hidden text-xs text-white/25 sm:block">Select a customer to open their full workshop history</p>
      </div>

      {filteredCustomers.length ? (
        <section className={view === 'cards' ? 'grid gap-4 lg:grid-cols-2' : 'space-y-3'}>
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} compact={view === 'compact'} />
          ))}
        </section>
      ) : (
        <section className="grid min-h-72 place-items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.018] p-8 text-center">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.045] text-white/30"><Search size={23} /></div>
            <h2 className="mt-4 text-lg font-bold">No customers found</h2>
            <p className="mt-2 text-sm text-white/35">Try a different search or clear the current filters.</p>
            <button type="button" onClick={() => { setQuery(''); setStatus('All'); }} className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/65 hover:bg-white/5 hover:text-white">Clear search</button>
          </div>
        </section>
      )}

      {showNewCustomer && (
        <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <button aria-label="Close dialog" className="absolute inset-0" onClick={() => setShowNewCustomer(false)} />
          <form action={addCustomer} className="relative z-10 w-full max-w-2xl rounded-[30px] border border-white/10 bg-[#111318] p-5 shadow-2xl shadow-black/50 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Customer record</p>
                <h2 className="mt-2 text-2xl font-black">Add new customer</h2>
                <p className="mt-2 text-sm text-white/40">Start with their contact details. Vehicles can be attached from the profile.</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowNewCustomer(false)} className="rounded-xl border border-white/8 p-2.5 text-white/40 hover:bg-white/5 hover:text-white"><X size={18} /></button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" placeholder="Customer name" required icon={UserRound} />
              <Field label="Phone" name="phone" placeholder="04XX XXX XXX" required icon={Phone} />
              <Field label="Email" name="email" type="email" placeholder="name@example.com" icon={Mail} />
              <Field label="Suburb" name="suburb" placeholder="Belmont WA" icon={MapPin} />
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/35">Workshop note</span>
                <textarea name="note" rows={4} placeholder="Optional internal note…" className="w-full resize-none rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-500/45" />
              </label>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowNewCustomer(false)} className="h-11 rounded-2xl border border-white/8 px-5 text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-white">Cancel</button>
              <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-500"><Check size={17} /> Create customer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, attention = false }: { icon: typeof Users; label: string; value: string; detail: string; attention?: boolean }) {
  return (
    <article className="rounded-[24px] border border-white/8 bg-[#0d0f12] p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${attention ? 'bg-amber-400/10 text-amber-300' : 'bg-red-500/10 text-red-400'}`}><Icon size={20} /></div>
        {attention && <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">Action</span>}
      </div>
      <p className="mt-5 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-semibold text-white/70">{label}</p>
      <p className="mt-2 text-xs leading-5 text-white/30">{detail}</p>
    </article>
  );
}

function CustomerCard({ customer, compact }: { customer: Customer; compact: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-[26px] border border-white/8 bg-[#0d0f12] transition duration-300 hover:-translate-y-0.5 hover:border-white/14 hover:bg-[#101318] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-red-500/[0.035] blur-2xl transition group-hover:bg-red-500/[0.07]" />
      <div className={`relative flex gap-4 ${compact ? 'items-center' : 'items-start'}`}>
        <div className={`grid shrink-0 place-items-center rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/18 to-red-950/20 font-black text-red-300 ${compact ? 'h-11 w-11 text-sm' : 'h-14 w-14 text-base'}`}>
          {customer.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`${compact ? 'text-base' : 'text-lg'} truncate font-black tracking-tight`}>{customer.name}</h2>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[customer.status]}`}>{customer.status}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/25">{customer.id}</p>
            </div>
            <button type="button" aria-label="Customer actions" className="rounded-xl p-2 text-white/25 transition hover:bg-white/5 hover:text-white"><MoreHorizontal size={19} /></button>
          </div>

          {compact ? (
            <div className="mt-3 grid gap-2 text-xs text-white/40 sm:grid-cols-4">
              <span className="flex items-center gap-2"><Phone size={13} /> {customer.phone}</span>
              <span className="flex items-center gap-2"><CarFront size={13} /> {customer.vehicles.length} vehicle{customer.vehicles.length === 1 ? '' : 's'}</span>
              <span className="flex items-center gap-2"><Wrench size={13} /> {customer.jobs} jobs</span>
              <span className="font-bold text-white/70">{currency.format(customer.lifetimeSpend)}</span>
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-3 text-sm text-white/45 sm:grid-cols-2">
                <a href={`tel:${customer.phone.replace(/\s/g, '')}`} className="flex min-w-0 items-center gap-2.5 transition hover:text-white"><Phone size={15} className="shrink-0 text-red-400/75" /><span className="truncate">{customer.phone}</span></a>
                <a href={`mailto:${customer.email}`} className="flex min-w-0 items-center gap-2.5 transition hover:text-white"><Mail size={15} className="shrink-0 text-red-400/75" /><span className="truncate">{customer.email}</span></a>
                <span className="flex min-w-0 items-center gap-2.5"><MapPin size={15} className="shrink-0 text-red-400/75" /><span className="truncate">{customer.suburb}</span></span>
                <span className="flex min-w-0 items-center gap-2.5"><CalendarDays size={15} className="shrink-0 text-red-400/75" /><span className="truncate">Last visit {customer.lastVisit}</span></span>
              </div>

              <div className="mt-5 rounded-2xl border border-white/7 bg-white/[0.025] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">Vehicles</p>
                  <span className="text-xs font-semibold text-white/35">{customer.vehicles.length}</span>
                </div>
                {customer.vehicles.length ? (
                  <div className="space-y-2">
                    {customer.vehicles.slice(0, 2).map((vehicle) => (
                      <div key={vehicle.rego} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-semibold text-white/65">{vehicle.label}</span>
                        <span className="shrink-0 rounded-lg border border-white/8 bg-black/20 px-2 py-1 text-[11px] font-bold tracking-wider text-white/45">{vehicle.rego}</span>
                      </div>
                    ))}
                    {customer.vehicles.length > 2 && <p className="pt-1 text-xs text-white/25">+ {customer.vehicles.length - 2} more vehicle</p>}
                  </div>
                ) : <p className="text-sm text-white/30">No vehicle linked yet.</p>}
              </div>

              {customer.note && (
                <div className="mt-4 flex gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/[0.045] p-3.5 text-xs leading-5 text-amber-100/60">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-300/70" />
                  <span>{customer.note}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`relative mt-5 flex flex-col gap-3 border-t border-white/7 pt-4 sm:flex-row sm:items-center sm:justify-between ${compact ? 'ml-[60px]' : ''}`}>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/35">
          <span><b className="text-white/70">{customer.jobs}</b> jobs</span>
          <span><b className="text-white/70">{currency.format(customer.lifetimeSpend)}</b> lifetime spend</span>
          {customer.nextBooking && <span className="text-emerald-300/70">Next: {customer.nextBooking}</span>}
        </div>
        <Link href={`/admin/customers/${customer.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-red-400 transition hover:text-red-300">
          Open profile <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function Field({ label, name, placeholder, required = false, type = 'text', icon: Icon }: { label: string; name: string; placeholder: string; required?: boolean; type?: string; icon: typeof UserRound }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/35">{label}{required && <span className="text-red-400"> *</span>}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={16} />
        <input name={name} type={type} required={required} placeholder={placeholder} className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-500/45" />
      </div>
    </label>
  );
}
