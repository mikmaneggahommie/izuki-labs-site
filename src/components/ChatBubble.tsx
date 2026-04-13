"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ArrowRight } from "lucide-react";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
      setMessages([
        {
          role: "assistant",
          content: `Hey ${formData.name}! 👋 I'm the izuki.labs assistant. Ask me anything about our pricing, packages, or services.`,
        },
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userInfo: formData,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages((prev) => [...prev, data]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try reaching out directly via email or Telegram.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = ["Your name", "Phone number", "Email address"];
  const stepPlaceholders = ["e.g. Abebe Kebede", "e.g. 0912345678", "e.g. abebe@gmail.com"];
  const stepTypes = ["text", "tel", "email"];
  const stepKeys = ["name", "phone", "email"] as const;

  return (
    <>
      {/* Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-14 h-14 bg-[#FF3F11] rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(255,63,17,0.4)]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 md:bottom-28 md:right-10 z-[90] w-[calc(100vw-2rem)] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#1A1A1A]/10">
              <h3 className="font-display text-lg font-bold tracking-tight text-[#1A1A1A]">
                izuki.labs
              </h3>
              <p className="text-xs text-[#1A1A1A]/40 mt-0.5">
                Ask about pricing, packages, or services
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5" style={{ maxHeight: 350 }}>
              {step <= 3 ? (
                <form onSubmit={handleSubmitInfo} className="space-y-5">
                  {/* Progress */}
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          background:
                            s <= step ? "#1A1A1A" : "rgba(26,26,26,0.1)",
                        }}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#1A1A1A]/50 block mb-2">
                      {stepLabels[step - 1]}
                    </label>
                    <input
                      required
                      type={stepTypes[step - 1]}
                      placeholder={stepPlaceholders[step - 1]}
                      value={formData[stepKeys[step - 1]]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [stepKeys[step - 1]]: e.target.value,
                        })
                      }
                      className="w-full border border-[#1A1A1A]/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 bg-transparent text-[#1A1A1A]"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors"
                  >
                    {step < 3 ? "Continue" : "Start Chat"}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {step === 1 && (
                    <p className="text-xs text-[#1A1A1A]/30 text-center">
                      Or call directly:{" "}
                      <a href="tel:+251954676421" className="underline">
                        +251 954 676 421
                      </a>
                    </p>
                  )}
                </form>
              ) : (
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-3 rounded-lg text-sm leading-relaxed max-w-[85%] ${
                        m.role === "assistant"
                          ? "bg-[#f5f5f0] text-[#1A1A1A] mr-auto"
                          : "bg-[#1A1A1A] text-white ml-auto"
                      }`}
                    >
                      {m.content}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-1 px-3 py-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: i * 0.2,
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/30"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            {step === 4 && (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-[#1A1A1A]/10 flex gap-2"
              >
                <input
                  className="flex-1 border border-[#1A1A1A]/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 bg-transparent text-[#1A1A1A]"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#1A1A1A] text-white p-2.5 rounded-lg disabled:opacity-40 hover:bg-[#333] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
