"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Handshake,
  AlertTriangle,
  ScrollText,
  ClipboardCheck,
  Search,
  Workflow,
  Activity,
  Zap,
  Hash,
  Globe,
  Cpu,
} from "lucide-react";
import { getAgentsStatus } from "@/lib/api";

interface AgentInfo {
  name: string;
  id: string;
  role: string;
  provider: string;
  models: string[];
  sdg: string[];
}

interface AgentStats {
  total_actions: number;
  total_tokens_used: number;
  unique_agents_active: number;
  licenses_processed: number;
}

interface PerAgentStat {
  agent_name: string;
  total_actions: number;
  total_tokens: number;
}

interface ModelInfo {
  tier: string;
  model_id: string;
  provider: string;
  available: boolean;
}

const AGENT_ICONS: Record<string, React.ElementType> = {
  "Compliance & Risk Agent": AlertTriangle,
  "Negotiator Agent": Handshake,
  "IP Contract Generation Agent": ScrollText,
  "Audit & Traceability Agent": ClipboardCheck,
  "Talent Search Agent": Search,
  "Orchestrator": Workflow,
};

const AGENT_COLORS: Record<string, string> = {
  "Compliance & Risk Agent": "#B45309",
  "Negotiator Agent": "#1E3A5F",
  "IP Contract Generation Agent": "#0F766E",
  "Audit & Traceability Agent": "#6B21A8",
  "Talent Search Agent": "#0369A1",
  "Orchestrator": "#0B0B0F",
};

const SDG_COLORS: Record<string, string> = {
  "SDG 8": "bg-red-500/10 text-red-700",
  "SDG 10": "bg-pink-500/10 text-pink-700",
  "SDG 16": "bg-blue-500/10 text-blue-700",
};

export default function AgentDashboardPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [agentStats, setAgentStats] = useState<PerAgentStat[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentsStatus()
      .then((data) => {
        setAgents(data.agents || []);
        setStats(data.stats || null);
        setAgentStats(data.agent_stats || []);
        setModels(data.models || []);
      })
      .catch(() => {
        setAgents([
          { name: "Compliance & Risk Agent", id: "compliance", role: "Risk assessment & policy enforcement", provider: "FLock (DeepSeek) + Z.AI (GLM)", models: ["deepseek-v3.2", "glm-4-plus"], sdg: ["SDG 10", "SDG 16"] },
          { name: "Negotiator Agent", id: "negotiator", role: "Dynamic pricing & licensing terms", provider: "FLock (Qwen3 235B)", models: ["qwen3-235b-a22b-instruct-2507"], sdg: ["SDG 8", "SDG 10"] },
          { name: "IP Contract Generation Agent", id: "contract", role: "UK-law-compliant IP contract generation", provider: "Z.AI (GLM-4 Plus)", models: ["glm-4-plus"], sdg: ["SDG 16"] },
          { name: "Talent Search Agent", id: "search", role: "AI-driven talent discovery", provider: "FLock (DeepSeek)", models: ["deepseek-v3.2"], sdg: ["SDG 8", "SDG 10"] },
          { name: "Audit & Traceability Agent", id: "audit", role: "Transaction logging & usage monitoring", provider: "Local", models: [], sdg: ["SDG 16"] },
          { name: "Orchestrator", id: "orchestrator", role: "Multi-agent pipeline coordination", provider: "Local", models: [], sdg: ["SDG 8", "SDG 10", "SDG 16"] },
        ]);
        setStats({ total_actions: 0, total_tokens_used: 0, unique_agents_active: 6, licenses_processed: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <nav className="flex items-center justify-between px-8 lg:px-16 h-16 border-b border-[#E0E0DA] bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0B0B0F]">
            <span className="font-display text-sm font-bold italic text-[#0B0B0F]">FL</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body text-sm font-bold tracking-[0.2em] text-[#0B0B0F]">FACE LIBRARY</span>
            <span className="font-body text-[7px] font-light tracking-[0.25em] text-[#6B6B73]">LIKENESS INFRASTRUCTURE</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/claw-console" className="font-body text-sm text-[#1E3A5F] hover:underline">
            Claw Console
          </Link>
          <Link href="/" className="flex items-center gap-2 font-body text-sm text-[#6B6B73] hover:text-[#0B0B0F] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 lg:px-16 py-16">
        <div className="mb-12">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-[#1E3A5F] mb-3">
            System Overview
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-light text-[#0B0B0F] leading-tight">
            Agent <span className="italic">Orchestration</span>
          </h1>
          <p className="font-body text-sm text-[#6B6B73] mt-2">
            6 coordinated AI agents powered by FLock + Z.AI via OpenClaw
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
          {[
            { label: "Total Actions", value: stats?.total_actions ?? 0, icon: <Activity className="w-4 h-4 text-[#1E3A5F]" /> },
            { label: "Tokens Used", value: (stats?.total_tokens_used ?? 0).toLocaleString(), icon: <Hash className="w-4 h-4 text-[#1E3A5F]" /> },
            { label: "Active Agents", value: stats?.unique_agents_active ?? 6, icon: <Zap className="w-4 h-4 text-[#1E3A5F]" /> },
            { label: "Licenses Processed", value: stats?.licenses_processed ?? 0, icon: <Globe className="w-4 h-4 text-[#1E3A5F]" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#E0E0DA] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                {s.icon}
                <span className="font-body text-xs tracking-[0.15em] uppercase text-[#6B6B73]">{s.label}</span>
              </div>
              <p className="font-display text-3xl text-[#0B0B0F]">
                {loading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.name] || Workflow;
            const color = AGENT_COLORS[agent.name] || "#0B0B0F";
            const agentStat = agentStats.find((s) => s.agent_name === agent.id);
            return (
              <div
                key={agent.name}
                className="bg-white border border-[#E0E0DA] rounded-lg p-6 card-lift hover:border-[#1E3A5F]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center agent-pulse"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-body text-[10px] text-emerald-600 uppercase tracking-wider">Online</span>
                  </div>
                </div>
                <h3 className="font-display text-lg text-[#0B0B0F] mb-1">{agent.name}</h3>
                <p className="font-body text-xs text-[#6B6B73] mb-3 leading-relaxed">{agent.role}</p>

                {/* SDG badges */}
                {agent.sdg && agent.sdg.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.sdg.map((sdg) => (
                      <span key={sdg} className={`font-body text-[9px] px-2 py-0.5 rounded-full ${SDG_COLORS[sdg] || "bg-gray-100 text-gray-600"}`}>
                        {sdg}
                      </span>
                    ))}
                  </div>
                )}

                {/* Models used */}
                {agent.models && agent.models.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.models.map((m) => (
                      <span key={m} className="font-body text-[9px] px-2 py-0.5 rounded bg-[#F5F5F0] text-[#6B6B73]">
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Per-agent stats */}
                {agentStat && (
                  <div className="flex gap-4 text-[10px] text-[#6B6B73] font-body mb-3">
                    <span>{agentStat.total_actions} actions</span>
                    <span>{(agentStat.total_tokens || 0).toLocaleString()} tokens</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#E0E0DA]">
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-[#1E3A5F]">
                    {agent.provider}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Model Registry */}
        {models.length > 0 && (
          <div className="bg-white border border-[#E0E0DA] rounded-lg p-6 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-[#1E3A5F]" />
              <p className="font-body text-xs tracking-[0.15em] uppercase text-[#1E3A5F]">Model Registry</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {models.map((m) => (
                <div key={m.tier} className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F0]">
                  <div className={`w-2 h-2 rounded-full ${m.available ? "bg-emerald-500" : "bg-red-400"}`} />
                  <div>
                    <p className="font-body text-xs font-medium text-[#0B0B0F]">{m.model_id}</p>
                    <p className="font-body text-[10px] text-[#6B6B73]">{m.provider} / {m.tier}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architecture Diagram */}
        <div className="bg-[#0B0B0F] rounded-lg p-8 lg:p-12 text-[#FAFAF8]">
          <p className="font-body text-xs tracking-[0.25em] uppercase text-[#FAFAF8]/40 mb-4">
            Pipeline Architecture
          </p>
          <pre className="font-mono text-xs leading-relaxed text-[#FAFAF8]/70 overflow-x-auto">
{`  ┌─────────────────────────────────────────────────────────────┐
  │                    OPENCLAW ORCHESTRATOR                    │
  │                                                             │
  │   Request ──▶ Compliance ──▶ Negotiator ──▶ Contract        │
  │      │          Agent         Agent         Agent           │
  │      │       DeepSeek V3.2  Qwen3 235B    GLM-4 Plus       │
  │      │       + GLM Summary                + Qwen3 fallback  │
  │      │            │             │             │             │
  │      │            ▼             ▼             ▼             │
  │      │       Risk Score    Pricing &     UK-Law IP          │
  │      │       GDPR Check   Terms (SDG8)  Contract            │
  │      │                                                      │
  │      └──────── Audit Agent (logging all transactions) ──────│
  │                                                             │
  │   FLock.io: Qwen3 30B/235B · DeepSeek V3.2 · Kimi K2.5   │
  │   Z.AI:    GLM-4 Plus (128K context)                        │
  │   Tracing: Anyway SDK (OpenTelemetry)                       │
  │   SDG:     8 (Decent Work) · 10 (Equality) · 16 (Justice) │
  └─────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
}
