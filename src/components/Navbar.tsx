import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/">
          <p className="text-2xl font-black tracking-tight">J1 MOTORS</p>
          <p className="text-xs text-neutral-500">Car Repairs · MRB 7269</p>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/booking"
            className="hidden rounded-md px-4 py-2 text-sm font-semibold hover:bg-neutral-100 sm:block"
          >
            Book Service
          </Link>

          <Link
            href="/track"
            className="hidden rounded-md px-4 py-2 text-sm font-semibold hover:bg-neutral-100 sm:block"
          >
            Track Repair
          </Link>

          <Link
            href="/staff"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100"
          >
            Staff Login
          </Link>
        </nav>
      </div>
    </header>
  );
}