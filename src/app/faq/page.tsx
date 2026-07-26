import Link from "next/link";
import { ArrowLeft, ChevronDown, Phone } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about bookings, servicing, repairs, quotes and repair tracking at J1 Motors.",
};

const faqGroups = [
  {
    title: "Bookings",
    items: [
      ["Is my online booking confirmed immediately?", "No. The online form is a booking request. J1 Motors will contact you to confirm the date and time."],
      ["How do I cancel or change my booking?", "Use the Manage Booking page or call us on 0497 066 771. Your change or cancellation is only final after we confirm it."],
      ["Can I book for the same day?", "Same-day availability depends on the workshop schedule. Calling us is the fastest way to check."],
      ["What time should I drop off my vehicle?", "Please arrive at the confirmed time shown in your booking confirmation. Contact us if you expect to be late."],
    ],
  },
  {
    title: "Servicing & Repairs",
    items: [
      ["Do you work on all makes and models?", "Yes. We service and repair most passenger and light commercial vehicles."],
      ["Will you contact me before carrying out extra work?", "Yes. We will explain any additional work and obtain approval before proceeding."],
      ["Can you diagnose warning lights and unusual noises?", "Yes. We provide mechanical and electronic diagnostic testing. The time required depends on the fault."],
      ["Do you provide logbook servicing?", "Yes. We can service vehicles according to the manufacturer schedule and record the completed maintenance."],
    ],
  },
  {
    title: "Quotes, Payment & Tracking",
    items: [
      ["Can I request a quote online?", "Yes. Use the Request Quote page and provide as much information as possible. Some faults require an inspection before an accurate price can be given."],
      ["Is an online quote always the final price?", "A quote is based on the information available at the time. We will contact you if inspection reveals additional work or parts."],
      ["How do I track my repair?", "Use the secure Track Repair link provided by J1 Motors. For privacy, repair details are only shown through the correct customer link or reference."],
      ["What payment methods do you accept?", "Please confirm available payment methods with the workshop when booking or collecting your vehicle."],
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#f3f1ec] text-neutral-950">
      <header className="border-b border-black/10 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-300 transition hover:text-white">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          <a href="tel:+61497066771" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-red-600">
            <Phone size={17} /><span className="hidden sm:inline">0497 066 771</span>
          </a>
        </div>
      </header>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-red-600">Customer Help</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Frequently asked questions</h1>
            <p className="mt-5 text-lg leading-8 text-neutral-600">Quick answers about booking, servicing, repairs and collecting your vehicle.</p>
          </div>

          <div className="mt-12 space-y-10">
            {faqGroups.map((group) => (
              <section key={group.title}>
                <h2 className="text-2xl font-black">{group.title}</h2>
                <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
                  {group.items.map(([question, answer]) => (
                    <details key={question} className="group border-b border-black/10 last:border-b-0">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 font-black sm:px-7">
                        <span>{question}</span>
                        <ChevronDown className="shrink-0 text-red-600 transition group-open:rotate-180" size={21} />
                      </summary>
                      <p className="px-5 pb-6 leading-7 text-neutral-600 sm:px-7">{answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] bg-neutral-950 p-7 text-white sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">Still need help?</p>
            <h2 className="mt-3 text-3xl font-black">Talk to the workshop.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/55">Call us during business hours or submit a booking request online.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="tel:+61497066771" className="rounded-xl bg-red-600 px-6 py-3.5 text-center font-black transition hover:bg-red-500">Call 0497 066 771</a>
              <Link href="/book" className="rounded-xl border border-white/15 px-6 py-3.5 text-center font-black transition hover:bg-white/5">Book Service</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
