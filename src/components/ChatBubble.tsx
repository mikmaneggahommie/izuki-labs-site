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
  
  // Strip extraction signals
  const cleanText = text.split("@@@INFO_EXTRACTED@@@")[0].trim();

  return cleanText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>') // Bullet points
    .replace(/^\s*(\d+)\.\s+(.*)$/gm, '<li class="ml-4 list-decimal">$1</li>') // Numbered lists
    .replace(/\n/g, '<br />')
    .replace(/(<li.*<\/li>)/gs, '<ul class="my-2">$1</ul>'); // Wrap lists
};

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey, I'm the design partner for the lab. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [flowState, setFlowState] = useState<"COLLECTING_NAME" | "COLLECTING_CONTACT" | "COLLECTING_EMAIL" | "CHATTING">("COLLECTING_NAME");
  const [formData, setFormData] = useState<UserInfo>({});
  const [leadStepInput, setLeadStepInput] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSkip = () => {
    // If we have any data (name, phone, etc.), send it before skipping
    if (Object.keys(formData).length > 0) {
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    setMessages((prev) => [...prev, 
      { role: "user", content: "I'll skip the details for now." },
      { role: "assistant", content: "No worries! I'm here to help. What can I tell you about my design systems or pricing?" }
    ]);
    setFlowState("CHATTING");
  };

  const handleLeadStep = (e: React.FormEvent) => {
    e.preventDefault();
    const val = leadStepInput.trim();
    if (!val) return;

    if (flowState === "COLLECTING_NAME") {
      setFormData({ ...formData, name: val });
      setMessages(prev => [...prev, { role: "user", content: val }]);
      appendAssistantMessage(`Nice to meet you, ${val}. What's the best way to reach you? (Telegram @username or Phone)`);
      setFlowState("COLLECTING_CONTACT");
    } else if (flowState === "COLLECTING_CONTACT") {
      const isTelegram = val.startsWith("@");
      setFormData({ ...formData, [isTelegram ? "telegram" : "phone"]: val });
      setMessages(prev => [...prev, { role: "user", content: val }]);
      appendAssistantMessage("Perfect. Lastly, your email for the custom proposal?");
      setFlowState("COLLECTING_EMAIL");
    } else if (flowState === "COLLECTING_EMAIL") {
      setFormData({ ...formData, email: val });
      setMessages(prev => [...prev, { role: "user", content: val }]);
      appendAssistantMessage("Got it! I'm logging your request now. How can I help with your design projects today?");
      
      // Submit lead to backend
      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, email: val }),
      });
      
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
        throw new Error(errorData.details || "Connection failed.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Append initial message
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

        // Check for extraction signals
        if (assistantContent.includes("@@@INFO_EXTRACTED@@@")) {
          const parts = assistantContent.split("@@@INFO_EXTRACTED@@@");
          const jsonStr = parts[1]?.trim();
          if (jsonStr) {
            try {
              const extractedData = JSON.parse(jsonStr);
              setFormData(prev => ({ ...prev, ...extractedData }));
              // Save lead silently
              fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, ...extractedData }),
              });
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      console.error("Chat Error:", err);
      // Fallback response with specific error detail if available
      appendAssistantMessage(err.message || "I'm having a bit of trouble connecting to the network. You can reach me directly on Telegram @snowplugwalk or email me at it.mikiyas.daniel@gmail.com.");
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
            isNearBottom ? "ring-2 ring-red-500/50" : ""
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
            className="fixed bottom-4 right-4 z-[110] flex h-[500px] w-[calc(100vw-32px)] max-w-[400px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0A0A0A] shadow-[0_32px_128px_rgba(0,0,0,0.8)] backdrop-blur-xl md:bottom-10 md:right-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-[#111111] px-6 py-5">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">izuki.labs</span>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF0000]" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">Studio Concierge</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-scroll flex-1 p-6 space-y-6 overflow-y-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3.5 text-[14.5px] leading-relaxed ${
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

            {/* Input & Footer */}
            <div className="border-t border-white/5 bg-[#111111] p-5 space-y-4">
              {flowState !== "CHATTING" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Step {flowState === "COLLECTING_NAME" ? "1" : flowState === "COLLECTING_CONTACT" ? "2" : "3"} of 3
                    </span>
                    <button 
                      onClick={handleSkip}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#FF0000] hover:underline"
                    >
                      Skip to Chat
                    </button>
                  </div>
                  
                  <form onSubmit={handleLeadStep} className="relative">
                    <input
                      autoFocus
                      value={leadStepInput}
                      onChange={(e) => setLeadStepInput(e.target.value)}
                      placeholder={
                        flowState === "COLLECTING_NAME" ? "Enter your name..." : 
                        flowState === "COLLECTING_CONTACT" ? "@telegram or phone..." : 
                        "Enter your email..."
                      }
                      className="w-full rounded-none border border-white/10 bg-[#1A1A1A] py-3.5 pl-5 pr-14 text-[14px] text-white placeholder:text-white/20 focus:border-[#FF0000]/50 focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!leadStepInput.trim()}
                      className="absolute right-2 top-1.5 flex h-10 w-10 items-center justify-center rounded-none bg-[#FF0000] text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  <div className="h-1 w-full bg-white/5">
                    <motion.div 
                      className="h-full bg-[#FF0000]"
                      initial={{ width: "33.33%" }}
                      animate={{ 
                        width: flowState === "COLLECTING_NAME" ? "33.33%" : 
                               flowState === "COLLECTING_CONTACT" ? "66.66%" : "100%" 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <form onSubmit={submitMessage} className="relative">
                    <input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about design systems..."
                      className="w-full rounded-none border border-white/10 bg-[#1A1A1A] py-3.5 pl-5 pr-14 text-[14px] text-white placeholder:text-white/20 focus:border-[#FF0000]/50 focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1.5 flex h-10 w-10 items-center justify-center rounded-none bg-[#FF0000] text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="mailto:it.mikiyas.daniel@gmail.com"
                      className="flex h-12 items-center justify-center gap-2 rounded-none bg-[#FF0000] text-[13px] font-bold uppercase tracking-tight text-white transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      Email Me
                    </a>
                    <a
                      href="https://t.me/snowplugwalk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 items-center justify-center gap-2 rounded-none border border-white/10 bg-white/5 text-[13px] font-bold uppercase tracking-tight text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                    >
                      Message Telegram
                    </a>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
