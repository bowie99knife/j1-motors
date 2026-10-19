'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Vehicle = {id:string;customer_id:string|null;registration:string;state:string|null;vin:string|null;year:number|null;make:string|null;model:string|null;engine:string|null;transmission:string|null;colour:string|null;odometer:number|null};
type Booking = {id:string;booking_number:string|null;booking_date:string|null;booking_type:string|null;status:string|null};
type Job = {id:string;job_number:string|null;status:string|null;booking_id:string|null;complaint:string|null;diagnosis:string|null;repair_notes:string|null};
export default function VehicleProfile({id}:{id:string}){
 const [vehicle,setVehicle]=useState<Vehicle|null>(null);
 const [owner,setOwner]=useState<{id:string;first_name:string;last_name:string|null;phone:string}|null>(null);
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [jobs,setJobs]=useState<Job[]>([]);
 const [editing,setEditing]=useState(false);
 const [saving,setSaving]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [form,setForm]=useState({registration:'',state:'',vin:'',year:'',make:'',model:'',engine:'',transmission:'',colour:'',odometer:''});
 useEffect(()=>{let active=true;async function load(){
  setLoading(true);setError('');
  const v=await supabase.from('vehicles').select('id,customer_id,registration,state,vin,year,make,model,engine,transmission,colour,odometer').eq('id',id).maybeSingle();
  if(!active)return;
  if(v.error||!v.data){setError(v.error?.message||'Vehicle not found');setLoading(false);return;}
  const r=v.data as Vehicle;setVehicle(r);
  setForm({registration:r.registration||'',state:r.state||'',vin:r.vin||'',year:String(r.year??''),make:r.make||'',model:r.model||'',engine:r.engine||'',transmission:r.transmission||'',colour:r.colour||'',odometer:String(r.odometer??'')});
  const [b,c]=await Promise.all([
   supabase.from('bookings').select('id,booking_number,booking_date,booking_type,status').eq('vehicle_id',id).order('booking_date',{ascending:false}),
   r.customer_id?supabase.from('customers').select('id,first_name,last_name,phone').eq('id',r.customer_id).maybeSingle():Promise.resolve({data:null,error:null})
  ]);
  if(!active)return;
  if(b.error)setError(b.error.message);else setBookings(b.data||[]);
  if(c.error)setError(c.error.message);else setOwner(c.data);
  if(b.data?.length){
   const j=await supabase.from('job_cards').select('id,job_number,status,booking_id,complaint,diagnosis,repair_notes').in('booking_id',b.data.map(x=>x.id));
   if(!active)return;
   if(j.error)setError(j.error.message);else setJobs(j.data||[]);
  }
  setLoading(false);
 }load();return()=>{active=false}},[id]);
 async function save(){
  if(!vehicle||saving)return;
  if(!form.registration.trim()){setError('Registration is required');return;}
  setSaving(true);setError('');
  const patch={registration:form.registration.trim().toUpperCase(),state:form.state||null,vin:form.vin||null,year:form.year?Number(form.year):null,make:form.make||null,model:form.model||null,engine:form.engine||null,transmission:form.transmission||null,colour:form.colour||null,odometer:form.odometer?Number(form.odometer):null};
  const {data,error:e}=await supabase.from('vehicles').update(patch).eq('id',id).select('id,customer_id,registration,state,vin,year,make,model,engine,transmission,colour,odometer').single();
  setSaving(false);
  if(e){setError(e.message);return;}setVehicle(data as Vehicle);setEditing(false);
 }
 const field=(label:string,key:keyof typeof form)=><label className="block text-sm text-white/60">{label}<input value={form[key]} onChange={e=>setForm(x=>({...x,[key]:e.target.value}))} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b20] p-3 text-white"/></label>;
 return <div className="space-y-6 pb-12">
 <Link href="/admin/vehicles" className="text-sm text-white/60 hover:text-white">← Back to vehicles</Link>
 {loading?<p>Loading vehicle…</p>:!vehicle?<p role="alert" className="text-red-300">{error||'Vehicle not found'}</p>:<>
 <section className="rounded-3xl border border-white/10 bg-[#0f1115] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-red-400">Vehicle profile</p><h1 className="mt-2 text-3xl font-black">{vehicle.registration}</h1><p className="mt-2 text-white/60">{[vehicle.year,vehicle.make,vehicle.model].filter(Boolean).join(' ')}</p><p className="mt-2 text-sm text-white/50">VIN: {vehicle.vin||'Not recorded'} · Odometer: {vehicle.odometer==null?'Not recorded':vehicle.odometer.toLocaleString('en-AU')+' km'}</p></div><button onClick={()=>setEditing(x=>!x)} className="rounded-xl bg-red-600 px-5 py-3 font-bold">{editing?'Close editor':'Edit vehicle'}</button></div>
 {editing&&<div className="mt-6 grid gap-4 sm:grid-cols-2">{field('Registration','registration')}{field('State','state')}{field('VIN','vin')}{field('Year','year')}{field('Make','make')}{field('Model','model')}{field('Engine','engine')}{field('Transmission','transmission')}{field('Colour','colour')}{field('Odometer (km)','odometer')}<button onClick={save} disabled={saving} className="rounded-xl bg-red-600 px-5 py-3 font-bold disabled:opacity-50">{saving?'Saving…':'Save vehicle'}</button></div>}
 {error&&<p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}</section>
 <section className="rounded-3xl border border-white/10 p-6"><h2 className="mb-3 text-xl font-bold">Owner</h2>{owner?<Link href={'/admin/customers/'+owner.id} className="text-red-300 hover:underline">{owner.first_name} {owner.last_name||''} · {owner.phone}</Link>:<p className="text-white/50">No owner linked</p>}</section>
 <section className="rounded-3xl border border-white/10 p-6"><h2 className="mb-3 text-xl font-bold">Complete visit history</h2>{bookings.length?bookings.map(b=><div key={b.id} className="border-t border-white/10 py-4"><p className="font-semibold">{b.booking_number||b.id} · {b.booking_date||'No date'}</p><p className="text-sm text-white/50">{b.booking_type||'Service'} · {b.status||'Unknown status'}</p>{jobs.filter(j=>j.booking_id===b.id).map(j=><div key={j.id} className="mt-3 rounded-xl bg-white/[.035] p-4"><Link href={'/admin/job-cards/'+j.id} className="font-semibold text-red-300 hover:underline">{j.job_number||j.id} · {j.status}</Link>{j.complaint&&<p className="mt-2 text-sm text-white/60">Complaint: {j.complaint}</p>}{j.diagnosis&&<p className="mt-1 text-sm text-white/60">Diagnosis: {j.diagnosis}</p>}{j.repair_notes&&<p className="mt-1 whitespace-pre-wrap text-sm text-white/60">Repair: {j.repair_notes}</p>}</div>)}</div>):<p className="text-white/50">No visits recorded</p>}</section>
 </>}</div>;
}
