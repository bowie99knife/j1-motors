"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

function StaffToolsIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-6 w-6" fill="none">
      <path d="M7.2 5.5 25.7 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m21.9 4.8 5.3 5.3-3.4 3.4-5.3-5.3 3.4-3.4Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M25.7 5.8 8.2 23.3" stroke="#dc2626" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5.7 21.5a4 4 0 0 0 4.8 4.8l-2.2-2.2 1.8-1.8 2.2 2.2a4 4 0 0 0-4.8-4.8l-1.8 1.8Z" fill="#dc2626" />
    </svg>
  );
}

const navLinks = [
  ["Home", "/"],
  ["Our Story", "/#our-story"],
  ["Services", "/#services"],
  ["Track Repair", "/track"],
  ["FAQ", "/faq"],
  ["Contact", "/#contact"],
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/track");
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[9999] isolate pointer-events-auto transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-neutral-950 shadow-2xl"
          : "bg-gradient-to-b from-black/90 via-black/55 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-[74px] max-w-7xl items-center px-5 sm:h-20 sm:px-8 lg:px-12">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="relative z-10 shrink-0 touch-manipulation pointer-events-auto"
          aria-label="J1 Motors home"
        >
          <Image src="/images/logo.png" alt="J1 Motors" width={150} height={60} priority className="h-auto w-[128px] sm:w-[150px]" style={{ width: "auto", height: "auto" }} />
        </Link>

        <nav className="ml-auto hidden items-center gap-7 text-sm font-bold text-white/80 lg:flex">
          {navLinks.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              prefetch={href === "/track"}
              className="pointer-events-auto transition hover:text-white"
            >
              {label}
            </Link>
          ))}
          <Link href="/book" className="pointer-events-auto rounded-xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-500">
            Book Service
          </Link>
        </nav>

        <Link
          href="/staff"
          aria-label="Staff portal"
          title="Staff Portal"
          onClick={() => setOpen(false)}
          className="relative z-10 ml-auto mr-1 flex h-12 w-12 touch-manipulation select-none items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white pointer-events-auto lg:ml-4 lg:mr-0"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <StaffToolsIcon />
          <span className="sr-only">Staff Portal</span>
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="relative z-10 ml-1 flex h-12 w-12 touch-manipulation select-none items-center justify-center rounded-xl text-white pointer-events-auto lg:hidden"
          style={{ WebkitTapHighlightColor: "transparent" }}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`absolute left-0 right-0 top-full z-[10000] border-t border-white/10 bg-neutral-950 shadow-2xl lg:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="max-h-[calc(100dvh-74px)] overflow-y-auto overscroll-contain px-5 py-5 sm:max-h-[calc(100dvh-80px)]">
          {navLinks.map(([label, href], index) => (
            <Link
              key={label}
              href={href}
              prefetch={href === "/track"}
              onClick={() => setOpen(false)}
              className="flex min-h-16 touch-manipulation items-center justify-between border-b border-white/10 py-4 text-2xl font-black text-white pointer-events-auto"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span>{label}</span>
              <span className="text-sm text-white/25">0{index + 1}</span>
            </Link>
          ))}

          <Link
            href="/book"
            onClick={() => setOpen(false)}
            className="mt-6 flex min-h-14 touch-manipulation items-center justify-center rounded-xl bg-red-600 px-6 py-4 text-center text-lg font-black text-white pointer-events-auto"
          >
            Book Service
          </Link>
          <Link
            href="/quote"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-14 touch-manipulation items-center justify-center rounded-xl border border-white/15 px-6 py-4 text-center text-lg font-black text-white pointer-events-auto"
          >
            Request Quote
          </Link>
          <p className="pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-8 text-xs font-bold uppercase tracking-[0.22em] text-white/25">
            J1 Motors · Belmont WA
          </p>
        </nav>
      </div>
    </header>
  );
}