# Face Library

**Secure AI Likeness Licensing Infrastructure**

Face Library is a permission and monetization layer for human identity in generative AI. It enables talent (actors, models, public figures) to control how their likeness is used by brands and AI systems, with 9 AI agents handling compliance, negotiation, contract generation, avatar prompts, fingerprinting, Web3 rights, and audit -- end to end.

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

1. **Talent** registers their likeness preferences (allowed categories, pricing, geo restrictions, social media, agency representation)
2. **Agents (Talent Agencies)** manage talent rosters with configurable approval workflows
3. **Brands** submit license requests describing their intended use
4. **9 AI Agents** autonomously process requests through a 7-step pipeline:
   - Compliance & risk assessment
   - Dynamic price negotiation
   - UK-law-compliant IP contract generation
   - License token issuance
   - Avatar/image prompt generation
   - Likeness fingerprint scanning
   - Web3 smart contract metadata
   - Immutable audit logging
5. **Talent** reviews and approves/rejects with full transparency

---

## Architecture

```
                         +------------------+
                         |   Next.js App    |
                         |   (19 Pages)     |
                         +--------+---------+
                                  |
                                  | REST API
                                  |
                         +--------+---------+
                         |   FastAPI        |
                         |   (Backend)      |
                         +--------+---------+
                                  |
              +-------------------+-------------------+
              |         |         |         |         |
        +-----+---+ +---+----+ +-+-------+ +--+----+ +---+--------+
        |Compliance| |Pricing | |IP       | |Avatar | |Likeness    |
        |& Risk    | |Negoti- | |Contract | |Gener- | |Fingerprint |
        |Agent     | |ator    | |Agent    | |ation  | |Agent       |
        |DeepSeek  | |Qwen3   | |GLM-4    | |Deep-  | |DeepSeek    |
        |+GLM summ | |235B    | |Plus     | |Seek   | |V3.2       |
        +-----+----+ +---+----+ +----+----+ +--+----+ +---+--------+
              |           |          |          |          |
        +-----+---+ +----+----+ +---+--------+ |          |
        |Web3     | |Talent   | |Audit &     | |          |
        |Rights   | |Discovery| |Logging     | |          |
        |Agent    | |Agent    | |Agent       | |          |
        |Polygon  | |DeepSeek | |Local       | |          |
        +---------+ +---------+ +----+-------+ |          |
              |           |          |          |          |
        +-----+-----------+----------+----------+----------+------+
        |              Pipeline Orchestrator (v2.0)                |
        |    7-step pipeline coordination across all agents        |
        +-----+---------------------------------------------------+
              |
        +-----+---------------------------------------------------+
        |                   OpenClaw Gateway                       |
        |   FLock.io API  |  Z.AI GLM  |  Anyway SDK (Tracing)    |
        +---------------------------------------------------------+
```

### 7-Step Agent Pipeline

When a brand submits a license request, the orchestrator runs:

1. **Compliance & Risk Agent** -- Assesses content risk, brand risk, legal risk, ethical risk, and geographic risk using DeepSeek V3.2. Generates executive summary via Z.AI GLM-4 Plus. Returns risk level and recommendation.
2. **Pricing Negotiator Agent** -- Analyzes talent preferences and market rates using Qwen3 235B. Proposes dynamic pricing with breakdown, confidence score, and SDG 8 alignment.
3. **IP Contract Agent** -- Generates a full UK-law-compliant IP license agreement using Z.AI GLM-4 Plus (128K context). 12 sections covering parties, definitions, grant of rights, restrictions, compensation, IP ownership, data protection, warranties, termination, liability, dispute resolution, and general provisions. Falls back to FLock Qwen3 235B Thinking.
4. **License Token** -- Issues a UUID license token for tracking.
5. **Avatar Generation Agent** -- Generates detailed image/avatar prompts using DeepSeek V3.2, ready for dispatch to Z.AI image generation.
6. **Likeness Fingerprint Agent** -- Simulates unauthorized use detection scan using DeepSeek V3.2. Generates fingerprint ID and scan report with platforms checked, violations found, and risk score.
7. **Web3 Rights Agent** -- Generates ERC-721 smart contract metadata on Polygon for on-chain IP rights tracking. Produces contract address, token metadata, and estimated gas.
8. **Audit & Logging Agent** -- Logs every step with timestamps, agent identity, model used, tokens consumed, and action details. Powers the Claw Console.

If compliance recommends rejection, the pipeline short-circuits (skips steps 2-7) and logs the failure.

---

## Bounty Tracks

### 1. FLock.io -- Best Use of Open-Source AI Models ($5,000 USDT)

Face Library uses **all 5 FLock open-source models** as the primary LLM provider:

| Agent | Model | Tier | Purpose |
|-------|-------|------|---------|
| Pricing Negotiator | Qwen3 235B Instruct | Creative | Dynamic pricing and licensing terms |
| Compliance & Risk | DeepSeek V3.2 | Fast | Risk assessment and policy enforcement |
| IP Contract | Qwen3 235B Thinking | Reasoning (fallback) | IP contract generation |
| Avatar Generation | DeepSeek V3.2 | Fast | Image/avatar prompt generation |
| Likeness Fingerprint | DeepSeek V3.2 | Fast | Unauthorized use detection |
| Talent Discovery | DeepSeek V3.2 | Fast | AI-driven talent search |
| Onboarding Chat | DeepSeek V3.2 | Fast | Conversational profile setup |
| (Available) | Qwen3 30B | Primary | General analysis |
| (Available) | Kimi K2.5 | Long Context | 128K context for extended analysis |

**SDG Alignment:**
- **SDG 8 (Decent Work)** -- Creating fair economic opportunities for creators. Negotiator agent ensures pricing aligns with market rates. `/api/sdg/impact` endpoint tracks creator compensation metrics.
- **SDG 10 (Reduced Inequalities)** -- Ensuring individual creators have the same IP protection as large corporations. Compliance agent blocks unfair requests.
- **SDG 16 (Peace, Justice)** -- Building transparent, auditable licensing infrastructure with UK law compliance. Full audit trail on every transaction.

### 2. Z.AI -- Best Use of GLM Model ($4,000 USD)

Z.AI's GLM-4 Plus (128K context window) is used as a **core component** in two agents:

1. **IP Contract Agent (Primary)** -- Generates full 12-section UK-law-compliant IP licensing agreements covering GDPR, Copyright Act 1988, Consumer Rights Act 2015, and dispute resolution. GLM-4 Plus's 128K context is ideal for long structured legal documents.
2. **Compliance & Risk Agent (Summary)** -- After DeepSeek performs risk analysis, GLM-4 Plus generates concise executive summaries for talent review. This dual-model approach combines fast analysis with high-quality summarization.

The `openclaw.json` gateway registers Z.AI as a dedicated provider with model binding `zai/glm-4-plus`. Contract agent falls back to FLock Qwen3 235B Thinking if Z.AI is unavailable.

### 3. Claw for Human -- Most Impactful AI Agent ($500)

Face Library is built entirely on the OpenClaw platform:
- `openclaw.json` gateway configuration with FLock + Z.AI providers (6 models across 2 providers)
- 9 agent definitions with workspace paths, model assignments, and SDG tags
- Anyway tracing plugin for full observability (session/agent/LLM/tool spans)
- Rich agent dashboard showing per-agent stats, model registry, and SDG badges
- Claw Console for real-time audit log viewing across all agents
- Demonstrates a real-world use case: protecting human identity rights in the age of generative AI

### 4. AnyWay -- Best Use of Anyway SDK (Mac Mini)

Full OpenTelemetry tracing integration via `backend/tracing.py`:

- **Session-level spans** for each license request pipeline (wraps entire orchestrator run)
- **Agent-level spans** for each AI agent invocation (all 9 agents)
- **LLM-level spans** for each model call (model, provider, tokens, latency)
- **Tool-level spans** for database operations (audit writes, trail reads, stats queries)

Traces export to `https://trace-dev-collector.anyway.sh` with full content capture. The `openclaw.json` plugin config captures all 4 span types at 100% sample rate.

Additionally, a self-service **pricing API** (`POST /api/pricing/estimate`) supports the commercialization requirement by providing instant algorithmic price estimates for brands.

### 5. Animoca Brands -- Best Multi-Agent System ($1,000 USD)

Face Library is a coordinated multi-agent system where 9 specialized AI agents collaborate to solve a real problem -- protecting human identity rights in generative AI:

- **Multi-agent orchestration** -- 9 agents (Compliance, Negotiator, Contract, Avatar Generation, Fingerprint, Web3 Rights, Search, Audit, Orchestrator) work in a coordinated 7-step pipeline with full metadata tracking
- **Agent UX** -- Full dashboard with real-time agent activity feed (Claw Console), expandable logs, per-request audit trails, per-agent statistics, and model registry
- **Agent decision history** -- `GET /api/agents/decisions` endpoint tracks all agent decisions across the pipeline
- **Web3 integration** -- Web3 Rights Agent generates ERC-721 smart contract metadata on Polygon for on-chain IP rights
- **Real-world impact** -- Enables creators to control, monetize, and audit how their likeness is used by AI systems

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| LLM Providers | FLock.io (Qwen3 30B/235B, DeepSeek V3.2, Kimi K2.5), Z.AI (GLM-4 Plus 128K) |
| Agent Platform | OpenClaw (gateway config, 9 agent definitions, 2 providers) |
| Observability | Anyway SDK (OpenTelemetry -- session/agent/LLM/tool spans) |
| Tracing | `opentelemetry-api`, `opentelemetry-sdk`, `opentelemetry-exporter-otlp-proto-http` |
| Auth | Supabase Auth (primary) + SHA-256 salted password hashing (fallback) |
| Web3 | ERC-721, Polygon (via Web3 Rights Agent) |

---

## Pages & Features (19 Pages)

| Page | Role | Description |
|------|------|-------------|
| `/` | All | Landing page -- hero, trust bar, role cards (Talent/Agent/Brand), 9-agent showcase, pipeline visualization. Auth-aware nav shows dashboard links when logged in. |
| `/signup` | All | Account creation with role selection (Talent / Brand / Agent). Shows Agency Name field for agent role. |
| `/login` | All | Email + password authentication. Routes to role-specific dashboard. |
| `/talent/register` | Talent | Detailed talent profile registration with bio, categories, pricing, permissions |
| `/onboarding/chat` | Talent | 8-step conversational onboarding: age, location, photo upload, AI description, social media, restrictions, agency check, terms |
| `/talent/dashboard` | Talent | Manage ad category permissions (15 categories), approval mode, geo scope, linked agent display, incoming license requests |
| `/talent/library` | All | Browse all registered talents with filtering and search. Talent cards with name, categories, social links, pricing. |
| `/agent/register` | Agent | Quick signup form for talent agencies (name, email, agency name, website) |
| `/agent/onboarding` | Agent | 6-step guided setup: welcome, agency info, talent profiles, restrictions, approval workflow, complete |
| `/agent/dashboard` | Agent | Managed talents list, pending approvals queue, contract templates, approve/reject actions |
| `/brand/register` | Brand | Brand/advertiser profile registration |
| `/brand/onboarding` | Brand | Brand onboarding chat flow |
| `/brand/dashboard` | Brand | Create license requests, trigger 7-agent pipeline, view per-request agent results |
| `/brand/search` | Brand | AI-powered talent discovery with natural language search via Talent Discovery Agent |
| `/license/[id]` | All | License detail -- risk assessment, pricing, contract, fingerprint, Web3 metadata, audit trail, approve/reject |
| `/agents` | All | System agent dashboard -- stats (actions, tokens, agents, licenses), 9-agent grid, model registry, pipeline architecture diagram |
| `/claw-console` | All | Real-time audit log viewer with search, agent filter, expandable details, license context |

---

## App Flow

### Talent Flow
1. Landing page (`/`) -> "Apply as Talent" -> `/talent/register`
2. Registration creates account -> redirects to `/onboarding/chat`
3. 8-step chat onboarding (age, location, photo, description, social media, restrictions, agency, terms)
4. Completes -> redirects to `/talent/library`
5. Logs in -> redirects to `/talent/dashboard`
6. Dashboard: manage preferences, review incoming license requests, approve/reject

### Agent Flow
1. Landing page (`/`) -> "Apply as Agent" -> `/agent/register`
2. Registration creates account -> redirects to `/agent/onboarding`
3. 6-step onboarding (agency info, talent profiles, restrictions, approval workflow)
4. Completes -> redirects to `/agent/dashboard`
5. Dashboard: manage talent roster, review requests on behalf of talent

### Brand Flow
1. Landing page (`/`) -> "License a Likeness" -> `/brand/register`
2. Registration creates account -> redirects to `/brand/onboarding` or `/brand/dashboard`
3. Dashboard: browse talent library, create license requests
4. Trigger pipeline -> 7-agent processing (compliance -> negotiation -> contract -> token -> avatar -> fingerprint -> web3 -> audit)
5. View results at `/license/[id]` -- risk score, proposed price, full contract, audit trail

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
FLOCK_BASE_URL=https://api.flock.io/v1
ZAI_API_KEY=your_zai_api_key
ZAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
ANYWAY_API_KEY=your_anyway_api_key
DATABASE_URL=sqlite:///./face_library.db
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
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

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account (talent/brand/agent) |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me/{id}` | Get current user |

### Talent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/talent/register` | Register talent with full profile |
| GET | `/api/talent/{id}` | Get talent profile (includes linked agent) |
| PUT | `/api/talent/{id}/preferences` | Update category/approval/geo/social preferences |
| GET | `/api/talent/{id}/requests` | List incoming license requests |
| GET | `/api/talents` | List all talents |
| POST | `/api/talent/search` | AI-powered talent search |
| POST | `/api/talent/analyze-photo` | AI photo analysis for profile description |

### Brand
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/brand/register` | Register brand |
| GET | `/api/brand/{id}` | Get brand profile |
| GET | `/api/brand/{id}/requests` | List brand's license requests |

### Agent (Talent Agency)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/register` | Register talent agency |
| GET | `/api/agent/{id}` | Get agent profile + managed talents |
| GET | `/api/agent/{id}/requests` | Get license requests for all managed talents |

### Talent-Agent Linking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/talent-agent/link` | Link talent to agent with approval type |
| DELETE | `/api/talent-agent/link/{id}` | Remove talent-agent link |
| GET | `/api/talent-agent/links/{agent_id}` | List all talent links for an agent |

### Licensing (7-Agent Pipeline)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/licensing/request` | Create license request |
| POST | `/api/licensing/{id}/process` | Trigger 7-agent pipeline |
| GET | `/api/licensing/{id}` | Get license details + contract + pipeline results |
| POST | `/api/licensing/{id}/approve` | Approve or reject license |
| GET | `/api/licenses` | List all licenses |

### AI Agents & Observability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/status` | 9-agent system status + stats + model registry |
| GET | `/api/agents/decisions` | Agent decision history |
| GET | `/api/audit/logs` | All agent audit logs (Claw Console) |
| GET | `/api/audit/{id}` | Audit trail for specific license |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pricing/estimate` | Algorithmic pricing estimate |
| GET | `/api/sdg/impact` | SDG impact metrics |
| POST | `/api/chat/onboarding` | Onboarding chat (talent/brand/agent) |
| GET | `/api/health` | Health check (version, agent count, pipeline info) |

---

## Team

**Not.Just.AI**

Built at the UK AI Agent Hackathon EP.4 x OpenClaw, Imperial College London, March 2026.

---

## License

MIT
