import Link from "next/link";
import { ArrowLeft, Clock3, Phone, ShieldAlert } from "lucide-react";
import ManageBookingForm from "@/components/ManageBookingForm";

export const metadata = {
  title: "Reschedule or Cancel a Booking",
  description: "Request a change or cancellation for an existing J1 Motors workshop booking.",
};

export default function ManageBookingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute left-[-12rem] top-32 h-[30rem] w-[30rem] rounded-full bg-red-700/15 blur-[120px]" />

      <header className="relative border-b border-white/10 bg-black/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-300 transition hover:text-white">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <a href="tel:+61497066771" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:border-red-500 hover:bg-red-600">
            <Phone size={17} /><span className="hidden sm:inline">0497 066 771</span>
          </a>
        </div>
      </header>

      <section className="relative px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-base font-bold uppercase tracking-[0.3em] text-red-500">Existing Booking</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-7xl">Change of plans?</h1>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-neutral-300 sm:text-2xl">
              Reschedule your appointment or request a cancellation from the same page.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 sm:p-9 lg:sticky lg:top-8">
              <ShieldAlert className="h-11 w-11 text-red-500" />
              <h2 className="mt-5 text-3xl font-black">Need to make a change?</h2>
              <p className="mt-4 text-lg leading-8 text-neutral-300">
                No worries. Give us as much notice as possible and we will help move your booking or free up the workshop time.
              </p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-5">
                <div className="flex gap-3">
                  <Clock3 className="mt-1 shrink-0 text-red-500" size={22} />
                  <div>
                    <p className="text-lg font-bold">Booking is today or within 24 hours?</p>
                    <p className="mt-2 text-base leading-7 text-neutral-400">Please call 0497 066 771 during workshop hours so we can assist you quickly.</p>
                  </div>
                </div>
              </div>
              <Link href="/faq" className="mt-6 inline-flex text-lg font-bold text-red-400 transition hover:text-red-300">Read booking FAQs →</Link>
            </aside>

            <ManageBookingForm />
          </div>
        </div>
      </section>
    </main>
  );
}
