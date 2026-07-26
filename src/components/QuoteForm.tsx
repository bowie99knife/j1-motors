"use client";

import {
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  Search,
  Trash2,
  UploadCloud,
  User,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ContactMethod = "phone" | "email";

type QuoteFormData = {
  name: string;
  phone: string;
  email: string;
  registrationState: string;
  registration: string;
  make: string;
  model: string;
  year: string;
  category: string;
  description: string;
  contactMethod: ContactMethod;
};

type SearchableSelectProps = {
  label: string;
  name: "registrationState" | "make" | "model" | "year";
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
};

type UploadedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

const vehicleModels: Record<string, string[]> = {
  Toyota: ["86", "Camry", "Corolla", "HiAce", "Hilux", "Kluger", "LandCruiser", "Prado", "RAV4", "Yaris", "Other"],
  Ford: ["Everest", "Falcon", "Fiesta", "Focus", "Mustang", "Ranger", "Territory", "Transit", "Other"],
  Mazda: ["Mazda 2", "Mazda 3", "Mazda 6", "CX-3", "CX-30", "CX-5", "CX-8", "CX-9", "BT-50", "MX-5", "Other"],
  Nissan: ["350Z", "370Z", "Altima", "Dualis", "Juke", "Navara", "Patrol", "Pulsar", "Qashqai", "X-Trail", "Other"],
  Hyundai: ["Accent", "Elantra", "Getz", "i20", "i30", "iLoad", "Kona", "Santa Fe", "Sonata", "Tucson", "Other"],
  Kia: ["Carnival", "Cerato", "Picanto", "Rio", "Sorento", "Sportage", "Stinger", "Other"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Jazz", "Odyssey", "Other"],
  Subaru: ["BRZ", "Forester", "Impreza", "Liberty", "Outback", "WRX", "XV", "Other"],
  Mitsubishi: ["ASX", "Eclipse Cross", "Lancer", "Outlander", "Pajero", "Triton", "Other"],
  Volkswagen: ["Amarok", "Golf", "Passat", "Polo", "Tiguan", "Touareg", "Transporter", "Other"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "GLA", "GLC", "GLE", "S-Class", "Sprinter", "Vito", "Other"],
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X5", "Other"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "Other"],
  Holden: ["Astra", "Barina", "Colorado", "Commodore", "Captiva", "Cruze", "Trax", "Other"],
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
const australianStates = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "ACT", "NT"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index));

const repairCategories = [
  { title: "Engine", description: "Leaks, noises, overheating or engine repairs." },
  { title: "Transmission", description: "Shifting, clutch, gearbox or driveline concerns." },
  { title: "Brakes", description: "Pads, rotors, warning lights or braking concerns." },
  { title: "Suspension", description: "Knocks, vibration, handling or steering issues." },
  { title: "Electrical", description: "Battery, charging, wiring or electrical faults." },
  { title: "Air Conditioning", description: "Poor cooling, noises, leaks or A/C repairs." },
  { title: "Diagnostics", description: "Warning lights, fault codes or performance issues." },
  { title: "General Repair", description: "Servicing, maintenance and general mechanical work." },
  { title: "Other", description: "Anything not listed above." },
];

const initialFormData: QuoteFormData = {
  name: "",
  phone: "",
  email: "",
  registrationState: "WA",
  registration: "",
  make: "",
  model: "",
  year: "",
  category: "",
  description: "",
  contactMethod: "phone",
};

const MAX_FILES = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function QuoteForm() {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [submittedReference, setSubmittedReference] = useState("");
  const [fileError, setFileError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModels = useMemo(
    () => (formData.make ? vehicleModels[formData.make] ?? ["Other"] : []),
    [formData.make]
  );

  function updateField<K extends keyof QuoteFormData>(field: K, value: QuoteFormData[K]) {
    setFormData((previous) => ({ ...previous, [field]: value }));
  }

  function handleMakeChange(value: string) {
    setFormData((previous) => ({ ...previous, make: value, model: "" }));
  }

  function addFiles(fileList: FileList | File[]) {
    setFileError("");
    const incoming = Array.from(fileList);
    const remainingSlots = MAX_FILES - photos.length;

    if (remainingSlots <= 0) {
      setFileError(`You can upload up to ${MAX_FILES} photos.`);
      return;
    }

    const accepted: UploadedPhoto[] = [];
    for (const file of incoming.slice(0, remainingSlots)) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const validType = file.type.startsWith("image/") || extension === "heic" || extension === "heif";

      if (!validType) {
        setFileError("Only JPG, PNG, WEBP, HEIC and HEIF image files are accepted.");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError("Each photo must be smaller than 10 MB.");
        continue;
      }

      accepted.push({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (incoming.length > remainingSlots) {
      setFileError(`Only ${MAX_FILES} photos can be uploaded.`);
    }

    setPhotos((previous) => [...previous, ...accepted]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  }

  function removePhoto(id: string) {
    setPhotos((previous) => {
      const selected = previous.find((photo) => photo.id === id);
      if (selected) URL.revokeObjectURL(selected.previewUrl);
      return previous.filter((photo) => photo.id !== id);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData.category) {
      document.getElementById("repair-category")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const reference = `J1Q-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    console.log("Quote request submitted:", { ...formData, photos: photos.map((photo) => photo.file) });
    setSubmittedReference(reference);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
    setFormData(initialFormData);
    setSubmittedReference("");
    setFileError("");
  }

  if (submittedReference) {
    return (
      <div data-aos="zoom-in" className="rounded-[2rem] border border-emerald-500/30 bg-neutral-900/95 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-12">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-emerald-400">Request submitted</p>
        <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Quote request received</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-300">
          Thank you. J1 Motors will review the information and contact you using your preferred contact method.
        </p>
        <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-white/10 bg-black/30 p-5">
          <p className="text-sm text-neutral-500">Reference Number</p>
          <p className="mt-1 text-xl font-black tracking-wider text-white">{submittedReference}</p>
        </div>
        <button type="button" onClick={resetForm} className="mt-8 rounded-full bg-red-600 px-7 py-3.5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700">
          Request Another Quote
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-aos="fade-left" className="rounded-[2rem] border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
      <FormSection icon={<User size={22} />} title="Customer Details" description="Tell us how we can contact you about the quote.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Full Name" name="name" value={formData.name} onChange={(value) => updateField("name", value)} placeholder="Your full name" required />
          <TextField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={(value) => updateField("phone", value)} placeholder="0497 000 000" required />
          <div className="md:col-span-2">
            <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={(value) => updateField("email", value)} placeholder="you@example.com" />
          </div>
        </div>
      </FormSection>

      <FormDivider />

      <FormSection icon={<Car size={22} />} title="Vehicle Details" description="Enter the vehicle registration and basic details.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid grid-cols-[0.75fr_1.25fr] gap-3 md:col-span-2">
            <SearchableSelect label="Registration State" name="registrationState" value={formData.registrationState} options={australianStates} placeholder="Select state" required onChange={(value) => updateField("registrationState", value)} />
            <TextField label="Vehicle Registration" name="registration" value={formData.registration} onChange={(value) => updateField("registration", value.toUpperCase())} placeholder="1ABC234" required />
          </div>
          <SearchableSelect label="Vehicle Make" name="make" value={formData.make} options={makes} placeholder="Search vehicle make" required onChange={handleMakeChange} />
          <SearchableSelect label="Vehicle Model" name="model" value={formData.model} options={availableModels} placeholder={formData.make ? "Search vehicle model" : "Select make first"} disabled={!formData.make} required onChange={(value) => updateField("model", value)} />
          <SearchableSelect label="Vehicle Year" name="year" value={formData.year} options={years} placeholder="Search vehicle year" required onChange={(value) => updateField("year", value)} />
        </div>
      </FormSection>

      <FormDivider />

      <FormSection icon={<Wrench size={22} />} title="Repair Category" description="Choose the area that best matches your request.">
        <div id="repair-category" className="grid gap-3 sm:grid-cols-2">
          {repairCategories.map((category) => {
            const selected = formData.category === category.title;
            return (
              <button key={category.title} type="button" onClick={() => updateField("category", category.title)} className={`relative rounded-2xl border p-5 text-left transition duration-200 ${selected ? "border-red-500 bg-red-600/15 shadow-lg shadow-red-950/20" : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-white">{category.title}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">{category.description}</p>
                  </div>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-red-500 bg-red-600 text-white" : "border-neutral-600 text-transparent"}`}>
                    <Check size={15} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {!formData.category && <p className="mt-3 text-sm text-neutral-500">Please select one repair category before submitting.</p>}
      </FormSection>

      <FormDivider />

      <FormSection icon={<Wrench size={22} />} title="Describe the Problem" description="Write the symptoms in your own words. A diagnosis will only be made after inspection.">
        <label htmlFor="description" className="mb-2 block text-sm font-bold text-neutral-200">Vehicle Concern</label>
        <textarea id="description" name="description" value={formData.description} onChange={(event) => updateField("description", event.target.value)} required rows={7} maxLength={2000} placeholder="Example: The vehicle makes a knocking noise over bumps and the steering feels loose. The problem started last week. No warning lights are currently displayed." className="w-full resize-y rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20" />
        <div className="mt-2 flex justify-between gap-4 text-xs text-neutral-500">
          <span>Include warning lights, noises, leaks and when the issue occurs.</span>
          <span>{formData.description.length}/2000</span>
        </div>
      </FormSection>

      <FormDivider />

      <FormSection icon={<Camera size={22} />} title="Upload Photos" description="Optional photos can help us understand the request before contacting you.">
        <div onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }} onDrop={handleDrop} className={`rounded-2xl border-2 border-dashed p-7 text-center transition ${dragActive ? "border-red-500 bg-red-600/10" : "border-white/15 bg-black/20 hover:border-white/30"}`}>
          <UploadCloud className="mx-auto h-11 w-11 text-red-500" />
          <p className="mt-4 font-bold text-white">Drag and drop photos here</p>
          <p className="mt-1 text-sm text-neutral-500">or choose files from your device</p>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-red-500 hover:bg-red-600">Browse Photos</button>
          <p className="mt-4 text-xs text-neutral-600">JPG, PNG, WEBP, HEIC or HEIF · Maximum 10 MB each · Up to {MAX_FILES} photos</p>
        </div>

        {fileError && <p className="mt-3 text-sm text-red-400">{fileError}</p>}

        {photos.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <div className="relative aspect-square">
                  <Image src={photo.previewUrl} alt={photo.file.name} fill unoptimized className="object-cover" />
                </div>
                <button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.file.name}`} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-white backdrop-blur transition hover:bg-red-600">
                  <Trash2 size={17} />
                </button>
                <p className="truncate px-3 py-2 text-xs text-neutral-400">{photo.file.name}</p>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      <FormDivider />

      <FormSection icon={<Phone size={22} />} title="Preferred Contact" description="Choose how you would like J1 Motors to respond.">
        <div className="grid gap-3 sm:grid-cols-2">
          <ContactOption icon={<Phone size={20} />} title="Phone" description="Call me about this request." selected={formData.contactMethod === "phone"} onClick={() => updateField("contactMethod", "phone")} />
          <ContactOption icon={<Mail size={20} />} title="Email" description="Reply to me by email." selected={formData.contactMethod === "email"} onClick={() => updateField("contactMethod", "email")} />
        </div>
        {formData.contactMethod === "email" && !formData.email && <p className="mt-3 text-sm text-amber-400">Please enter an email address above for email contact.</p>}
      </FormSection>

      <div className="mt-9 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-neutral-400">
        Submitting this form sends a quote request only. Final pricing may require vehicle inspection, diagnostic testing or confirmation of parts and labour.
      </div>

      <button type="submit" disabled={formData.contactMethod === "email" && !formData.email} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-base font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
        Request Quote
      </button>
    </form>
  );
}

function FormSection({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">{icon}</div>
        <div>
          <h2 className="text-xl font-black text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-neutral-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FormDivider() { return <div className="my-9 h-px bg-white/10" />; }

function TextField({ label, name, value, onChange, placeholder, type = "text", required = false }: { label: string; name: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-bold text-neutral-200">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input id={name} name={name} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="w-full rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-white placeholder:text-neutral-600 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20" />
    </div>
  );
}

function ContactOption({ icon, title, description, selected, onClick }: { icon: ReactNode; title: string; description: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-2xl border p-5 text-left transition ${selected ? "border-red-500 bg-red-600/15" : "border-white/10 bg-white/[0.035] hover:border-white/25"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected ? "bg-red-600 text-white" : "bg-white/5 text-neutral-400"}`}>{icon}</span>
          <div><p className="font-bold text-white">{title}</p><p className="mt-1 text-sm text-neutral-500">{description}</p></div>
        </div>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-red-500 bg-red-600 text-white" : "border-neutral-600 text-transparent"}`}><Check size={15} /></span>
      </div>
    </button>
  );
}

function SearchableSelect({ label, name, value, options, placeholder, disabled = false, required = false, onChange }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? options.filter((option) => option.toLowerCase().includes(normalizedQuery)) : options;
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function chooseOption(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={`${name}-button`} className="mb-2 block text-sm font-bold text-neutral-200">{label}{required && <span className="text-red-500"> *</span>}</label>
      <button id={`${name}-button`} type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-neutral-950 px-4 py-3 text-left text-white outline-none transition hover:border-white/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50">
        <span className={value ? "text-white" : "text-neutral-600"}>{value || placeholder}</span>
        <ChevronDown size={18} className={`shrink-0 text-neutral-500 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70">
          <div className="border-b border-white/10 p-3">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-white/10 bg-black py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredOptions.length ? filteredOptions.map((option) => (
              <button key={option} type="button" onClick={() => chooseOption(option)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white/10 ${option === value ? "bg-red-600/15 text-red-400" : "text-neutral-200"}`}>
                {option}{option === value && <Check size={16} />}
              </button>
            )) : <p className="px-3 py-6 text-center text-sm text-neutral-500">No matching options</p>}
          </div>
        </div>
      )}
    </div>
  );
}
