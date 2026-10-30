'use client';

import Link from 'next/link';
import { CheckCircle2, Clock3, FileText, Phone, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type LabourLine = { id: string; description: string; hours: number; rate: number };
type PartLine = { id: string; part_number: string | null; description: string; quantity: number; unit_price: number };

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

export default function CustomerQuote({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [labour, setLabour] = useState<LabourLine[]>([]);
  const [parts, setParts] = useState<PartLine[]>([]);

  useEffect(() => {
    let active = true;

    async function loadQuote() {
      setLoading(true); setErrorMessage('');
      try {
        const response = await fetch(`/api/public/quotes/${encodeURIComponent(token)}`, { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Unable to load quote.');
        if (!active) return;
        setQuote(payload.quote);
        setLabour((payload.labour ?? []).map((line: any) => ({ ...line, hours:Number(line.hours), rate:Number(line.rate) })));
        setParts((payload.parts ?? []).map((line: any) => ({ ...line, quantity:Number(line.quantity), unit_price:Number(line.unit_price) })));
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load quote.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuote();
    return () => { active = false; };
  }, [token]);

  const labourSubtotal = useMemo(
    () => labour.reduce((sum, line) => sum + line.hours * line.rate, 0),
    [labour]
  );
  const partsSubtotal = useMemo(
    () => parts.reduce((sum, line) => sum + line.quantity * line.unit_price, 0),
    [parts]
  );

  async function respond(status: 'Approved' | 'Declined') {
    if (!quote?.id || actionLoading) return;
    setActionLoading(true); setErrorMessage('');
    try {
      const response = await fetch(`/api/public/quotes/${encodeURIComponent(token)}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to update quote.');
      setQuote((current:any)=>({...current,status:payload.status}));
    } catch(error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update quote.');
    } finally { setActionLoading(false); }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#08090b] px-4 text-white">
        <div className="text-center"><Clock3 className="mx-auto animate-pulse text-red-400" /><p className="mt-4 text-sm text-white/45">Loading your quote…</p></div>
      </main>
    );
  }

  if (errorMessage && !quote) {
    return (
      <main className="min-h-screen bg-[#08090b] px-4 py-12 text-white">
        <div className="mx-auto max-w-xl rounded-[30px] border border-white/10 bg-[#0d0f12] p-8 text-center shadow-2xl sm:p-12">
          <FileText className="mx-auto h-14 w-14 text-white/25" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-red-400">Quote unavailable</p>
          <h1 className="mt-3 text-3xl font-black">We couldn't open this quote</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-white/45">{errorMessage}</p>
          <Link href="/" className="mt-8 inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-bold text-white/60 hover:bg-white/5 hover:text-white">Return home</Link>
        </div>
      </main>
    );
  }

  const customerRow = quote?.customers as any;
  const vehicleRow = quote?.vehicles as any;
  const customerName = customerRow ? [customerRow.first_name, customerRow.last_name].filter(Boolean).join(' ') : 'Customer';
  const vehicleName = vehicleRow ? [vehicleRow.year, vehicleRow.make, vehicleRow.model].filter(Boolean).join(' ') : '';
  const status = quote?.status || 'Draft';
  const decided = status === 'Approved' || status === 'Declined';

  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[26px] border border-white/10 bg-[#0d0f12] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-400">J1 Motors Repair Quote</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">{quote.quote_number}</h1>
            <p className="mt-2 text-sm text-white/40">Prepared for {customerName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold">
            Status: <span className={status === 'Approved' ? 'text-emerald-400' : status === 'Declined' ? 'text-red-400' : 'text-amber-300'}>{status}</span>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</div>
        )}

        <section className="grid gap-5 md:grid-cols-2">
          <Card title="Vehicle">
            <p className="text-lg font-black">{vehicleName || 'Vehicle'}</p>
            <p className="mt-1 text-sm text-white/45">{vehicleRow?.registration || 'Registration unavailable'}</p>
          </Card>

          <Card title="Quote details">
            <p className="text-sm text-white/50">Expiry</p>
            <p className="mt-1 font-bold">{quote.expiry_date || 'Not specified'}</p>
          </Card>
        </section>

        {quote.diagnosis && (
          <section className="mt-5"><Card title="Diagnosis"><p className="whitespace-pre-wrap text-sm leading-7 text-white/65">{quote.diagnosis}</p></Card></section>
        )}

        {labour.length > 0 && (
          <section className="mt-5">
            <Card title="Labour">
              <div className="divide-y divide-white/8">
                {labour.map((line) => (
                  <div key={line.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0 last:pb-0">
                    <div><p className="font-bold">{line.description}</p><p className="mt-1 text-xs text-white/35">{line.hours} hr × {money.format(line.rate)}</p></div>
                    <p className="font-black">{money.format(line.hours * line.rate)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {parts.length > 0 && (
          <section className="mt-5">
            <Card title="Parts">
              <div className="divide-y divide-white/8">
                {parts.map((line) => (
                  <div key={line.id} className="grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0 last:pb-0">
                    <div><p className="font-bold">{line.description}</p><p className="mt-1 text-xs text-white/35">{line.part_number ? `${line.part_number} · ` : ''}Qty {line.quantity} × {money.format(line.unit_price)}</p></div>
                    <p className="font-black">{money.format(line.quantity * line.unit_price)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card title="Notes & terms">
            {quote.notes && <div><p className="text-xs font-bold uppercase tracking-wider text-white/30">Notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{quote.notes}</p></div>}
            <div className={quote.notes ? 'mt-5 border-t border-white/8 pt-5' : ''}>
              <p className="text-xs font-bold uppercase tracking-wider text-white/30">Terms</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{quote.terms || 'Please contact J1 Motors if you have any questions about this quote.'}</p>
            </div>
          </Card>

          <Card title="Quote total">
            <div className="space-y-3 text-sm">
              <Row label="Labour" value={money.format(labourSubtotal)} />
              <Row label="Parts" value={money.format(partsSubtotal)} />
              <Row label="Subtotal" value={money.format(Number(quote.subtotal || labourSubtotal + partsSubtotal))} />
              <Row label="GST" value={money.format(Number(quote.gst || 0))} muted />
            </div>
            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-xs text-white/35">Total incl. GST</p>
              <p className="mt-1 text-3xl font-black">{money.format(Number(quote.total || 0))}</p>
            </div>
          </Card>
        </section>

        <section className="mt-5 rounded-[26px] border border-white/10 bg-[#0d0f12] p-6">
          {decided ? (
            <div className="text-center">
              {status === 'Approved' ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" /> : <XCircle className="mx-auto h-12 w-12 text-red-400" />}
              <h2 className="mt-4 text-2xl font-black">Quote {status.toLowerCase()}</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/45">
                {status === 'Approved' ? 'Thank you. J1 Motors has received your approval.' : 'J1 Motors has received your response. Contact the workshop if you would like to discuss the quote.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-red-400" /><div><h2 className="font-black">Approve this repair quote?</h2><p className="mt-1 text-sm leading-6 text-white/40">Please review the work and total above before approving.</p></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button disabled={actionLoading} onClick={() => respond('Approved')} className="h-12 rounded-2xl bg-emerald-600 font-black hover:bg-emerald-500 disabled:opacity-50">Approve quote</button>
                <button disabled={actionLoading} onClick={() => respond('Declined')} className="h-12 rounded-2xl border border-red-500/30 bg-red-500/10 font-black text-red-300 hover:bg-red-500/20 disabled:opacity-50">Decline quote</button>
              </div>
            </>
          )}
        </section>

        <footer className="mt-6 flex flex-col items-center justify-between gap-3 text-center text-xs text-white/30 sm:flex-row sm:text-left">
          <p>J1 Motors · Belmont WA</p>
          <a href="tel:0497066771" className="inline-flex items-center gap-2 hover:text-white"><Phone size={14} />0497 066 771</a>
        </footer>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-[26px] border border-white/10 bg-[#0d0f12] p-6"><p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-white/30">{title}</p>{children}</div>;
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return <div className={`flex items-center justify-between ${muted ? 'text-white/40' : 'text-white/60'}`}><span>{label}</span><span className="font-bold text-white/85">{value}</span></div>;
}