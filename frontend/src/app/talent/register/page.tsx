"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { registerTalent } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const categories = [
  "Influencer",
  "Model",
  "Actor",
  "Sports Professional",
  "Celebrity",
  "None of the above",
];

const ages = Array.from({ length: 63 }, (_, i) => i + 18);

export default function TalentRegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    stage_name: "",
    age: "",
    category: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      setErrorMsg("Please select a category.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await registerTalent({
        name: form.name,
        email: form.email,
        bio: form.stage_name ? `Stage name: ${form.stage_name}` : "",
        categories: form.category,
        min_price_per_use: 100,
        max_license_duration_days: 365,
        allow_ai_training: false,
        allow_video_generation: true,
        allow_image_generation: true,
      });
      setUser({
        user_id: res.user_id || res.id,
        email: form.email,
        name: form.name,
        role: "talent",
        profile_id: res.id,
      });
      setStatus("success");
      setTimeout(() => router.push("/onboarding/chat"), 1500);
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
          <h1 className="font-display text-3xl text-[#0B0B0F] mb-2">Welcome aboard!</h1>
          <p className="font-body text-[#6B6B73] mb-6">
            Redirecting you to set up your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
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

      {/* Form */}
      <main className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-light text-[#0B0B0F] mb-3">
              Create Your Talent Profile
            </h1>
            <p className="font-body text-[15px] text-[#6B6B73]">
              Tell us a little about yourself so brands can discover you.
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
                placeholder="Email Address"
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all"
              />
            </div>

            <div>
              <input
                type="text"
                value={form.stage_name}
                onChange={(e) => update("stage_name", e.target.value)}
                placeholder="Talent / Stage Name (optional)"
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] placeholder-[#B0B0B8] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all"
              />
            </div>

            <div>
              <select
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                className="w-full bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl px-5 py-3.5 font-body text-[15px] text-[#0B0B0F] focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/30 focus:border-[#4F6AF6] transition-all appearance-none"
                style={{ color: form.age ? "#0B0B0F" : "#B0B0B8" }}
              >
                <option value="" disabled>Age</option>
                {ages.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Category Selection */}
            <div className="pt-2">
              <p className="font-body text-[13px] text-[#6B6B73] mb-3">Category</p>
              <div className="space-y-2.5">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                      form.category === cat
                        ? "border-[#4F6AF6] bg-[#4F6AF6]/5"
                        : "border-[#E8E8EC] bg-[#F8F8FA] hover:border-[#D0D0D8]"
                    }`}
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all ${
                        form.category === cat
                          ? "border-[#4F6AF6]"
                          : "border-[#C8C8D0]"
                      }`}
                    >
                      {form.category === cat && (
                        <div className="w-[10px] h-[10px] rounded-full bg-[#4F6AF6]" />
                      )}
                    </div>
                    <span className="font-body text-[14px] text-[#0B0B0F]">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F6AF6] to-[#6C8AFF] text-white font-body text-[15px] font-semibold py-4 px-8 rounded-xl hover:shadow-lg hover:shadow-[#4F6AF6]/25 transition-all duration-300 disabled:opacity-50"
              >
                {status === "loading" ? "Creating..." : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <p className="font-body text-sm text-red-500 text-center">{errorMsg}</p>
            )}

            <p className="font-body text-[11px] text-[#9B9BA3] text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span> and confirm
              the information is accurate.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
