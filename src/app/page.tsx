import Header from "@/components/Header";
import ExperienceLayer from "@/components/ExperienceLayer";
import HeroSection from "@/components/HeroSection";
import WorkShowcase from "@/components/WorkShowcase";
import AboutMarquee from "@/components/AboutMarquee";
import PricingSection from "@/components/PricingSection";
import CaseStudy from "@/components/CaseStudy";
import PoliciesAccordion from "@/components/PoliciesAccordion";
import ContactFooter from "@/components/ContactFooter";
import ChatBubble from "@/components/ChatBubble";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <ExperienceLayer />
      <Header />

      <main className="site-main">
        <HeroSection />
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
