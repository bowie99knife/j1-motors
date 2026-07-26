import { MapPin, Phone, Clock } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="bg-white py-24 text-black">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-semibold uppercase tracking-[0.3em] text-red-600">
            Contact
          </p>

          <h2 className="mt-4 text-4xl font-black">Visit J1 Motors</h2>

          <p className="mt-5 max-w-xl leading-7 text-neutral-600">
            Contact our workshop to book a service, discuss a repair or arrange
            a vehicle inspection.
          </p>

          <div className="mt-8 space-y-5 text-neutral-700">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-red-600" size={22} />
              <p>
                <strong>Address:</strong> 193 Campbell Street, Belmont WA
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-1 text-red-600" size={22} />
              <p>
                <strong>Phone:</strong>{" "}
                <a href="tel:0497066771" className="underline-offset-4 hover:underline">
                  0497 066 771
                </a>
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 text-red-600" size={22} />
              <p>
                <strong>Hours:</strong> Monday–Friday, 8:30am–5:00pm
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-100 p-8 md:p-10">
          <h3 className="text-2xl font-black">Need help with your vehicle?</h3>

          <p className="mt-5 leading-7 text-neutral-600">
            Call us directly or open the workshop location in Google Maps.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="tel:0497066771"
              className="rounded-lg bg-black px-6 py-4 font-bold text-white transition hover:bg-red-600"
            >
              Call Now
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=193+Campbell+Street+Belmont+WA"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-4 font-bold text-black transition hover:border-red-600 hover:text-red-600"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}