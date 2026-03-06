/**
 * Face Library API Client — All backend calls to FastAPI.
 *
 * Sections: Auth, Talent, Brand, Agent, Talent-Agent Linking,
 * Licensing (7-agent pipeline), Search, Pricing, SDG Impact,
 * Agent Orchestration Status, Audit Logs, Onboarding Chat.
 *
 * Backend: FastAPI at localhost:8000 (configurable via NEXT_PUBLIC_API_URL).
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API Error");
  }
  return res.json();
}

// Auth
export const signup = (data: { email: string; password: string; name: string; role: string; company_name?: string }) =>
  fetchAPI("/api/auth/signup", { method: "POST", body: JSON.stringify(data) });

export const login = (data: { email: string; password: string }) =>
  fetchAPI("/api/auth/login", { method: "POST", body: JSON.stringify(data) });

export const getMe = (userId: number) => fetchAPI(`/api/auth/me/${userId}`);

// Talent
export const registerTalent = (data: Record<string, unknown>) =>
  fetchAPI("/api/talent/register", { method: "POST", body: JSON.stringify(data) });

export const getTalent = (id: number) => fetchAPI(`/api/talent/${id}`);

export const listTalents = () => fetchAPI("/api/talents");

export const updateTalentPreferences = (id: number, data: Record<string, unknown>) =>
  fetchAPI(`/api/talent/${id}/preferences`, { method: "PUT", body: JSON.stringify(data) });

export const getTalentRequests = (id: number) => fetchAPI(`/api/talent/${id}/requests`);

// Brand
export const registerBrand = (data: Record<string, unknown>) =>
  fetchAPI("/api/brand/register", { method: "POST", body: JSON.stringify(data) });

export const getBrand = (id: number) => fetchAPI(`/api/brand/${id}`);

export const getBrandRequests = (id: number) => fetchAPI(`/api/brand/${id}/requests`);

// Agent
export const registerAgent = (data: Record<string, unknown>) =>
  fetchAPI("/api/agent/register", { method: "POST", body: JSON.stringify(data) });

export const getAgent = (id: number) => fetchAPI(`/api/agent/${id}`);

export const getAgentRequests = (id: number) => fetchAPI(`/api/agent/${id}/requests`);

// Talent-Agent Linking
export const linkTalentAgent = (data: { talent_id: number; agent_id: number; approval_type?: string }) =>
  fetchAPI("/api/talent-agent/link", { method: "POST", body: JSON.stringify(data) });

export const unlinkTalentAgent = (linkId: number) =>
  fetchAPI(`/api/talent-agent/link/${linkId}`, { method: "DELETE" });

export const getAgentLinks = (agentId: number) => fetchAPI(`/api/talent-agent/links/${agentId}`);

// Licensing
export const createLicenseRequest = (data: Record<string, unknown>) =>
  fetchAPI("/api/licensing/request", { method: "POST", body: JSON.stringify(data) });

export const processLicense = (id: number) =>
  fetchAPI(`/api/licensing/${id}/process`, { method: "POST" });

export const getLicense = (id: number) => fetchAPI(`/api/licensing/${id}`);

export const approveLicense = (id: number, approved: boolean, notes?: string) =>
  fetchAPI(`/api/licensing/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ approved, notes }),
  });

export const listLicenses = () => fetchAPI("/api/licenses");

// Search
export const searchTalent = (query: string, filters?: Record<string, unknown>) =>
  fetchAPI("/api/talent/search", {
    method: "POST",
    body: JSON.stringify({ query, ...filters }),
  });

// Agents
export const getAgentsStatus = () => fetchAPI("/api/agents/status");

export const getAuditTrail = (licenseId: number) =>
  fetchAPI(`/api/audit/${licenseId}`);

export const getAllAuditLogs = () => fetchAPI("/api/audit/logs");

// Pricing
export const getPricingEstimate = (data: {
  content_type?: string;
  duration_days?: number;
  regions?: string;
  exclusivity?: boolean;
  talent_min_price?: number;
}) => fetchAPI("/api/pricing/estimate", { method: "POST", body: JSON.stringify(data) });

// SDG Impact
export const getSDGImpact = () => fetchAPI("/api/sdg/impact");

// Agent Decisions
export const getAgentDecisions = () => fetchAPI("/api/agents/decisions");

// Onboarding Chat
export const onboardingChat = (data: {
  messages: { role: string; content: string }[];
  user_type: string;
  context?: Record<string, string>;
}) => fetchAPI("/api/chat/onboarding", { method: "POST", body: JSON.stringify(data) });

// Photo Analysis
export const analyzePhoto = (data: { description?: string }) =>
  fetchAPI("/api/talent/analyze-photo", { method: "POST", body: JSON.stringify(data) });

// Health
export const getHealth = () => fetchAPI("/api/health");
