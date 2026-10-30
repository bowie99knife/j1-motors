'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Customer = { id:string; first_name:string; last_name:string|null; phone:string; email:string|null; address:string|null; notes:string|null; created_at:string|null };
type Vehicle = { id:string; registration:string; year:number|null; make:string|null; model:string|null };
type Booking = { id:string; booking_number:string|null; booking_date:string|null; booking_type:string|null; status:string|null; vehicle_id:string|null };
type Job = { id:string; job_number:string|null; status:string|null; booking_id:string|null };
type Quote = { id:string; quote_number:string|null; status:string|null; total:number|null; created_at:string|null };
export default function CustomerProfile({id}:{id:string}) {
 const [customer,setCustomer]=useState<Customer|null>(null);
 const [vehicles,setVehicles]=useState<Vehicle[]>([]);
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [jobs,setJobs]=useState<Job[]>([]);
 const [quotes,setQuotes]=useState<Quote[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [editing,setEditing]=useState(false);
 const [error,setError]=useState('');
 const [form,setForm]=useState({first_name:'',last_name:'',phone:'',email:'',address:'',notes:''});
 useEffect(()=>{let active=true;async function load(){
  setLoading(true);setError('');
  const [c,v,b,q]=await Promise.all([
   supabase.from('customers').select('id,first_name,last_name,phone,email,address,notes,created_at').eq('id',id).maybeSingle(),
   supabase.from('vehicles').select('id,registration,year,make,model').eq('customer_id',id),
   supabase.from('bookings').select('id,booking_number,booking_date,booking_type,status,vehicle_id').eq('customer_id',id).order('booking_date',{ascending:false}),
   supabase.from('quotes').select('id,quote_number,status,total,created_at').eq('customer_id',id).order('created_at',{ascending:false})
  ]);
  if(!active)return;
  if(c.error||!c.data){setError(c.error?.message||'Customer not found');setLoading(false);return;}
  const record=c.data as Customer;setCustomer(record);
  setForm({first_name:record.first_name||'',last_name:record.last_name||'',phone:record.phone||'',email:record.email||'',address:record.address||'',notes:record.notes||''});
  if(v.error)setError(v.error.message);else setVehicles(v.data||[]);
  if(b.error)setError(b.error.message);else setBookings(b.data||[]);
  if(q.error)setError(q.error.message);else setQuotes(q.data||[]);
  if(b.data?.length){
   const ids=b.data.map(x=>x.id);
   const j=await supabase.from('job_cards').select('id,job_number,status,booking_id').in('booking_id',ids);
   if(!active)return;
   if(j.error)setError(j.error.message);else setJobs(j.data||[]);
  }
  setLoading(false);
 }load();return()=>{active=false}},[id]);
 async function save(){
  if(!customer||saving)return;
  if(!form.first_name.trim()||!form.phone.trim()){setError('Name and phone are required.');return}
  setSaving(true);setError('');
  const patch={first_name:form.first_name.trim(),last_name:form.last_name.trim()||null,phone:form.phone.trim(),email:form.email.trim()||null,address:form.address.trim()||null,notes:form.notes.trim()||null};
  const {data,error:e}=await supabase.from('customers').update(patch).eq('id',id).select('id,first_name,last_name,phone,email,address,notes,created_at').single();
  setSaving(false);
  if(e){setError(e.message);return}
  setCustomer(data as Customer);setEditing(false);
 }
 const field=(label:string,key:keyof typeof form,multi=false)=><label className="block text-sm text-white/60">{label}{multi?<textarea value={form[key]} onChange={e=>setForm(x=>({...x,[key]:e.target.value}))} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b20] p-3 text-white"/>:<input value={form[key]} onChange={e=>setForm(x=>({...x,[key]:e.target.value}))} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b20] p-3 text-white"/>}</label>;
 return <div className="space-y-6 pb-12">
 <Link href="/admin/customers" className="text-sm text-white/60 hover:text-white">← Back to customers</Link>
 {loading?<p>Loading customer…</p>:!customer?<p role="alert" className="text-red-300">{error||'Customer not found'}</p>:<>
 <section className="rounded-3xl border border-white/10 bg-[#0f1115] p-6">
 <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-red-400">Customer profile</p><h1 className="mt-2 text-3xl font-black">{customer.first_name} {customer.last_name||''}</h1><p className="mt-3 text-white/60">{customer.phone} · {customer.email||'No email'}</p><p className="mt-1 text-white/50">{customer.address||'No address recorded'}</p></div><button onClick={()=>setEditing(x=>!x)} className="rounded-xl bg-red-600 px-5 py-3 font-bold">{editing?'Close editor':'Edit customer'}</button></div>
 {editing&&<div className="mt-6 grid gap-4 sm:grid-cols-2">{field('First name', 'first_name')}{field('Last name','last_name')}{field('Phone','phone')}{field('Email','email')}{field('Address','address')}<div className="sm:col-span-2">{field('Workshop notes','notes',true)}</div><button onClick={save} disabled={saving} className="rounded-xl bg-red-600 px-5 py-3 font-bold disabled:opacity-50">{saving?'Saving…':'Save customer'}</button></div>}
 {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
 </section>
 <section className="grid gap-4 sm:grid-cols-3">{[['Vehicles',vehicles.length],['Bookings',bookings.length],['Job cards',jobs.length]].map(([label,count])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-white/50">{label}</p><p className="mt-2 text-3xl font-bold">{count}</p></div>)}</section>
 <section className="rounded-3xl border border-white/10 p-6"><h2 className="mb-4 text-xl font-bold">Vehicles</h2>{vehicles.length?vehicles.map(v=><Link key={v.id} href={'/admin/vehicles/'+v.id} className="block border-t border-white/10 py-3 hover:text-red-300">{v.registration} · {[v.year,v.make,v.model].filter(Boolean).join(' ')}</Link>):<p className="text-white/50">No linked vehicles</p>}</section>
 <section className="rounded-3xl border border-white/10 p-6"><h2 className="mb-4 text-xl font-bold">Booking & repair history</h2>{bookings.length?bookings.map(b=><div key={b.id} className="border-t border-white/10 py-4"><p className="font-semibold">{b.booking_number||b.id} · {b.booking_date||'No date'}</p><p className="text-sm text-white/50">{b.booking_type||'Service'} · {b.status||'Unknown status'}</p>{jobs.filter(j=>j.booking_id===b.id).map(j=><Link key={j.id} href={'/admin/job-cards/'+j.id} className="mt-2 block text-sm text-red-300">Job {j.job_number||j.id} · {j.status}</Link>)}</div>):<p className="text-white/50">No booking history</p>}</section>
 <section className="rounded-3xl border border-white/10 p-6"><h2 className="mb-4 text-xl font-bold">Quotes</h2>{quotes.length?quotes.map(q=><Link key={q.id} href={'/admin/quotes/'+q.id} className="block border-t border-white/10 py-3 hover:text-red-300">{q.quote_number||q.id} · {q.status||'Draft'} · {q.total==null?'—':new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(q.total)}</Link>):<p className="text-white/50">No quotes</p>}</section>
 <section className="rounded-3xl border border-white/10 p-6"><h2 className="font-bold">Workshop notes</h2><p className="mt-3 whitespace-pre-wrap text-white/60">{customer.notes||'No notes recorded'}</p></section>
 </>}
 </div>;
}
