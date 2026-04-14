"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type FlowState =
  | "COLLECTING_NAME"
  | "COLLECTING_PHONE"
  | "COLLECTING_EMAIL"
  | "CHATTING";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const chatEnabled = process.env.NEXT_PUBLIC_CHAT_MODE !== "disabled";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [flowState, setFlowState] = useState<FlowState>(
    chatEnabled ? "COLLECTING_NAME" : "CHATTING"
  );
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [messages, setMessages] = useState<Message[]>(
    chatEnabled
      ? [
          {
            role: "assistant",
            content: "Welcome to izuki.labs. What should I call you?",
          },
        ]
      : [
          {
            role: "assistant",
            content:
              "The hosted version keeps chat lightweight, so live AI replies are off here. Reach out directly and I’ll reply personally.",
          },
        ]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, isLoading, messages]);

  const submitMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatEnabled || !input.trim() || isLoading) {
      return;
    }

    const userContent = input.trim();
    const userMessage: Message = { role: "user", content: userContent };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 550));

    if (flowState === "COLLECTING_NAME") {
      setFormData((current) => ({ ...current, name: userContent }));
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Perfect, ${userContent}. What phone number should I use for project follow-up?`,
        },
      ]);
      setFlowState("COLLECTING_PHONE");
      setIsLoading(false);
      return;
    }

    if (flowState === "COLLECTING_PHONE") {
      setFormData((current) => ({ ...current, phone: userContent }));
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Great. Drop your email too and I’ll keep the thread organized.",
        },
      ]);
      setFlowState("COLLECTING_EMAIL");
      setIsLoading(false);
      return;
    }

    if (flowState === "COLLECTING_EMAIL") {
      setFormData((current) => ({ ...current, email: userContent }));
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Locked in. Ask about pricing, timelines, retainers, or the best package for your brand.",
        },
      ]);
      setFlowState("CHATTING");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userInfo: formData,
        }),
      });
      const data = (await response.json()) as Partial<Message>;

      if (data.content && data.role === "assistant") {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: data.content ?? "" },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "I’m having trouble connecting right now. Reach me directly through email or Telegram and I’ll respond there.",
          },
        ]);
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I’m having trouble connecting right now. Reach me directly through email or Telegram and I’ll respond there.",
        },
      ]);
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
          className="fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#111111] text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-colors hover:border-[#E8503A] md:bottom-8 md:right-8"
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
            className="fixed bottom-[100px] right-4 z-[95] flex max-h-[520px] w-[calc(100vw-32px)] max-w-[380px] flex-col overflow-hidden rounded-[16px] border border-white/12 bg-[#0A0A0A] shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:right-8"
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
                  {chatEnabled ? "AI Brand Architect" : "Direct Project Contact"}
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

            {chatEnabled ? (
              <form
                onSubmit={submitMessage}
                className="border-t border-white/10 bg-[#111111] px-5 py-4"
              >
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
            ) : (
              <div className="space-y-3 border-t border-white/10 bg-[#111111] px-5 py-4">
                <a
                  href="mailto:it.mikiyas.daniel@gmail.com"
                  className="flex h-11 items-center justify-center rounded-[8px] bg-[#E8503A] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Email Me
                </a>
                <a
                  href="https://t.me/snowplugwalk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-center rounded-[8px] border border-white/10 bg-[#1A1A1A] px-4 text-[14px] font-medium text-white transition-colors hover:border-white/20"
                >
                  Message On Telegram
                </a>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
