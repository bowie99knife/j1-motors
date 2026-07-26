"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck, Wrench } from "lucide-react";

export default function StaffPortal() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <Link href="/" className="mb-8 inline-flex touch-manipulation items-center gap-2 text-sm font-bold text-white/45 transition hover:text-white"><ArrowLeft size={17} /> Back to website</Link>
        <Image src="/images/logo.png" alt="J1 Motors" width={170} height={68} className="h-auto w-[150px]" />
        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-red-500"><LockKeyhole size={27} /></div>
        <h1 className="mt-6 text-4xl font-black tracking-tight">Staff Portal</h1>
        <p className="mt-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/45"><ShieldCheck size={16} /> Authorised personnel only</p>
        <p className="mt-6 leading-7 text-white/55">J1 Workshop OS is currently connected through the existing admin workspace.</p>
        <Link href="/admin" className="mt-8 flex min-h-14 touch-manipulation w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-500 active:scale-[0.98]">
          <Wrench size={19} /> Enter Staff Portal
        </Link>
        <p className="mt-5 text-center text-xs leading-5 text-white/25">Staff authentication will be enforced when the backend login is connected.</p>
      </div>
    </main>
  );
}
