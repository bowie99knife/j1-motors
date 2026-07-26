import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  ClipboardCheck,
  FileSearch,
  Phone,
  ShieldCheck,
} from "lucide-react";

import QuoteForm from "@/components/QuoteForm";

export const metadata = {
  title: "Request a Quote | J1 Motors",
  description: "Request a vehicle repair quote from J1 Motors in Belmont, Western Australia.",
};

const benefits = [
  {
    title: "Mechanic Reviewed",
    description: "Every request is reviewed by the J1 Motors workshop team.",
    icon: ClipboardCheck,
  },
  {
    title: "Photos Supported",
    description: "Upload warning lights, leaks, damage or visible concerns.",
    icon: Camera,
  },
  {
    title: "Clear Communication",
    description: "We will contact you if more information or an inspection is required.",
    icon: FileSearch,
  },
  {
    title: "No Automatic Diagnosis",
    description: "Diagnosis and recommendations remain with the mechanic.",
    icon: ShieldCheck,
  },
];

export default function QuotePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute left-[-12rem] top-40 h-[30rem] w-[30rem] rounded-full bg-red-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10rem] top-[35rem] h-[28rem] w-[28rem] rounded-full bg-red-900/15 blur-[130px]" />

      <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-300 transition hover:text-white">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <a href="tel:0497066771" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-red-500 hover:bg-red-600">
            <Phone size={17} /><span className="hidden sm:inline">0497 066 771</span>
          </a>
        </div>
      </header>

      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center" data-aos="fade-up">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red-500">Repair Quote Request</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">Tell us what your vehicle needs</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">
              Describe the concern in your own words and attach photos where helpful. Our workshop team will review your request and contact you.
            </p>
          </div>

          <div className="mt-14 grid items-start gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <aside data-aos="fade-right" className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-9 lg:sticky lg:top-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">What happens next</p>
              <h2 className="mt-4 text-3xl font-black">A proper workshop review</h2>
              <p className="mt-4 leading-7 text-neutral-400">
                Provide the vehicle details and concern. We will assess the information before discussing likely work, inspection requirements and pricing.
              </p>

              <div className="mt-8 space-y-6">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white"><Icon size={21} /></div>
                      <div><h3 className="font-bold text-white">{benefit.title}</h3><p className="mt-1 text-sm leading-6 text-neutral-500">{benefit.description}</p></div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-9 rounded-2xl border border-red-500/20 bg-red-600/10 p-5">
                <p className="font-bold text-white">Important</p>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  An online request is not a final diagnosis or fixed quote. Some repairs require physical inspection, testing or confirmation of parts availability.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="font-bold text-white">Need to speak with us?</p>
                <p className="mt-2 text-sm leading-6 text-neutral-400">Call J1 Motors during workshop hours: Monday–Friday, 8:30 AM–5:00 PM.</p>
              </div>
            </aside>

            <QuoteForm />
          </div>
        </div>
      </section>
    </main>
  );
}
