'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, CarFront, CheckCircle2, ChevronDown, CircleGauge, Clock3, Grid2X2, List, Plus, Search, SlidersHorizontal, UserRound, Wrench } from 'lucide-react';
import { VehicleStatus, vehicles } from './vehicleData';

const filters: Array<'All' | VehicleStatus> = ['All', 'In Workshop', 'Ready for Collection', 'Booked In', 'Completed'];

const statusClass: Record<VehicleStatus, string> = {
  'In Workshop': 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  'Ready for Collection': 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  'Completed': 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  'Booked In': 'border-violet-400/25 bg-violet-400/10 text-violet-300',
};

function formatOdometer(value: number) {
  return `${new Intl.NumberFormat('en-AU').format(value)} km`;
}

export default function VehiclesManager() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('recent');

  const visibleVehicles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return vehicles
      .filter((vehicle) => filter === 'All' || vehicle.status === filter)
      .filter((vehicle) => !needle || [vehicle.registration, vehicle.vin, vehicle.make, vehicle.model, vehicle.variant, vehicle.owner.name, vehicle.owner.phone].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => sort === 'rego' ? a.registration.localeCompare(b.registration) : sort === 'odometer' ? b.odometer - a.odometer : b.id.localeCompare(a.id));
  }, [filter, query, sort]);

  const inWorkshop = vehicles.filter((vehicle) => vehicle.status === 'In Workshop').length;
  const ready = vehicles.filter((vehicle) => vehicle.status === 'Ready for Collection').length;
  const booked = vehicles.filter((vehicle) => vehicle.status === 'Booked In').length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-red-400">Vehicle database</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Vehicles</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Find complete vehicle details, active repairs, ownership and service history in one place.</p>
        </div>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold shadow-[0_12px_32px_rgba(220,38,38,.22)] transition hover:bg-red-500">
          <Plus size={18} /> Add vehicle
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total vehicles', value: vehicles.length, detail: 'Customer vehicle records', icon: CarFront },
          { label: 'In workshop', value: inWorkshop, detail: 'Active repairs today', icon: Wrench },
          { label: 'Ready to collect', value: ready, detail: 'Customer notification due', icon: CheckCircle2 },
          { label: 'Upcoming bookings', value: booked, detail: 'Vehicles booked in', icon: CalendarDays },
        ].map((card) => {
          const Icon = card.icon;
          return <div key={card.label} className="rounded-[26px] border border-white/8 bg-[#0f1115] p-5 shadow-[0_22px_55px_rgba(0,0,0,.18)]">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">{card.label}</p><p className="mt-3 text-3xl font-black">{card.value}</p></div><div className="grid h-11 w-11 place-items-center rounded-2xl border border-red-500/15 bg-red-500/8 text-red-400"><Icon size={20}/></div></div>
            <p className="mt-3 text-xs text-white/35">{card.detail}</p>
          </div>;
        })}
      </section>

      <section className="rounded-[28px] border border-white/8 bg-[#0d0f12] p-4 sm:p-5">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"/>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search registration, VIN, vehicle or owner…" className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-red-500/55 focus:bg-white/[0.05]"/>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`h-10 rounded-xl px-3.5 text-xs font-bold transition ${filter === item ? 'bg-white text-black' : 'border border-white/8 bg-white/[0.025] text-white/45 hover:bg-white/[0.06] hover:text-white'}`}>{item}</button>)}
          </div>
          <div className="flex items-center gap-2">
            <label className="relative"><SlidersHorizontal size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 appearance-none rounded-xl border border-white/8 bg-white/[0.03] pl-9 pr-9 text-xs font-semibold text-white/60 outline-none"><option value="recent">Recently added</option><option value="rego">Registration</option><option value="odometer">Highest odometer</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"/></label>
            <div className="flex rounded-xl border border-white/8 bg-white/[0.025] p-1"><button aria-label="Grid view" onClick={() => setView('grid')} className={`rounded-lg p-2 ${view === 'grid' ? 'bg-white text-black' : 'text-white/35'}`}><Grid2X2 size={16}/></button><button aria-label="List view" onClick={() => setView('list')} className={`rounded-lg p-2 ${view === 'list' ? 'bg-white text-black' : 'text-white/35'}`}><List size={16}/></button></div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-white/45"><span className="text-white">{visibleVehicles.length}</span> vehicle{visibleVehicles.length === 1 ? '' : 's'}</p><p className="hidden text-xs text-white/25 sm:block">Select a vehicle to view its complete workshop history</p></div>

      {visibleVehicles.length === 0 ? <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] py-20 text-center"><CarFront className="mx-auto text-white/15" size={42}/><h2 className="mt-4 text-lg font-bold">No vehicles found</h2><p className="mt-2 text-sm text-white/35">Try another search or filter.</p></div> : view === 'grid' ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleVehicles.map((vehicle) => <article key={vehicle.id} className="group overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1115] transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_26px_70px_rgba(0,0,0,.25)]">
            <div className="border-b border-white/7 p-5"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black tracking-[0.15em] text-white/45">{vehicle.state}</span><p className="text-2xl font-black tracking-tight">{vehicle.registration}</p></div><h2 className="mt-3 text-base font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h2><p className="mt-1 text-xs text-white/35">{vehicle.variant} · {vehicle.colour}</p></div><span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${statusClass[vehicle.status]}`}>{vehicle.status}</span></div></div>
            <div className="space-y-4 p-5"><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/[0.025] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Odometer</p><p className="mt-2 text-sm font-bold">{formatOdometer(vehicle.odometer)}</p></div><div className="rounded-2xl bg-white/[0.025] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">Last service</p><p className="mt-2 text-sm font-bold">{vehicle.lastService}</p></div></div>
              <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] text-white/40"><UserRound size={18}/></div><div className="min-w-0"><p className="truncate text-sm font-bold">{vehicle.owner.name}</p><p className="truncate text-xs text-white/35">{vehicle.owner.phone}</p></div></div>
              {vehicle.currentJob ? <div className="rounded-2xl border border-amber-400/12 bg-amber-400/[0.045] p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-300/70">Current job</p><span className="text-[10px] font-bold text-white/30">{vehicle.currentJob.number}</span></div><p className="mt-2 text-sm font-bold">{vehicle.currentJob.title}</p><div className="mt-3 flex items-center gap-2 text-xs text-white/40"><Clock3 size={14}/>{vehicle.currentJob.stage}</div></div> : <div className="rounded-2xl border border-white/7 bg-white/[0.02] p-4 text-xs text-white/35">No active job card</div>}
              <Link href={`/admin/vehicles/${vehicle.id}`} className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/9 bg-white/[0.035] text-sm font-bold transition group-hover:border-red-500/35 group-hover:bg-red-500/10 group-hover:text-red-300">Open vehicle profile <ArrowUpRight size={16}/></Link>
            </div>
          </article>)}
        </section>
      ) : (
        <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#0f1115]"><div className="hidden grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/8 px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-white/25 lg:grid"><span>Vehicle</span><span>Owner</span><span>Status</span><span>Odometer</span><span>Last service</span><span></span></div>{visibleVehicles.map((vehicle) => <Link key={vehicle.id} href={`/admin/vehicles/${vehicle.id}`} className="grid gap-4 border-b border-white/7 p-5 transition last:border-0 hover:bg-white/[0.025] lg:grid-cols-[1.2fr_1.4fr_1fr_1fr_1fr_auto] lg:items-center"><div><p className="text-lg font-black">{vehicle.registration}</p><p className="mt-1 text-xs text-white/35">{vehicle.year} {vehicle.make} {vehicle.model}</p></div><div><p className="text-sm font-bold">{vehicle.owner.name}</p><p className="mt-1 text-xs text-white/35">{vehicle.owner.phone}</p></div><div><span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase ${statusClass[vehicle.status]}`}>{vehicle.status}</span></div><p className="text-sm font-semibold text-white/60">{formatOdometer(vehicle.odometer)}</p><p className="text-sm font-semibold text-white/60">{vehicle.lastService}</p><ArrowUpRight size={18} className="text-white/25"/></Link>)}</section>
      )}
    </div>
  );
}
