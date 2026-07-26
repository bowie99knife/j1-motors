import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  Car,
  Clock3,
  Phone,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

import BookingForm from "@/components/BookingForm";

export const metadata = {
  title: "Book a Service | J1 Motors",
  description:
    "Request a vehicle service, diagnostic inspection or repair booking with J1 Motors.",
};

const benefits = [
  {
    title: "All Makes & Models",
    description:
      "Professional care for passenger and light commercial vehicles.",
    icon: Car,
  },
  {
    title: "Honest Recommendations",
    description: "Clear advice before repair work begins.",
    icon: BadgeDollarSign,
  },
  {
    title: "Advanced Diagnostics",
    description: "Modern equipment and proper testing procedures.",
    icon: ScanLine,
  },
  {
    title: "Quality Workmanship",
    description: "Careful repairs completed to a professional standard.",
    icon: ShieldCheck,
  },
];

export default function BookPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-[-12rem] top-40 h-[30rem] w-[30rem] rounded-full bg-red-700/20 blur-[120px]" />

      <div className="pointer-events-none absolute right-[-10rem] top-[35rem] h-[28rem] w-[28rem] rounded-full bg-red-900/15 blur-[130px]" />

      {/* Top navigation */}
      <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-300 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <a
            href="tel:0497066771"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-red-500 hover:bg-red-600"
          >
            <Phone size={17} />

            <span className="hidden sm:inline">0497 066 771</span>
          </a>
        </div>
      </header>

      {/* Booking section */}
      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <div
            className="mx-auto max-w-4xl text-center"
            data-aos="fade-up"
          >
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red-500">
              Online Booking
            </p>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Book your vehicle with J1 Motors
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
              Tell us about your vehicle and preferred booking time. We will
              contact you to confirm availability.
            </p>

            <p className="mt-5 text-sm text-neutral-500">
              Already booked? <Link href="/manage-booking" className="font-bold text-red-400 hover:text-red-300">Reschedule or cancel</Link>
              {" · "}<Link href="/faq" className="font-bold text-red-400 hover:text-red-300">Read FAQs</Link>
            </p>

          </div>

          {/* Main content */}
          <div className="mt-14 grid items-start gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            {/* Left information panel */}
            <aside
              data-aos="fade-right"
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-9 lg:sticky lg:top-8"
            >
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                Why book with us
              </p>

              <h2 className="mt-4 text-3xl font-black">
                Reliable workshop care
              </h2>

              <p className="mt-4 leading-7 text-neutral-400">
                J1 Motors provides servicing, diagnosis and mechanical repairs
                for customers across Belmont and surrounding areas.
              </p>

              <div className="mt-8 space-y-6">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold text-white">
                          {benefit.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-neutral-500">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Opening hours */}
              <div className="mt-9 rounded-2xl border border-red-500/20 bg-red-600/10 p-5">
                <div className="flex items-start gap-3">
                  <Clock3
                    className="mt-0.5 shrink-0 text-red-500"
                    size={21}
                  />

                  <div>
                    <p className="font-bold text-white">Opening Hours</p>

                    <p className="mt-1 text-sm leading-6 text-neutral-400">
                      Monday – Friday
                      <br />
                      8:30 AM – 5:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking information */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="font-bold text-white">Booking Information</p>

                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  Appointment times are available every 30 minutes from 8:30 AM
                  to 5:00 PM.
                </p>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Your booking request is not confirmed until J1 Motors contacts
                  you.
                </p>
              </div>
            </aside>

            {/* Booking form */}
            <BookingForm />
          </div>
        </div>
      </section>
    </main>
  );
}