/**
 * Agent Dashboard — Central hub for talent agencies managing their roster.
 *
 * Features:
 * - Stat cards: Managed Talents, Pending Approvals, Total Requests
 * - Managed talents list with geo scope and approval type badges
 * - Expandable approval queue with approve/reject actions
 * - Contract template section (Standard, Exclusive, Time-Limited)
 *
 * Accessible at: /agent/dashboard (requires agent role)
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Clock, FileText, Shield, MapPin,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import { useAuth } from "@/lib/auth";
import { getAgent, getAgentRequests, approveLicense } from "@/lib/api";

interface ManagedTalent {
  id: number;
  name: string;
  geo_scope: string;
  approval_type: string;
  categories: string | null;
}

interface AgentProfileData {
  id: number;
  name: string;
  email: string;
  agency_name: string;
  website: string | null;
  country: string | null;
  team_size: string | null;
  default_restricted_categories: string | null;
  approval_workflow: string;
  managed_talents: ManagedTalent[];
}

interface RequestData {
  id: number;
  status: string;
  talent_name: string;
  brand_name: string;
  use_case: string;
  content_type: string;
  desired_duration_days: number;
  proposed_price: number | null;
  created_at: string;
}

const CONTRACT_TEMPLATES = [
  { name: "Standard Licensing", desc: "Basic likeness usage with time limits", status: "Available" },
  { name: "Exclusive Rights", desc: "Single-brand exclusivity for a period", status: "Coming soon" },
  { name: "Time-Limited", desc: "Short-term campaign usage only", status: "Coming soon" },
];

export default function AgentDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "agent")) {
      router.push("/login");
      return;
    }
    if (user?.profile_id) {
      loadData(user.profile_id);
    }
  }, [user, authLoading]);

  const loadData = async (profileId: number) => {
    try {
      const [p, r] = await Promise.all([
        getAgent(profileId),
        getAgentRequests(profileId),
      ]);
      setProfile(p);
      setRequests(r);
    } catch {
      // Profile may not exist yet
    }
    setLoading(false);
  };

  const handleRequestAction = async (id: number, approved: boolean) => {
    try {
      await approveLicense(id, approved);
      if (user?.profile_id) loadData(user.profile_id);
    } catch {
      // error
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1E3A5F] border-t-transparent" />
      </div>
    );
  }

  const managedTalents = profile?.managed_talents || [];
  const pendingRequests = requests.filter((r) => r.status === "awaiting_approval" || r.status === "pending");

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <DashboardNav />

      <div className="max-w-6xl mx-auto px-8 lg:px-16 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-[#0B0B0F]">Agent Dashboard</h1>
          <p className="font-body text-sm text-[#6B6B73]">
            {profile?.agency_name || "Your Agency"} — Manage talent and approvals
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-[#E0E0DA] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-[#1E3A5F]" />
              <span className="font-body text-xs uppercase tracking-wider text-[#6B6B73]">Managed Talents</span>
            </div>
            <p className="font-display text-3xl text-[#0B0B0F]">{managedTalents.length}</p>
          </div>
          <div className="bg-white border border-[#E0E0DA] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="font-body text-xs uppercase tracking-wider text-[#6B6B73]">Pending Approvals</span>
            </div>
            <p className="font-display text-3xl text-[#0B0B0F]">{pendingRequests.length}</p>
          </div>
          <div className="bg-white border border-[#E0E0DA] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-body text-xs uppercase tracking-wider text-[#6B6B73]">Total Requests</span>
            </div>
            <p className="font-display text-3xl text-[#0B0B0F]">{requests.length}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Managed Talents */}
          <div className="bg-white border border-[#E0E0DA] rounded-lg p-6">
            <h3 className="font-body text-sm font-semibold text-[#0B0B0F] flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" /> Managed Talents
            </h3>
            {managedTalents.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-[#6B6B73] mb-3">No talents linked yet.</p>
                <p className="font-body text-xs text-[#9B9BA3]">
                  Talents can link to your agency during onboarding, or you can send them an invite.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {managedTalents.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-[#E0E0DA] p-4">
                    <div>
                      <p className="font-body text-sm font-medium text-[#0B0B0F]">{t.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-[#6B6B73]" />
                        <span className="font-body text-xs text-[#6B6B73] capitalize">{t.geo_scope}</span>
                        <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5F0] text-[#6B6B73]">
                          {t.approval_type.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/talent/library`}
                      className="font-body text-xs text-[#1E3A5F] hover:underline"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approval Queue */}
          <div className="bg-white border border-[#E0E0DA] rounded-lg p-6">
            <h3 className="font-body text-sm font-semibold text-[#0B0B0F] flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4" /> Approval Queue
            </h3>
            {requests.length === 0 ? (
              <p className="font-body text-sm text-[#6B6B73] py-4">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="rounded-lg border border-[#E0E0DA] overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F5F5F0]/50 transition-colors"
                      onClick={() => setExpandedRequest(expandedRequest === r.id ? null : r.id)}
                    >
                      <div>
                        <p className="font-body text-sm font-medium text-[#0B0B0F]">
                          {r.talent_name} &larr; {r.brand_name}
                        </p>
                        <p className="font-body text-xs text-[#6B6B73]">
                          {r.content_type} &middot; {r.desired_duration_days} days
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-body text-xs px-3 py-1 rounded-full capitalize ${
                          r.status === "active" || r.status === "approved" ? "bg-green-50 text-green-700" :
                          r.status === "rejected" ? "bg-red-50 text-red-700" :
                          "bg-[#F5F5F0] text-[#6B6B73]"
                        }`}>
                          {r.status}
                        </span>
                        {expandedRequest === r.id ? <ChevronUp className="h-4 w-4 text-[#6B6B73]" /> : <ChevronDown className="h-4 w-4 text-[#6B6B73]" />}
                      </div>
                    </div>
                    {expandedRequest === r.id && (
                      <div className="px-4 pb-4 border-t border-[#E0E0DA] pt-3">
                        <p className="font-body text-xs text-[#6B6B73] mb-2">Use case: {r.use_case}</p>
                        {r.proposed_price != null && (
                          <p className="font-body text-xs text-[#6B6B73] mb-2">
                            Suggested price: £{r.proposed_price.toLocaleString()} GBP
                          </p>
                        )}
                        {(r.status === "awaiting_approval" || r.status === "pending") && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleRequestAction(r.id, true)}
                              className="flex items-center gap-1 font-body text-xs border border-[#E0E0DA] px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" /> Approve
                            </button>
                            <button
                              onClick={() => handleRequestAction(r.id, false)}
                              className="flex items-center gap-1 font-body text-xs text-[#6B6B73] hover:text-red-600 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contract Templates */}
        <div className="bg-white border border-[#E0E0DA] rounded-lg p-6 mt-6">
          <h3 className="font-body text-sm font-semibold text-[#0B0B0F] flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" /> Contract Templates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTRACT_TEMPLATES.map((t) => (
              <div key={t.name} className="rounded-lg border border-[#E0E0DA] p-4">
                <h4 className="font-body text-sm font-medium text-[#0B0B0F] mb-1">{t.name}</h4>
                <p className="font-body text-xs text-[#6B6B73] mb-3">{t.desc}</p>
                <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${
                  t.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-[#F5F5F0] text-[#6B6B73]"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
