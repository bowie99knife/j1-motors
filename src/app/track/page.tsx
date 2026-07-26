import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackRepair from "@/components/TrackRepair";

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <TrackRepair />
      <Footer />
    </main>
  );
}
