'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  History,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';

type Priority = 'OK' | 'Monitor' | 'Repair';
type InspectionItem = { id: number; system: string; item: string; findings: string; priority: Priority };
type Line = { id: number; description: string; qty: number; price: number };

const stages = ['Inspection', 'Diagnosis', 'Waiting Quote', 'Quote Approved', 'Repairing', 'Final Inspection', 'Ready Collection', 'Collected'];
const starterInspection: InspectionItem[] = [
  { id: 1, system: 'Engine', item: 'Engine oil', findings: '', priority: 'OK' },
  { id: 2, system: 'Engine', item: 'Oil leaks', findings: '', priority: 'OK' },
  { id: 3, system: 'Cooling', item: 'Coolant condition', findings: '', priority: 'OK' },
  { id: 4, system: 'Cooling', item: 'Cooling system leaks', findings: '', priority: 'OK' },
  { id: 5, system: 'Brakes', item: 'Front brake pads', findings: '', priority: 'OK' },
  { id: 6, system: 'Suspension', item: 'Front control arm bushes', findings: '', priority: 'OK' },
];

export default function JobCardEditor({ jobId = 'NEW' }: { jobId?: string }) {
  const isNew = jobId === 'NEW';
  const [stage, setStage] = useState('Inspection');
  const [saved, setSaved] = useState(false);
  const [inspection, setInspection] = useState(starterInspection);
  const [parts, setParts] = useState<Line[]>([]);
  const [labour, setLabour] = useState<Line[]>([]);

  const total = useMemo(() => [...parts, ...labour].reduce((sum, line) => sum + line.qty * line.price, 0), [parts, labour]);
  const updateInspection = (id: number, patch: Partial<InspectionItem>) => setInspection((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const updateLine = (kind: 'parts' | 'labour', id: number, patch: Partial<Line>) => {
    if (kind === 'parts') {
      setParts((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
    } else {
      setLabour((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
    }
  };
  const addLine = (kind: 'parts' | 'labour') => {
    const line = { id: Date.now(), description: '', qty: 1, price: 0 };
    if (kind === 'parts') setParts((items) => [...items, line]);
    else setLabour((items) => [...items, line]);
  };

  function save() { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }

  return (
    <div className="space-y-6 pb-20">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/admin/job-cards" className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/8 bg-white/[0.035] text-white/50 hover:bg-white/[0.07] hover:text-white"><ArrowLeft size={18} /></Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">{isNew ? 'Create job card' : `Job ${jobId}`}</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">{isNew ? 'New workshop job' : 'Job card'}</h1>
            <p className="mt-1 text-sm text-white/38">{isNew ? 'Enter customer and vehicle details below.' : 'No database record loaded.'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={save} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black hover:bg-white/[0.08]">{saved ? <Check size={17} className="text-emerald-300" /> : <Save size={17} />} {saved ? 'Saved' : 'Save draft'}</button>
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black hover:bg-white/[0.08]"><Printer size={17} /> Print</button>
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-black shadow-[0_12px_35px_rgba(220,38,38,.22)] hover:bg-red-500"><Send size={17} /> Create quote</button>
        </div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/8 bg-[#101216] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <Info label="Customer" value="—" icon={UserRound} />
                <Info label="Phone" value="—" />
                <Info label="Vehicle" value="—" />
                <Info label="Registration" value="—" />
              </div>
              <div className="min-w-[250px] rounded-2xl border border-red-500/18 bg-red-950/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">Current stage</p>
                <div className="relative mt-2">
                  <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-black/35 px-4 pr-10 text-sm font-black outline-none focus:border-red-500/50">{stages.map((item) => <option key={item} className="bg-[#111318]">{item}</option>)}</select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-white/35" size={18} />
                </div>
                <p className="mt-3 text-xs leading-5 text-white/36">This is the stage shown to the customer on Track Repair.</p>
              </div>
            </div>
          </div>

          <Card title="Customer complaint" icon={FileText} subtitle="Record the customer's description in their own words.">
            <textarea defaultValue="" className="min-h-32 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none placeholder:text-white/20 focus:border-red-500/45" />
          </Card>

          <Card title="Inspection findings" icon={ClipboardCheck} subtitle="Mechanics write findings freely and set only the priority.">
            <div className="space-y-3">
              {inspection.map((item) => <div key={item.id} className="rounded-2xl border border-white/7 bg-black/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">{item.system}</p><p className="mt-1 font-black">{item.item}</p></div>
                  <div className="flex gap-2">{(['OK', 'Monitor', 'Repair'] as Priority[]).map((priority) => <button type="button" key={priority} onClick={() => updateInspection(item.id, { priority })} className={`rounded-xl border px-3 py-2 text-xs font-black transition ${item.priority === priority ? priority === 'OK' ? 'border-emerald-400/30 bg-emerald-400/12 text-emerald-300' : priority === 'Monitor' ? 'border-amber-400/30 bg-amber-400/12 text-amber-300' : 'border-red-400/30 bg-red-400/12 text-red-300' : 'border-white/8 bg-white/[0.025] text-white/28'}`}>{priority}</button>)}</div>
                </div>
                <textarea value={item.findings} onChange={(e) => updateInspection(item.id, { findings: e.target.value })} placeholder="Write findings..." className="mt-3 min-h-20 w-full rounded-xl border border-white/7 bg-white/[0.025] p-3 text-sm leading-6 outline-none placeholder:text-white/18 focus:border-red-500/40" />
              </div>)}
            </div>
          </Card>

          <Card title="Diagnosis" icon={Wrench} subtitle="Record the confirmed cause of the fault. No AI, no forced template.">
            <textarea defaultValue="" className="min-h-36 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none focus:border-red-500/45" />
          </Card>

          <LineCard title="Parts" lines={parts} kind="parts" onUpdate={updateLine} onAdd={addLine} onRemove={(id) => setParts((items) => items.filter((item) => item.id !== id))} />
          <LineCard title="Labour" lines={labour} kind="labour" onUpdate={updateLine} onAdd={addLine} onRemove={(id) => setLabour((items) => items.filter((item) => item.id !== id))} />

          <Card title="Recommendations" icon={ClipboardCheck} subtitle="Customer-facing recommendations written by the mechanic.">
            <textarea defaultValue="" className="min-h-28 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none focus:border-red-500/45" />
          </Card>

          <Card title="Internal notes" icon={FileText} subtitle="Workshop only. Never shown on the customer tracking page.">
            <textarea placeholder="Write private workshop notes..." className="min-h-28 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none placeholder:text-white/18 focus:border-red-500/45" />
          </Card>

          <Card title="Workshop photos" icon={Camera} subtitle="Internal job-card evidence only. Customers cannot see these photos.">
            <label className="grid min-h-36 cursor-pointer place-items-center rounded-2xl border border-dashed border-white/12 bg-black/20 text-center transition hover:border-red-500/35 hover:bg-red-950/10">
              <div><Camera className="mx-auto text-white/25" /><p className="mt-3 text-sm font-black">Add workshop photos</p><p className="mt-1 text-xs text-white/28">Inspection, failed parts or completed repairs</p></div>
              <input type="file" multiple accept="image/*" className="hidden" />
            </label>
          </Card>
        </div>

        <aside className="space-y-5">
          <div className="sticky top-6 space-y-5">
            <div className="rounded-[28px] border border-white/8 bg-[#101216] p-5">
              <div className="flex items-center gap-2"><CircleDollarSign size={18} className="text-red-400" /><h2 className="font-black">Job summary</h2></div>
              <div className="mt-5 space-y-3 text-sm">
                <TotalRow label="Parts" value={parts.reduce((s, x) => s + x.qty * x.price, 0)} />
                <TotalRow label="Labour" value={labour.reduce((s, x) => s + x.qty * x.price, 0)} />
                <div className="border-t border-white/8 pt-4"><TotalRow label="Estimate total" value={total} strong /></div>
              </div>
              <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-sm font-black hover:bg-red-500"><Send size={17} /> Create customer quote</button>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-[#101216] p-5">
              <div className="flex items-center gap-2"><History size={18} className="text-red-400" /><h2 className="font-black">Vehicle timeline</h2></div>
              <div className="mt-5 space-y-5 border-l border-white/10 pl-4">
                {([] as string[][]).map(([date, title, detail]) => <div key={date + title} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#101216] bg-red-500" /><p className="text-[10px] font-black uppercase tracking-wider text-white/25">{date}</p><p className="mt-1 text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-white/33">{detail}</p></div>)}
              </div>
            </div>
          </div>
        </aside>
      </section>

      <div className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111318]/95 p-3 shadow-2xl backdrop-blur md:left-auto md:right-6 md:w-auto">
        <p className="hidden px-2 text-xs font-bold text-white/35 md:block">Supabase connection required to save</p>
        <button onClick={save} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-black hover:bg-white/[0.09] md:flex-none"><Save size={17} /> Save</button>
        <button onClick={() => setStage('Ready Collection')} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black hover:bg-emerald-500 md:flex-none"><Check size={17} /> Ready collection</button>
      </div>
    </div>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof UserRound }) {
  return <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">{label}</p><p className="mt-1.5 flex items-center gap-2 font-black">{Icon && <Icon size={16} className="text-white/25" />}{value}</p></div>;
}
function Card({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof FileText; children: React.ReactNode }) {
  return <section className="rounded-[28px] border border-white/8 bg-[#101216] p-5 sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-500/10 text-red-300"><Icon size={18} /></div><div><h2 className="font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-white/32">{subtitle}</p></div></div>{children}</section>;
}
function LineCard({ title, lines, kind, onUpdate, onAdd, onRemove }: { title: string; lines: Line[]; kind: 'parts' | 'labour'; onUpdate: (kind: 'parts' | 'labour', id: number, patch: Partial<Line>) => void; onAdd: (kind: 'parts' | 'labour') => void; onRemove: (id: number) => void }) {
  return <section className="rounded-[28px] border border-white/8 bg-[#101216] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-black">{title}</h2><p className="mt-1 text-xs text-white/32">Add only what is relevant to this repair.</p></div><button onClick={() => onAdd(kind)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.05] px-3 text-xs font-black hover:bg-white/[0.09]"><Plus size={15} /> Add line</button></div><div className="space-y-3">{lines.map((line) => <div key={line.id} className="grid gap-3 rounded-2xl border border-white/7 bg-black/20 p-3 sm:grid-cols-[1fr_90px_120px_42px] sm:items-center"><input value={line.description} onChange={(e) => onUpdate(kind, line.id, { description: e.target.value })} placeholder="Description" className="h-11 rounded-xl border border-white/7 bg-white/[0.025] px-3 text-sm outline-none focus:border-red-500/40" /><input type="number" step="0.1" value={line.qty} onChange={(e) => onUpdate(kind, line.id, { qty: Number(e.target.value) })} className="h-11 rounded-xl border border-white/7 bg-white/[0.025] px-3 text-sm outline-none focus:border-red-500/40" /><div className="relative"><span className="absolute left-3 top-3 text-sm text-white/25">$</span><input type="number" step="0.01" value={line.price} onChange={(e) => onUpdate(kind, line.id, { price: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-white/7 bg-white/[0.025] pl-7 pr-3 text-sm outline-none focus:border-red-500/40" /></div><button onClick={() => onRemove(line.id)} className="grid h-10 w-10 place-items-center rounded-xl text-white/25 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={16} /></button></div>)}</div></section>;
}
function TotalRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) { return <div className="flex items-center justify-between"><span className={strong ? 'font-black' : 'text-white/40'}>{label}</span><span className={strong ? 'text-xl font-black' : 'font-bold'}>${value.toFixed(2)}</span></div>; }
