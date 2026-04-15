"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, ExternalLink } from "lucide-react";

type Message = {
  role: "assistant" | "user";
  content: string;
  isInfoRequest?: boolean;
};

type UserInfo = {
  name?: string;
  telegram?: string;
  phone?: string;
  email?: string;
};

// Improved Markdown-to-HTML formatter for enterprise styling
const formatMarkdown = (text: string) => {
  if (!text) return "";
  
  // Strip extraction signals and associated JSON block
  const cleanText = text
    .replace(/@@@INFO_EXTRACTED@@@\s*\{[\s\S]*?\}/g, "")
    .replace(/@@@INFO_EXTRACTED@@@/g, "")
    .trim();

  return cleanText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>') // Bullet points
    .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li class="ml-4 list-decimal">$1</li>') // Numbered lists
    .replace(/\n/g, '<br />')
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="my-2">$1</ul>'); // Wrap lists
};

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [flowState, setFlowState] = useState<"COLLECTING_NAME" | "COLLECTING_CONTACT" | "COLLECTING_EMAIL" | "CHATTING">("COLLECTING_NAME");
  const [formData, setFormData] = useState<UserInfo>({});
  const [leadStepInput, setLeadStepInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validation Patterns
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => {
    const clean = phone.replace(/[\s\-\(\)]/g, "");
    return /^\+?\d{7,15}$/.test(clean);
  };
  const validateTelegram = (tg: string) => /^@?[a-zA-Z0-9_]{5,32}$/.test(tg);

  const normalizeTelegram = (tg: string) => tg.startsWith("@") ? tg : "@" + tg;

  // Persistence: Load
  useEffect(() => {
    const savedMsg = sessionStorage.getItem("izuki_chat_msgs");
    const savedInfo = sessionStorage.getItem("izuki_chat_info");
    if (savedMsg) setMessages(JSON.parse(savedMsg));
    else setMessages([{ role: "assistant", content: "Hey, I'm glad you're here 👋 What's your name?" }]);
    
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      setFormData(info);
      if (info.email) setFlowState("CHATTING");
    }
  }, []);

  // Persistence: Save
  useEffect(() => {
    if (messages.length > 0) sessionStorage.setItem("izuki_chat_msgs", JSON.stringify(messages));
    if (Object.keys(formData).length > 0) sessionStorage.setItem("izuki_chat_info", JSON.stringify(formData));
  }, [messages, formData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      setIsNearBottom(scrollTop + clientHeight > scrollHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const appendAssistantMessage = (content: string, isInfoRequest = false) => {
    setMessages((prev) => [...prev, { role: "assistant", content, isInfoRequest }]);
  };

  const tryLeadSubmit = async (data: UserInfo) => {
    // Only submit if we have at least one valid contact method
    const hasContact = (data.email && validateEmail(data.email)) || 
                       (data.phone && validatePhone(data.phone)) || 
                       (data.telegram && validateTelegram(data.telegram));

    if (!hasContact) return;

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error("Lead submission failed:", e);
    }
  };

  const handleSkip = () => {
    tryLeadSubmit(formData);
    setMessages((prev) => [...prev, 
      { role: "user", content: "I'll skip the details for now." },
      { role: "assistant", content: "No worries! Ask me anything about design, pricing, or how I work." }
    ]);
    setFlowState("CHATTING");
  };

  const handleLeadStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let val = leadStepInput.trim();
    if (!val) return;

    if (flowState === "COLLECTING_NAME") {
      if (val.length < 2 || /\d/.test(val)) {
        setError("Please enter a valid name (no numbers).");
        return;
      }
      const newData = { ...formData, name: val };
      setFormData(newData);
      setMessages(prev => [...prev, { role: "user", content: val }]);
      appendAssistantMessage(`Nice to meet you, ${val}. What's the best way to reach you? (Telegram @username or Phone)`);
      setFlowState("COLLECTING_CONTACT");
    } else if (flowState === "COLLECTING_CONTACT") {
      const isEmail = validateEmail(val);
      const isPhone = !isEmail && /^\+?\d{7,15}$/.test(val.replace(/[\s\-\(\)]/g, ""));
      const isTelegram = !isEmail && !isPhone;

      if (isTelegram && val.length < 3) {
        setError("Please enter a valid contact method.");
        return;
      }
      
      const normalizedValue = isTelegram && !val.includes("/") ? normalizeTelegram(val) : val;
      const newData = { ...formData, [isTelegram ? "telegram" : "phone"]: normalizedValue };
      setFormData(newData);
      setMessages(prev => [...prev, { role: "user", content: val }]);
      appendAssistantMessage("Perfect. Lastly, your email for the custom proposal?");
      setFlowState("COLLECTING_EMAIL");
    } else if (flowState === "COLLECTING_EMAIL") {
      if (!validateEmail(val)) {
        setError("Please enter a valid email address.");
        return;
      }
      const newData = { ...formData, email: val };
      setFormData(newData);
      setMessages(prev => [...prev, { role: "user", content: val }]);
      appendAssistantMessage("Got it! How can I help you today? Ask me anything about design, pricing, or my process.");
      tryLeadSubmit(newData);
      setFlowState("CHATTING");
    }
    setLeadStepInput("");
  };

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage: Message = { role: "user", content: userContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userInfo: formData,
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        // Append initial assistant placeholder
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          assistantContent += chunk;
          
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = assistantContent;
            return newMessages;
          });
        }
      } else {
        const errorBody = await response.json().catch(() => ({}));
        console.error(`[IZUKI-FRONTEND] API Failed (${response.status}):`, errorBody);
        
        if (response.status === 404) {
           throw new Error("API Route Missing. Check Vercel Deployment.");
        } else if (response.status === 500) {
           throw new Error(errorBody.message || 'Something went wrong. Try again.');
        } else {
           throw new Error(`Connection failed (${response.status})`);
        }
      }
    } catch (err: any) {
      console.error("Critical Connection Failure:", err);
      appendAssistantMessage("I'm having trouble connecting right now. Try again in a moment, or reach me directly below.");
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
          className={`fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A] text-white shadow-2xl transition-all hover:scale-110 active:scale-95 md:bottom-10 md:right-10 ${
            isNearBottom ? "ring-2 ring-[#00FF00]/50" : ""
          }`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ rotate: 12 }}
        >
          <MessageSquare className="h-6 w-6" />
        </motion.button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 right-4 z-[110] flex h-[520px] w-[calc(100vw-32px)] max-w-[400px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0A0A0A] shadow-[0_32px_128px_rgba(0,0,0,0.8)] backdrop-blur-xl md:bottom-10 md:right-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-[#111111] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-black tracking-tight text-white uppercase">IZUKI LABS</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF00] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00FF00]" />
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-scroll flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed ${
                        message.role === "user"
                          ? "rounded-[1.25rem] rounded-br-[4px] bg-[#FF0000] text-white font-medium shadow-[0_4px_12px_rgba(255,0,0,0.2)]"
                          : "rounded-[1.25rem] rounded-bl-[4px] bg-[#1A1A1A] text-white/90 border border-white/5"
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                    />
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-[1.25rem] rounded-bl-[4px] bg-[#1A1A1A] px-5 py-4 border border-white/5">
                      <div className="flex gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/30" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input & Footer */}
            <div className="border-t border-white/5 bg-[#111111] p-4">
              {flowState !== "CHATTING" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Step {flowState === "COLLECTING_NAME" ? "1" : flowState === "COLLECTING_CONTACT" ? "2" : "3"} of 3
                    </span>
                    <button 
                      onClick={handleSkip}
                      className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    >
                      Skip to Chat
                    </button>
                  </div>
                  
                  <form onSubmit={handleLeadStep} className="relative">
                    <motion.input
                      autoFocus
                      animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      value={leadStepInput}
                      onChange={(e) => {
                        setLeadStepInput(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder={
                        flowState === "COLLECTING_NAME" ? "Enter your name..." : 
                        flowState === "COLLECTING_CONTACT" ? "@telegram, phone, or link..." : 
                        "Enter your email..."
                      }
                      className={`w-full rounded-xl border py-3 pl-4 pr-14 text-[14px] text-white placeholder:text-white/20 focus:outline-none transition-all ${
                        error ? "border-red-500/60 bg-red-500/5" : "border-white/10 bg-[#1A1A1A] focus:border-white/20"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!leadStepInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF0000] text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                  {/* Error space — always reserved to prevent layout shift */}
                  <div className="h-4">
                    {error && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="block text-[11px] font-medium text-red-400"
                      >
                        {error}
                      </motion.span>
                    )}
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#FF0000] rounded-full"
                      initial={{ width: "33.33%" }}
                      animate={{ 
                        width: flowState === "COLLECTING_NAME" ? "33.33%" : 
                               flowState === "COLLECTING_CONTACT" ? "66.66%" : "100%" 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <form onSubmit={submitMessage} className="relative">
                    <input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] py-3 pl-4 pr-14 text-[14px] text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF0000] text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href="mailto:it.mikiyas.daniel@gmail.com"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF0000] text-[12px] font-bold uppercase tracking-tight text-white transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      Email Me
                    </a>
                    <a
                      href="https://t.me/snowplugwalk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-[12px] font-bold uppercase tracking-tight text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                    >
                      Message Telegram
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
