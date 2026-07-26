import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#121212]">
      <Image
        src="/images/hero.png"
        alt="Vehicle inside the J1 Motors workshop"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_center] sm:object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.5)_0%,rgba(12,12,12,0.75)_58%,rgba(12,12,12,0.96)_100%)] sm:bg-[linear-gradient(90deg,rgba(12,12,12,0.94)_0%,rgba(12,12,12,0.72)_48%,rgba(12,12,12,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:items-center lg:px-12 lg:pb-0 lg:pt-24">
        <div className="w-full max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/80 backdrop-blur-md sm:text-xs">
            <ShieldCheck size={15} className="text-red-500" /> Belmont automotive specialists
          </div>

          <h1 className="text-[clamp(3.2rem,14vw,8.5rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
            Driven by
            <span className="block text-red-600">passion.</span>
            <span className="mt-2 block">Built on trust.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
            Honest advice, precision workmanship and modern diagnostics — keeping Perth drivers safely on the road.
          </p>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/book" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-4 text-base font-black text-white transition hover:bg-red-500 active:scale-[0.98]">
              Book Service <ArrowUpRight size={18} />
            </Link>
            <Link href="/quote" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-7 py-4 text-base font-black text-white backdrop-blur-md transition hover:bg-white hover:text-black active:scale-[0.98]">
              Request Quote
            </Link>
          </div>

          <a href="#our-story" className="mt-10 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/45 transition hover:text-white sm:mt-12">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20"><ArrowDown size={16} /></span>
            Our Story
          </a>
        </div>
      </div>
    </section>
  );
}
