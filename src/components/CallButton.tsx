import { Phone } from "lucide-react";

export default function CallButton() {
  return (
    <a
      href="tel:0497066771"
      aria-label="Call J1 Motors"
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 40,
      }}
      className="flex h-16 w-16 touch-manipulation items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition hover:scale-110 hover:bg-red-700"
    >
      <Phone size={28} />
    </a>
  );
}