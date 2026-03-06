"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Lock, Sparkles, Upload, FileText, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { onboardingChat } from "@/lib/api";

interface Message {
  role: "assistant" | "user";
  content: string;
  actions?: { label: string; icon?: "upload" | "describe"; value: string }[];
}

const steps = [
  { label: "Welcome", key: "welcome" },
  { label: "Campaign Brief", key: "campaign" },
  { label: "Talent Search", key: "talent" },
  { label: "License Request", key: "license" },
];

export default function BrandOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const brandName = user?.name || "Your brand";
      setMessages([
        {
          role: "assistant",
          content: `Hi! Welcome to Face Library. Excited to help you find the perfect talent for your next AI-generated ad campaign!`,
        },
        {
          role: "assistant",
          content: `${brandName} looks like a great brand. Let's get your campaign set up.`,
        },
        {
          role: "assistant",
          content: "Do you have a campaign brief?",
          actions: [
            { label: "Upload Campaign Brief", icon: "upload", value: "upload_brief" },
            { label: "Describe Campaign & Audience", icon: "describe", value: "describe_campaign" },
          ],
        },
      ]);
      setInitialized(true);
    }
  }, [initialized, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAIResponse = useCallback(async (allMessages: Message[]) => {
    setLoading(true);
    try {
      const chatHistory = allMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await onboardingChat({
        messages: chatHistory,
        user_type: "brand",
        context: { name: user?.name || "" },
      });
      return res.response;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleAction = async (value: string) => {
    if (value === "upload_brief") {
      const userMsg: Message = { role: "user", content: "I'd like to upload a campaign brief." };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setCurrentStep(1);
      const aiReply = await getAIResponse(updated);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "Great! Please describe your campaign in the chat and we'll structure it for you. What product or service are you promoting?",
        },
      ]);
    } else if (value === "describe_campaign") {
      const userMsg: Message = { role: "user", content: "I'll describe my campaign." };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setCurrentStep(1);
      const aiReply = await getAIResponse(updated);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "Tell me about your campaign. What product or service are you promoting? Who is your target audience?",
        },
      ]);
    } else if (value === "browse") {
      router.push("/talent/library");
    } else if (value === "dashboard") {
      router.push("/brand/dashboard");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const userMessage: Message = { role: "user", content: userMsg };
    const updated = [...messages, userMessage];
    setMessages(updated);

    const aiReply = await getAIResponse(updated);

    if (currentStep === 1) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "Got it! What type of talent are you looking for?",
        },
      ]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "I'll search our talent library based on your requirements.",
        },
        {
          role: "assistant",
          content: "Would you like to browse the talent library now?",
          actions: [
            { label: "Browse Talent Library", icon: "describe", value: "browse" },
            { label: "Go to Dashboard", icon: "describe", value: "dashboard" },
          ],
        },
      ]);
      setCurrentStep(3);
    } else {
      if (aiReply) {
        setMessages((prev) => [...prev, { role: "assistant", content: aiReply }]);
      }
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E8E8EC] flex flex-col bg-[#FAFAFA]">
        <div className="p-6 border-b border-[#E8E8EC]">
          <Link href="/" className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0B0B0F]">
              <span className="font-display text-xs font-bold italic text-[#0B0B0F]">FL</span>
            </div>
            <span className="font-body text-xs font-bold tracking-[0.15em] text-[#0B0B0F]">FACE LIBRARY</span>
          </Link>
        </div>

        <div className="p-6 flex-1">
          <p className="font-body text-xs font-semibold text-[#0B0B0F] mb-1">Onboarding</p>
          <p className="font-body text-[11px] text-[#9B9BA3] mb-5">Step {currentStep + 1} of {steps.length}</p>
          <div className="space-y-1">
            {steps.map((step, i) => (
              <div
                key={step.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  i === currentStep
                    ? "bg-[#4F6AF6]/10 text-[#4F6AF6]"
                    : i < currentStep
                    ? "text-[#0B0B0F]"
                    : "text-[#B0B0B8]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                    i < currentStep
                      ? "bg-[#4F6AF6] text-white"
                      : i === currentStep
                      ? "border-2 border-[#4F6AF6] text-[#4F6AF6]"
                      : "border-2 border-[#D8D8E0] text-[#B0B0B8]"
                  }`}
                >
                  {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="font-body text-[13px]">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[#E8E8EC]">
          <div className="flex items-center gap-2 text-[#9B9BA3]">
            <Lock className="w-3 h-3" />
            <span className="font-body text-[10px]">Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-[#9B9BA3] mt-1">
            <Sparkles className="w-3 h-3" />
            <span className="font-body text-[10px]">Powered by Face Library AI</span>
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-[#E8E8EC] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F6AF6] to-[#6C8AFF] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-body text-[14px] font-semibold text-[#0B0B0F]">Face Library Assistant</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-body text-[11px] text-[#9B9BA3]">Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${msg.role === "user" ? "" : "flex gap-3"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#F0F0F4] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#4F6AF6]" />
                  </div>
                )}
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl font-body text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#4F6AF6] text-white rounded-br-md"
                        : "bg-[#F4F4F8] text-[#0B0B0F] rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.actions && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.actions.map((action) => (
                        <button
                          key={action.value}
                          onClick={() => handleAction(action.value)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E8EC] bg-white font-body text-[13px] text-[#0B0B0F] hover:border-[#4F6AF6] hover:bg-[#4F6AF6]/5 transition-all disabled:opacity-50"
                        >
                          {action.icon === "upload" ? <Upload className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F0F0F4] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#4F6AF6]" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#F4F4F8]">
                  <Loader2 className="w-4 h-4 text-[#4F6AF6] animate-spin" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 py-4 border-t border-[#E8E8EC]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
              placeholder="Type your answer here..."
              className="flex-1 bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-4 py-3 font-body text-[14px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/20 focus:border-[#4F6AF6] transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] flex items-center justify-center text-white hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
