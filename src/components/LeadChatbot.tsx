"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Phone, Mail, Loader2 } from "lucide-react";

export default function LeadChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else {
      setStep(4);
      setMessages([{ role: "assistant", content: `Hey ${formData.name}! I'm the Izuki Labs architect. How can I help you build your brand today?` }]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages(prev => [...prev, data]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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

            <div className={cn("p-6 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar", step === 4 && "min-h-[300px]")}>
              {step <= 3 ? (
                <form onSubmit={handleNext} className="space-y-6">
                  {/* ... (Previous input fields) */}
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
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-3 rounded-2xl text-sm max-w-[85%]",
                        m.role === "assistant" ? "bg-white/5 mr-auto" : "bg-accent/10 ml-auto text-accent"
                      )}
                    >
                      {m.content}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <Loader2 className="w-4 h-4 animate-spin opacity-40" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {step === 4 && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 flex gap-2">
                <input 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs flex-1 outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-accent p-2 rounded-xl text-accent-foreground disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}

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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
