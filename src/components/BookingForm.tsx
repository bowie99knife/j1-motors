"use client";

import {
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Search,
  User,
  Wrench,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type BookingFormData = {
  name: string;
  phone: string;
  email: string;
  registrationState: string;
  registration: string;
  make: string;
  model: string;
  year: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
};

type SearchableSelectProps = {
  label: string;
  name: "registrationState" | "make" | "model" | "year";
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const vehicleModels: Record<string, string[]> = {
  Toyota: [
    "86",
    "Camry",
    "Corolla",
    "HiAce",
    "Hilux",
    "Kluger",
    "LandCruiser",
    "Prado",
    "RAV4",
    "Yaris",
    "Other",
  ],
  Ford: [
    "Everest",
    "Falcon",
    "Fiesta",
    "Focus",
    "Mustang",
    "Ranger",
    "Territory",
    "Transit",
    "Other",
  ],
  Mazda: [
    "Mazda 2",
    "Mazda 3",
    "Mazda 6",
    "CX-3",
    "CX-30",
    "CX-5",
    "CX-8",
    "CX-9",
    "BT-50",
    "MX-5",
    "Other",
  ],
  Nissan: [
    "350Z",
    "370Z",
    "Altima",
    "Dualis",
    "Juke",
    "Navara",
    "Patrol",
    "Pulsar",
    "Qashqai",
    "X-Trail",
    "Other",
  ],
  Hyundai: [
    "Accent",
    "Elantra",
    "Getz",
    "i20",
    "i30",
    "iLoad",
    "Kona",
    "Santa Fe",
    "Sonata",
    "Tucson",
    "Other",
  ],
  Kia: [
    "Carnival",
    "Cerato",
    "Picanto",
    "Rio",
    "Sorento",
    "Sportage",
    "Stinger",
    "Other",
  ],
  Honda: [
    "Accord",
    "Civic",
    "CR-V",
    "HR-V",
    "Jazz",
    "Odyssey",
    "Other",
  ],
  Subaru: [
    "BRZ",
    "Forester",
    "Impreza",
    "Liberty",
    "Outback",
    "WRX",
    "XV",
    "Other",
  ],
  Mitsubishi: [
    "ASX",
    "Eclipse Cross",
    "Lancer",
    "Outlander",
    "Pajero",
    "Triton",
    "Other",
  ],
  Volkswagen: [
    "Amarok",
    "Golf",
    "Passat",
    "Polo",
    "Tiguan",
    "Touareg",
    "Transporter",
    "Other",
  ],
  "Mercedes-Benz": [
    "A-Class",
    "C-Class",
    "E-Class",
    "GLA",
    "GLC",
    "GLE",
    "S-Class",
    "Sprinter",
    "Vito",
    "Other",
  ],
  BMW: [
    "1 Series",
    "2 Series",
    "3 Series",
    "4 Series",
    "5 Series",
    "X1",
    "X3",
    "X5",
    "Other",
  ],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "Other"],
  Holden: [
    "Astra",
    "Barina",
    "Colorado",
    "Commodore",
    "Captiva",
    "Cruze",
    "Trax",
    "Other",
  ],
  Isuzu: ["D-Max", "MU-X", "Other"],
  Suzuki: ["Baleno", "Jimny", "Swift", "S-Cross", "Vitara", "Other"],
  Lexus: ["ES", "GS", "IS", "NX", "RX", "UX", "Other"],
  Jeep: ["Cherokee", "Compass", "Grand Cherokee", "Renegade", "Wrangler", "Other"],
  Volvo: ["S60", "S90", "V40", "XC40", "XC60", "XC90", "Other"],
  Peugeot: ["208", "308", "3008", "5008", "Partner", "Other"],
  Renault: ["Captur", "Clio", "Koleos", "Megane", "Trafic", "Other"],
  Other: ["Other"],
};

const makes = Object.keys(vehicleModels).sort();

const australianStates = [
  "WA",
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "TAS",
  "ACT",
  "NT",
];

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1979 },
  (_, index) => String(currentYear - index)
);

const services = [
  {
    title: "General Service",
    description: "Routine inspection, oil and filter service.",
  },
  {
    title: "Logbook Service",
    description: "Manufacturer-scheduled maintenance.",
  },
  {
    title: "Diagnostics",
    description: "Warning lights, faults and performance issues.",
  },
  {
    title: "Brake Repairs",
    description: "Pads, rotors, hydraulics and inspections.",
  },
  {
    title: "Suspension & Steering",
    description: "Handling, noise and steering concerns.",
  },
  {
    title: "Engine Repair",
    description: "Engine faults, leaks and mechanical repairs.",
  },
  {
    title: "Battery & Electrical",
    description: "Battery, charging and electrical diagnosis.",
  },
  {
    title: "Other",
    description: "Tell us what your vehicle needs.",
  },
];

const timeSlots = [
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

const initialFormData: BookingFormData = {
  name: "",
  phone: "",
  email: "",
  registrationState: "WA",
  registration: "",
  make: "",
  model: "",
  year: "",
  service: "",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

export default function BookingForm() {
  const [formData, setFormData] =
    useState<BookingFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [bookingNumber, setBookingNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const availableModels = useMemo(
    () => (formData.make ? vehicleModels[formData.make] ?? ["Other"] : []),
    [formData.make]
  );


const minimumDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Australia/Perth',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());


  function updateField<K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleMakeChange(value: string) {
    setFormData((previous) => ({
      ...previous,
      make: value,
      model: "",
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData.service || submitting) return;
    setSubmitting(true); setSubmitError("");
    try {
      const response = await fetch("/api/public/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to submit booking.");
      if (typeof payload.bookingNumber !== "string" || !payload.bookingNumber.trim()) {
        throw new Error("Booking response is missing its reference. Please contact J1 Motors before submitting again.");
      }
      setBookingNumber(payload.bookingNumber);
      setCopied(false);
      setSubmitted(true); setFormData(initialFormData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Booking submission failed:", error);
      setSubmitError(error instanceof Error ? error.message : "Unable to submit booking. Please try again.");
    } finally { setSubmitting(false); }
  }


if (submitted) {
  return (
    <div
      data-aos="zoom-in"
      className="rounded-[2rem] border border-emerald-500/30 bg-neutral-900/95 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-12"
    >
      <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />

      <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl">
        Booking request received
      </h2>

      <p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-300">
        Thank you. J1 Motors will contact you to confirm the requested date
        and time.
      </p>

      <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-white/15 bg-black/40 p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Your booking reference
        </p>

        <p
          className="mt-3 break-all font-mono text-xl font-bold text-white sm:text-2xl"
          aria-label="Booking reference"
        >
          {bookingNumber || "Reference unavailable"}
        </p>

        <button
          type="button"
          disabled={!bookingNumber}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(bookingNumber);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className="mt-4 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied!" : "Copy Booking Reference"}
        </button>

        <p className="mt-3 text-sm text-neutral-400">
          Keep this reference for enquiries. This is a request,
          not a confirmed appointment.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setSubmitted(false);
          setBookingNumber("");
          setCopied(false);
        }}
        className="mt-8 rounded-full bg-red-600 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700"
      >
        Make Another Booking
      </button>
    </div>
  );
}

  return (
    <form
      onSubmit={handleSubmit}
      data-aos="fade-left"
      className="rounded-[2rem] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9"
    >
      <FormSection
        icon={<User size={22} />}
        title="Customer Details"
        description="How we can contact you about the booking."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Your full name"
            required
          />

          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => updateField("phone", value)}
            placeholder="0497 000 000"
            required
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => updateField("email", value)}
            placeholder="you@example.com"
          />

          <div className="grid grid-cols-[0.75fr_1.25fr] gap-3 md:col-span-2">
            <SearchableSelect
              label="Registration State"
              name="registrationState"
              value={formData.registrationState}
              options={australianStates}
              placeholder="Select state"
              onChange={(value) => updateField("registrationState", value)}
            />

            <TextField
              label="Vehicle Registration"
              name="registration"
              value={formData.registration}
              onChange={(value) =>
                updateField("registration", value.toUpperCase())
              }
              placeholder="1ABC234"
              required
            />
          </div>
        </div>
      </FormSection>

      <FormDivider />

      <FormSection
        icon={<Car size={22} />}
        title="Vehicle Details"
        description="Choose your vehicle make, model and year."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <SearchableSelect
            label="Vehicle Make"
            name="make"
            value={formData.make}
            options={makes}
            placeholder="Search vehicle make"
            onChange={handleMakeChange}
          />

          <SearchableSelect
            label="Vehicle Model"
            name="model"
            value={formData.model}
            options={availableModels}
            placeholder={
              formData.make ? "Search vehicle model" : "Select make first"
            }
            disabled={!formData.make}
            onChange={(value) => updateField("model", value)}
          />

          <SearchableSelect
            label="Vehicle Year"
            name="year"
            value={formData.year}
            options={years}
            placeholder="Search vehicle year"
            onChange={(value) => updateField("year", value)}
          />
        </div>
      </FormSection>

      <FormDivider />

      <FormSection
        icon={<Wrench size={22} />}
        title="Choose a Service"
        description="Select the main service or repair you need."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const selected = formData.service === service.title;

            return (
              <button
                key={service.title}
                type="button"
                onClick={() => updateField("service", service.title)}
                className={`relative rounded-2xl border p-5 text-left transition duration-200 ${
                  selected
                    ? "border-red-500 bg-red-600/15 shadow-lg shadow-red-950/20"
                    : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-white">{service.title}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      {service.description}
                    </p>
                  </div>

                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-neutral-600 text-transparent"
                    }`}
                  >
                    <Check size={15} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {!formData.service && (
          <p className="mt-3 text-sm text-neutral-500">
            Please select one service before submitting.
          </p>
        )}
      </FormSection>

      <FormDivider />

      <FormSection
        icon={<CalendarDays size={22} />}
        title="Booking Details"
        description="Choose your preferred date and time."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="preferredDate"
              className="mb-2 block text-sm font-bold text-neutral-200"
            >
              Preferred Date
            </label>

            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              min={minimumDate}
              value={formData.preferredDate}
              onChange={(event) =>
                updateField("preferredDate", event.target.value)
              }
              required
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 [color-scheme:dark]"
            />
          </div>

          <div>
            <label
              htmlFor="preferredTime"
              className="mb-2 block text-sm font-bold text-neutral-200"
            >
              Preferred Time
            </label>

            <div className="relative">
              <Clock3
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={(event) =>
                  updateField("preferredTime", event.target.value)
                }
                required
                className="w-full appearance-none rounded-xl border border-white/10 bg-neutral-950 py-3 pl-11 pr-10 text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">Select preferred time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-bold text-neutral-200"
            >
              Additional Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={5}
              placeholder="Describe the problem, warning lights, noises or any special requests"
              className="w-full resize-none rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>
      </FormSection>

      {submitError && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={!formData.service || submitting}
        className="mt-8 w-full rounded-full bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:shadow-none"
      >
        {submitting ? "Submitting…" : "Submit Booking Request"}
      </button>

      <p className="mt-4 text-center text-sm leading-6 text-neutral-500">
        Your booking is not confirmed until J1 Motors contacts you.
      </p>
    </form>
  );
}

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-neutral-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function FormDivider() {
  return <div className="my-9 h-px bg-white/10" />;
}

function TextField({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-neutral-200"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      />
    </div>
  );
}

function SearchableSelect({
  label,
  name,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function chooseOption(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={`${name}-button`}
        className="mb-2 block text-sm font-bold text-neutral-200"
      >
        {label}
      </label>

      <button
        id={`${name}-button`}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-left text-white outline-none transition hover:border-white/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={value ? "text-white" : "text-neutral-600"}>
          {value || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-neutral-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/60">
          <div className="border-b border-white/10 p-3">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${label.toLowerCase()}`}
                className="w-full rounded-lg border border-white/10 bg-neutral-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseOption(option)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    value === option
                      ? "bg-red-600 text-white"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{option}</span>
                  {value === option && <Check size={16} />}
                </button>
              ))
            ) : (
              <p className="px-3 py-5 text-center text-sm text-neutral-500">
                No matching option found
              </p>
            )}
          </div>
        </div>
      )}

      <input type="hidden" name={name} value={value} required />
    </div>
  );
}