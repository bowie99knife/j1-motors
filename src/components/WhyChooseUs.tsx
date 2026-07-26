import {
  ShieldCheck,
  Wrench,
  Car,
  Clock,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Trusted Service",
      description:
        "Honest advice, transparent pricing and quality workmanship every time.",
    },
    {
      icon: Wrench,
      title: "Experienced Mechanics",
      description:
        "Professional diagnostics and repairs for all makes and models.",
    },
    {
      icon: Car,
      title: "All Vehicle Brands",
      description:
        "Japanese, Korean, European and Australian vehicles are all welcome.",
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description:
        "Efficient servicing to get you safely back on the road sooner.",
    },
  ];

  return (
    <section
      id="why"
      className="bg-neutral-950 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-[0.3em] text-red-500">
            Why Choose Us
          </p>

          <h2 className="mt-4 text-4xl font-black">
            Why Drivers Choose J1 Motors
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
            We combine honest workmanship, modern diagnostic equipment,
            and quality parts to keep your vehicle reliable.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-2 hover:border-red-500"
              >
                <Icon className="mb-6 h-12 w-12 text-red-500" />

                <h3 className="text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-neutral-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}