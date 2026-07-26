import Link from "next/link";
import { Camera, CheckCircle2 } from "lucide-react";

const upcomingWork = [
  "Routine servicing",
  "Engine repairs and rebuilds",
  "Diagnostic work",
  "Suspension and brake repairs",
  "Performance projects",
  "Behind-the-scenes workshop work",
];

export default function Gallery() {
  return (
    <section id="gallery" className="bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-[0.3em] text-red-500">
            Our Work
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Inside Our Workshop
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
            A clean, honest workshop where every vehicle is treated with care,
            from routine servicing to complex diagnostics and performance work.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/15 text-red-500">
              <Camera aria-hidden="true" className="h-8 w-8" />
            </div>

            <h3 className="mt-6 text-2xl font-black sm:text-3xl">
              Gallery Coming Soon
            </h3>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
              We&apos;re currently updating this section with real photos from
              our workshop. Rather than using stock images, we believe in
              showing the work we actually do.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            {upcomingWork.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-200"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-red-500"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-neutral-500">
            Every photo shown here will feature a real vehicle repaired or
            serviced by the J1 Motors team.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/book"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Book Your Vehicle
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
