import {
  BookOpenCheck,
  ScanSearch,
  Settings,
  Disc3,
  Gauge,
  Snowflake,
} from "lucide-react";

const services = [
  {
    title: "Logbook Servicing",
    description:
      "Scheduled servicing completed according to manufacturer requirements.",
    icon: BookOpenCheck,
  },
  {
    title: "Vehicle Diagnostics",
    description:
      "Professional fault finding using modern diagnostic equipment.",
    icon: ScanSearch,
  },
  {
    title: "Engine Repairs",
    description:
      "Engine inspection, repairs and replacement work for many vehicle types.",
    icon: Settings,
  },
  {
    title: "Brake Repairs",
    description:
      "Brake inspections, pad replacement, rotor repairs and hydraulic work.",
    icon: Disc3,
  },
  {
    title: "Suspension Repairs",
    description:
      "Diagnosis and repair of suspension, steering and handling problems.",
    icon: Gauge,
  },
  {
    title: "Air Conditioning",
    description:
      "Air conditioning inspection, fault diagnosis and repair services.",
    icon: Snowflake,
  },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">
        Our services
      </p>

      <h2 className="mt-3 text-3xl font-black">How we can help</h2>

      <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
        J1 Motors provides reliable automotive repairs and maintenance for many
        vehicle makes and models.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <div
              key={service.title}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-950 text-white">
                <Icon size={24} strokeWidth={2} />
              </div>

              <h3 className="text-xl font-black">{service.title}</h3>

              <p className="mt-3 leading-7 text-neutral-600">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}