/**
 * Agent Onboarding — Guided setup flow for talent agencies.
 *
 * 6-step flow:
 *   1. Welcome — Introduce Face Library to the agency
 *   2. Agency Info — Name, website, country, team size
 *   3. Talent Profiles — How many talents they manage
 *   4. Restrictions — Default restricted ad categories for all talent
 *   5. Approval Workflow — talent_only / agent_only / both_required
 *   6. Complete — Redirect to agent dashboard
 *
 * AI responses powered by FLock DeepSeek V3.2 via /api/chat/onboarding.
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Lock, Sparkles, Check, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { onboardingChat } from "@/lib/api";

interface Message {
  role: "assistant" | "user";
  content: string;
  options?: { label: string; value: string }[];
  type?: "text" | "restrictions" | "approval-workflow";
}

const steps = [
  { label: "Welcome", key: "welcome" },
  { label: "Agency Info", key: "agency" },
  { label: "Talent Profiles", key: "talent" },
  { label: "Restrictions", key: "restrictions" },
  { label: "Approval Workflow", key: "workflow" },
  { label: "Complete", key: "complete" },
];

const RESTRICTION_CATEGORIES = [
  "Alcohol", "Smoking", "Gambling", "Adult", "Political", "Fur", "Lingerie", "Other",
];

export default function AgentOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setMessages([
        {
          role: "assistant",
          content: "Hi! Welcome to Face Library. Let's set up your agency profile and approvals workflow.",
        },
        {
          role: "assistant",
          content: "What's your agency called?",
        },
      ]);
      setInitialized(true);
    }
  }, [initialized]);

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
        user_type: "agent",
        context: { name: user?.name || "" },
      });
      return res.response;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleOption = async (value: string) => {
    const userMsg: Message = { role: "user", content: value };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await advanceConversation(updated);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const userMessage: Message = { role: "user", content: userMsg };
    const updated = [...messages, userMessage];
    setMessages(updated);
    await advanceConversation(updated);
  };

  const toggleRestriction = (cat: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleRestrictionsSubmit = async () => {
    const msg = selectedRestrictions.length > 0
      ? `Default restrictions: ${selectedRestrictions.join(", ")}`
      : "No default restrictions";

    const userMsg: Message = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "How should approval work for your talents' license requests?",
        type: "approval-workflow",
      },
    ]);
    setCurrentStep(4);
  };

  const handleWorkflowSelect = async (workflow: string) => {
    const labels: Record<string, string> = {
      talent_only: "Talent approves directly",
      agent_only: "Agency approves on behalf",
      both_required: "Both talent and agency must approve",
    };
    const userMsg: Message = { role: "user", content: labels[workflow] || workflow };
    const updated = [...messages, userMsg];
    setMessages(updated);

    const aiReply = await getAIResponse(updated);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: aiReply || "Your agency profile is all set up! Redirecting you to your dashboard...",
      },
    ]);
    setCurrentStep(5);
    // Redirect to agent dashboard after completion
    setTimeout(() => router.push("/agent/dashboard"), 2000);
  };

  const advanceConversation = async (allMessages: Message[]) => {
    const aiReply = await getAIResponse(allMessages);

    if (currentStep === 0) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply || "Please share your website link." },
      ]);
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "Where is your agency registered? And how large is your team?",
          options: [
            { label: "1-10", value: "1-10" },
            { label: "11-50", value: "11-50" },
            { label: "51-200", value: "51-200" },
            { label: "200+", value: "200+" },
          ],
        },
      ]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "Approximately how many talents do you want to onboard initially?",
          options: [
            { label: "1-10", value: "1-10 talents" },
            { label: "We will create profiles", value: "We create profiles" },
            { label: "Talents will self-onboard", value: "Self-onboard" },
            { label: "Mixed", value: "Mixed approach" },
          ],
        },
      ]);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply || "What default content restrictions should apply to your talents? Select all that apply.",
          type: "restrictions",
        },
      ]);
    } else if (currentStep >= 5) {
      if (aiReply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiReply },
        ]);
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
          <p className="font-body text-[11px] text-[#9B9BA3] mb-5">Step {Math.min(currentStep + 1, steps.length)} of {steps.length}</p>
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

                  {/* Option buttons */}
                  {msg.options && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleOption(opt.value)}
                          disabled={loading}
                          className="px-4 py-2 rounded-xl border border-[#E8E8EC] bg-white font-body text-[13px] text-[#0B0B0F] hover:border-[#4F6AF6] hover:bg-[#4F6AF6]/5 transition-all disabled:opacity-50"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Restriction selection */}
                  {msg.type === "restrictions" && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {RESTRICTION_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => toggleRestriction(cat)}
                            className={`px-4 py-2 rounded-xl border font-body text-[13px] transition-all ${
                              selectedRestrictions.includes(cat)
                                ? "border-red-400 bg-red-50 text-red-700"
                                : "border-[#E8E8EC] bg-white text-[#0B0B0F] hover:border-[#4F6AF6]"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleRestrictionsSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[13px] font-medium hover:shadow-md transition-all disabled:opacity-50"
                      >
                        {selectedRestrictions.length > 0 ? `Set ${selectedRestrictions.length} restrictions` : "No restrictions"}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Approval workflow selection */}
                  {msg.type === "approval-workflow" && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        { label: "Talent approves directly", value: "talent_only" },
                        { label: "Agency approves on behalf", value: "agent_only" },
                        { label: "Both must approve", value: "both_required" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleWorkflowSelect(opt.value)}
                          disabled={loading}
                          className="px-4 py-2 rounded-xl border border-[#E8E8EC] bg-white font-body text-[13px] text-[#0B0B0F] hover:border-[#4F6AF6] hover:bg-[#4F6AF6]/5 transition-all disabled:opacity-50"
                        >
                          {opt.label}
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
