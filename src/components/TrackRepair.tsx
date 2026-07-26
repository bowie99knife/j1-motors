"use client";

import { FormEvent, useState } from "react";
import {
  CalendarClock,
  Car,
  Check,
  Circle,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const stages = [
  "Booking Received",
  "Vehicle Received",
  "Inspection Completed",
  "Waiting for Approval",
  "Repair In Progress",
  "Final Inspection",
  "Ready for Collection",
  "Vehicle Collected",
];

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

  const currentStageIndex = 4;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "vehicle") {
      if (!registration.trim() || !phone.trim()) {
        setError("Please enter the registration number and phone number.");
        return;
      }
    } else if (!bookingNumber.trim()) {
      setError("Please enter the booking number.");
      return;
    }

    setSearched(true);
  };

  const resetSearch = () => {
    setSearched(false);
    setError("");
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050505] px-5 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-red-700/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-400">
            <Wrench size={16} /> Repair Status
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Track Your Vehicle
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Check the current stage of your repair using your vehicle details or booking number.
          </p>
        </div>

        {!searched ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
            <div className="mb-8 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/50 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode("vehicle");
                  setError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition sm:text-base ${
                  mode === "vehicle"
                    ? "bg-red-600 text-white shadow-lg shadow-red-950/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Vehicle Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("booking");
                  setError("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-bold transition sm:text-base ${
                  mode === "booking"
                    ? "bg-red-600 text-white shadow-lg shadow-red-950/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Booking Number
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "vehicle" ? (
                <>
                  <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-300">
                        Registration State
                      </span>
                      <select
                        value={registrationState}
                        onChange={(event) => setRegistrationState(event.target.value)}
                        className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      >
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-zinc-300">
                        Registration Number
                      </span>
                      <input
                        value={registration}
                        onChange={(event) => setRegistration(event.target.value.toUpperCase())}
                        placeholder="1ABC234"
                        autoComplete="off"
                        className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 uppercase text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-zinc-300">
                      Phone Number
                    </span>
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="04XX XXX XXX"
                      inputMode="tel"
                      autoComplete="tel"
                      className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    />
                    <span className="mt-2 block text-xs leading-5 text-zinc-500">
                      Use the phone number provided when the booking was made.
                    </span>
                  </label>
                </>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-300">
                    Booking Number
                  </span>
                  <input
                    value={bookingNumber}
                    onChange={(event) => setBookingNumber(event.target.value.toUpperCase())}
                    placeholder="J1-000154"
                    autoComplete="off"
                    className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 uppercase text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </label>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <Search size={20} /> Track Repair
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-4 text-sm leading-6 text-zinc-500">
              <ShieldCheck className="mt-0.5 shrink-0 text-zinc-400" size={18} />
              Your phone number is used to verify the vehicle before repair information is displayed.
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl shadow-black/40">
              <div className="border-b border-white/10 bg-gradient-to-r from-red-950/45 via-zinc-950 to-zinc-950 p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400">
                      <Car size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Vehicle
                      </p>
                      <h2 className="mt-1 text-2xl font-black sm:text-3xl">Toyota Camry</h2>
                      <p className="mt-1 text-zinc-400">WA • {registration || "1ABC234"}</p>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm text-zinc-500">Booking Number</p>
                    <p className="mt-1 font-bold tracking-wide text-white">
                      {bookingNumber || "J1-000154"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.08] p-6 sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-950/50">
                      <Wrench size={30} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-red-400">
                        Current Stage
                      </p>
                      <h3 className="mt-2 text-3xl font-black">Repair In Progress</h3>
                      <p className="mt-3 max-w-2xl leading-7 text-zinc-300">
                        Our technician is currently carrying out the approved repairs on your vehicle.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <ClipboardCheck className="text-red-500" size={24} />
                  <h3 className="text-xl font-black">Repair Progress</h3>
                </div>

                <div>
                  {stages.map((stage, index) => {
                    const completed = index < currentStageIndex;
                    const current = index === currentStageIndex;
                    const last = index === stages.length - 1;

                    return (
                      <div key={stage} className="relative flex gap-4">
                        {!last && (
                          <div
                            className={`absolute left-[15px] top-8 h-[calc(100%-4px)] w-px ${
                              completed ? "bg-red-600" : "bg-white/10"
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                            completed
                              ? "border-red-600 bg-red-600 text-white"
                              : current
                                ? "border-red-500 bg-red-500/15 text-red-400 ring-4 ring-red-500/10"
                                : "border-white/15 bg-zinc-950 text-zinc-700"
                          }`}
                        >
                          {completed ? <Check size={17} strokeWidth={3} /> : <Circle size={10} fill="currentColor" />}
                        </div>
                        <div className={`pb-7 ${last ? "pb-0" : ""}`}>
                          <p
                            className={`font-bold ${
                              current ? "text-red-400" : completed ? "text-white" : "text-zinc-600"
                            }`}
                          >
                            {stage}
                          </p>
                          {current && (
                            <p className="mt-1 text-sm text-zinc-500">Current workshop stage</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="text-red-500" size={23} />
                    <h3 className="text-lg font-black">Estimated Completion</h3>
                  </div>
                  <p className="mt-5 text-2xl font-black">To Be Confirmed</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    J1 Motors will update this when an accurate completion time is available.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6">
                  <h3 className="text-lg font-black">Need Assistance?</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Contact the workshop and quote your booking number for help with your repair.
                  </p>
                  <a
                    href="tel:0497066771"
                    className="mt-5 flex h-12 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 font-bold text-red-400 transition hover:bg-red-500/15"
                  >
                    Call 0497 066 771
                  </a>
                </div>

                <button
                  type="button"
                  onClick={resetSearch}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Track Another Vehicle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
