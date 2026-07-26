import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

const summaryCards = [
  { label: "Today's bookings", value: '8', detail: '3 checked in', icon: CalendarDays, tone: 'text-sky-300', panel: 'bg-sky-400/10' },
  { label: 'Waiting for quote', value: '3', detail: 'Oldest: 1h 20m', icon: FileText, tone: 'text-amber-300', panel: 'bg-amber-400/10' },
  { label: 'Repair in progress', value: '5', detail: '2 waiting on parts', icon: Wrench, tone: 'text-red-300', panel: 'bg-red-400/10' },
  { label: 'Ready for collection', value: '2', detail: 'Customers notified', icon: CheckCircle2, tone: 'text-emerald-300', panel: 'bg-emerald-400/10' },
];

const bookings = [
  { time: '8:30', period: 'AM', customer: 'Sarah Mitchell', vehicle: '2018 Toyota Camry', rego: '1ABC 234', service: 'Logbook service', status: 'Checked in', tone: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' },
  { time: '9:30', period: 'AM', customer: 'Daniel Wong', vehicle: '2020 Mazda CX-5', rego: '1KLM 881', service: 'Brake noise inspection', status: 'Arriving', tone: 'bg-sky-400/10 text-sky-300 border-sky-400/20' },
  { time: '10:30', period: 'AM', customer: 'Michael Brown', vehicle: '2016 Ford Ranger', rego: '1HIL 907', service: 'Engine diagnosis', status: 'Confirmed', tone: 'bg-white/5 text-white/55 border-white/10' },
  { time: '1:00', period: 'PM', customer: 'Emily Parker', vehicle: '2019 Hyundai i30', rego: '1J1 560', service: 'Air conditioning', status: 'Confirmed', tone: 'bg-white/5 text-white/55 border-white/10' },
];

const workshop = [
  { vehicle: 'Toyota Camry', rego: '1ABC 234', job: 'JC-1048', stage: 'Inspection', description: 'Cooling system pressure test', dot: 'bg-sky-400', badge: 'text-sky-300 bg-sky-400/10' },
  { vehicle: 'Ford Ranger', rego: '1HIL 907', job: 'JC-1047', stage: 'Repairing', description: 'Front wheel bearing replacement', dot: 'bg-red-400', badge: 'text-red-300 bg-red-400/10' },
  { vehicle: 'Mazda 3', rego: '1MZD 302', job: 'JC-1045', stage: 'Waiting Parts', description: 'Radiator hose ordered', dot: 'bg-amber-400', badge: 'text-amber-300 bg-amber-400/10' },
  { vehicle: 'Honda Civic', rego: '1HND 445', job: 'JC-1043', stage: 'Final Check', description: 'Road test and leak inspection', dot: 'bg-violet-400', badge: 'text-violet-300 bg-violet-400/10' },
];

const activity = [
  { icon: CheckCircle2, title: 'Quote approved', detail: 'Sarah Mitchell · Toyota Camry', time: '9:15 AM', tone: 'text-emerald-300 bg-emerald-400/10' },
  { icon: Wrench, title: 'Repair started', detail: 'Ford Ranger · JC-1047', time: '9:02 AM', tone: 'text-red-300 bg-red-400/10' },
  { icon: CalendarDays, title: 'New booking received', detail: 'Emily Parker · Hyundai i30', time: '8:46 AM', tone: 'text-sky-300 bg-sky-400/10' },
  { icon: ShieldCheck, title: 'Vehicle ready', detail: 'Honda Civic · JC-1043', time: '8:25 AM', tone: 'text-violet-300 bg-violet-400/10' },
];

export default function AdminWorkshopPage() {
  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            <CircleDot size={14} /> Live workshop
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Good evening, Jason.</h1>
          <p className="mt-2 text-sm text-white/42 sm:text-base">Wednesday, 22 July 2026 · Here’s what needs your attention.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-white/75 transition hover:bg-white/[0.07] hover:text-white">
            <Search size={17} /> Find job
          </button>
          <Link href="/admin/job-cards" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-bold shadow-[0_12px_35px_rgba(220,38,38,.24)] transition hover:bg-red-500">
            <Plus size={18} /> New job card
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, detail, icon: Icon, tone, panel }) => (
          <article key={label} className="group rounded-[26px] border border-white/8 bg-[#101216] p-5 transition hover:-translate-y-0.5 hover:border-white/14">
            <div className="flex items-start justify-between">
              <div className={`grid h-11 w-11 place-items-center rounded-2xl ${panel} ${tone}`}><Icon size={21} /></div>
              <ArrowUpRight size={17} className="text-white/18 transition group-hover:text-white/50" />
            </div>
            <p className="mt-5 text-sm font-semibold text-white/42">{label}</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="text-4xl font-black tracking-tight">{value}</p>
              <p className="pb-1 text-right text-xs text-white/28">{detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.45fr_.75fr]">
        <div className="rounded-[28px] border border-white/8 bg-[#101216]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-black">Today’s bookings</h2>
              <p className="mt-1 text-sm text-white/35">Next arrival in 32 minutes</p>
            </div>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-sm font-bold text-red-400 hover:text-red-300">View all <ChevronRight size={17} /></Link>
          </div>
          <div className="divide-y divide-white/7">
            {bookings.map((booking) => (
              <div key={`${booking.time}-${booking.rego}`} className="grid gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6 lg:grid-cols-[90px_1fr_1fr_auto] lg:items-center">
                <div className="flex items-end gap-1 lg:block">
                  <span className="text-xl font-black">{booking.time}</span>
                  <span className="ml-1 text-[10px] font-bold text-white/30">{booking.period}</span>
                </div>
                <div>
                  <p className="font-bold">{booking.customer}</p>
                  <p className="mt-1 text-sm text-white/35">{booking.vehicle} · {booking.rego}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/72">{booking.service}</p>
                  <p className="mt-1 text-xs text-white/28">Online booking</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${booking.tone}`}>{booking.status}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[28px] border border-white/8 bg-[#101216]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
            <div>
              <h2 className="text-lg font-black">Recent activity</h2>
              <p className="mt-1 text-sm text-white/35">Latest workshop updates</p>
            </div>
            <MoreHorizontal className="text-white/25" size={20} />
          </div>
          <div className="space-y-1 p-3">
            {activity.map(({ icon: Icon, title, detail, time, tone }) => (
              <div key={`${title}-${time}`} className="flex gap-3 rounded-2xl p-3 transition hover:bg-white/[0.03]">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-bold">{title}</p>
                    <span className="shrink-0 text-[10px] text-white/25">{time}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-white/35">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-[28px] border border-white/8 bg-[#101216]">
        <div className="flex flex-col gap-4 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-black">Vehicles in workshop</h2>
            <p className="mt-1 text-sm text-white/35">Current stage only — no misleading percentages.</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-white/40">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-400" /> Inspection</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-red-400" /> Repairing</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-400" /> Waiting parts</span>
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400" /> Final check</span>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {workshop.map((item) => (
            <Link key={item.job} href="/admin/job-cards" className="group rounded-2xl border border-white/7 bg-white/[0.025] p-4 transition hover:border-red-500/35 hover:bg-white/[0.045]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/28">{item.job}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.badge}`}>{item.stage}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot} shadow-[0_0_16px_currentColor]`} />
                <div className="min-w-0">
                  <p className="truncate font-black">{item.vehicle}</p>
                  <p className="mt-0.5 text-xs text-white/35">{item.rego}</p>
                </div>
              </div>
              <p className="mt-4 min-h-10 text-sm leading-5 text-white/48">{item.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/7 pt-3 text-xs font-bold text-white/32">
                Open job card <ChevronRight size={15} className="transition group-hover:translate-x-1 group-hover:text-red-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[28px] border border-red-500/18 bg-gradient-to-r from-red-950/45 to-[#101216] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-500/12 text-red-300"><Sparkles size={20} /></div>
          <div>
            <p className="font-black">Workshop principle</p>
            <p className="mt-1 text-sm leading-6 text-white/45">The system records what the mechanic knows. It never tells the mechanic what to think.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-red-300"><Clock3 size={15} /> Built for real workshop flow</div>
      </section>
    </div>
  );
}
