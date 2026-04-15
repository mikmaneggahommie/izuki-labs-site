"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { isLikelyQuestion } from "@/lib/studio-concierge";

type FlowState =
  | "COLLECTING_NAME"
  | "COLLECTING_PHONE"
  | "COLLECTING_EMAIL"
  | "CHATTING";

type Message = {
  role: "assistant" | "user";
  content: string;
  isInfoRequest?: boolean;
};

type ChatApiResponse = {
  role: "assistant";
  content: string;
  extractedInfo?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
};

const backendChatEnabled = process.env.NEXT_PUBLIC_CHAT_MODE !== "disabled";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("COLLECTING_NAME");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 350;
      
      setIsNearBottom(nearBottom);

      if (hasAutoOpened || isOpen) {
        return;
      }

      // Trigger auto-open if user is near the bottom (footer reached)
      if (nearBottom) {
        setIsOpen(true);
        setHasAutoOpened(true);
        // Removed redundant "What would you like to know?" append here to fix doubling.
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
      setFlowState("CHATTING");
      appendAssistantMessage("No problem. We can keep it casual. How can I help with your design systems today?");
    } else if (flowState === "COLLECTING_PHONE") {
      setFlowState("COLLECTING_EMAIL");
      appendAssistantMessage("Understood. Drop your email if you'd like me to follow up there instead.", true);
    } else if (flowState === "COLLECTING_EMAIL") {
      setFlowState("CHATTING");
      appendAssistantMessage("Locked in. Ask about pricing, timelines, or my Remote Designer plan.");
      
      // Save partial lead if any
      if (formData.name || formData.phone) {
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).catch(err => console.error("Failed to save partial lead:", err));
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

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || "Stream failed");
        }

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

          const parts = assistantContent.split("@@@INFO_EXTRACTED@@@");
          const uiText = parts[0];
          const jsonText = parts[1];

          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") last.content = uiText;
            return next;
          });

          if (jsonText) {
            try {
              const info = JSON.parse(jsonText);
              const name = info.name || "";
              const phone = info.phone || "";
              const email = info.email || "";

              setFormData(prev => ({
                name: name || prev.name,
                phone: phone || prev.phone,
                email: email || prev.email,
              }));

              // If we just got an email and it looks valid, fire the lead save automatically
              if (email && email.includes("@") && email.includes(".")) {
                const currentData = { ...formData, name: name || formData.name, phone: phone || formData.phone, email };
                
                // Use a simple guard to prevent triple-firing during the stream
                if ((window as any)._lastSavedEmail !== email) {
                  (window as any)._lastSavedEmail = email;
                  fetch("/api/lead", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(currentData),
                  }).catch(err => console.error("Auto-lead save failed:", err));
                }
              }
            } catch (e) {}
          }
        }
      } catch (err: any) {
        console.error("Chat Error:", err);
        appendAssistantMessage(`Site Error: ${err.message || "System temporarily offline."}`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    appendAssistantMessage("The bot is currently disabled.");
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen ? (
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#111111] text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-colors hover:border-[#00FF00] md:bottom-8 md:right-8 ${
            isNearBottom ? "animate-dot-pulse" : ""
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5 stroke-[1.7]" />
        </motion.button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[100px] right-4 z-[95] flex max-h-[560px] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-[18px] border border-white/12 bg-[#0A0A0A] shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:right-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-[#111111] px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold tracking-[-0.03em] text-white">
                    izuki.labs
                  </p>
                  <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-online-pulse" />
                </div>
                <p className="text-[12px] font-medium text-white/45">
                  {backendChatEnabled
                    ? "Ask anything"
                    : "Design Assistant"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/72 transition-colors hover:text-[#00FF00]"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className="group flex flex-col gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`max-w-[88%] px-4 py-3 text-[14px] leading-[1.55] ${
                      message.role === "assistant"
                        ? "rounded-[12px_12px_12px_4px] border border-white/12 bg-[#1A1A1A] text-white"
                        : "ml-auto rounded-[12px_12px_4px_12px] bg-[#00FF00] text-black font-medium"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                  />
                  
                  {message.role === "assistant" && message.isInfoRequest && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-1"
                    >
                      <button
                        onClick={handleSkip}
                        className="flex h-8 items-center rounded-full border border-white/10 px-4 text-[11px] font-bold uppercase tracking-wider text-white/40 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white"
                      >
                        Skip for now
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}

              {isLoading ? (
                <div className="flex max-w-[88%] items-center gap-2 rounded-[12px_12px_12px_4px] border border-white/6 bg-[#1A1A1A] px-4 py-3">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-white/55"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: dot * 0.12,
                      }}
                    />
                  ))}
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="space-y-3 border-t border-white/10 bg-[#111111] px-5 py-4">
              <form onSubmit={submitMessage}>
                <div className="flex items-center gap-3">
                  <input
                    autoFocus
                    value={input}
                    disabled={isLoading}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={
                      flowState === "COLLECTING_NAME"
                        ? "Type your name..."
                        : flowState === "COLLECTING_PHONE"
                          ? "Enter phone number..."
                          : flowState === "COLLECTING_EMAIL"
                            ? "Enter your email..."
                            : "Ask about pricing, timelines, or services..."
                    }
                    className="h-12 flex-1 rounded-[8px] border border-white/10 bg-[#1A1A1A] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/20"
                  />

                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#00FF00] text-black transition-opacity disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="mailto:it.mikiyas.daniel@gmail.com"
                  className="flex h-11 items-center justify-center rounded-[8px] bg-[#00FF00] px-4 text-[13px] font-bold text-black transition-opacity hover:opacity-90 mt-1"
                >
                  Email Me
                </a>
                <a
                  href="https://t.me/snowplugwalk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center rounded-[8px] border border-[#00FF00]/40 bg-[#111111] px-4 text-[13px] font-bold text-[#00FF00] transition-colors hover:bg-[#00FF00]/10 mt-1"
                >
                  Message On Telegram
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
