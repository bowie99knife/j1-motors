'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
type JobPhoto = { id: string; storage_path: string; file_name: string; url: string };

const PHOTO_URL_TTL_SECONDS = 3600;
const PHOTO_URL_REFRESH_MS = 45 * 60 * 1000;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const stages = ['Inspection', 'Diagnosis', 'Waiting Quote', 'Quote Approved', 'Repairing', 'Final Inspection', 'Ready Collection', 'Collected'];
const starterInspection: InspectionItem[] = [
  { id: 1, system: 'Engine', item: 'Engine oil', findings: '', priority: 'OK' },
  { id: 2, system: 'Drivetrains', item: 'Oil leaks', findings: '', priority: 'OK' },
  { id: 3, system: 'Cooling', item: 'Coolant condition', findings: '', priority: 'OK' },
  { id: 4, system: 'Cooling', item: 'Cooling system leaks', findings: '', priority: 'OK' },
  { id: 5, system: 'Brakes', item: 'Front brake pads', findings: '', priority: 'OK' },
  { id: 6, system: 'Brakes', item: 'Rear brake pads', findings: '', priority: 'OK' },
  { id: 7, system: 'Suspension', item: 'Suspension systems', findings: '', priority: 'OK' },
  { id: 8, system: 'Tires', item: 'Front Tires', findings: '', priority: 'OK' },
  { id: 9, system: 'Tires', item: 'Rear Tires', findings: '', priority: 'OK' },
];

export default function JobCardEditor({ jobId = 'NEW' }: { jobId?: string }) {
  const isNew = jobId === 'NEW';
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [repairNotes, setRepairNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [savingNow, setSavingNow] = useState(false);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [stage, setStage] = useState('Inspection');
  const [saved, setSaved] = useState(false);
  const [inspection, setInspection] = useState(starterInspection);
  const [parts, setParts] = useState<Line[]>([]);
  const [labour, setLabour] = useState<Line[]>([]);

  // Signed URLs are temporary; refresh them before they expire while this editor is open.
  useEffect(() => {
    if (isNew) return;
    let active = true;
    const refresh = async () => {
      const { data: rows, error } = await supabase
        .from('job_photos')
        .select('id, storage_path, file_name')
        .eq('job_card_id', jobId)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      const resolved = await Promise.all((rows ?? []).map(async (photo) => {
        const { data, error: signError } = await supabase.storage
          .from('job-photos')
          .createSignedUrl(photo.storage_path, PHOTO_URL_TTL_SECONDS);
        return { ...photo, url: signError ? '' : (data?.signedUrl ?? '') };
      }));
      if (active) {
        setPhotos(resolved);
        if (resolved.some(photo => !photo.url)) {
          setErrorMessage('Some private photo previews could not be loaded. Please refresh or sign in again.');
        }
      }
    };
    const timer = window.setInterval(refresh, PHOTO_URL_REFRESH_MS);
    return () => { active = false; window.clearInterval(timer); };
  }, [isNew, jobId]);

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

  useEffect(() => {
    let active = true;
    async function load() {
      if (isNew) {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, status, booking_date, booking_time, booking_type, customer_notes, customers(first_name,last_name,phone), vehicles(year,make,model,registration)')
          .order('booking_date', { ascending: false });
        if (!active) return;
        if (error) setErrorMessage(error.message);
        else {
          const available = (data ?? []).filter((b: any) => !['cancelled', 'canceled'].includes(String(b.status ?? '').trim().toLowerCase()));
          setBookings(available);
          const requested = new URLSearchParams(window.location.search).get('bookingId');
          if (requested) {
            if (available.some((b: any) => b.id === requested)) setBookingId(requested);
            else setErrorMessage('Selected booking was not found or was cancelled.');
          }
        }
        return;
      }

      const { data, error } = await supabase
        .from('job_cards')
        .select('id, booking_id, complaint, diagnosis, repair_notes, recommendations, internal_notes, labour_hours, status, bookings(customers(first_name,last_name,phone), vehicles(year,make,model,registration))')
        .eq('id', jobId)
        .single();

      if (!active) return;
      if (error) setErrorMessage(error.message);
      else {
        setJobInfo(data);
        setBookingId(data.booking_id || '');
        setComplaint(data.complaint || '');
        setDiagnosis(data.diagnosis || '');
        setRepairNotes(data.recommendations || data.repair_notes || '');
        setInternalNotes(data.internal_notes || '');
        setStage(data.status || 'Inspection');

        const [inspectionResult, partsResult, labourResult] = await Promise.all([
          supabase.from('job_inspections').select('id, system, item, findings, priority').eq('job_card_id', jobId).order('created_at'),
          supabase.from('job_parts').select('id, description, qty, price').eq('job_card_id', jobId).order('created_at'),
          supabase.from('job_labour').select('id, description, qty, price').eq('job_card_id', jobId).order('created_at'),
        ]);

        if (!active) return;

        if (inspectionResult.error) setErrorMessage(inspectionResult.error.message);
        else if ((inspectionResult.data ?? []).length > 0) {
          setInspection((inspectionResult.data ?? []).map((item: any, index: number) => ({
            id: index + 1,
            system: item.system,
            item: item.item,
            findings: item.findings || '',
            priority: (item.priority || 'OK') as Priority,
          })));
        }

        if (partsResult.error) setErrorMessage(partsResult.error.message);
        else setParts((partsResult.data ?? []).map((line: any, index: number) => ({
          id: index + 1,
          description: line.description,
          qty: Number(line.qty),
          price: Number(line.price),
        })));

        if (labourResult.error) setErrorMessage(labourResult.error.message);
        else setLabour((labourResult.data ?? []).map((line: any, index: number) => ({
          id: index + 1,
          description: line.description,
          qty: Number(line.qty),
          price: Number(line.price),
        })));

        const { data: photoRows, error: photoError } = await supabase
          .from('job_photos')
          .select('id, storage_path, file_name')
          .eq('job_card_id', jobId)
          .order('created_at', { ascending: false });

        if (photoError) setErrorMessage(photoError.message);
        else {
          const resolved = await Promise.all((photoRows ?? []).map(async (photo: any) => {
            const { data, error: signError } = await supabase.storage
              .from('job-photos')
              .createSignedUrl(photo.storage_path, PHOTO_URL_TTL_SECONDS);
            return { ...photo, url: signError ? '' : (data?.signedUrl ?? '') };
          }));
          if (!active) return;
          setPhotos(resolved);
          if (resolved.some((photo) => !photo.url)) {
            setErrorMessage('Some private photo previews could not be loaded. Please refresh or sign in again.');
          }
        }
      }
    }
    load();
    return () => { active = false; };
  }, [isNew, jobId]);

  async function save() {
    setSavingNow(true);
    setErrorMessage('');

    const labourHours = labour.reduce((sum, line) => sum + Number(line.qty || 0), 0);
    const payload = {
      booking_id: bookingId || null,
      complaint: complaint || null,
      diagnosis: diagnosis || null,
      repair_notes: repairNotes || null,
      recommendations: repairNotes || null,
      internal_notes: internalNotes || null,
      labour_hours: labourHours,
      status: stage,
      updated_at: new Date().toISOString(),
    };

    let targetJobId = jobId;

    if (isNew) {
      if (!bookingId) {
        setErrorMessage('Please select a booking first.');
        setSavingNow(false);
        return;
      }

      // Refuse duplicate job cards for the selected booking.
      const existing = await supabase.from('job_cards').select('id, job_number').eq('booking_id', bookingId).limit(1).maybeSingle();
      if (existing.error) {
        setErrorMessage(existing.error.message);
        setSavingNow(false);
        return;
      }
      if (existing.data) {
        setErrorMessage(`This booking already has job card ${existing.data.job_number || existing.data.id}. Open that job card instead of creating another.`);
        setSavingNow(false);
        return;
      }
      const { data, error } = await supabase
        .from('job_cards')
        .insert({ ...payload, job_number: `J1-J${Date.now().toString().slice(-8)}` })
        .select('id')
        .single();

      if (error) {
        setErrorMessage(error.message);
        setSavingNow(false);
        return;
      }

      targetJobId = data.id;
    } else {
      // Existing job cards must retain their database booking relationship.
      // Booking reassignment must be an explicit, separately verified action.
      const { booking_id: _originalBookingId, ...existingJobChanges } = payload;
      const { error } = await supabase.from('job_cards').update(existingJobChanges).eq('id', jobId);
      if (error) {
        setErrorMessage(error.message);
        setSavingNow(false);
        return;
      }
    }

    // Replace the child rows with the current editor state.
    const deleteResults = await Promise.all([
      supabase.from('job_inspections').delete().eq('job_card_id', targetJobId),
      supabase.from('job_parts').delete().eq('job_card_id', targetJobId),
      supabase.from('job_labour').delete().eq('job_card_id', targetJobId),
    ]);

    const deleteError = deleteResults.find((result) => result.error)?.error;
    if (deleteError) {
      setErrorMessage(deleteError.message);
      setSavingNow(false);
      return;
    }

    const inspectionRows = inspection.map((item) => ({
      job_card_id: targetJobId,
      system: item.system,
      item: item.item,
      findings: item.findings || null,
      priority: item.priority,
    }));
    const partRows = parts
      .filter((line) => line.description.trim())
      .map((line) => ({
        job_card_id: targetJobId,
        description: line.description.trim(),
        qty: Number(line.qty || 0),
        price: Number(line.price || 0),
      }));
    const labourRows = labour
      .filter((line) => line.description.trim())
      .map((line) => ({
        job_card_id: targetJobId,
        description: line.description.trim(),
        qty: Number(line.qty || 0),
        price: Number(line.price || 0),
      }));

    const inserts = await Promise.all([
      inspectionRows.length ? supabase.from('job_inspections').insert(inspectionRows) : Promise.resolve({ error: null }),
      partRows.length ? supabase.from('job_parts').insert(partRows) : Promise.resolve({ error: null }),
      labourRows.length ? supabase.from('job_labour').insert(labourRows) : Promise.resolve({ error: null }),
    ]);

    const insertError = inserts.find((result: any) => result.error)?.error;
    if (insertError) {
      setErrorMessage(insertError.message);
      setSavingNow(false);
      return;
    }

    setSavingNow(false);
    setSaved(true);

    if (isNew) {
      router.push(`/admin/job-cards/${targetJobId}`);
      return;
    }

    window.setTimeout(() => setSaved(false), 1800);
  }

  async function uploadPhotos(files: FileList | null) {
    if (!files?.length) return;

    if (isNew) {
      setErrorMessage('Save the new job card first, then upload workshop photos.');
      return;
    }

    setUploadingPhotos(true);
    setErrorMessage('');

    try {
      const uploaded: JobPhoto[] = [];

      for (const file of Array.from(files)) {
        if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
          throw new Error(`${file.name}: only JPEG, PNG and WebP photos are allowed.`);
        }
        if (file.size > MAX_PHOTO_BYTES) {
          throw new Error(`${file.name}: photo must be 10 MB or smaller.`);
        }

        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${jobId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        const { data: row, error: rowError } = await supabase
          .from('job_photos')
          .insert({
            job_card_id: jobId,
            storage_path: storagePath,
            file_name: file.name,
          })
          .select('id, storage_path, file_name')
          .single();

        if (rowError) {
          await supabase.storage.from('job-photos').remove([storagePath]);
          throw rowError;
        }

        const { data: signed, error: signError } = await supabase.storage
          .from('job-photos')
          .createSignedUrl(storagePath, PHOTO_URL_TTL_SECONDS);
        if (signError || !signed?.signedUrl) {
          // The photo is saved. Do not delete it if preview signing fails.
          uploaded.push({ ...row, url: '' });
          setErrorMessage('Photo uploaded, but its private preview is unavailable. Refresh after signing in again.');
        } else {
          uploaded.push({ ...row, url: signed.signedUrl });
        }
      }

      setPhotos((current) => [...uploaded, ...current]);
    } catch (error) {
      console.error('Workshop photo upload failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to upload workshop photo.');
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function deletePhoto(photo: JobPhoto) {
    if (!window.confirm(`Delete ${photo.file_name}?`)) return;

    setErrorMessage('');
    const { error: storageError } = await supabase.storage.from('job-photos').remove([photo.storage_path]);
    if (storageError) {
      setErrorMessage(storageError.message);
      return;
    }

    const { error: rowError } = await supabase.from('job_photos').delete().eq('id', photo.id);
    if (rowError) {
      setErrorMessage(rowError.message);
      return;
    }

    setPhotos((current) => current.filter((item) => item.id !== photo.id));
  }

  const selectedBooking = bookings.find((booking) => booking.id === bookingId);
  const linked = isNew ? selectedBooking : jobInfo?.bookings;
  const linkedCustomer = linked?.customers;
  const linkedVehicle = linked?.vehicles;
  const customerName = linkedCustomer ? [linkedCustomer.first_name, linkedCustomer.last_name].filter(Boolean).join(' ') : '—';
  const vehicleName = linkedVehicle ? [linkedVehicle.year, linkedVehicle.make, linkedVehicle.model].filter(Boolean).join(' ') : '—';

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
          <button onClick={save} disabled={savingNow} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black hover:bg-white/[0.08] disabled:opacity-50">{saved ? <Check size={17} className="text-emerald-300" /> : <Save size={17} />} {saved ? 'Saved' : 'Save draft'}</button>
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black hover:bg-white/[0.08]"><Printer size={17} /> Print</button>
          <Link href={isNew ? "#" : `/admin/quotes/new?jobCardId=${jobId}`} aria-disabled={isNew} className={`inline-flex h-11 items-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-black shadow-[0_12px_35px_rgba(220,38,38,.22)] hover:bg-red-500 ${isNew ? "pointer-events-none opacity-50" : ""}`}><Send size={17} /> Create quote</Link>
        </div>
      </section>

      {errorMessage && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">Supabase error: {errorMessage}</div>}

      {isNew && (
        <section className="rounded-[28px] border border-white/8 bg-[#101216] p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-400">Start from booking</p>
          <select value={bookingId} onChange={(e) => {
            const id = e.target.value;
            setBookingId(id);
            const booking = bookings.find((item) => item.id === id);
            if (booking?.customer_notes) setComplaint(booking.customer_notes);
          }} className="mt-3 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm font-black outline-none focus:border-red-500/50">
            <option value="" className="bg-[#111318]">Select booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id} className="bg-[#111318]">
                {booking.booking_date} {booking.booking_time} · {[booking.customers?.first_name, booking.customers?.last_name].filter(Boolean).join(' ')} · {booking.vehicles?.registration}
              </option>
            ))}
          </select>
        </section>
      )}

      <section className="grid gap-5 2xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/8 bg-[#101216] p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <Info label="Customer" value={customerName} icon={UserRound} />
                <Info label="Phone" value={linkedCustomer?.phone || "—"} />
                <Info label="Vehicle" value={vehicleName} />
                <Info label="Registration" value={linkedVehicle?.registration || "—"} />
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
            <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} className="min-h-32 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none placeholder:text-white/20 focus:border-red-500/45" />
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
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="min-h-36 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none focus:border-red-500/45" />
          </Card>

          <LineCard title="Parts" lines={parts} kind="parts" onUpdate={updateLine} onAdd={addLine} onRemove={(id) => setParts((items) => items.filter((item) => item.id !== id))} />
          <LineCard title="Labour" lines={labour} kind="labour" onUpdate={updateLine} onAdd={addLine} onRemove={(id) => setLabour((items) => items.filter((item) => item.id !== id))} />

          <Card title="Recommendations" icon={ClipboardCheck} subtitle="Customer-facing recommendations written by the mechanic.">
            <textarea value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)} className="min-h-28 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none focus:border-red-500/45" />
          </Card>

          <Card title="Internal notes" icon={FileText} subtitle="Workshop only. Never shown on the customer tracking page.">
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Write private workshop notes..." className="min-h-28 w-full rounded-2xl border border-white/8 bg-black/25 p-4 text-sm leading-6 outline-none placeholder:text-white/18 focus:border-red-500/45" />
          </Card>

          <Card title="Workshop photos" icon={Camera} subtitle="Internal job-card evidence only. Customers cannot see these photos.">
            <label className={`grid min-h-36 place-items-center rounded-2xl border border-dashed border-white/12 bg-black/20 text-center transition ${isNew || uploadingPhotos ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-red-500/35 hover:bg-red-950/10'}`}>
              <div>
                <Camera className="mx-auto text-white/25" />
                <p className="mt-3 text-sm font-black">{uploadingPhotos ? 'Uploading photos…' : 'Add workshop photos'}</p>
                <p className="mt-1 text-xs text-white/28">{isNew ? 'Save this job card first before adding photos' : 'Inspection, failed parts or completed repairs'}</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={isNew || uploadingPhotos}
                onChange={(event) => {
                  uploadPhotos(event.target.files);
                  event.currentTarget.value = '';
                }}
                className="hidden"
              />
            </label>

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-white/8 bg-black/25">
                    {photo.url ? (
                      <a href={photo.url} target="_blank" rel="noreferrer" className="block aspect-square">
                        <img src={photo.url} alt={photo.file_name} className="h-full w-full object-cover" />
                      </a>
                    ) : (
                      <div className="flex aspect-square items-center justify-center p-3 text-center text-xs text-white/50">
                        Private preview unavailable. Refresh to retry.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => deletePhoto(photo)}
                      className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-xl bg-black/75 text-white/65 backdrop-blur hover:bg-red-600 hover:text-white"
                      aria-label={`Delete ${photo.file_name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                    <p className="truncate border-t border-white/7 px-3 py-2 text-[10px] text-white/35">{photo.file_name}</p>
                  </div>
                ))}
              </div>
            )}
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
              <Link href={isNew ? "#" : `/admin/quotes/new?jobCardId=${jobId}`} aria-disabled={isNew} className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-sm font-black hover:bg-red-500 ${isNew ? "pointer-events-none opacity-50" : ""}`}><Send size={17} /> Create customer quote</Link>
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
        <p className="hidden px-2 text-xs font-bold text-white/35 md:block">Changes save to Supabase</p>
        <button onClick={save} disabled={savingNow} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-black hover:bg-white/[0.09] disabled:opacity-50 md:flex-none"><Save size={17} /> {savingNow ? 'Saving…' : 'Save'}</button>
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