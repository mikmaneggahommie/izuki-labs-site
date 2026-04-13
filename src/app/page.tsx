import SpinningCircle from "@/components/SpinningCircle";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full delay-1000" />

      <div className="z-10 text-center space-y-12">
        <header className="space-y-4">
          <p className="text-accent font-mono text-xs uppercase tracking-[0.5em] animate-fade-in">
            Architecture of Influence
          </p>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-tight">
            IZUKI<span className="text-accent">.</span>LABS
          </h1>
        </header>

        <nav className="flex flex-col items-center gap-8">
          <Link 
            href="/SocialmediaPackage"
            data-cursor="EXPLORE"
            className="group relative px-12 py-6 rounded-2xl liquid-glass border-white/5 overflow-hidden transition-all hover:scale-105"
          >
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-xl font-bold uppercase tracking-widest">Social Media Package</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <div className="flex gap-6 text-[10px] font-mono uppercase tracking-widest opacity-40">
            <span>Portfolio</span>
            <span>Architecture</span>
            <span>Contact</span>
          </div>
        </nav>
      </div>

      <div className="absolute bottom-12">
        <SpinningCircle text="IZUKI.LABS • EST 2026 • " size={160} />
      </div>
    </main>
  );
}
