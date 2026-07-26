"use client";

import { FormEvent, useState } from "react";
import { CalendarClock, CheckCircle2, PhoneCall, XCircle } from "lucide-react";

type RequestType = "reschedule" | "cancel";

const inputClass =
  "mt-2.5 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

export default function ManageBookingForm() {
  const [requestType, setRequestType] = useState<RequestType>("reschedule");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    const isReschedule = requestType === "reschedule";

    return (
      <div className="rounded-[2rem] border border-emerald-500/25 bg-neutral-900/95 p-8 text-center shadow-2xl shadow-black/40 sm:p-12">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <h2 className="mt-6 text-3xl font-black sm:text-4xl">
          {isReschedule ? "Reschedule request received" : "Cancellation request received"}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-neutral-300">
          We will check your booking and contact you to confirm the {isReschedule ? "new appointment time" : "cancellation"}.
          Your current booking remains unchanged until J1 Motors confirms it.
        </p>
        <a
          href="tel:+61497066771"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-lg font-bold text-white transition hover:bg-red-500"
        >
          <PhoneCall size={20} /> Call the Workshop
        </a>
      </div>
    );
  }

  const isReschedule = requestType === "reschedule";

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/40 sm:p-9">
      <div>
        <h2 className="text-3xl font-black sm:text-4xl">What would you like to do?</h2>
        <p className="mt-3 text-lg leading-7 text-neutral-400">Choose an option, then enter the booking details below.</p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRequestType("reschedule")}
          aria-pressed={isReschedule}
          className={`rounded-2xl border p-5 text-left transition ${
            isReschedule
              ? "border-red-500 bg-red-600/15 ring-4 ring-red-500/10"
              : "border-white/10 bg-black/25 hover:border-white/25"
          }`}
        >
          <CalendarClock className="h-8 w-8 text-red-500" />
          <span className="mt-4 block text-xl font-black">Reschedule booking</span>
          <span className="mt-2 block text-base leading-6 text-neutral-400">Move your appointment to another suitable date or time.</span>
        </button>

        <button
          type="button"
          onClick={() => setRequestType("cancel")}
          aria-pressed={!isReschedule}
          className={`rounded-2xl border p-5 text-left transition ${
            !isReschedule
              ? "border-red-500 bg-red-600/15 ring-4 ring-red-500/10"
              : "border-white/10 bg-black/25 hover:border-white/25"
          }`}
        >
          <XCircle className="h-8 w-8 text-red-500" />
          <span className="mt-4 block text-xl font-black">Cancel booking</span>
          <span className="mt-2 block text-base leading-6 text-neutral-400">Let us know that you can no longer attend your appointment.</span>
        </button>
      </div>

      <div className="mt-9 border-t border-white/10 pt-8">
        <h3 className="text-2xl font-black">Find your booking</h3>
        <p className="mt-2 text-base leading-7 text-neutral-400">Enter the same details used when the booking was submitted.</p>
      </div>

      <input type="hidden" name="requestType" value={requestType} />

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <label className="text-base font-bold text-neutral-200">
          Full Name
          <input name="name" required autoComplete="name" placeholder="Your full name" className={inputClass} />
        </label>

        <label className="text-base font-bold text-neutral-200">
          Phone Number
          <input name="phone" type="tel" required autoComplete="tel" placeholder="0497 000 000" className={inputClass} />
        </label>

        <label className="text-base font-bold text-neutral-200">
          Vehicle Registration
          <input name="registration" required placeholder="1ABC234" className={`${inputClass} uppercase`} />
        </label>

        <label className="text-base font-bold text-neutral-200">
          Current Booking Date
          <input name="bookingDate" type="date" required className={inputClass} />
        </label>

        {isReschedule && (
          <>
            <label className="text-base font-bold text-neutral-200">
              Preferred New Date
              <input name="preferredDate" type="date" required className={inputClass} />
            </label>

            <label className="text-base font-bold text-neutral-200">
              Preferred New Time
              <input
                name="preferredTime"
                type="time"
                required
                min="08:30"
                max="17:00"
                step="1800"
                className={inputClass}
              />
              <span className="mt-2 block text-sm font-normal text-neutral-500">
                Choose a time between 8:30 AM and 5:00 PM. Final availability will be confirmed by J1 Motors.
              </span>
            </label>
          </>
        )}

        <label className="text-base font-bold text-neutral-200 sm:col-span-2">
          {isReschedule ? "Anything we should know?" : "Reason for cancellation"}{" "}
          <span className="font-normal text-neutral-500">(optional)</span>
          <textarea
            name="reason"
            rows={4}
            placeholder={isReschedule ? "Tell us what date or time works best for you" : "Let us know why you need to cancel"}
            className={`${inputClass} resize-none`}
          />
        </label>
      </div>

      <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-base leading-7 text-amber-100/85">
        This sends a request only. Your booking stays active until J1 Motors confirms the {isReschedule ? "new date and time" : "cancellation"} by phone or email.
      </div>

      <button type="submit" className="mt-7 w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-black text-white transition hover:bg-red-500">
        {isReschedule ? "Request Reschedule" : "Request Cancellation"}
      </button>
    </form>
  );
}
