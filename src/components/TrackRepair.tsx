"use client";

import { FormEvent, useState } from "react";
import { Search, ShieldCheck, Wrench } from "lucide-react";

const states = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "ACT", "NT"];
type SearchMode = "vehicle" | "booking";

export default function TrackRepair() {
  const [mode, setMode] = useState<SearchMode>("vehicle");
  const [registrationState, setRegistrationState] = useState("WA");
  const [registration, setRegistration] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (mode === "vehicle" && (!registration.trim() || !phone.trim())) {
      setError("Please enter the registration number and phone number.");
      return;
    }
    if (mode === "booking" && !bookingNumber.trim()) {
      setError("Please enter the booking number.");
      return;
    }
    setSearched(true);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050505] px-5 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-400"><Wrench size={16} /> Repair Status</span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Track Your Vehicle</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">Check the current stage of your repair using your vehicle details or booking number.</p>
        </div>

        {!searched ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/40 sm:p-8">
            <div className="mb-8 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/50 p-1.5">
              {(["vehicle", "booking"] as const).map((item) => (
                <button key={item} type="button" onClick={() => { setMode(item); setError(""); }} className={`rounded-xl px-4 py-3 text-sm font-bold transition sm:text-base ${mode === item ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"}`}>
                  {item === "vehicle" ? "Vehicle Details" : "Booking Number"}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "vehicle" ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
                    <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-300">Registration State</span><select value={registrationState} onChange={(e) => setRegistrationState(e.target.value)} className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-white outline-none">{states.map((state) => <option key={state}>{state}</option>)}</select></label>
                    <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-300">Registration Number</span><input value={registration} onChange={(e) => setRegistration(e.target.value.toUpperCase())} placeholder="Vehicle registration" className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 uppercase text-white outline-none" /></label>
                  </div>
                  <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-300">Phone Number</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number used for booking" inputMode="tel" autoComplete="tel" className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-white outline-none" /></label>
                </>
              ) : (
                <label className="block"><span className="mb-2 block text-sm font-semibold text-zinc-300">Booking Number</span><input value={bookingNumber} onChange={(e) => setBookingNumber(e.target.value.toUpperCase())} placeholder="Booking number" className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 uppercase text-white outline-none" /></label>
              )}
              {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
              <button type="submit" className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-black uppercase tracking-[0.12em] text-white hover:bg-red-700"><Search size={20} /> Track Repair</button>
            </form>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4 text-sm leading-6 text-zinc-500"><ShieldCheck className="mt-0.5 shrink-0" size={18} />Your phone number is used to verify the vehicle before repair information is displayed.</div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/90 p-8 text-center shadow-2xl shadow-black/40">
            <Search className="mx-auto text-zinc-600" size={36} />
            <h2 className="mt-5 text-2xl font-black">Repair tracking is not connected yet</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-zinc-400">Temporary repair records have been removed. Tracking results will appear after Supabase is connected.</p>
            <button type="button" onClick={() => { setSearched(false); setError(""); }} className="mt-7 h-12 rounded-xl border border-white/10 bg-white/[0.03] px-6 font-bold text-zinc-300 hover:bg-white/[0.06]">Back to search</button>
          </div>
        )}
      </div>
    </section>
  );
}
