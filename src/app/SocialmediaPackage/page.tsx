import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
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
      <Header />

      <main>
        {/* Hero — Black bg, cascading images, massive text */}
        <HeroSection />

        {/* Selected Work — Off-white bg, phone mockups */}
        <WorkShowcase />

        {/* About — Black bg, text reveal */}
        <AboutMarquee />

        {/* Pricing — Off-white bg, 3 cards */}
        <PricingSection />

        {/* Case Study — Black bg, before/after */}
        <CaseStudy />

        {/* Policies — Off-white bg, accordion */}
        <PoliciesAccordion />

        {/* Contact & Footer — Black bg */}
        <ContactFooter />
      </main>

      {/* Floating Chat */}
      <ChatBubble />
    </>
  );
}
