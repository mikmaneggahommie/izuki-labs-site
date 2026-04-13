"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Phone, Mail } from "lucide-react";

export default function LeadChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else {
      // Logic for Supabase / API later
      setStep(4);
    }
  };

  return (
    <>
      {/* Floating Toggle */}
      <motion.button
        data-cursor="CHAT"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-accent text-accent-foreground shadow-liquid flex items-center justify-center z-[100]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 w-[350px] liquid-glass rounded-3xl overflow-hidden shadow-liquid z-[100] border-white/10"
          >
            <div className="bg-accent p-6 text-accent-foreground">
              <h3 className="text-xl font-black uppercase tracking-tighter">Liquid Assistant</h3>
              <p className="text-xs opacity-80 uppercase tracking-widest font-mono">izuki.labs support</p>
            </div>

            <div className="p-8 space-y-6">
              {step <= 3 ? (
                <form onSubmit={handleNext} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {step === 1 ? "Your Name" : step === 2 ? "Contact Number" : "Email Address"}
                    </label>
                    <div className="relative">
                      {step === 1 && <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                      {step === 2 && <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                      {step === 3 && <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                      
                      <input
                        required
                        type={step === 3 ? "email" : "text"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                        placeholder={step === 1 ? "Enter name..." : step === 2 ? "Enter phone..." : "Enter email..."}
                        value={step === 1 ? formData.name : step === 2 ? formData.phone : formData.email}
                        onChange={(e) => setFormData({ ...formData, [step === 1 ? 'name' : step === 2 ? 'phone' : 'email']: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                  >
                    Next <Send className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center py-8 space-y-4"
                >
                  <p className="text-sm font-medium">Thank you, {formData.name}!</p>
                  <p className="text-xs text-muted-foreground">Our team will reach out to you within 24 hours.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-4 text-accent text-[10px] font-bold uppercase tracking-widest"
                  >
                    Close Window
                  </button>
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            {step <= 3 && (
              <div className="h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-accent"
                  animate={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
