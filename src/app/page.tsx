import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Comparison } from "@/components/sections/Comparison";
import { Modules } from "@/components/sections/Modules";
import { ReviewDeepDive } from "@/components/sections/ReviewDeepDive";
import { LowLevelDesign } from "@/components/sections/LowLevelDesign";
import { MockInterviews } from "@/components/sections/MockInterviews";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { FAQSection } from "@/components/sections/FAQSection";
import { CallToAction } from "@/components/sections/CallToAction";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Comparison />
        <Modules />
        <ReviewDeepDive />
        <LowLevelDesign />
        <MockInterviews />
        <FeatureGrid />
        <FAQSection />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
