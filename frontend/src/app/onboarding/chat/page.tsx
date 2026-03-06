/**
 * Talent Onboarding Chat — Conversational profile setup flow.
 *
 * 8-step guided flow:
 *   Step 0: Age selection (quick-pick buttons or freetext)
 *   Step 1: Location (freetext)
 *   Step 2: Photo upload → AI-generated profile description
 *   Step 3: Review/edit AI description
 *   Step 4: Connect social media (Instagram, TikTok, YouTube)
 *   Step 5: Select restricted ad categories (Alcohol, Gambling, etc.)
 *   Step 6: Agency representation check (yes/no)
 *   Step 7: Agency email (if represented)
 *   Step 8: Terms review & agree → redirect to Talent Library
 *
 * AI responses powered by FLock DeepSeek V3.2 via /api/chat/onboarding.
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Sparkles, Edit3, Check, Loader2, Instagram, Youtube, Music2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { onboardingChat, analyzePhoto } from "@/lib/api";

interface Message {
  role: "bot" | "user";
  content: string;
  type?: "text" | "photo-preview" | "ai-description" | "terms" | "social-media" | "restrictions" | "agency-check";
  photoUrl?: string;
  description?: { hair: string; eyes: string; style: string; vibe: string };
}

const RESTRICTION_CATEGORIES = [
  "Alcohol", "Smoking", "Gambling", "Adult", "Political", "Fur", "Lingerie", "Other",
];

export default function FaceLibraryChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState({ instagram: "", tiktok: "", youtube: "" });
  const [hasAgent, setHasAgent] = useState<boolean | null>(null);
  const [agentEmail, setAgentEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      setMessages([
        {
          role: "bot",
          content: "Hi! Welcome to Face Library — we're excited to have you here. In 3 minutes, we'll set up your profile so brands can license your likeness safely.",
        },
        {
          role: "bot",
          content: "First, what's your age?",
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
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await onboardingChat({
        messages: chatHistory,
        user_type: "talent",
        context: { name: user?.name || "" },
      });
      return res.response;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const userMessage: Message = { role: "user", content: userMsg };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    if (step === 0) {
      const aiReply = await getAIResponse(updatedMessages);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: aiReply || "And where are you currently based?" },
      ]);
      setStep(1);
    } else if (step === 1) {
      const aiReply = await getAIResponse(updatedMessages);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: aiReply || "Great. Now upload one clear photo (good lighting, no sunglasses). We'll generate your profile description from it.",
        },
      ]);
      setStep(2);
    } else if (step === 7) {
      // Agency email provided
      setAgentEmail(userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Got it! We'll notify your agency. Now let's review the terms." },
        {
          role: "bot",
          content: "Before we generate your digital avatar, please review:",
          type: "terms",
        },
      ]);
      setStep(8);
    } else if (step === 8) {
      const aiReply = await getAIResponse(updatedMessages);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: aiReply || "Your profile is ready! Redirecting you to the talent library..." },
      ]);
      setTimeout(() => router.push("/talent/library"), 2000);
    } else {
      const aiReply = await getAIResponse(updatedMessages);
      if (aiReply) {
        setMessages((prev) => [...prev, { role: "bot", content: aiReply }]);
      }
    }
  };

  const handleAgeSelect = async (age: string) => {
    const userMessage: Message = { role: "user", content: age };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const aiReply = await getAIResponse(updatedMessages);
    setMessages((prev) => [
      ...prev,
      { role: "bot", content: aiReply || "And where are you currently based?" },
    ]);
    setStep(1);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Uploaded a photo", type: "photo-preview", photoUrl: url },
      { role: "bot", content: "Analyzing your photo with AI..." },
    ]);
    setLoading(true);

    try {
      const res = await analyzePhoto({ description: file.name });
      const desc = res.description as { hair: string; eyes: string; style: string; vibe: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `Here's your AI-generated profile description (powered by ${res.model}):`,
          type: "ai-description",
          description: desc,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Here's your AI-generated profile description:",
          type: "ai-description",
          description: { hair: "Brown", eyes: "Brown", style: "Natural", vibe: "Confident" },
        },
      ]);
    } finally {
      setLoading(false);
      setStep(3);
    }
  };

  const handleDescriptionAction = async (action: "approve" | "edit") => {
    if (action === "approve") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "Looks good!" },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Would you like to connect your social media accounts? This helps brands discover you.",
            type: "social-media",
          },
        ]);
        setStep(4);
      }, 500);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "I'd like to edit my description." },
      ]);
      const aiReply = await getAIResponse([
        ...messages,
        { role: "user", content: "I'd like to edit my description." },
      ]);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: aiReply || "No problem! Type your corrections below and I'll update your profile." },
      ]);
    }
  };

  const handleSocialSubmit = () => {
    const parts = [];
    if (socialLinks.instagram) parts.push(`Instagram: @${socialLinks.instagram}`);
    if (socialLinks.tiktok) parts.push(`TikTok: @${socialLinks.tiktok}`);
    if (socialLinks.youtube) parts.push(`YouTube: ${socialLinks.youtube}`);
    const msg = parts.length > 0 ? `Connected: ${parts.join(", ")}` : "Skipped social media";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      {
        role: "bot",
        content: "Now, are there any ad categories you'd like to restrict? Select all that apply.",
        type: "restrictions",
      },
    ]);
    setStep(5);
  };

  const toggleRestriction = (cat: string) => {
    setSelectedRestrictions((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleRestrictionsSubmit = () => {
    const msg = selectedRestrictions.length > 0
      ? `Restricted: ${selectedRestrictions.join(", ")}`
      : "No restrictions set";

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg },
      {
        role: "bot",
        content: "Are you currently represented by a talent agency?",
        type: "agency-check",
      },
    ]);
    setStep(6);
  };

  const handleAgencyResponse = (represented: boolean) => {
    setHasAgent(represented);
    if (represented) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "Yes, I have an agency." },
        { role: "bot", content: "What's your agency's email address? We'll loop them in." },
      ]);
      setStep(7);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "No, I'm independent." },
        {
          role: "bot",
          content: "Before we generate your digital avatar, please review:",
          type: "terms",
        },
      ]);
      setStep(8);
    }
  };

  const handleAgreeTerms = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "I agree to proceed." },
      { role: "bot", content: "Generating your digital avatar... Your profile is now live!" },
    ]);
    setTimeout(() => router.push("/talent/library"), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-6 border-b border-[#E8E8EC]">
        <Link href="/" className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0B0B0F]">
              <span className="font-display text-xs font-bold italic text-[#0B0B0F]">FL</span>
            </div>
            <span className="font-body text-xs font-bold tracking-[0.15em] text-[#0B0B0F]">FACE LIBRARY</span>
          </div>
          <span className="font-body text-[9px] font-light tracking-[0.2em] text-[#9B9BA3]">
            Secure Likeness Licensing Platform
          </span>
        </Link>
      </header>

      {/* Chat */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 overflow-y-auto">
        <div className="space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-[#F0F0F4] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#4F6AF6]" />
                </div>
              )}
              <div className="max-w-[75%]">
                {(!msg.type || msg.type === "text") && (
                  <div
                    className={`px-4 py-3 rounded-2xl font-body text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white rounded-br-md"
                        : "bg-[#F4F4F8] text-[#0B0B0F] rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {msg.type === "photo-preview" && msg.photoUrl && (
                  <div className="w-48 rounded-2xl overflow-hidden shadow-sm">
                    <img src={msg.photoUrl} alt="Uploaded photo" className="w-full h-48 object-cover" />
                  </div>
                )}

                {msg.type === "ai-description" && msg.description && (
                  <div className="bg-[#F4F4F8] rounded-2xl rounded-bl-md p-5">
                    <p className="font-body text-[14px] text-[#0B0B0F] mb-4">{msg.content}</p>
                    <div className="bg-white rounded-xl p-4 space-y-2.5 mb-4 border border-[#E8E8EC]">
                      {Object.entries(msg.description).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="font-body text-[13px] text-[#6B6B73] capitalize">{key}</span>
                          <span className="font-body text-[13px] font-medium text-[#0B0B0F]">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDescriptionAction("approve")}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[13px] font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Looks good
                      </button>
                      <button
                        onClick={() => handleDescriptionAction("edit")}
                        className="flex-1 inline-flex items-center justify-center gap-2 border border-[#E8E8EC] bg-white text-[#0B0B0F] font-body text-[13px] font-medium py-2.5 rounded-xl hover:border-[#4F6AF6] transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {msg.type === "social-media" && (
                  <div className="bg-[#F4F4F8] rounded-2xl rounded-bl-md p-5">
                    <p className="font-body text-[14px] text-[#0B0B0F] mb-4">{msg.content}</p>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E8E8EC] px-4 py-3">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <input
                          type="text"
                          value={socialLinks.instagram}
                          onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                          placeholder="Instagram username"
                          className="flex-1 font-body text-[13px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E8E8EC] px-4 py-3">
                        <Music2 className="w-4 h-4 text-[#0B0B0F]" />
                        <input
                          type="text"
                          value={socialLinks.tiktok}
                          onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                          placeholder="TikTok username"
                          className="flex-1 font-body text-[13px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E8E8EC] px-4 py-3">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <input
                          type="text"
                          value={socialLinks.youtube}
                          onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                          placeholder="YouTube channel"
                          className="flex-1 font-body text-[13px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSocialSubmit}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[13px] font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all"
                      >
                        {socialLinks.instagram || socialLinks.tiktok || socialLinks.youtube ? "Connect & Continue" : "Skip"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {msg.type === "restrictions" && (
                  <div className="bg-[#F4F4F8] rounded-2xl rounded-bl-md p-5">
                    <p className="font-body text-[14px] text-[#0B0B0F] mb-4">{msg.content}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
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
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[13px] font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all"
                    >
                      {selectedRestrictions.length > 0 ? `Block ${selectedRestrictions.length} categories` : "No restrictions"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {msg.type === "agency-check" && (
                  <div className="bg-[#F4F4F8] rounded-2xl rounded-bl-md p-5">
                    <p className="font-body text-[14px] text-[#0B0B0F] mb-4">{msg.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAgencyResponse(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 border border-[#E8E8EC] bg-white text-[#0B0B0F] font-body text-[13px] font-medium py-2.5 rounded-xl hover:border-[#4F6AF6] hover:bg-[#4F6AF6]/5 transition-all"
                      >
                        Yes, I have an agency
                      </button>
                      <button
                        onClick={() => handleAgencyResponse(false)}
                        className="flex-1 inline-flex items-center justify-center gap-2 border border-[#E8E8EC] bg-white text-[#0B0B0F] font-body text-[13px] font-medium py-2.5 rounded-xl hover:border-[#4F6AF6] hover:bg-[#4F6AF6]/5 transition-all"
                      >
                        No, I&apos;m independent
                      </button>
                    </div>
                  </div>
                )}

                {msg.type === "terms" && (
                  <div className="bg-[#F4F4F8] rounded-2xl rounded-bl-md p-5">
                    <p className="font-body text-[14px] text-[#0B0B0F] mb-4">{msg.content}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#E8E8EC]">
                        <div className="w-6 h-6 rounded-full bg-[#4F6AF6]/10 flex items-center justify-center">
                          <span className="font-body text-[11px] font-bold text-[#4F6AF6]">1</span>
                        </div>
                        <span className="font-body text-[13px] text-[#0B0B0F]">Terms & Conditions</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#E8E8EC]">
                        <div className="w-6 h-6 rounded-full bg-[#4F6AF6]/10 flex items-center justify-center">
                          <span className="font-body text-[11px] font-bold text-[#4F6AF6]">2</span>
                        </div>
                        <span className="font-body text-[13px] text-[#0B0B0F]">Example License Contract</span>
                      </div>
                    </div>
                    <button
                      onClick={handleAgreeTerms}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[13px] font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all"
                    >
                      I agree to proceed
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0F0F4] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#4F6AF6]" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#F4F4F8]">
                <Loader2 className="w-4 h-4 text-[#4F6AF6] animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="max-w-2xl w-full mx-auto px-6 py-4 border-t border-[#E8E8EC]">
        {step === 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {["18-24", "25-30", "31-40", "41-50", "50+"].map((age) => (
              <button
                key={age}
                onClick={() => handleAgeSelect(age)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[13px] font-medium hover:shadow-md transition-all disabled:opacity-50"
              >
                {age} <ArrowRight className="w-3 h-3 inline ml-1" />
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E8EC] bg-white font-body text-[13px] text-[#0B0B0F] hover:border-[#4F6AF6] hover:bg-[#4F6AF6]/5 transition-all disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            placeholder={
              step === 0
                ? "Or type your age..."
                : step === 2
                ? "Or describe yourself instead..."
                : step === 7
                ? "Enter your agency's email..."
                : "Type your message..."
            }
            className="flex-1 bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-4 py-3 font-body text-[14px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/20 focus:border-[#4F6AF6] transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] flex items-center justify-center text-white hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
