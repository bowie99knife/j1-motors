import { redirect } from "next/navigation";

export default function CancelBookingPage() {
  redirect("/manage-booking");
}
