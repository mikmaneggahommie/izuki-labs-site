"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";

type FlowState = "COLLECTING_NAME" | "COLLECTING_PHONE" | "COLLECTING_EMAIL" | "CHATTING";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("COLLECTING_NAME");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "Hi! I'm the izuki.labs assistant. 👋 What's your name?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage = { role: "user", content: userContent };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Artificial delay for "typing" feel
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    await delay(1000);

    if (flowState === "COLLECTING_NAME") {
      setFormData((prev) => ({ ...prev, name: userContent }));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Nice to meet you, ${userContent}! What's your phone number so we can reach out?`,
        },
      ]);
      setFlowState("COLLECTING_PHONE");
      setIsLoading(false);
    } else if (flowState === "COLLECTING_PHONE") {
      setFormData((prev) => ({ ...prev, phone: userContent }));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Got it. And your email address?",
        },
      ]);
      setFlowState("COLLECTING_EMAIL");
      setIsLoading(false);
    } else if (flowState === "COLLECTING_EMAIL") {
      setFormData((prev) => ({ ...prev, email: userContent }));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Perfect! I've saved your details. How can I facilitate your brand architecture today? You can ask about our pricing, packages, or specific services.",
        },
      ]);
      setFlowState("CHATTING");
      setIsLoading(false);
    } else {
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
            content: "Sorry, I'm having trouble connecting. Please try reaching out directly via email or Telegram.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
            className="fixed bottom-24 right-4 md:bottom-28 md:right-10 z-[90] w-[calc(100vw-2rem)] md:w-[380px] h-[75vh] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#1A1A1A]/10 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <h3 className="font-display text-lg font-bold tracking-tight text-[#1A1A1A]">
                izuki.labs
              </h3>
              <p className="text-xs text-[#1A1A1A]/40 mt-0.5">
                AI Brand Architect
              </p>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${
                    m.role === "assistant"
                      ? "bg-[#F4F4F4] text-[#1A1A1A] rounded-tl-none mr-auto shadow-sm"
                      : "bg-[#1A1A1A] text-white rounded-tr-none ml-auto shadow-md"
                  }`}
                >
                  {m.content}
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F4F4F4] text-[#1A1A1A] p-3.5 rounded-2xl rounded-tl-none mr-auto shadow-sm flex gap-1"
                >
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
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-[#1A1A1A]/10 bg-white"
            >
              <div className="relative flex items-center">
                <input
                  autoFocus
                  className="w-full border border-[#1A1A1A]/10 rounded-xl px-4 py-3 text-[14px] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 bg-[#F9F9F9] text-[#1A1A1A] pr-12 transition-all placeholder:text-gray-400"
                  placeholder={
                    flowState === "COLLECTING_NAME" ? "Type your name..." :
                    flowState === "COLLECTING_PHONE" ? "Enter phone number..." :
                    flowState === "COLLECTING_EMAIL" ? "Enter your email..." : 
                    "Ask me anything..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-1.5 bg-[#1A1A1A] text-white rounded-lg disabled:bg-gray-200 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {flowState === "COLLECTING_NAME" && !input && (
                <p className="text-[10px] text-[#1A1A1A]/30 text-center mt-3">
                  Or reach out directly via{" "}
                  <a href="tel:+251954676421" className="underline font-semibold text-[#1A1A1A]/50">
                    +251 954 676 421
                  </a>
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
