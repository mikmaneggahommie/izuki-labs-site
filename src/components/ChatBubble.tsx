"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getStudioConciergeReply } from "@/lib/studio-concierge";

type FlowState =
  | "COLLECTING_NAME"
  | "COLLECTING_PHONE"
  | "COLLECTING_EMAIL"
  | "CHATTING";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const backendChatEnabled = process.env.NEXT_PUBLIC_CHAT_MODE !== "disabled";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>("COLLECTING_NAME");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to izuki.labs. What should I call you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: "Got a question about a plan or timeline? Ask me anything right here.",
          },
        ]);
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

  const appendAssistantMessage = (content: string) => {
    setMessages((current) => [
      ...current,
      { role: "assistant", content },
    ]);
  };

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) {
      return;
    }

    const userContent = input.trim();
    const userMessage: Message = { role: "user", content: userContent };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 420));

    if (flowState === "COLLECTING_NAME") {
      setFormData((current) => ({ ...current, name: userContent }));
      appendAssistantMessage(
        `Perfect, ${userContent}. What phone number should I use for project follow-up?`
      );
      setFlowState("COLLECTING_PHONE");
      setIsLoading(false);
      return;
    }

    if (flowState === "COLLECTING_PHONE") {
      // Basic phone validation: strips non-digits and checks length
      const digitCount = userContent.replace(/\\D/g, "").length;
      if (digitCount < 9 || digitCount > 15) {
        appendAssistantMessage(
          "That doesn't look like a valid phone number. Please provide a valid number with country code if needed."
        );
        setIsLoading(false);
        return;
      }

      setFormData((current) => ({ ...current, phone: userContent }));
      appendAssistantMessage(
        "Great. Drop your email too and I’ll keep the thread organized."
      );
      setFlowState("COLLECTING_EMAIL");
      setIsLoading(false);
      return;
    }

    if (flowState === "COLLECTING_EMAIL") {
      // Basic email validation regex
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(userContent)) {
        appendAssistantMessage(
          "That doesn't look like a valid email. Please provide a valid email address."
        );
        setIsLoading(false);
        return;
      }

      const nextUserInfo = { ...formData, email: userContent };
      setFormData(nextUserInfo);
      appendAssistantMessage(
        backendChatEnabled
          ? "Locked in. Ask about pricing, timelines, retainers, or the best package for your brand."
          : "Locked in. I’ve got your details in this chat, and I can still guide you through pricing, timelines, and the best package right here."
      );
      setFlowState("CHATTING");
      setIsLoading(false);

      // Silently save the lead to the backend
      try {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextUserInfo),
        });
      } catch (err) {
        console.error("Failed to save lead:", err);
      }

      return;
    }

    const nextMessages = [...messages, userMessage];

    if (!backendChatEnabled) {
      appendAssistantMessage(getStudioConciergeReply(userContent, formData));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          userInfo: formData,
        }),
      });

      const data = (await response.json()) as Partial<Message>;

      if (data.content && data.role === "assistant") {
        appendAssistantMessage(data.content);
      } else {
        appendAssistantMessage(getStudioConciergeReply(userContent, formData));
      }
    } catch {
      appendAssistantMessage(getStudioConciergeReply(userContent, formData));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen ? (
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#111111] text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-colors hover:border-[#FF0000] md:bottom-8 md:right-8 ${
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
                  <span className="h-2.5 w-2.5 rounded-full bg-[#E8503A]" />
                </div>
                <p className="text-[12px] font-medium text-white/45">
                  {backendChatEnabled
                    ? "AI Studio Concierge"
                    : "Studio Concierge"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/72 transition-colors hover:text-[#E8503A]"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-6 py-6">
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`max-w-[88%] px-4 py-3 text-[14px] leading-[1.55] ${
                    message.role === "assistant"
                      ? "rounded-[12px_12px_12px_4px] border border-white/6 bg-[#1A1A1A] text-white"
                      : "ml-auto rounded-[12px_12px_4px_12px] bg-[#E8503A] text-white"
                  }`}
                >
                  {message.content}
                </motion.div>
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
                    className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#E8503A] text-white transition-opacity disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="mailto:it.mikiyas.daniel@gmail.com"
                  className="flex h-11 items-center justify-center rounded-[8px] bg-[#E8503A] px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Email Me
                </a>
                <a
                  href="https://t.me/snowplugwalk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center rounded-[8px] border border-white/10 bg-[#1A1A1A] px-4 text-[13px] font-medium text-white transition-colors hover:border-white/20"
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
