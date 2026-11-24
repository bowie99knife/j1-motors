'use client';

import {
  CalendarDays,
  ChevronLeft,
  List,
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
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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


type CustomerOption = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
};

type VehicleOption = {
  id: string;
  customer_id: string | null;
  registration: string;
  year: number | null;
  make: string | null;
  model: string | null;
};

type BookingRow = {
  id: string;
  booking_number: string | null;
  booking_date: string | null;
  booking_time: string | null;
  status: string | null;
  booking_type: string | null;
  customer_notes: string | null;
  customers: CustomerOption | null;
  vehicles: VehicleOption | null;
};

function getDateGroup(date: string | null): Booking['dateGroup'] {
  if (!date) return 'This Week';

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return 'This Week';
}

function bookingFromRow(row: BookingRow): Booking {
  const customer = row.customers
    ? [row.customers.first_name, row.customers.last_name].filter(Boolean).join(' ')
    : 'Unknown customer';

  const vehicle = row.vehicles
    ? [row.vehicles.year, row.vehicles.make, row.vehicles.model].filter(Boolean).join(' ')
    : 'Unknown vehicle';

  return {
    id: row.id,
    dateGroup: getDateGroup(row.booking_date),
    dateLabel: row.booking_date || 'No date',
    time: row.booking_time || '-',
    customer,
    phone: row.customers?.phone || '',
    email: row.customers?.email || '',
    vehicle,
    rego: row.vehicles?.registration || '',
    service: row.booking_type || 'General service',
    status: (row.status as BookingStatus) || 'Waiting Confirmation',
    notes: row.customer_notes || 'No customer notes.',
  };
}

type CalendarView = 'Day' | 'Week' | 'Month' | 'List';

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function weekStart(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7));
}

function calendarDays(date: Date, view: CalendarView): Date[] {
  if (view === 'Day') return [date];
  if (view === 'Week') return Array.from({ length: 7 }, (_, index) => addDays(weekStart(date), index));
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = weekStart(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function calendarHeading(date: Date, view: CalendarView): string {
  if (view === 'Month') return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  if (view === 'Day') return date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const start = weekStart(date);
  const end = addDays(start, 6);
  return `${start.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}  -  ${end.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

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
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<Filter>('Today');
  const [calendarView, setCalendarView] = useState<CalendarView>('Week');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [newBookingDate, setNewBookingDate] = useState(() => dateKey(new Date()));
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [editBookingOpen, setEditBookingOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage('');

      const [bookingsResult, customersResult, vehiclesResult] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, booking_number, booking_date, booking_time, status, booking_type, customer_notes, customers(id, first_name, last_name, phone, email), vehicles(id, customer_id, registration, year, make, model)')
          .order('booking_date', { ascending: true })
          .order('booking_time', { ascending: true }),
        supabase.from('customers').select('id, first_name, last_name, phone, email').order('first_name'),
        supabase.from('vehicles').select('id, customer_id, registration, year, make, model').order('registration'),
      ]);

      if (!active) return;

      if (bookingsResult.error) {
        setErrorMessage(bookingsResult.error.message);
        setBookings([]);
      } else {
        setBookings((bookingsResult.data ?? []).map((row) => bookingFromRow(row as unknown as BookingRow)));
      }

      if (customersResult.error) setErrorMessage((v) => v || customersResult.error!.message);
      else setCustomers((customersResult.data ?? []) as CustomerOption[]);

      if (vehiclesResult.error) setErrorMessage((v) => v || vehiclesResult.error!.message);
      else setVehicles((vehiclesResult.data ?? []) as VehicleOption[]);

      setLoading(false);
    }

    loadData();
    return () => { active = false; };
  }, []);

  const selected = bookings.find((booking) => booking.id === selectedId);
  const displayedDays = useMemo(() => calendarDays(calendarDate, calendarView), [calendarDate, calendarView]);
  const matchingCalendarBookings = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return bookings.filter((booking) => !searchTerm ||
      [booking.customer, booking.phone, booking.vehicle, booking.rego, booking.service, booking.id]
        .join(' ').toLowerCase().includes(searchTerm));
  }, [bookings, query]);
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of matchingCalendarBookings) {
      const group = map.get(booking.dateLabel) || [];
      group.push(booking);
      map.set(booking.dateLabel, group);
    }
    for (const group of map.values()) group.sort((a, b) => a.time.localeCompare(b.time));
    return map;
  }, [matchingCalendarBookings]);

  function navigateCalendar(direction: number) {
    setCalendarDate((current) => {
      if (calendarView === 'Month') return new Date(current.getFullYear(), current.getMonth() + direction, 1);
      return addDays(current, direction * (calendarView === 'Week' ? 7 : 1));
    });
  }

  function openNewBooking(date: string = dateKey(calendarDate)) {
    setNewBookingDate(date);
    setErrorMessage('');
    setNewBookingOpen(true);
  }


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

  const updateStatus = async (status: BookingStatus) => {
    if (!selected) return;
    setErrorMessage('');
    const { error } = await supabase.from('bookings').update({ status }).eq('id', selected.id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setBookings((current) => current.map((booking) => (booking.id === selected.id ? { ...booking, status } : booking)));
  };

  async function editBooking(formData: FormData) {
    if (!selected || editing) return;
    const booking_date = String(formData.get('booking_date') || '');
    const booking_time = String(formData.get('booking_time') || '');
    const booking_type = String(formData.get('booking_type') || '').trim();
    const customer_notes = String(formData.get('customer_notes') || '').trim();
    if (!booking_date || !booking_time || !booking_type) {
      setErrorMessage('Date, time and service are required.');
      return;
    }
    setEditing(true);
    setErrorMessage('');
    const { error } = await supabase.from('bookings')
      .update({ booking_date, booking_time, booking_type, customer_notes })
      .eq('id', selected.id);
    setEditing(false);
    if (error) { setErrorMessage(error.message); return; }
    setBookings(current => current.map(b => b.id === selected.id
      ? { ...b, dateLabel: booking_date, dateGroup: getDateGroup(booking_date), time: booking_time, service: booking_type, notes: customer_notes }
      : b));
    setEditBookingOpen(false);
  }

  async function addBooking(formData: FormData) {
    const customerId = String(formData.get('customer_id') || '');
    const vehicleId = String(formData.get('vehicle_id') || '');
    const date = String(formData.get('booking_date') || '');
    const time = String(formData.get('booking_time') || '');
    const service = String(formData.get('booking_type') || '').trim();
    const notes = String(formData.get('customer_notes') || '').trim() || null;

    if (!customerId || !vehicleId || !date || !time || !service) {
      setErrorMessage('Please complete customer, vehicle, date, time and requested service.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const bookingNumber = `J1-B${Date.now().toString().slice(-8)}`;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        customer_id: customerId,
        vehicle_id: vehicleId,
        booking_date: date,
        booking_time: time,
        status: 'Waiting Confirmation',
        booking_type: service,
        customer_notes: notes,
      })
      .select('id, booking_number, booking_date, booking_time, status, booking_type, customer_notes, customers(id, first_name, last_name, phone, email), vehicles(id, customer_id, registration, year, make, model)')
      .single();

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBookings((current) => [...current, bookingFromRow(data as unknown as BookingRow)]);
    setNewBookingOpen(false);
    setSelectedCustomerId('');
  }

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
          onClick={() => openNewBooking()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold shadow-[0_14px_40px_rgba(220,38,38,.2)] transition hover:bg-red-500"
        >
          <Plus size={18} /> New booking
        </button>
      </section>

      {errorMessage && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">Supabase error: {errorMessage}</div>}
      {loading && <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-white/45">Loading bookings...</div>}

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

      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0f12] shadow-[0_30px_80px_rgba(0,0,0,.26)]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setCalendarDate(new Date())} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10">Today</button>
            <button type="button" aria-label="Previous period" onClick={() => navigateCalendar(-1)} className="rounded-xl border border-white/15 p-2.5 hover:bg-white/10"><ChevronLeft size={18}/></button>
            <button type="button" aria-label="Next period" onClick={() => navigateCalendar(1)} className="rounded-xl border border-white/15 p-2.5 hover:bg-white/10"><ChevronRight size={18}/></button>
            <h2 className="ml-1 text-base font-black sm:text-lg">{calendarHeading(calendarDate, calendarView)}</h2>
          </div>
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1">
            {(['Day', 'Week', 'Month', 'List'] as CalendarView[]).map((view) => (
              <button key={view} type="button" onClick={() => { setCalendarView(view); if (view === 'List') setFilter('All'); }}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${calendarView === view ? 'bg-red-600 text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}>
                {view === 'List' && <List size={13} className="mr-1 inline"/>}{view}
              </button>
            ))}
          </div>
        </div>
        <div className="border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, rego, service..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-10 pr-3 text-sm outline-none placeholder:text-white/25 focus:border-red-500/60"/>
          </div>
        </div>
        {calendarView !== 'List' && (
          <div className="p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/60">
              {(['Waiting Confirmation', 'Confirmed', 'Checked In', 'Completed', 'Cancelled'] as BookingStatus[]).map((status) => (
                <span key={status} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full border ${statusStyle[status]}`}/>{status}</span>
              ))}
            </div>
            {calendarView === 'Month' ? (
              <div className="grid grid-cols-7 gap-1.5">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((name) => <div key={name} className="py-2 text-center text-[10px] font-bold uppercase text-white/40 sm:text-xs">{name}</div>)}
                {displayedDays.map((day) => {
                  const key = dateKey(day);
                  const items = bookingsByDate.get(key) || [];
                  const outside = day.getMonth() !== calendarDate.getMonth();
                  return (
                    <div key={key} className={`min-h-24 rounded-xl border p-1.5 sm:min-h-32 sm:p-2 ${key === dateKey(new Date()) ? 'border-red-500/60 bg-red-500/[0.06]' : 'border-white/10 bg-white/[0.018]'} ${outside ? 'opacity-45' : ''}`}>
                      <button type="button" onClick={() => { setCalendarDate(day); setCalendarView('Day'); }} className="mb-1 flex w-full items-center justify-between rounded-md text-left hover:text-red-300">
                        <span className="text-xs font-bold">{day.getDate()}</span>
                        <span className="text-[10px] text-white/35">{items.length || ''}</span>
                      </button>
                      {items.slice(0, 3).map((booking) => (
                        <button key={booking.id} type="button" onClick={() => openBooking(booking)} title={`${booking.time} ${booking.customer}  |  ${booking.rego}`}
                          className={`mb-1 block w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] font-semibold ${statusStyle[booking.status]}`}>
                          {booking.time.slice(0,5)} {booking.rego || booking.customer}
                        </button>
                      ))}
                      {items.length > 3 && <button type="button" onClick={() => { setCalendarDate(day); setCalendarView('Day'); }} className="text-[10px] text-white/55 hover:text-white">+{items.length - 3} more</button>}
                      <button type="button" onClick={() => openNewBooking(key)} className="mt-1 block w-full rounded-md py-1 text-left text-[10px] text-white/25 hover:text-red-300" aria-label={`Add booking on ${key}`}>+ Add</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`grid gap-2 ${calendarView === 'Week' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1'}`}>
                {displayedDays.map((day) => {
                  const key = dateKey(day);
                  const items = bookingsByDate.get(key) || [];
                  const closed = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div key={key} className={`min-h-48 rounded-2xl border p-3 ${key === dateKey(new Date()) ? 'border-red-500/50 bg-red-500/[0.04]' : 'border-white/10 bg-white/[0.02]'}`}>
                      <button type="button" onClick={() => { setCalendarDate(day); setCalendarView('Day'); }} className="mb-3 w-full border-b border-white/10 pb-3 text-left hover:text-red-300">
                        <span className="block text-xs font-semibold text-white/45">{day.toLocaleDateString('en-AU', { weekday: 'short' })}</span>
                        <span className="text-xl font-black">{day.getDate()}</span>
                        <span className="ml-2 text-[10px] text-white/35">{items.length} jobs</span>
                      </button>
                      {closed && <p className="mb-2 text-[10px] text-white/35">Outside usual workshop hours</p>}
                      {items.map((booking) => (
                        <button key={booking.id} type="button" onClick={() => openBooking(booking)}
                          className={`mb-2 w-full rounded-xl border p-2 text-left transition hover:brightness-125 ${statusStyle[booking.status]}`}>
                          <span className="block text-xs font-black">{booking.time.slice(0,5)}</span>
                          <span className="mt-1 block break-words text-xs font-bold">{booking.rego || booking.vehicle}</span>
                          <span className="mt-1 block break-words text-[11px] opacity-80">{booking.customer}</span>
                          {calendarView === 'Day' && <span className="mt-1 block text-[11px] opacity-70">{booking.service}  |  {booking.status}</span>}
                        </button>
                      ))}
                      {items.length === 0 && <p className="mb-3 text-xs text-white/30">No bookings</p>}
                      <button type="button" onClick={() => openNewBooking(key)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-white/15 px-2 py-2 text-xs font-semibold text-white/45 hover:border-red-500/40 hover:text-red-300"><Plus size={13}/> Add booking</button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-xs text-white/35">Appointments show start times only. Usual workshop hours: Mon - Fri, 8:30 AM - 5:00 PM. Click a booking to edit.</p>
          </div>
        )}
      </section>

      {calendarView === 'List' && (
      <section className="rounded-[28px] border border-white/8 bg-[#0d0f12] shadow-[0_30px_80px_rgba(0,0,0,.26)]">
        <div className="border-b border-white/8 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer, phone, registration or booking..."
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

      )}

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
                  <Info icon={CalendarDays} label="Appointment" value={`${selected.dateLabel}  |  ${selected.time}`} />
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
                  <ActionButton icon={FileText} label="Create quote" onClick={() => router.push(`/admin/quotes/new?bookingId=${encodeURIComponent(selected.id)}`)} />
                  <ActionButton icon={Wrench} label="Create job card" onClick={() => router.push(`/admin/job-cards/new?bookingId=${encodeURIComponent(selected.id)}`)} />
                  <ActionButton icon={MoreHorizontal} label="Edit booking" onClick={() => setEditBookingOpen(true)} />
                  {selected.status !== 'Cancelled' && (
                    <ActionButton icon={X} label="Cancel booking" danger onClick={() => updateStatus('Cancelled')} />
                  )}
                </div>
              </section>

            </div>
          </aside>
        </div>
      )}

      {editBookingOpen && selected && (
        <div className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-black/80 p-4" onMouseDown={() => !editing && setEditBookingOpen(false)}>
          <form action={editBooking} onMouseDown={e => e.stopPropagation()} className="w-full max-w-xl space-y-5 rounded-3xl border border-white/10 bg-[#0d0f12] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Edit booking</h2>
              <button type="button" onClick={() => setEditBookingOpen(false)} aria-label="Close edit booking"><X size={20}/></button>
            </div>
            <p className="text-sm text-white/50">{selected.customer}  |  {selected.rego}</p>
            <label className="block text-sm">Date<input name="booking_date" type="date" required defaultValue={selected.dateLabel} className="mt-2 w-full rounded-xl border border-white/10 bg-[#191b20] p-3"/></label>
            <label className="block text-sm">Time<input name="booking_time" type="time" required defaultValue={selected.time} className="mt-2 w-full rounded-xl border border-white/10 bg-[#191b20] p-3"/></label>
            <label className="block text-sm">Service<input name="booking_type" required defaultValue={selected.service} className="mt-2 w-full rounded-xl border border-white/10 bg-[#191b20] p-3"/></label>
            <label className="block text-sm">Customer notes<textarea name="customer_notes" rows={4} defaultValue={selected.notes === 'No customer notes.' ? '' : selected.notes} className="mt-2 w-full rounded-xl border border-white/10 bg-[#191b20] p-3"/></label>
            {errorMessage && <p role="alert" className="text-sm text-red-300">{errorMessage}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditBookingOpen(false)} className="rounded-xl border border-white/10 px-4 py-3">Cancel</button>
              <button type="submit" disabled={editing} className="rounded-xl bg-red-600 px-5 py-3 font-bold disabled:opacity-50">{editing ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>
      )}

      {newBookingOpen && (
        <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm" onMouseDown={() => !saving && setNewBookingOpen(false)}>
          <form action={addBooking} className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-[#0d0f12] p-6 shadow-[0_35px_100px_rgba(0,0,0,.6)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Manual entry</p>
                <h2 className="mt-1 text-2xl font-black">New booking</h2>
                <p className="mt-2 text-sm text-white/40">Choose an existing customer and one of their vehicles.</p>
              </div>
              <button type="button" disabled={saving} onClick={() => setNewBookingOpen(false)} className="rounded-xl border border-white/8 p-2 text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-40"><X size={18} /></button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold text-white/45 sm:col-span-2">
                Customer *
                <select name="customer_id" required value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-red-500/60">
                  <option value="" className="bg-[#111318]">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id} className="bg-[#111318]">{[customer.first_name, customer.last_name].filter(Boolean).join(' ')}  |  {customer.phone}</option>)}
                </select>
              </label>

              <label className="text-xs font-bold text-white/45 sm:col-span-2">
                Vehicle *
                <select name="vehicle_id" required defaultValue="" className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-red-500/60">
                  <option value="" className="bg-[#111318]">Select vehicle</option>
                  {vehicles.filter((vehicle) => !selectedCustomerId || vehicle.customer_id === selectedCustomerId).map((vehicle) => <option key={vehicle.id} value={vehicle.id} className="bg-[#111318]">{vehicle.registration}  |  {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ')}</option>)}
                </select>
              </label>

              <label className="text-xs font-bold text-white/45">
                Date *
                <input name="booking_date" type="date" required value={newBookingDate} onChange={(event) => setNewBookingDate(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-red-500/60" />
              </label>
              <label className="text-xs font-bold text-white/45">
                Time *
                <input name="booking_time" type="time" required className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none focus:border-red-500/60" />
              </label>
              <label className="text-xs font-bold text-white/45 sm:col-span-2">
                Requested service *
                <input name="booking_type" required placeholder="e.g. Logbook service" className="mt-2 h-11 w-full rounded-xl border border-white/8 bg-white/[0.035] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-500/60" />
              </label>
              <label className="text-xs font-bold text-white/45 sm:col-span-2">
                Customer notes
                <textarea name="customer_notes" rows={3} placeholder="Optional notes..." className="mt-2 w-full resize-none rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-500/60" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={saving} onClick={() => setNewBookingOpen(false)} className="rounded-xl border border-white/8 px-4 py-2.5 text-sm font-bold text-white/50 hover:bg-white/5 hover:text-white disabled:opacity-40">Cancel</button>
              <button type="submit" disabled={saving || customers.length === 0} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Saving...' : 'Save booking'}</button>
            </div>
          </form>
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