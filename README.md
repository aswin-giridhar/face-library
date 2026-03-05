# Face Library

**Secure AI Likeness Licensing Infrastructure**

Face Library is a permission and monetization layer for human identity in generative AI. It enables talent (actors, models, public figures) to control how their likeness is used by brands and AI systems, with AI agents handling compliance, negotiation, contract generation, and audit -- end to end.

Built for the **UK AI Agent Hackathon EP.4 x OpenClaw** (March 2026, Imperial College London) by team **Not.Just.AI**.

---

## The Problem

Generative AI can now create hyper-realistic images and videos of real people. There is no standardized infrastructure for:

- **Consent** -- who gave permission for their face to be used?
- **Compensation** -- how are creators paid when their likeness generates value?
- **Compliance** -- is the usage legal under UK/EU data protection and IP law?
- **Audit** -- who used what, when, and under what terms?

## The Solution

Face Library provides a multi-agent platform where:

1. **Talent** registers their likeness preferences (allowed categories, pricing, geo restrictions)
2. **Brands** submit license requests describing their intended use
3. **AI Agents** autonomously process requests through a full pipeline:
   - Compliance & risk assessment
   - Dynamic price negotiation
   - UK-law-compliant IP contract generation
   - Immutable audit logging
4. **Talent** reviews and approves/rejects with full transparency

---

## Architecture

```
                         +------------------+
                         |   Next.js App    |
                         |   (Frontend)     |
                         +--------+---------+
                                  |
                                  | REST API
                                  |
                         +--------+---------+
                         |   FastAPI        |
                         |   (Backend)      |
                         +--------+---------+
                                  |
                    +-------------+-------------+
                    |             |              |
              +-----+-----+ +---+----+ +-------+-------+
              | Compliance | | Negoti | | Contract Gen  |
              | Agent      | | ator   | | Agent         |
              | (DeepSeek) | | (Qwen3)| | (GLM-4/FLock) |
              +-----+------+ +---+----+ +-------+-------+
                    |             |              |
              +-----+-----+ +---+----+ +-------+-------+
              | Search     | | Audit  | | Orchestrator  |
              | Agent      | | Agent  | | (Pipeline)    |
              | (DeepSeek) | | (Local)| | (Local)       |
              +-----------+  +--------+ +---------------+
                    |             |              |
              +-----+-------------+--------------+------+
              |           OpenClaw Gateway               |
              |   FLock.io API  |  Z.AI GLM  |  Anyway  |
              +----------------------------------------------+
```

### Multi-Agent Pipeline

When a brand submits a license request, the orchestrator runs:

1. **Compliance Agent** -- Assesses content risk, brand risk, legal risk, ethical risk, and geographic risk. Returns risk level and recommendation.
2. **Negotiator Agent** -- Analyzes talent preferences and market rates. Proposes dynamic pricing with breakdown and confidence score.
3. **Contract Agent** -- Generates a full UK-law-compliant IP license agreement (Copyright Act 1988, UK GDPR, Consumer Rights Act 2015). 12 sections covering parties, definitions, grant of rights, restrictions, compensation, IP ownership, data protection, warranties, termination, liability, dispute resolution, and general provisions.
4. **Audit Agent** -- Logs every step with timestamps, agent identity, and action details.

---

## Bounty Tracks

### 1. FLock.io -- Best Use of Open-Source AI Models ($5,000 USDT)

Face Library uses **all 5 FLock open-source models** as the primary LLM provider:

| Agent | Model | Tier | Purpose |
|-------|-------|------|---------|
| Negotiator | Qwen3 235B Instruct | Creative | Dynamic pricing and licensing terms |
| Compliance | DeepSeek V3.2 | Fast | Risk assessment and policy enforcement |
| Contract | Qwen3 235B Thinking | Reasoning (fallback) | IP contract generation |
| Search | DeepSeek V3.2 | Fast | AI-driven talent discovery |
| Audit | Qwen3 30B | Primary | Log analysis |
| (Available) | Kimi K2.5 | Long Context | 128K context for extended analysis |

**SDG Alignment:**
- **SDG 8 (Decent Work)** -- Creating fair economic opportunities for creators. Negotiator agent ensures pricing aligns with market rates. `/api/sdg/impact` endpoint tracks creator compensation metrics.
- **SDG 10 (Reduced Inequalities)** -- Ensuring individual creators have the same IP protection as large corporations. Compliance agent blocks unfair requests.
- **SDG 16 (Peace, Justice)** -- Building transparent, auditable licensing infrastructure with UK law compliance. Full audit trail on every transaction.

### 2. Z.AI -- Best Use of GLM Model ($4,000 USD)

Z.AI's GLM-4 Plus (128K context window) is used as a **core component** in two agents:

1. **Contract Agent (Primary)** -- Generates full 12-section UK-law-compliant IP licensing agreements covering GDPR, Copyright Act 1988, Consumer Rights Act 2015, and dispute resolution. GLM-4 Plus's 128K context is ideal for long structured legal documents.
2. **Compliance Agent (Summary)** -- After DeepSeek performs risk analysis, GLM-4 Plus generates concise executive summaries for talent review. This dual-model approach combines fast analysis with high-quality summarization.

The `openclaw.json` gateway registers Z.AI as a dedicated provider with model binding `zai/glm-4-plus`. Contract agent falls back to FLock Qwen3 235B Thinking if Z.AI is unavailable.

### 3. Claw for Human -- Most Impactful AI Agent ($500)

Face Library is built entirely on the OpenClaw platform:
- `openclaw.json` gateway configuration with FLock + Z.AI providers (6 models across 2 providers)
- 5 agent definitions with workspace paths, model assignments, and SDG tags
- Anyway tracing plugin for full observability (session/agent/LLM/tool spans)
- Rich agent dashboard showing per-agent stats, model registry, and SDG badges
- Demonstrates a real-world use case: protecting human identity rights in the age of generative AI

### 4. AnyWay -- Best Use of Anyway SDK (Mac Mini)

Full OpenTelemetry tracing integration via `backend/tracing.py`:

- **Session-level spans** for each license request pipeline (wraps entire orchestrator run)
- **Agent-level spans** for each AI agent invocation (compliance, negotiator, contract, search)
- **LLM-level spans** for each model call (model, provider, tokens, latency)
- **Tool-level spans** for database operations (audit writes, trail reads, stats queries)

Traces export to `https://trace-dev-collector.anyway.sh` with full content capture. The `openclaw.json` plugin config captures all 4 span types at 100% sample rate.

Additionally, a self-service **pricing API** (`POST /api/pricing/estimate`) supports the commercialization requirement by providing instant algorithmic price estimates for brands.

### 5. Animoca Brands -- Best Multi-Agent System ($1,000 USD)

Face Library is a coordinated multi-agent system where 5 specialized AI agents collaborate to solve a real problem -- protecting human identity rights in generative AI:

- **Multi-agent orchestration** -- Compliance, Negotiator, Contract, Search, and Audit agents work in a coordinated pipeline with full metadata tracking (agents invoked, models used, tokens consumed, elapsed time)
- **Agent UX** -- Full dashboard with real-time agent activity feed (Claw Console), expandable logs, per-request audit trails, per-agent statistics, and model registry
- **Agent decision history** -- `GET /api/agents/decisions` endpoint tracks all agent decisions across the pipeline, enabling analysis of agent behavior patterns
- **Real-world impact** -- Enables creators to control, monetize, and audit how their likeness is used by AI systems
- **Decision engine** -- Agents autonomously assess risk, negotiate pricing, and generate legal contracts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| LLM Providers | FLock.io (Qwen3 30B/235B, DeepSeek V3.2, Kimi K2.5), Z.AI (GLM-4 Plus 128K) |
| Agent Platform | OpenClaw (gateway config, 5 agent definitions, 2 providers) |
| Observability | Anyway SDK (OpenTelemetry -- session/agent/LLM/tool spans) |
| Tracing | `opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-exporter-otlp-proto-http` |
| Auth | SHA-256 salted password hashing, localStorage sessions |

---

## Pages & Features

| Page | Description |
|------|-------------|
| `/` | Landing page -- hero, trust bar, role cards, agent showcase, how it works pipeline |
| `/signup` | Account creation with role selection (Talent / Brand / Agent) |
| `/login` | Email + password authentication |
| `/talent/dashboard` | Manage ad category permissions (allow/block), approval mode (auto/manual), geographic scope, view and action incoming license requests |
| `/talent/register` | Detailed talent profile registration with bio, categories, pricing, permissions |
| `/brand/dashboard` | Create license requests, select talent, run the AI orchestrator pipeline, view per-request agent logs |
| `/brand/register` | Brand profile registration |
| `/brand/search` | AI-powered talent discovery with natural language search |
| `/license/[id]` | License detail -- compliance results, negotiation notes, generated contract, approve/reject, full audit trail |
| `/agents` | System agent dashboard -- stats, agent grid with provider info, architecture diagram |
| `/claw-console` | Real-time agent activity log viewer with search, agent filter, expandable input/output payloads |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cat > ../.env << 'EOF'
FLOCK_API_KEY=your_flock_api_key
FLOCK_API_BASE=https://api.flock.io/v1
ZAI_API_KEY=your_zai_api_key
ZAI_API_BASE=https://open.bigmodel.cn/api/paas/v4
ANYWAY_API_KEY=your_anyway_api_key
DATABASE_URL=sqlite:///./face_library.db
EOF

# Run
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### API Documentation

With the backend running, visit http://localhost:8000/docs for the interactive Swagger UI.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account (talent/brand/agent) |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me/{id}` | Get current user |
| POST | `/api/talent/register` | Register talent with full profile |
| GET | `/api/talent/{id}` | Get talent profile |
| PUT | `/api/talent/{id}/preferences` | Update category/approval/geo preferences |
| GET | `/api/talent/{id}/requests` | List incoming license requests |
| GET | `/api/talents` | List all talents |
| POST | `/api/brand/register` | Register brand |
| GET | `/api/brand/{id}` | Get brand profile |
| GET | `/api/brand/{id}/requests` | List brand's license requests |
| POST | `/api/licensing/request` | Create license request |
| POST | `/api/licensing/{id}/process` | Run multi-agent pipeline |
| GET | `/api/licensing/{id}` | Get license details + contract |
| POST | `/api/licensing/{id}/approve` | Approve or reject license |
| GET | `/api/licenses` | List all licenses |
| POST | `/api/talent/search` | AI-powered talent search |
| GET | `/api/agents/status` | Agent system status + stats + model registry |
| GET | `/api/agents/decisions` | Agent decision history (Animoca bounty) |
| POST | `/api/pricing/estimate` | Algorithmic pricing estimate (AnyWay bounty) |
| GET | `/api/sdg/impact` | SDG impact metrics (FLock bounty) |
| GET | `/api/audit/logs` | All agent audit logs (Claw Console) |
| GET | `/api/audit/{id}` | Audit trail for specific license |
| GET | `/api/health` | Health check |

---

## Team

**Not.Just.AI**

Built at the UK AI Agent Hackathon EP.4 x OpenClaw, Imperial College London, March 2026.

---

## License

MIT
