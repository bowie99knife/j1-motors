'use client';

import {
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  CloudDownload,
  Copy,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  ReceiptText,
  RotateCcw,
  Save,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
} from 'lucide-react';
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type SectionId =
  | 'general'
  | 'workshop'
  | 'quotes'
  | 'invoices'
  | 'bookings'
  | 'messages'
  | 'users'
  | 'security';

type SettingsState = {
  workshopName: string;
  legalName: string;
  abn: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  labourRate: string;
  gstRate: string;
  openingHours: string;
  terms: string;
  logoDataUrl: string;
  quotePrefix: string;
  quoteNextNumber: string;
  quoteExpiryDays: string;
  quoteDefaultNotes: string;
  quoteTerms: string;
  invoicePrefix: string;
  invoiceNextNumber: string;
  invoicePaymentTerms: string;
  invoiceBankDetails: string;
  invoiceFooter: string;
  bookingPrefix: string;
  appointmentInterval: string;
  defaultDuration: string;
  bufferTime: string;
  maxDailyBookings: string;
  quoteMessage: string;
  readyMessage: string;
  bookingMessage: string;
  sessionTimeout: string;
};

const defaultSettings: SettingsState = {
  workshopName: 'J1 Motors Car Repairs',
  legalName: 'J1 Motors Car Repairs',
  abn: '',
  phone: '0497 066 771',
  email: 'j1motorscarrepairs@gmail.com',
  website: 'https://j1motors.netlify.app',
  address: '193 Campbell Street',
  suburb: 'Belmont',
  state: 'WA',
  postcode: '6104',
  labourRate: '165.00',
  gstRate: '10',
  openingHours: 'Monday–Friday, 8:30 AM–5:00 PM',
  terms:
    'Additional work will not be carried out without customer approval. Vehicles must be collected within the agreed collection window unless otherwise arranged.',
  logoDataUrl: '',
  quotePrefix: 'QT-',
  quoteNextNumber: '000154',
  quoteExpiryDays: '30',
  quoteDefaultNotes: 'Please contact us if you have any questions about this quote.',
  quoteTerms:
    'This quote is valid for the stated period and may change if additional faults or parts are identified after dismantling.',
  invoicePrefix: 'INV-',
  invoiceNextNumber: '000381',
  invoicePaymentTerms: 'Due on collection',
  invoiceBankDetails: 'Bank details will appear here when configured.',
  invoiceFooter: 'Payment is required before vehicle collection unless prior arrangements have been approved.',
  bookingPrefix: 'BK-',
  appointmentInterval: '30',
  defaultDuration: '60',
  bufferTime: '15',
  maxDailyBookings: '12',
  quoteMessage:
    'Hi {customer},\n\nYour repair quote for {vehicle} is ready.\n\nReview and approve it here:\n{quote_link}\n\nJ1 Motors\n0497 066 771',
  readyMessage:
    'Hi {customer}, your {vehicle} is ready for collection from J1 Motors. Please contact us if you need to arrange a collection time.',
  bookingMessage:
    'Hi {customer}, your booking for {vehicle} is confirmed for {booking_date} at {booking_time}.\n\nJ1 Motors\n0497 066 771',
  sessionTimeout: '60',
};

const sections: Array<{ id: SectionId; label: string; description: string; icon: typeof Building2 }> = [
  { id: 'general', label: 'General', description: 'Business identity and contact details', icon: Building2 },
  { id: 'workshop', label: 'Workshop', description: 'Address, rates and operating details', icon: Landmark },
  { id: 'quotes', label: 'Quotes', description: 'Numbering, expiry and customer terms', icon: FileText },
  { id: 'invoices', label: 'Invoices', description: 'Numbering, payment and bank details', icon: ReceiptText },
  { id: 'bookings', label: 'Bookings', description: 'Appointment rules and capacity', icon: CalendarClock },
  { id: 'messages', label: 'Message templates', description: 'Copy-ready customer messages', icon: MessageSquareText },
  { id: 'users', label: 'Users & roles', description: 'Prepare workshop access levels', icon: Users },
  { id: 'security', label: 'Security & data', description: 'Sessions, export and backup readiness', icon: ShieldCheck },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/80">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-5 text-white/35">{hint}</span>}
    </label>
  );
}

const inputClass =
  'h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-red-500/70 focus:bg-black/30 focus:ring-4 focus:ring-red-500/10';
const textareaClass =
  'min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-red-500/70 focus:bg-black/30 focus:ring-4 focus:ring-red-500/10';

function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#101216] shadow-[0_20px_80px_rgba(0,0,0,.22)]">
      <div className="border-b border-white/8 px-5 py-5 sm:px-7">
        <h2 className="text-lg font-black tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-white/40">{description}</p>}
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

export default function SettingsManager() {
  const [activeSection, setActiveSection] = useState<SectionId>('general');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<SettingsState>(defaultSettings);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('j1-workshop-settings');
    if (!saved) return;
    try {
      const parsed = { ...defaultSettings, ...JSON.parse(saved) } as SettingsState;
      setSettings(parsed);
      setSavedSettings(parsed);
    } catch {
      // Keep safe defaults if stored data is invalid.
    }
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);
  const currentSection = sections.find((section) => section.id === activeSection) ?? sections[0];
  const CurrentSectionIcon = currentSection.icon;

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    window.localStorage.setItem('j1-workshop-settings', JSON.stringify(settings));
    setSavedSettings(settings);
    setToast('Settings saved successfully');
    window.setTimeout(() => setToast(''), 2600);
  }

  function discardChanges() {
    setSettings(savedSettings);
    setToast('Unsaved changes discarded');
    window.setTimeout(() => setToast(''), 2200);
  }

  function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setToast('Logo must be smaller than 2 MB');
      window.setTimeout(() => setToast(''), 2600);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('logoDataUrl', String(reader.result ?? ''));
    reader.readAsDataURL(file);
  }

  async function copyTemplate(value: string) {
    await navigator.clipboard.writeText(value);
    setToast('Template copied');
    window.setTimeout(() => setToast(''), 1800);
  }

  function exportSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'j1-workshop-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pb-28">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            <UserCog size={16} /> System configuration
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            Manage workshop details, document defaults, customer messages and access preferences from one place.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
          <div className={`h-2.5 w-2.5 rounded-full ${dirty ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <div>
            <p className="text-xs font-bold text-white/75">{dirty ? 'Unsaved changes' : 'All changes saved'}</p>
            <p className="text-[11px] text-white/30">Stored locally until Supabase is connected</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[28px] border border-white/8 bg-[#101216] p-3 xl:sticky xl:top-28">
          <div className="px-3 pb-3 pt-2">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">Configuration</p>
          </div>
          <nav className="space-y-1.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    active ? 'bg-red-600 text-white shadow-[0_12px_30px_rgba(220,38,38,.18)]' : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? 'bg-white/15' : 'bg-white/[0.04]'}`}>
                    <Icon size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{section.label}</p>
                    <p className={`truncate text-[11px] ${active ? 'text-white/65' : 'text-white/28'}`}>{section.description}</p>
                  </div>
                  <ChevronRight size={17} className={`shrink-0 transition ${active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'}`} />
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="rounded-[28px] border border-white/8 bg-gradient-to-br from-white/[0.055] to-transparent p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-500/12 text-red-400">
                <CurrentSectionIcon size={23} />
              </div>
              <div>
                <h2 className="text-xl font-black">{currentSection.label}</h2>
                <p className="mt-1 text-sm text-white/40">{currentSection.description}</p>
              </div>
            </div>
          </div>

          {activeSection === 'general' && (
            <>
              <SectionCard title="Business identity" description="Used throughout quotes, invoices, customer pages and printed documents.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Workshop name"><input className={inputClass} value={settings.workshopName} onChange={(e) => update('workshopName', e.target.value)} /></Field>
                  <Field label="Legal business name"><input className={inputClass} value={settings.legalName} onChange={(e) => update('legalName', e.target.value)} /></Field>
                  <Field label="ABN" hint="Leave blank until the correct business ABN is confirmed."><input className={inputClass} placeholder="ABN" value={settings.abn} onChange={(e) => update('abn', e.target.value)} /></Field>
                  <Field label="Phone"><input className={inputClass} value={settings.phone} onChange={(e) => update('phone', e.target.value)} /></Field>
                  <Field label="Email"><input type="email" className={inputClass} value={settings.email} onChange={(e) => update('email', e.target.value)} /></Field>
                  <Field label="Website"><input className={inputClass} value={settings.website} onChange={(e) => update('website', e.target.value)} /></Field>
                </div>
              </SectionCard>
            </>
          )}

          {activeSection === 'workshop' && (
            <>
              <SectionCard title="Workshop logo" description="Used on customer quotes, invoices and printable documents.">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-[26px] border border-dashed border-white/15 bg-black/20">
                    {settings.logoDataUrl ? <img src={settings.logoDataUrl} alt="Workshop logo preview" className="h-full w-full object-contain p-3" /> : <ImageIcon size={34} className="text-white/20" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Upload a transparent PNG or JPG</p>
                    <p className="mt-1 max-w-lg text-xs leading-5 text-white/35">Recommended square image, maximum 2 MB. The preview is stored in this browser until cloud storage is connected.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogo} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-black transition hover:bg-white/90"><Upload size={17} /> Upload logo</button>
                      {settings.logoDataUrl && <button type="button" onClick={() => update('logoDataUrl', '')} className="h-11 rounded-2xl border border-white/10 px-4 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white">Remove</button>}
                    </div>
                  </div>
                </div>
              </SectionCard>
              <SectionCard title="Workshop location" description="Displayed on customer documents and contact information.">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2"><Field label="Street address"><input className={inputClass} value={settings.address} onChange={(e) => update('address', e.target.value)} /></Field></div>
                  <Field label="Suburb"><input className={inputClass} value={settings.suburb} onChange={(e) => update('suburb', e.target.value)} /></Field>
                  <Field label="State"><input className={inputClass} value={settings.state} onChange={(e) => update('state', e.target.value)} /></Field>
                  <Field label="Postcode"><input className={inputClass} value={settings.postcode} onChange={(e) => update('postcode', e.target.value)} /></Field>
                  <Field label="Business hours"><input className={inputClass} value={settings.openingHours} onChange={(e) => update('openingHours', e.target.value)} /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Rates and workshop defaults" description="These defaults will prefill quotes and invoices when connected.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Default labour rate" hint="Amount before GST, per hour."><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35">$</span><input inputMode="decimal" className={`${inputClass} pl-8`} value={settings.labourRate} onChange={(e) => update('labourRate', e.target.value)} /></div></Field>
                  <Field label="GST rate"><div className="relative"><input inputMode="decimal" className={`${inputClass} pr-10`} value={settings.gstRate} onChange={(e) => update('gstRate', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/35">%</span></div></Field>
                  <div className="md:col-span-2"><Field label="Default workshop terms"><textarea className={textareaClass} value={settings.terms} onChange={(e) => update('terms', e.target.value)} /></Field></div>
                </div>
              </SectionCard>
            </>
          )}

          {activeSection === 'quotes' && (
            <>
              <SectionCard title="Quote numbering" description="Controls how new quote references are generated.">
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Prefix"><input className={inputClass} value={settings.quotePrefix} onChange={(e) => update('quotePrefix', e.target.value)} /></Field>
                  <Field label="Next number"><input className={inputClass} value={settings.quoteNextNumber} onChange={(e) => update('quoteNextNumber', e.target.value)} /></Field>
                  <Field label="Default expiry"><div className="relative"><input className={`${inputClass} pr-14`} value={settings.quoteExpiryDays} onChange={(e) => update('quoteExpiryDays', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">days</span></div></Field>
                </div>
                <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[0.055] px-4 py-3 text-sm text-red-200/70">Next quote: <strong className="text-red-300">{settings.quotePrefix}{settings.quoteNextNumber}</strong></div>
              </SectionCard>
              <SectionCard title="Default quote content">
                <div className="space-y-5">
                  <Field label="Customer notes"><textarea className={textareaClass} value={settings.quoteDefaultNotes} onChange={(e) => update('quoteDefaultNotes', e.target.value)} /></Field>
                  <Field label="Terms and conditions"><textarea className={textareaClass} value={settings.quoteTerms} onChange={(e) => update('quoteTerms', e.target.value)} /></Field>
                </div>
              </SectionCard>
            </>
          )}

          {activeSection === 'invoices' && (
            <>
              <SectionCard title="Invoice numbering">
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Prefix"><input className={inputClass} value={settings.invoicePrefix} onChange={(e) => update('invoicePrefix', e.target.value)} /></Field>
                  <Field label="Next number"><input className={inputClass} value={settings.invoiceNextNumber} onChange={(e) => update('invoiceNextNumber', e.target.value)} /></Field>
                  <Field label="Payment terms"><select className={inputClass} value={settings.invoicePaymentTerms} onChange={(e) => update('invoicePaymentTerms', e.target.value)}><option>Due on collection</option><option>Due immediately</option><option>7 days</option><option>14 days</option><option>30 days</option></select></Field>
                </div>
                <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[0.055] px-4 py-3 text-sm text-red-200/70">Next invoice: <strong className="text-red-300">{settings.invoicePrefix}{settings.invoiceNextNumber}</strong></div>
              </SectionCard>
              <SectionCard title="Payment and footer details">
                <div className="space-y-5">
                  <Field label="Bank details"><textarea className={textareaClass} value={settings.invoiceBankDetails} onChange={(e) => update('invoiceBankDetails', e.target.value)} /></Field>
                  <Field label="Invoice footer"><textarea className={textareaClass} value={settings.invoiceFooter} onChange={(e) => update('invoiceFooter', e.target.value)} /></Field>
                </div>
              </SectionCard>
            </>
          )}

          {activeSection === 'bookings' && (
            <>
              <SectionCard title="Booking references and capacity" description="Set practical limits for the public booking form and workshop diary.">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Booking prefix"><input className={inputClass} value={settings.bookingPrefix} onChange={(e) => update('bookingPrefix', e.target.value)} /></Field>
                  <Field label="Appointment interval"><div className="relative"><input className={`${inputClass} pr-16`} value={settings.appointmentInterval} onChange={(e) => update('appointmentInterval', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">minutes</span></div></Field>
                  <Field label="Default duration"><div className="relative"><input className={`${inputClass} pr-16`} value={settings.defaultDuration} onChange={(e) => update('defaultDuration', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">minutes</span></div></Field>
                  <Field label="Buffer time"><div className="relative"><input className={`${inputClass} pr-16`} value={settings.bufferTime} onChange={(e) => update('bufferTime', e.target.value)} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35">minutes</span></div></Field>
                  <Field label="Maximum daily bookings"><input className={inputClass} value={settings.maxDailyBookings} onChange={(e) => update('maxDailyBookings', e.target.value)} /></Field>
                </div>
              </SectionCard>
              <SectionCard title="Workshop availability">
                <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <div className="flex items-center gap-3"><CalendarClock className="text-red-400" size={20} /><div><p className="text-sm font-bold">Current business hours</p><p className="mt-1 text-xs text-white/35">{settings.openingHours}</p></div></div>
                  <p className="mt-4 text-xs leading-5 text-white/30">Detailed day-by-day availability will connect to booking capacity when Supabase is implemented.</p>
                </div>
              </SectionCard>
            </>
          )}

          {activeSection === 'messages' && (
            <SectionCard title="Manual customer messages" description="These templates are copied to WhatsApp, SMS, Messenger or email. No SMS provider is required.">
              <div className="space-y-6">
                {[
                  { key: 'quoteMessage' as const, title: 'Quote ready message', icon: FileText },
                  { key: 'readyMessage' as const, title: 'Ready for collection message', icon: Bell },
                  { key: 'bookingMessage' as const, title: 'Booking confirmation message', icon: CalendarClock },
                ].map((template) => {
                  const Icon = template.icon;
                  return (
                    <div key={template.key} className="rounded-[24px] border border-white/8 bg-black/15 p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-400"><Icon size={18} /></div><h3 className="text-sm font-black">{template.title}</h3></div><button type="button" onClick={() => copyTemplate(settings[template.key])} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/55 transition hover:bg-white/5 hover:text-white"><Copy size={15} /> Copy</button></div>
                      <textarea className={`${textareaClass} min-h-40`} value={settings[template.key]} onChange={(e) => update(template.key, e.target.value)} />
                    </div>
                  );
                })}
                <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.055] px-4 py-3 text-xs leading-5 text-blue-100/60">Available placeholders: <strong>{'{customer}'}</strong>, <strong>{'{vehicle}'}</strong>, <strong>{'{quote_link}'}</strong>, <strong>{'{booking_date}'}</strong>, <strong>{'{booking_time}'}</strong>.</div>
              </div>
            </SectionCard>
          )}

          {activeSection === 'users' && (
            <>
              <SectionCard title="Workshop roles" description="Role controls are prepared for authentication. No access restrictions are enforced until the backend is connected.">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: 'Owner / Admin', description: 'Full workshop, settings, users and financial access.', count: 1, icon: KeyRound },
                    { name: 'Manager', description: 'Manage bookings, jobs, quotes, customers and vehicles.', count: 0, icon: UserCog },
                    { name: 'Mechanic', description: 'Access bookings, job cards, customer and vehicle history.', count: 2, icon: BookOpen },
                    { name: 'Reception', description: 'Manage bookings, customers, quotes and collection status.', count: 0, icon: Users },
                  ].map((role) => {
                    const Icon = role.icon;
                    return <div key={role.name} className="rounded-[24px] border border-white/8 bg-black/15 p-5"><div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.05] text-white/65"><Icon size={20} /></div><span className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1 text-[11px] font-bold text-white/40">{role.count} user{role.count === 1 ? '' : 's'}</span></div><h3 className="mt-4 text-sm font-black">{role.name}</h3><p className="mt-2 text-xs leading-5 text-white/35">{role.description}</p></div>;
                  })}
                </div>
              </SectionCard>
              <SectionCard title="Team access">
                <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-white/12 bg-black/10 p-6 text-center sm:items-center">
                  <LockKeyhole size={26} className="text-white/25" />
                  <div><p className="text-sm font-bold">User invitations activate with authentication</p><p className="mt-1 text-xs leading-5 text-white/30">This avoids creating fake accounts before Supabase Auth and permission rules are ready.</p></div>
                </div>
              </SectionCard>
            </>
          )}

          {activeSection === 'security' && (
            <>
              <SectionCard title="Session security">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Automatic sign-out"><select className={inputClass} value={settings.sessionTimeout} onChange={(e) => update('sessionTimeout', e.target.value)}><option value="30">After 30 minutes</option><option value="60">After 1 hour</option><option value="240">After 4 hours</option><option value="480">After 8 hours</option></select></Field>
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4"><div className="flex items-center gap-3 text-emerald-300"><ShieldCheck size={20} /><p className="text-sm font-bold">Security-ready structure</p></div><p className="mt-2 text-xs leading-5 text-emerald-100/45">Authentication, 2FA and audit logs will activate when the Supabase backend is connected.</p></div>
                </div>
              </SectionCard>
              <SectionCard title="Data export and backup" description="Download the current workshop configuration without changing project files.">
                <div className="grid gap-4 md:grid-cols-2">
                  <button type="button" onClick={exportSettings} className="group flex items-center gap-4 rounded-[24px] border border-white/8 bg-black/15 p-5 text-left transition hover:border-white/15 hover:bg-white/[0.035]"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-300"><CloudDownload size={22} /></div><div><p className="text-sm font-black">Export settings</p><p className="mt-1 text-xs leading-5 text-white/35">Download a JSON backup of this configuration.</p></div><ChevronRight className="ml-auto text-white/20 transition group-hover:translate-x-1 group-hover:text-white/50" size={18} /></button>
                  <div className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-black/15 p-5"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-white/40"><RotateCcw size={22} /></div><div><p className="text-sm font-black">Database backup</p><p className="mt-1 text-xs leading-5 text-white/35">Available after Supabase database integration.</p></div></div>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>

      <div className={`fixed bottom-0 right-0 z-40 border-t border-white/8 bg-[#0b0d10]/92 p-3 backdrop-blur-xl transition-all duration-300 lg:left-[272px] left-0`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-1 sm:px-5">
          <div className="hidden sm:block"><p className="text-xs font-bold text-white/65">{dirty ? 'You have unsaved changes' : 'Settings are up to date'}</p><p className="mt-0.5 text-[11px] text-white/25">Changes affect defaults across J1 Workshop OS.</p></div>
          <div className="ml-auto flex gap-3">
            <button type="button" disabled={!dirty} onClick={discardChanges} className="h-11 rounded-2xl border border-white/10 px-4 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30">Discard</button>
            <button type="button" disabled={!dirty} onClick={saveSettings} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-[0_12px_32px_rgba(220,38,38,.24)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-35"><Save size={17} /> Save changes</button>
          </div>
        </div>
      </div>

      {toast && <div className="fixed bottom-24 right-4 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-black shadow-2xl sm:right-7"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white"><Check size={14} strokeWidth={3} /></span>{toast}</div>}
    </div>
  );
}
