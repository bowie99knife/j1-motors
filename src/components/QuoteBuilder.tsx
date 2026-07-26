'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Link2,
  MessageSquareText,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type LabourLine = { id: string; description: string; hours: number; rate: number };
type PartLine = { id: string; partNumber: string; description: string; quantity: number; unitPrice: number };

type QuoteBuilderProps = { quoteId?: string };

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function QuoteBuilder({ quoteId }: QuoteBuilderProps) {
  const isNew = !quoteId;
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [registration, setRegistration] = useState('');
  const [vin, setVin] = useState('');
  const [odometer, setOdometer] = useState('');
  const [jobCard, setJobCard] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [terms, setTerms] = useState('Quote valid for 7 days. Parts availability may affect completion time. Additional work requires customer approval.');
  const [expiry, setExpiry] = useState('');
  const [gstIncluded, setGstIncluded] = useState(false);
  const [labour, setLabour] = useState<LabourLine[]>([]);
  const [parts, setParts] = useState<PartLine[]>([]);
  const [notice, setNotice] = useState('');

  const labourSubtotal = useMemo(() => labour.reduce((sum, line) => sum + Number(line.hours || 0) * Number(line.rate || 0), 0), [labour]);
  const partsSubtotal = useMemo(() => parts.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0), [parts]);
  const subtotal = labourSubtotal + partsSubtotal;
  const gst = gstIncluded ? subtotal - subtotal / 1.1 : subtotal * 0.1;
  const total = gstIncluded ? subtotal : subtotal + gst;
  const currentId = quoteId || 'New quote';
  const token = '';

  function addLabour() { setLabour((lines) => [...lines, { id: crypto.randomUUID(), description: '', hours: 1, rate: 145 }]); }
  function addPart() { setParts((lines) => [...lines, { id: crypto.randomUUID(), partNumber: '', description: '', quantity: 1, unitPrice: 0 }]); }
  function flash(message: string) { setNotice(message); window.setTimeout(() => setNotice(''), 1800); }
  async function copyLink() { await navigator.clipboard.writeText(`${window.location.origin}/q/${token}`); flash('Secure link copied'); }
  async function copyMessage() {
    const message = `Hi ${customer.split(' ')[0]},\n\nYour repair quote for ${vehicle} (${registration}) is ready.\n\nPlease review and approve it using the secure link below:\n${window.location.origin}/q/${token}\n\nJ1 Motors\n0497 066 771`;
    await navigator.clipboard.writeText(message);
    flash('Customer message copied');
  }

  return (
    <div className="space-y-6">
      {notice && <div className="fixed right-5 top-24 z-50 flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-[#101713] px-4 py-3 text-sm font-bold text-emerald-300 shadow-2xl"><Check size={17} />{notice}</div>}
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link href="/admin/quotes" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/38 transition hover:text-white"><ArrowLeft size={17} /> Back to quotes</Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{isNew ? 'New quote' : currentId}</h1>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-bold text-amber-300">{isNew ? 'Draft' : 'Viewed'}</span>
          </div>
          <p className="mt-2 text-sm text-white/40">Prepare a clear, customer-ready repair estimate.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => flash('Draft saved')} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-white/65 transition hover:bg-white/[0.07] hover:text-white"><Save size={17} /> Save draft</button>
          <Link href={`/q/${token}`} target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-bold text-white/65 transition hover:bg-white/[0.07] hover:text-white"><ExternalLink size={17} /> Preview</Link>
          <button type="button" onClick={() => flash('Quote marked as sent')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold shadow-[0_12px_30px_rgba(220,38,38,.22)] transition hover:bg-red-500"><Send size={17} /> Generate & send</button>
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-6">
          <Card title="Customer & vehicle" subtitle="Linked workshop records" icon={<UserRound size={19} />}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Customer name" value={customer} onChange={setCustomer} />
              <Field label="Phone" value={phone} onChange={setPhone} />
              <Field label="Email" value={email} onChange={setEmail} />
              <Field label="Job card" value={jobCard} onChange={setJobCard} />
              <Field label="Vehicle" value={vehicle} onChange={setVehicle} />
              <Field label="Registration" value={registration} onChange={setRegistration} />
              <Field label="VIN" value={vin} onChange={setVin} />
              <Field label="Odometer (km)" value={odometer} onChange={setOdometer} />
            </div>
          </Card>

          <Card title="Diagnosis" subtitle="Explain the confirmed fault in plain language" icon={<Wrench size={19} />}>
            <textarea value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} rows={6} className="w-full resize-y rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/75 outline-none transition placeholder:text-white/20 focus:border-red-500/45" placeholder="Write the diagnosis in your own words…" />
          </Card>

          <Card title="Labour" subtitle="Description, time and rate" icon={<ClipboardList size={19} />} action={<button type="button" onClick={addLabour} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/[0.07] hover:text-white"><Plus size={15} /> Add labour</button>}>
            <div className="space-y-3">
              {labour.map((line, index) => (
                <div key={line.id} className="grid gap-3 rounded-2xl border border-white/7 bg-black/15 p-3 lg:grid-cols-[minmax(0,1fr)_110px_130px_130px_42px] lg:items-end">
                  <Field label={index === 0 ? 'Description' : ''} value={line.description} onChange={(value) => setLabour((items) => items.map((item) => item.id === line.id ? { ...item, description: value } : item))} placeholder="Labour operation" />
                  <NumberField label={index === 0 ? 'Hours' : ''} value={line.hours} onChange={(value) => setLabour((items) => items.map((item) => item.id === line.id ? { ...item, hours: value } : item))} step="0.1" />
                  <NumberField label={index === 0 ? 'Rate' : ''} value={line.rate} onChange={(value) => setLabour((items) => items.map((item) => item.id === line.id ? { ...item, rate: value } : item))} />
                  <div><Label text={index === 0 ? 'Line total' : ''} /><div className="flex h-11 items-center justify-end rounded-xl border border-white/7 bg-white/[0.025] px-3 text-sm font-black">{money.format(line.hours * line.rate)}</div></div>
                  <button type="button" onClick={() => setLabour((items) => items.filter((item) => item.id !== line.id))} className="grid h-11 w-11 place-items-center rounded-xl text-white/25 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Parts" subtitle="Part number, quantity and selling price" icon={<CarFront size={19} />} action={<button type="button" onClick={addPart} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/[0.07] hover:text-white"><Plus size={15} /> Add part</button>}>
            <div className="space-y-3">
              {parts.map((line, index) => (
                <div key={line.id} className="grid gap-3 rounded-2xl border border-white/7 bg-black/15 p-3 xl:grid-cols-[150px_minmax(0,1fr)_90px_130px_130px_42px] xl:items-end">
                  <Field label={index === 0 ? 'Part number' : ''} value={line.partNumber} onChange={(value) => setParts((items) => items.map((item) => item.id === line.id ? { ...item, partNumber: value } : item))} placeholder="Optional" />
                  <Field label={index === 0 ? 'Description' : ''} value={line.description} onChange={(value) => setParts((items) => items.map((item) => item.id === line.id ? { ...item, description: value } : item))} placeholder="Part description" />
                  <NumberField label={index === 0 ? 'Qty' : ''} value={line.quantity} onChange={(value) => setParts((items) => items.map((item) => item.id === line.id ? { ...item, quantity: value } : item))} />
                  <NumberField label={index === 0 ? 'Unit price' : ''} value={line.unitPrice} onChange={(value) => setParts((items) => items.map((item) => item.id === line.id ? { ...item, unitPrice: value } : item))} step="0.01" />
                  <div><Label text={index === 0 ? 'Line total' : ''} /><div className="flex h-11 items-center justify-end rounded-xl border border-white/7 bg-white/[0.025] px-3 text-sm font-black">{money.format(line.quantity * line.unitPrice)}</div></div>
                  <button type="button" onClick={() => setParts((items) => items.filter((item) => item.id !== line.id))} className="grid h-11 w-11 place-items-center rounded-xl text-white/25 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Customer notes & terms" subtitle="Shown on the customer quote" icon={<MessageSquareText size={19} />}>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><Label text="Customer notes" /><textarea value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} rows={5} className="w-full resize-y rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/70 outline-none focus:border-red-500/45" /></div>
              <div><Label text="Terms & conditions" /><textarea value={terms} onChange={(event) => setTerms(event.target.value)} rows={5} className="w-full resize-y rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/70 outline-none focus:border-red-500/45" /></div>
            </div>
          </Card>
        </div>

        <aside className="space-y-5 2xl:sticky 2xl:top-28 2xl:self-start">
          <div className="rounded-[26px] border border-white/8 bg-[#0d0f12] p-5 shadow-[0_24px_65px_rgba(0,0,0,.24)]">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">Quote summary</p><p className="mt-1 text-sm font-bold">{currentId}</p></div><FileText size={22} className="text-red-400" /></div>
            <div className="mt-5 space-y-3 border-y border-white/8 py-5 text-sm">
              <SummaryRow label="Labour" value={money.format(labourSubtotal)} />
              <SummaryRow label="Parts" value={money.format(partsSubtotal)} />
              <SummaryRow label="Subtotal" value={money.format(subtotal)} />
              <SummaryRow label="GST" value={money.format(gst)} muted />
            </div>
            <div className="flex items-end justify-between py-5"><div><p className="text-xs text-white/35">Total incl. GST</p><p className="mt-1 text-3xl font-black tracking-tight">{money.format(total)}</p></div><span className="text-xs font-bold text-white/25">AUD</span></div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] p-3.5"><div><p className="text-sm font-bold">Prices include GST</p><p className="mt-0.5 text-xs text-white/30">Use GST-inclusive line pricing</p></div><input type="checkbox" checked={gstIncluded} onChange={(event) => setGstIncluded(event.target.checked)} className="h-4 w-4 accent-red-600" /></label>
            <div className="mt-4"><Label text="Expiry date" /><div className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" /><input type="date" value={expiry} onChange={(event) => setExpiry(event.target.value)} className="h-11 w-full rounded-xl border border-white/8 bg-white/[0.025] pl-10 pr-3 text-sm text-white/70 outline-none focus:border-red-500/45" /></div></div>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-[#0d0f12] p-5">
            <p className="text-sm font-black">Customer sharing</p><p className="mt-1 text-xs leading-5 text-white/35">No SMS provider required. Copy the secure link or a ready-made message.</p>
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={copyLink} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-sm font-bold text-white/65 hover:bg-white/[0.07] hover:text-white"><Link2 size={17} /> Copy secure link</button>
              <button type="button" onClick={copyMessage} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-sm font-bold text-white/65 hover:bg-white/[0.07] hover:text-white"><Copy size={17} /> Copy message</button>
              <Link href={`/q/${token}`} target="_blank" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-sm font-bold text-white/65 hover:bg-white/[0.07] hover:text-white"><ExternalLink size={17} /> Customer preview</Link>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-[#0d0f12] p-5">
            <p className="text-sm font-black">Documents</p>
            <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-xs font-bold text-white/60 hover:text-white"><Printer size={16} /> Print</button><button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-xs font-bold text-white/60 hover:text-white"><Download size={16} /> PDF</button></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, subtitle, icon, action, children }: { title: string; subtitle: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-[26px] border border-white/8 bg-[#0d0f12] shadow-[0_22px_60px_rgba(0,0,0,.18)]"><div className="flex flex-col gap-4 border-b border-white/8 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">{icon}</div><div><h2 className="font-black">{title}</h2><p className="mt-0.5 text-xs text-white/35">{subtitle}</p></div></div>{action}</div><div className="p-5">{children}</div></section>;
}
function Label({ text }: { text: string }) { return <label className={`mb-2 block min-h-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white/28 ${!text ? 'invisible' : ''}`}>{text || 'Label'}</label>; }
function Field({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <div><Label text={label} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-white/8 bg-black/20 px-3.5 text-sm text-white/75 outline-none transition placeholder:text-white/20 focus:border-red-500/45 focus:bg-black/30" /></div>; }
function NumberField({ label, value, onChange, step = '1' }: { label: string; value: number; onChange: (value: number) => void; step?: string }) { return <div><Label text={label} /><input type="number" min="0" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11 w-full rounded-xl border border-white/8 bg-black/20 px-3 text-right text-sm text-white/75 outline-none focus:border-red-500/45" /></div>; }
function SummaryRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) { return <div className={`flex items-center justify-between ${muted ? 'text-white/38' : 'text-white/60'}`}><span>{label}</span><span className="font-bold text-white/80">{value}</span></div>; }
