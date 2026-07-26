import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-black">J1 Motors</h3>
            <p className="mt-4 max-w-sm leading-7 text-white/45">
              Professional automotive repairs, diagnostics and servicing for all makes and models.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.16em] text-white/70">Quick Links</h4>
            <ul className="mt-5 space-y-3 text-white/45">
              <li><a href="/#our-story" className="transition hover:text-white">Our Story</a></li>
              <li><a href="/#services" className="transition hover:text-white">Services</a></li>
              <li><Link href="/book" className="transition hover:text-white">Book Service</Link></li>
              <li><Link href="/track" className="transition hover:text-white">Track Repair</Link></li>
              <li><Link href="/manage-booking" className="transition hover:text-white">Manage Booking</Link></li>
              <li><Link href="/faq" className="transition hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.16em] text-white/70">Workshop</h4>
            <div className="mt-5 space-y-3 text-white/45">
              <p>193 Campbell Street, Belmont WA</p>
              <p><a href="tel:+61497066771" className="transition hover:text-white">0497 066 771</a></p>
              <p>Monday–Friday: 8:30am–5:00pm</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs font-bold uppercase tracking-[0.12em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 J1 Motors Car Repairs</p>
          <p>All Cars · All Work · All Purpose</p>
        </div>
      </div>
    </footer>
  );
}
