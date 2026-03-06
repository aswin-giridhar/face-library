"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { signup } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AgentRegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    agency_name: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await signup({
        name: form.name,
        email: form.email,
        password: "agent-temp-" + Date.now(),
        role: "agent",
        company_name: form.agency_name,
      });
      setUser({
        user_id: res.user_id || res.id,
        email: form.email,
        name: form.name,
        role: "agent",
        profile_id: null,
      });
      setStatus("success");
      setTimeout(() => router.push("/agent/onboarding"), 1500);
    } catch {
      setStatus("error");
      setErrorMsg("Registration failed. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F6AF6] to-[#6C8AFF] flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl text-[#0B0B0F] mb-2">Profile Created!</h1>
          <p className="font-body text-[#6B6B73] mb-6">
            Setting up your onboarding assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-center py-8">
        <Link href="/" className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0B0B0F]">
              <span className="font-display text-sm font-bold italic text-[#0B0B0F]">FL</span>
            </div>
            <span className="font-body text-sm font-bold tracking-[0.2em] text-[#0B0B0F]">FACE LIBRARY</span>
          </div>
          <span className="font-body text-[10px] font-light tracking-[0.2em] text-[#9B9BA3]">
            Secure Likeness Licensing Platform
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-light text-[#0B0B0F] mb-3">
              Create Your Agent Profile
            </h1>
            <p className="font-body text-[15px] text-[#6B6B73]">
              Tell us about your agency so we can optimize your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all"
              />
            </div>

            <div>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Company Email Address"
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all"
              />
            </div>

            <div>
              <input
                type="text"
                required
                value={form.agency_name}
                onChange={(e) => update("agency_name", e.target.value)}
                placeholder="Agency Name"
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all"
              />
            </div>

            <div>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="Website"
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[15px] font-semibold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all duration-300 disabled:opacity-50"
              >
                {status === "loading" ? "Creating..." : "Create Profile"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <p className="font-body text-sm text-red-500 text-center">{errorMsg}</p>
            )}

            <p className="font-body text-[11px] text-[#9B9BA3] text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span> and confirm
              that the information provided is accurate.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
