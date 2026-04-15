"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X, User, Phone, Mail, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming cn is available, or I'll define it locally

type FlowState =
  | "COLLECTING_NAME"
  | "COLLECTING_TELEGRAM"
  | "COLLECTING_PHONE"
  | "COLLECTING_EMAIL"
  | "CHATTING";

type Message = {
  role: "assistant" | "user";
  content: string;
  isInfoRequest?: boolean;
};

const backendChatEnabled = process.env.NEXT_PUBLIC_CHAT_MODE !== "disabled";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("COLLECTING_NAME");
  const [formData, setFormData] = useState({ name: "", telegram: "", phone: "", email: "" });
  const [messages, setMessages] = useState<Message[]>([]);
  const hasInitialized = useRef(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      setMessages([{ role: "assistant", content: "What would you like to know?" }]);
      hasInitialized.current = true;
    }
  }, [isOpen]);

  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/^\s*-\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br />');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 400;
      
      setIsNearBottom(nearBottom);

      if (hasAutoOpened || isOpen) return;

      if (nearBottom) {
        setIsOpen(true);
        setHasAutoOpened(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAutoOpened, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, isLoading, messages]);

  const appendAssistantMessage = (content: string, isInfoRequest = false) => {
    setMessages((current) => [
      ...current,
      { role: "assistant", content, isInfoRequest },
    ]);
  };

  const handleSkip = () => {
    if (flowState === "COLLECTING_NAME") {
      setFlowState("COLLECTING_TELEGRAM");
      appendAssistantMessage("No worries. What's your Telegram handle?", true);
    } else if (flowState === "COLLECTING_TELEGRAM") {
      setFlowState("COLLECTING_PHONE");
      appendAssistantMessage("Got it. How about a phone number?", true);
    } else if (flowState === "COLLECTING_PHONE") {
      setFlowState("COLLECTING_EMAIL");
      appendAssistantMessage("Understood. Drop your email if you'd like me to follow up there.", true);
    } else if (flowState === "COLLECTING_EMAIL") {
      setFlowState("CHATTING");
      appendAssistantMessage("Locked in. Ask about pricing or my Remote Designer plan.");
      if (formData.name || formData.phone || formData.telegram || formData.email) {
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch(err => console.error("Failed to save lead:", err));
      }
    }
  };

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage: Message = { role: "user", content: userContent };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    if (flowState === "COLLECTING_NAME") {
      setFormData(prev => ({ ...prev, name: userContent }));
      setFlowState("COLLECTING_TELEGRAM");
      appendAssistantMessage("Thanks. What's your Telegram handle?", true);
      setIsLoading(false);
      return;
    } else if (flowState === "COLLECTING_TELEGRAM") {
      setFormData(prev => ({ ...prev, telegram: userContent }));
      setFlowState("COLLECTING_PHONE");
      appendAssistantMessage("Great. Any phone number for direct contact?", true);
      setIsLoading(false);
      return;
    } else if (flowState === "COLLECTING_PHONE") {
      setFormData(prev => ({ ...prev, phone: userContent }));
      setFlowState("COLLECTING_EMAIL");
      appendAssistantMessage("Almost done. Enter your email for formal follow-up.", true);
      setIsLoading(false);
      return;
    } else if (flowState === "COLLECTING_EMAIL") {
      setFormData(prev => ({ ...prev, email: userContent }));
      setFlowState("CHATTING");
      const currentData = { ...formData, email: userContent };
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      }).catch(err => console.error("Lead save failed:", err));
    }

    if (backendChatEnabled) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            userInfo: formData,
          }),
        });

        if (!response.ok) throw new Error("Chat failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        let assistantContent = "";
        const decoder = new TextDecoder();
        setMessages((current) => [...current, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          const uiText = assistantContent.split("@@@INFO_EXTRACTED@@@")[0];
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") last.content = uiText;
            return next;
          });
        }
      } catch (err: any) {
        console.error("Chat Error:", err);
        appendAssistantMessage("System temporarily offline.");
      } finally {
        setIsLoading(false);
      }
    } else {
      appendAssistantMessage("The bot is currently disabled.");
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (flowState) {
      case "COLLECTING_NAME": return "Type your name...";
      case "COLLECTING_TELEGRAM": return "Telegram handle...";
      case "COLLECTING_PHONE": return "Enter phone number...";
      case "COLLECTING_EMAIL": return "Enter your email...";
      default: return "Ask about pricing, services...";
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A] text-white shadow-liquid transition-all hover:scale-105 hover:border-white/20",
              isNearBottom && "animate-pulse border-[#FF0000]/40"
            )}
            aria-label="Open chat"
          >
            <MessageSquare className="h-6 w-6 stroke-[1.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[200] flex h-[600px] w-[calc(100vw-64px)] max-w-[400px] flex-col overflow-hidden rounded-[2.5rem] liquid-glass shadow-liquid"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-7 py-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tighter text-white uppercase">izuki.labs</span>
                  <div className="flex h-2 w-2 items-center justify-center">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-[#FF0000] opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-[#FF0000]" />
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Studio Concierge</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-white/10"
              >
                <X className="h-5 w-5 text-white/60 group-hover:text-white" />
              </button>
            </div>

            {/* CHAT AREA */}
            <div className="chat-scroll flex-1 space-y-5 overflow-y-auto px-7 py-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-[1.25rem] px-5 py-3.5 text-[14px] leading-relaxed",
                      m.role === "user"
                        ? "bg-[#FF0000] font-bold text-black shadow-[0_4px_15px_rgba(255,0,0,0.2)]"
                        : "border border-white/5 bg-white/[0.03] text-white/90"
                    )}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
                  />
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2.5">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                        className="h-1.5 w-1.5 rounded-full bg-[#FF0000]"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FOOTER AREA */}
            <div className="border-t border-white/5 bg-white/[0.01] p-6 space-y-5">
              <form onSubmit={submitMessage} className="relative group">
                <input
                  autoFocus
                  value={input}
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.02] pl-6 pr-14 text-sm font-medium text-white outline-none transition-all placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.04]"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF0000] text-black transition-all hover:scale-105 disabled:opacity-30"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </form>

              <div className="flex gap-3">
                {flowState !== "CHATTING" ? (
                  <button
                    onClick={handleSkip}
                    className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/[0.02] text-[11px] font-black uppercase tracking-[0.2em] text-white/60 transition-all hover:bg-white/5 hover:text-white"
                  >
                    Skip to Services
                  </button>
                ) : (
                  <div className="grid w-full grid-cols-2 gap-3">
                    <a
                      href="mailto:it.mikiyas.daniel@gmail.com"
                      className="flex h-12 items-center justify-center rounded-2xl bg-[#FF0000] text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all hover:opacity-90"
                    >
                      Email Me
                    </a>
                    <a
                      href="https://t.me/snowplugwalk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-[11px] font-black uppercase tracking-[0.2em] text-white/60 transition-all hover:border-white/20 hover:text-white"
                    >
                      Telegram
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
