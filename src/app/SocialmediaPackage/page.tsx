import Header from "@/components/Header";
import ExperienceLayer from "@/components/ExperienceLayer";
import HeroSection from "@/components/HeroSection";
import MarqueeTicker from "@/components/MarqueeTicker";
import WorkShowcase from "@/components/WorkShowcase";
import AboutMarquee from "@/components/AboutMarquee";
import PricingSection from "@/components/PricingSection";
import CaseStudy from "@/components/CaseStudy";
import PoliciesAccordion from "@/components/PoliciesAccordion";
import ContactFooter from "@/components/ContactFooter";
import ChatBubble from "@/components/ChatBubble";

export default function SocialMediaPackagePage() {
  return (
    <>
      <ExperienceLayer />
      <Header />

      <main className="site-main">
        <HeroSection />
        <MarqueeTicker />
        <WorkShowcase />
        <AboutMarquee />
        <PricingSection />
        <CaseStudy />
        <PoliciesAccordion />
        <ContactFooter />
      </main>

      <ChatBubble />
    </>
  );
}
