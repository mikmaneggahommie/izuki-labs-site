import Header from "@/components/Header";
import ExperienceLayer from "@/components/ExperienceLayer";
import HeroSection from "@/components/HeroSection";
import ServicesIntro from "@/components/ServicesIntro";
import WorkShowcase from "@/components/WorkShowcase";
import VelocityDivider from "@/components/VelocityDivider";
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
        <ServicesIntro />
        <WorkShowcase />
        <VelocityDivider />
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
