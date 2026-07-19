import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-neutral-400">
          Your trusted workshop in Belmont
        </p>

        <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
          Honest repairs.
          <br />
          Quality workmanship.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
          Professional servicing, diagnostics and repairs for all makes and
          models.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/booking"
            className="rounded-md bg-white px-6 py-3 font-bold text-neutral-950 hover:bg-neutral-200"
          >
            Book a Service
          </Link>

          <Link
            href="/track"
            className="rounded-md border border-neutral-600 px-6 py-3 font-bold hover:bg-neutral-800"
          >
            Track Repair
          </Link>

          <a
            href="tel:0497066771"
            className="rounded-md border border-neutral-600 px-6 py-3 font-bold hover:bg-neutral-800"
          >
            Call Now
          </a>
        </div>
      </div>
    </section>
  );
}