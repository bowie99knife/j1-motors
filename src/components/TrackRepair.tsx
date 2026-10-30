
"use client";

import { FormEvent, useState } from "react";
import { Search, ShieldCheck, Wrench } from "lucide-react";

const states = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "ACT", "NT"];

// Hide booking status once workshop repairs have started.
const hideBookingStatusFor = new Set([
  "repairing",
  "waiting for parts",
  "ready collection",
  "ready for collection",
  "collected",
  "completed",
]);

function shouldShowBookingStatus(repairStatus: unknown): boolean {
  if (typeof repairStatus !== "string") return true;
  return !hideBookingStatusFor.has(repairStatus.trim().toLowerCase());
}

type TrackingResult = {
  bookingNumber: string;
  bookingStatus: string;
  repairStatus: string;
  service: string;
  date: string;
  time: string;
  vehicle: string;
  registration: string;
  updatedAt: string | null;
};

export default function TrackRepair() {
  const [registrationState, setRegistrationState] = useState("WA");
  const [registration, setRegistration] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!registration.trim() || !phone.trim()) {
      setError("Please enter your registration number and phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/public/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "vehicle",
          registrationState,
          registration: registration.trim(),
          phone: phone.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || "Unable to check repair status."
        );
      }

      setResult(payload.result);
      setSearched(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to check repair status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050505] px-5 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-400">
            <Wrench size={16} />
            Repair Status
          </span>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Track Your Vehicle
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Check your repair status using your vehicle registration
            and the phone number registered with J1 Motors.
          </p>
        </div>

        {!searched ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/85 p-5 shadow-2xl shadow-black/40 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-300">
                    Registration State
                  </span>
                  <select
                    value={registrationState}
                    onChange={(e) =>
                      setRegistrationState(e.target.value)
                    }
                    className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-white outline-none focus:border-red-500"
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
                    onChange={(e) =>
                      setRegistration(e.target.value.toUpperCase())
                    }
                    placeholder="Vehicle registration"
                    autoComplete="off"
                    required
                    className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 uppercase text-white outline-none focus:border-red-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-300">
                  Phone Number
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number used for booking"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className="h-14 w-full rounded-xl border border-white/10 bg-black/60 px-4 text-white outline-none focus:border-red-500"
                />
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-black uppercase tracking-[0.12em] text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Search size={20} />
                {loading ? "Checking…" : "Track Repair"}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-4 text-sm leading-6 text-zinc-500">
              <ShieldCheck className="mt-0.5 shrink-0" size={18} />
              Your registration and phone number must match our records
              before repair information is displayed.
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950/90 p-8 text-center shadow-2xl shadow-black/40">
            <Wrench className="mx-auto text-red-500" size={36} />

            <h2 className="mt-5 text-2xl font-black">
              {result?.repairStatus ||
                result?.bookingStatus ||
                "Repair status"}
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-zinc-400">
              {result?.vehicle} · {result?.registration}
            </p>

            <div className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-zinc-500">Booking</p>
                <p className="mt-1 break-all font-bold">
                  {result?.bookingNumber}
                </p>
              </div>

              {shouldShowBookingStatus(result?.repairStatus) && (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs text-zinc-500">
                    Booking status
                  </p>
                  <p className="mt-1 font-bold">
                    {result?.bookingStatus}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-zinc-500">Service</p>
                <p className="mt-1 font-bold">
                  {result?.service}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs text-zinc-500">Appointment</p>
                <p className="mt-1 font-bold">
                  {result?.date} {result?.time}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearched(false);
                setError("");
                setResult(null);
              }}
              className="mt-7 h-12 rounded-xl border border-white/10 bg-white/[0.03] px-6 font-bold text-zinc-300 hover:bg-white/[0.06]"
            >
              Back to search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
