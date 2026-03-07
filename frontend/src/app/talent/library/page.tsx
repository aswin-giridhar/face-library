/**
 * Talent Library — Browse all registered talents with filtering and search.
 *
 * Brands use this page to discover talent for licensing. Displays a grid of
 * talent cards with name, categories, Instagram handle, and starting price.
 * Filters by: All, Trending, Female, Male, Blonde, Brunette, Influencer, Actor.
 * Falls back to placeholder demo data when no real talents exist.
 *
 * Accessible at: /talent/library (public, linked from nav for all authenticated users)
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Filter, Instagram } from "lucide-react";
import { listTalents } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Talent {
  id: number;
  name: string;
  bio: string;
  categories: string;
  min_price_per_use: number;
  allow_video_generation: boolean;
  allow_image_generation: boolean;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  avatar_url: string | null;
}

const filterButtons = [
  "All",
  "Trending",
  "Female",
  "Male",
  "Blonde",
  "Brunette",
  "Influencer",
  "Actor",
];


export default function TalentLibraryPage() {
  const { user } = useAuth();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    listTalents().then(setTalents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredTalents = talents.filter((t) => {
    if (activeFilter === "All") return true;
    const cat = (t.categories || "").toLowerCase();
    const filter = activeFilter.toLowerCase();
    return cat.includes(filter);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-10 h-16 border-b border-[#E8E8EC]">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0B0B0F]">
            <span className="font-display text-sm font-bold italic text-[#0B0B0F]">FL</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body text-sm font-bold tracking-[0.2em] text-[#0B0B0F]">FACE LIBRARY</span>
            <span className="font-body text-[7px] font-light tracking-[0.25em] text-[#9B9BA3]">
              Secure Likeness Licensing Platform
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-full bg-[#F4F4F8] flex items-center justify-center hover:bg-[#E8E8EC] transition-colors">
            <Bell className="w-4 h-4 text-[#6B6B73]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F6AF6] to-[#6C8AFF] flex items-center justify-center text-white font-body text-xs font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-light text-[#0B0B0F]">Talent Library</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by age, gender, vibe..."
                className="bg-[#F8F8FA] border border-[#E8E8EC] rounded-xl pl-10 pr-4 py-2.5 font-body text-[13px] text-[#0B0B0F] placeholder-[#B0B0B8] w-64 focus:outline-none focus:ring-2 focus:ring-[#4F6AF6]/20 focus:border-[#4F6AF6] transition-all"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E8EC] bg-white font-body text-[13px] text-[#6B6B73] hover:border-[#4F6AF6] transition-all">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filterButtons.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full font-body text-[13px] transition-all ${
                activeFilter === f
                  ? "bg-[#0B0B0F] text-white"
                  : "bg-[#F4F4F8] text-[#6B6B73] hover:bg-[#E8E8EC]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Real talents from API */}
          {filteredTalents.map((t) => (
            <Link
              key={t.id}
              href={`/brand/search?talent=${t.id}`}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-gray-300 mb-3">
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt={t.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-6xl text-white/60 font-light">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="font-body text-[15px] font-semibold text-[#0B0B0F]">{t.name}</h3>
              <p className="font-body text-[13px] text-[#6B6B73]">{t.categories || "Talent"}</p>
              {t.instagram && (
                <div className="flex items-center gap-1 mt-1">
                  <Instagram className="w-3 h-3 text-[#9B9BA3]" />
                  <span className="font-body text-[12px] text-[#9B9BA3]">@{t.instagram}</span>
                </div>
              )}
              <p className="font-body text-[12px] text-[#9B9BA3] mt-0.5">From £{t.min_price_per_use}/use</p>
            </Link>
          ))}

          {/* Loading / empty state */}
          {loading && (
            <div className="col-span-full flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B0B0F] border-t-transparent" />
            </div>
          )}
          {!loading && filteredTalents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="font-body text-sm text-[#6B6B73]">No talent found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
