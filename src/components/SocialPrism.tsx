"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import { cn } from "@/lib/utils";

const socialAccounts = [
  {
    handle: "@loline_mag",
    url: "https://www.instagram.com/loline_mag/",
    description: "Creative Direction & Editorial",
    posts: ["/1.JPG", "/2.jpg", "/3.jpg"], // Using local assets for placeholder feel but focused
  },
  {
    handle: "@atmosphere_251",
    url: "https://www.instagram.com/atmosphere_251/",
    description: "Event Branding & Motion",
    posts: ["/4.jpg", "/5.jpg", "/6.jpg"],
  },
];

export default function SocialPrism() {
  return (
    <section className="py-24 px-6 md:px-12 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <p className="text-accent font-mono uppercase text-sm tracking-widest mb-4">Live Social Presence</p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Social <br /> Prisms
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Explore the digital identities we architect. Real-time interaction meets liquid design.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {socialAccounts.map((account, i) => (
            <motion.div
              key={account.handle}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group relative liquid-glass rounded-[2.5rem] p-8 overflow-hidden"
            >
              {/* Decorative Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -z-10 group-hover:bg-accent/10 transition-colors duration-500" />

              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center border-white/10">
                    <InstagramIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{account.handle}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">{account.description}</p>
                  </div>
                </div>
                <a 
                  href={account.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-cursor="OPEN"
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group"
                >
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              {/* Grid of 'Prisms' (Interactive Posts) */}
              <div className="grid grid-cols-3 gap-4">
                {account.posts.map((src, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, rotateZ: index % 2 === 0 ? 2 : -2 }}
                    className="aspect-square relative rounded-2xl overflow-hidden liquid-glass border-white/10 group/post"
                  >
                    <img 
                      src={src} 
                      alt="Social Post" 
                      className="object-cover w-full h-full opacity-60 group-hover/post:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 noise-overlay opacity-[0.03]" />
                  </motion.div>
                ))}
              </div>

              {/* Liquid Status Indicator */}
              <div className="mt-8 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Connected • Live Stream</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
