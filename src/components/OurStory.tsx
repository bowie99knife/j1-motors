import { ArrowUpRight, Award, Gauge, Wrench } from "lucide-react";

const people = [
  {
    initials: "R",
    name: "Robin",
    title: "Founder & Master Technician",
    story:
      "Robin began his automotive career in South Korea before moving to Australia. After almost 20 years in the same workshop, he took the next step and founded J1 Motors — built on experience, honesty and workmanship that lasts.",
    icon: Award,
  },
  {
    initials: "J",
    name: "Jason",
    title: "Race Technician & Automotive Technician",
    story:
      "Jason completed a Diploma in Motorsports Technology in Malaysia, worked in the Motorsports industry and he had done heaps of race events, then moved to Australia to further his career. He has completed Australian automotive qualifications and continues advanced diagnostic training.",
    icon: Gauge,
  },
];

export default function OurStory() {
  return (
    <section id="our-story" className="bg-[#f3f1ec] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-red-600">
              <Wrench size={15} /> Our Story
            </p>
            <h2 className="max-w-xl text-4xl font-black leading-[0.98] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl">
              Different journeys.
              <br />
              Shared values.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8 lg:justify-self-end">
            J1 Motors brings together decades of workshop experience, motorsport knowledge and modern diagnostic training. The result is one trusted workshop focused on doing the job properly — and treating every customer with respect.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-2">
          {people.map(({ initials, name, title, story, icon: Icon }) => (
            <article
              key={name}
              className="group relative overflow-hidden rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-[0_18px_70px_rgba(0,0,0,0.06)] sm:p-8"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-600/5 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-950 text-xl font-black text-white">
                    {initials}
                  </div>
                  <Icon className="text-red-600" size={24} strokeWidth={1.8} />
                </div>
                <h3 className="mt-8 text-2xl font-black tracking-tight text-neutral-950">{name}</h3>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.12em] text-red-600">{title}</p>
                <p className="mt-6 leading-7 text-neutral-600">{story}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-[1.75rem] bg-neutral-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="text-2xl font-black tracking-tight sm:text-3xl">One trusted workshop.</p>
          <a href="#services" className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white">
            See what we do <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
