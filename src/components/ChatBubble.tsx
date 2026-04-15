"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      setMessages([{ role: "assistant", content: "What would you like to know?" }]);
      hasInitialized.current = true;
    }
  }, [isOpen]);

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
      // Initial Chat prompt
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
      default: return "What would you like to know?";
    }
  };

  const getCurrentPrompt = () => {
    if (messages.length === 0) return "What would you like to know?";
    // For collection states, show the last assistant message content
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    return lastAssistant?.content || "What would you like to know?";
  };

  return (
    <>
      {!isOpen ? (
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-[#FF0000]/40 bg-[#000000] text-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.2)] md:bottom-8 md:right-8 transition-all hover:scale-110 hover:border-[#FF0000] ${
            isNearBottom ? "animate-pulse" : ""
          }`}
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </motion.button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 z-[200] flex h-[580px] w-full max-w-[420px] flex-col overflow-hidden border-[2.5px] border-[#FF0000] bg-[#000000] shadow-[12px_12px_0px_#000000]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b-[2.5px] border-[#FF0000] px-6 py-5 bg-[#000000]">
              <div className="flex items-center gap-3">
                <span className="font-[family-name:var(--font-neue-haas-display)] text-xl font-black uppercase tracking-tighter text-white">izuki.labs</span>
                <div className="relative h-2.5 w-2.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#FF0000] opacity-75" />
                  <span className="relative block h-2.5 w-2.5 rounded-full bg-[#FF0000]" />
                </div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF0000]/60">Ask anything</p>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#FF0000] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MIDDLE SECTION - DYNAMIC HUB */}
            <div className="flex-1 overflow-hidden p-6">
              {flowState === "CHATTING" ? (
                <div className="chat-scroll h-full space-y-4 overflow-y-auto pr-2">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] border-[1.5px] px-4 py-3 text-[14px] leading-relaxed ${
                        m.role === "user" 
                        ? "border-[#FF0000] bg-[#FF0000] font-black text-black" 
                        : "border-[#FF0000] bg-[#111111] text-[#FF0000]"
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
                      />
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="w-full border-[2.5px] border-[#FF0000] bg-[#111111] p-8 text-center shadow-[6px_6px_0px_#FF0000]">
                    <p className="text-xl font-black leading-tight text-[#FF0000] uppercase tracking-tighter">
                      {getCurrentPrompt()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* LOWER SECTION - INPUT & ACTIONS */}
            <div className="border-t-[2.5px] border-[#00FF00] bg-[#000000]">
              <form onSubmit={submitMessage} className="border-b-[2.5px] border-[#00FF00]">
                <div className="flex items-center">
                  <input
                    autoFocus
                    value={input}
                    disabled={isLoading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="h-16 flex-1 bg-transparent px-6 text-lg font-bold text-[#00FF00] outline-none placeholder:text-[#00FF00]/30"
                  />
                  <button type="submit" className="flex h-16 w-16 items-center justify-center bg-[#00FF00] text-black transition-colors hover:bg-white">
                    <Send className="h-6 w-6" />
                  </button>
                </div>
              </form>

              <div className="p-5 space-y-4">
                {flowState !== "CHATTING" && (
                  <button
                    onClick={handleSkip}
                    className="h-12 w-full border-[2.5px] border-[#FF0000] bg-[#111111] text-[13px] font-black uppercase tracking-[0.4em] text-[#FF0000] transition-all hover:bg-[#FF0000] hover:text-black"
                  >
                    SKIP PROTOCOL
                  </button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="mailto:it.mikiyas.daniel@gmail.com"
                    className="flex h-12 items-center justify-center bg-[#FF0000] text-[13px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-white"
                  >
                    EMAIL
                  </a>
                  <a
                    href="https://t.me/snowplugwalk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center border-[2px] border-[#FF0000] bg-black text-[13px] font-black uppercase tracking-[0.2em] text-[#FF0000] transition-all hover:bg-[#FF0000] hover:text-black"
                  >
                    TELEGRAM
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
