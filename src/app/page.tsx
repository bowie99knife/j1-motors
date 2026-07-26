import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OurStory from "@/components/OurStory";
import WhyChooseUs from "@/components/WhyChooseUs";
import Services from "@/components/Services";
import Gallery from "@/components/gallery";
import Contact from "@/components/Contact";
import CallButton from "@/components/CallButton";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <OurStory />
        <WhyChooseUs />
        <Services />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <CallButton />
    </>
  );
}
