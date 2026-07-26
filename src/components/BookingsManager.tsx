'use client';

import {
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileText,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

type BookingStatus = 'Waiting Confirmation' | 'Confirmed' | 'Checked In' | 'Cancelled' | 'Completed';
type Filter = 'Today' | 'Tomorrow' | 'This Week' | 'All' | BookingStatus;

type Booking = {
  id: string;
  dateGroup: 'Today' | 'Tomorrow' | 'This Week';
  dateLabel: string;
  time: string;
  customer: string;
  phone: string;
  email: string;
  vehicle: string;
  rego: string;
  service: string;
  status: BookingStatus;
  notes: string;
};

const initialBookings: Booking[] = [];

const filters: Filter[] = ['Today', 'Tomorrow', 'This Week', 'All', 'Waiting Confirmation', 'Confirmed', 'Checked In'];

const statusStyle: Record<BookingStatus, string> = {
  'Waiting Confirmation': 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Confirmed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  'Checked In': 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  Cancelled: 'border-red-400/20 bg-red-400/10 text-red-300',
  Completed: 'border-white/10 bg-white/5 text-white/50',
};

export default function BookingsManager() {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<Filter>('Today');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  const selected = bookings.find((booking) => booking.id === selectedId);

  const visibleBookings = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const filterMatch =
        filter === 'All' ||
        booking.dateGroup === filter ||
        booking.status === filter;
      const searchMatch =
        !searchTerm ||
        [booking.id, booking.customer, booking.phone, booking.vehicle, booking.rego, booking.service]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm);
      return filterMatch && searchMatch;
    });
  }, [bookings, filter, query]);

  const openBooking = (booking: Booking) => {
    setSelectedId(booking.id);
    setDetailOpen(true);
  };

  const updateStatus = (status: BookingStatus) => {
    if (!selected) return;
    setBookings((current) => current.map((booking) => (booking.id === selected.id ? { ...booking, status } : booking)));
  };

  const stats: Array<[string, number, LucideIcon, string]> = [
    ['Today', bookings.filter((item) => item.dateGroup === 'Today').length, CalendarDays, 'Appointments scheduled'],
    ['Waiting', bookings.filter((item) => item.status === 'Waiting Confirmation').length, CircleAlert, 'Need confirmation'],
    ['Confirmed', bookings.filter((item) => item.status === 'Confirmed').length, CheckCircle2, 'Customers expected'],
    ['Checked in', bookings.filter((item) => item.status === 'Checked In').length, Wrench, 'Now in workshop'],
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400">Workshop schedule</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Bookings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Confirm appointments, check vehicles in and move each booking into the workshop without re-entering customer details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewBookingOpen(true)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold shadow-[0_14px_40px_rgba(220,38,38,.2)] transition hover:bg-red-500"
        >
          <Plus size={18} /> New booking
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, Icon, hint]) => (
          <article key={String(label)} className="rounded-3xl border border-white/8 bg-white/[0.028] p-5 shadow-[0_20px_60px_rgba(0,0,0,.18)]">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
                <Icon size={20} />
              </div>
              <span className="text-3xl font-black">{value}</span>
            </div>
            <p className="mt-5 text-sm font-bold">{label}</p>
            <p className="mt-1 text-xs text-white/35">{hint}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-white/8 bg-[#0d0f12] shadow-[0_30px_80px_rgba(0,0,0,.26)]">
        <div className="border-b border-white/8 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer, phone, registration or booking…"
                className="h-12 w-full rounded-2xl border border-white/8 bg-white/[0.035] pl-11 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-red-500/60"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                    filter === item
                      ? 'border-red-500 bg-red-600 text-white'
                      : 'border-white/8 bg-white/[0.025] text-white/45 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/8">
          {visibleBookings.length ? (
            visibleBookings.map((booking) => (
              <button
                type="button"
                key={booking.id}
                onClick={() => openBooking(booking)}
                className="group grid w-full gap-4 p-5 text-left transition hover:bg-white/[0.025] md:grid-cols-[100px_1.35fr_1fr_auto] md:items-center lg:p-6"
              >
                <div>
                  <p className="text-lg font-black">{booking.time}</p>
                  <p className="mt-1 text-xs text-white/35">{booking.dateGroup}</p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/5 text-white/60">
                      <CarFront size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{booking.vehicle}</p>
                      <p className="mt-1 text-xs font-semibold tracking-wide text-white/35">{booking.rego}</p>
                    </div>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{booking.customer}</p>
                  <p className="mt-1 truncate text-xs text-white/35">{booking.service}</p>
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <span className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${statusStyle[booking.status]}`}>{booking.status}</span>
                  <ChevronRight size={18} className="text-white/20 transition group-hover:translate-x-1 group-hover:text-white/60" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto text-white/20" size={34} />
              <p className="mt-4 font-bold">No matching bookings</p>
              <p className="mt-1 text-sm text-white/35">Try another filter or search term.</p>
            </div>
          )}
        </div>
      </section>

      {detailOpen && selected && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/70 backdrop-blur-sm" onMouseDown={() => setDetailOpen(false)}>
          <aside
            className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0c0e11] shadow-[-30px_0_90px_rgba(0,0,0,.5)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0c0e11]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Booking details</p>
                <h2 className="mt-1 text-xl font-black">{selected.id}</h2>
              </div>
              <button onClick={() => setDetailOpen(false)} className="rounded-xl border border-white/8 p-2.5 text-white/50 hover:bg-white/5 hover:text-white">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <section className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-2xl font-black">{selected.vehicle}</p>
                    <p className="mt-2 text-sm font-semibold tracking-wide text-white/45">{selected.rego}</p>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyle[selected.status]}`}>{selected.status}</span>
                </div>
                <div className="mt-5 grid gap-3 border-t border-white/8 pt-5 sm:grid-cols-2">
                  <Info icon={CalendarDays} label="Appointment" value={`${selected.dateLabel} · ${selected.time}`} />
                  <Info icon={Wrench} label="Requested service" value={selected.service} />
                </div>
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
                  <SectionTitle icon={UserRound} title="Customer" />
                  <p className="mt-5 text-lg font-bold">{selected.customer}</p>
                  <div className="mt-4 space-y-3 text-sm text-white/55">
                    <p className="flex items-center gap-3"><Phone size={16} /> {selected.phone}</p>
                    <p className="flex items-center gap-3 break-all"><Mail size={16} /> {selected.email}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
                  <SectionTitle icon={FileText} title="Customer notes" />
                  <p className="mt-5 text-sm leading-7 text-white/55">{selected.notes}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
                <SectionTitle icon={Wrench} title="Quick actions" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {selected.status !== 'Checked In' && selected.status !== 'Cancelled' && (
                    <ActionButton icon={CheckCircle2} label="Check in vehicle" primary onClick={() => updateStatus('Checked In')} />
                  )}
                  {selected.status === 'Waiting Confirmation' && (
                    <ActionButton icon={Check} label="Confirm booking" onClick={() => updateStatus('Confirmed')} />
                  )}
                  <ActionButton icon={FileText} label="Create quote" />
                  <ActionButton icon={Wrench} label="Create job card" />
                  <ActionButton icon={MoreHorizontal} label="Edit booking" />
                  {selected.status !== 'Cancelled' && (
                    <ActionButton icon={X} label="Cancel booking" danger onClick={() => updateStatus('Cancelled')} />
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-sky-400/15 bg-sky-400/[0.055] p-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-sky-300"><CircleAlert size={19} /></div>
                  <div>
                    <p className="text-sm font-bold text-sky-200">Not connected to the database</p>
                    <p className="mt-1 text-xs leading-5 text-sky-100/55">Bookings will appear here after Supabase is connected.</p>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}

      {newBookingOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={() => setNewBookingOpen(false)}>
          <div className="w-full max-w-xl rounded-[30px] border border-white/10 bg-[#0d0f12] p-6 shadow-[0_35px_100px_rgba(0,0,0,.6)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Manual entry</p>
                <h2 className="mt-1 text-2xl font-black">New booking</h2>
              </div>
              <button onClick={() => setNewBookingOpen(false)} className="rounded-xl border border-white/8 p-2 text-white/50 hover:bg-white/5 hover:text-white"><X size={18} /></button>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {['Customer name', 'Phone number', 'Vehicle', 'Registration', 'Date', 'Time'].map((label) => (
                <label key={label} className="text-xs font-bold text-white/45">
                  {label}
                  <input className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-red-500/60" />
                </label>
              ))}
              <label className="text-xs font-bold text-white/45 sm:col-span-2">
                Requested service
                <input className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-red-500/60" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setNewBookingOpen(false)} className="rounded-xl border border-white/8 px-4 py-2.5 text-sm font-bold text-white/50 hover:bg-white/5 hover:text-white">Cancel</button>
              <button onClick={() => setNewBookingOpen(false)} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-500">Save booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/10 text-red-400"><Icon size={17} /></div>
      <h3 className="font-bold">{title}</h3>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 shrink-0 text-white/30" size={17} />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/25">{label}</p>
        <p className="mt-1 text-sm font-semibold text-white/65">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, primary, danger, onClick }: { icon: LucideIcon; label: string; primary?: boolean; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-bold transition ${
        primary
          ? 'border-red-500 bg-red-600 text-white hover:bg-red-500'
          : danger
            ? 'border-red-500/15 bg-red-500/[0.06] text-red-300 hover:bg-red-500/10'
            : 'border-white/8 bg-white/[0.025] text-white/65 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );
}
