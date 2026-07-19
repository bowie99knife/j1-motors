import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      <Hero />

      <Services />

      <section className="bg-neutral-100">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-black">Honest advice</h3>
            <p className="mt-3 leading-7 text-neutral-600">
              Clear explanations and practical repair recommendations.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black">Experienced mechanics</h3>
            <p className="mt-3 leading-7 text-neutral-600">
              Careful workmanship across many vehicle makes and models.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black">Fast turnaround</h3>
            <p className="mt-3 leading-7 text-neutral-600">
              Efficient service designed to get you back on the road.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
              Contact
            </p>

            <h2 className="mt-3 text-3xl font-black">Visit J1 Motors</h2>

            <div className="mt-8 space-y-3 leading-7 text-neutral-700">
              <p>193 Campbell Street, Belmont WA</p>
              <p>Phone: 0497 066 771</p>
              <p>Monday–Friday: 8:30am–5:00pm</p>
            </div>
          </div>

          <div className="flex items-start gap-4 md:justify-end">
            <a
              href="tel:0497066771"
              className="rounded-md bg-neutral-950 px-6 py-3 font-bold text-white hover:bg-neutral-800"
            >
              Call Now
            </a>

            <a
              href="https://maps.google.com/?q=193+Campbell+Street+Belmont+WA"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-neutral-300 px-6 py-3 font-bold hover:bg-neutral-100"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:justify-between">
          <p>© 2026 J1 Motors Car Repairs</p>
          <p>All cars. All work. All purpose.</p>
        </div>
      </footer>
    </main>
  );
}