"use client";

import { motion } from "framer-motion";
import { Paintbrush, Video, Camera, Scissors } from "lucide-react";

const services = [
  {
    name: "Logo Design / Branding",
    price: "$99",
    unit: "set",
    icon: <Paintbrush className="w-6 h-6" />,
    description: "Architecting visual identities that resonate.",
  },
  {
    name: "Video Editing / Reels",
    price: "$79",
    unit: "vid",
    icon: <Video className="w-6 h-6" />,
    description: "High-impact short form content architecture.",
  },
  {
    name: "Motion Graphics",
    price: "$129",
    unit: "vid",
    icon: <Scissors className="w-6 h-6" />,
    description: "Fluid movement for digital atmospheres.",
  },
  {
    name: "Product Photography",
    price: "Custom",
    unit: "session",
    icon: <Camera className="w-6 h-6" />,
    description: "Professional capture of physical assets.",
  },
];

export default function ServiceMenu() {
  return (
    <section className="py-24 px-6 md:px-12 bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            Service Menu
          </h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em]">
            Fixed-rate brand components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group liquid-glass p-6 rounded-2xl border-white/5 hover:border-accent/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold uppercase mb-2 group-hover:text-accent transition-colors">{service.name}</h3>
              <p className="text-xs text-muted-foreground mb-6 h-10 overflow-hidden">{service.description}</p>
              
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-black tracking-tighter">{service.price}</span>
                <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest">/ {service.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
