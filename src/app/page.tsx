import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="section-dark min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="text-center max-w-2xl">
        <h1 className="font-display text-hero text-white mb-6">
          izuki<span className="accent-square" />labs
        </h1>

        <p className="text-body-large text-white/40 mb-12">
          Full portfolio under construction
        </p>

        <Link
          href="/SocialmediaPackage"
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-display font-bold text-sm uppercase tracking-widest hover:bg-[#FF3F11] hover:text-white transition-all duration-300"
        >
          Social Media Packages
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-16 flex flex-col gap-3 text-sm text-white/30">
          <a
            href="mailto:it.mikiyas.daniel@gmail.com"
            className="hover:text-white transition-colors"
          >
            it.mikiyas.daniel@gmail.com
          </a>
          <a
            href="https://t.me/snowplugwalk"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Telegram — @snowplugwalk
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 text-xs text-white/15">
        © 2026 izuki.labs
      </div>
    </main>
  );
}
