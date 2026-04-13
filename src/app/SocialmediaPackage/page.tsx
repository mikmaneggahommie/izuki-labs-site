import ExperienceStack from "@/components/ExperienceStack";
import PricingMatrix from "@/components/PricingMatrix";
import ServiceMenu from "@/components/ServiceMenu";
import SocialPrism from "@/components/SocialPrism";
import HighlightSlider from "@/components/HighlightSlider";
import LeadChatbot from "@/components/LeadChatbot";
import SpinningCircle from "@/components/SpinningCircle";

export default function SocialMediaPackagePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-24">
        <ExperienceStack />
      </section>

      {/* 2. Pricing Section */}
      <section id="pricing">
        <PricingMatrix />
        <ServiceMenu />
      </section>

      {/* 3. Social Proof Section */}
      <section id="social">
        <SocialPrism />
      </section>

      {/* 4. Case Study Section */}
      <section id="cases">
        <HighlightSlider />
      </section>

      {/* 5. Footer with Spinning Motif */}
      <footer className="py-24 border-t border-white/5 flex flex-col items-center justify-center gap-12">
        <div className="text-center">
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mb-4">Ready to architect your brand?</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Build the <br /> Atmosphere
          </h2>
        </div>
        
        <div data-cursor="JOIN">
          <SpinningCircle text="JOIN IZUKI • START GROWING • " size={240} />
        </div>

        <div className="text-[10px] font-mono opacity-20 uppercase tracking-[0.5em] mt-12">
          © 2026 IZUKI.LABS • ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* Persistent Assistant */}
      <LeadChatbot />
    </main>
  );
}
