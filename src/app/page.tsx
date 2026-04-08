import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  HeroSection,
  FeaturesSection,
  AIInterviewsSection,
  StatsSection,
  TestimonialsSection,
  CTASection,
  BrowseJobsCTA,
} from "@/components/home/HomeSections";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <AIInterviewsSection />
        <BrowseJobsCTA />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
