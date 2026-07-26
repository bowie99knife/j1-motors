import { Plus, Search, SlidersHorizontal } from 'lucide-react';

export default function AdminSectionPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">J1 Motors</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-white/40 sm:text-base">{description}</p>
        </div>
        <button className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-bold hover:bg-red-500"><Plus size={18} /> New {title.replace(/s$/, '')}</button>
      </div>
      <div className="rounded-[28px] border border-white/8 bg-[#101216] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={18} />
            <input className="h-11 w-full rounded-2xl border border-white/8 bg-white/[0.03] pl-11 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-red-500/50" placeholder={`Search ${title.toLowerCase()}…`} />
          </div>
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm font-bold text-white/60 hover:bg-white/[0.06] hover:text-white"><SlidersHorizontal size={17} /> Filters</button>
        </div>
        <div className="mt-5 grid min-h-72 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-8 text-center">
          <div>
            <p className="font-black">UI foundation ready</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">This section is prepared for the full workflow and Supabase data connection. No generic table has been added just to fill the screen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
