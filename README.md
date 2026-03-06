# Face Library

**Secure AI Likeness Licensing Infrastructure**

Face Library is a permission and monetization layer for human identity in generative AI. It enables talent (actors, models, public figures) to control how their likeness is used by brands and AI systems, with 9 AI agents handling compliance, negotiation, contract generation, avatar prompts, fingerprinting, Web3 rights, and audit -- end to end.

Built for the **UK AI Agent Hackathon EP.4 x OpenClaw** (March 2026, Imperial College London) by team **Not.Just.AI**.

### Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://face-library.vercel.app |
| **Backend API** | https://face-library.onrender.com |
| **API Docs (Swagger)** | https://face-library.onrender.com/docs |
| **GitHub** | https://github.com/aswin-giridhar/face-library |

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
6. **Brands** pay for approved licenses via Stripe Connect

---

## Architecture

```
                         +------------------+
                         |   Next.js App    |
                         |   (19 Pages)     |
                         +--------+---------+
                                  |
                    +-------------+-------------+
                    |             |             |
               REST API    Telegram Bot   Stripe Connect
                    |             |             |
                         +--------+---------+
                         |   FastAPI        |
                         |  (42 Endpoints)  |
                         +--------+---------+
                                  |
              +-------------------+-------------------+
              |         |         |         |         |
        +-----+---+ +---+----+ +-+-------+ +--+----+ +---+--------+
        |Compliance| |Pricing | |IP       | |Avatar | |Likeness    |
        |& Risk    | |Negoti- | |Contract | |Gener- | |Fingerprint |
        |Agent     | |ator    | |Agent    | |ation  | |Agent       |
        |DeepSeek  | |Qwen3   | |GLM-4.5  | |Deep-  | |DeepSeek    |
        |+GLM summ | |235B    | |(Z.AI)   | |Seek   | |V3.2       |
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
        |   FLock.io API  |  Z.AI GLM  |  OpenRouter  |  Anyway   |
        +---------------------------------------------------------+
```

### Multi-Channel Deployment

| Channel | Description |
|---------|-------------|
| **Web App** | 19-page Next.js application with role-based dashboards |
| **REST API** | 42 endpoints with Swagger docs |
| **Telegram Bot** | `/search`, `/status`, `/agents` commands via webhook |
| **Stripe Connect** | Payment checkout for license commercialization |

### 7-Step Agent Pipeline

When a brand submits a license request, the orchestrator runs:

1. **Compliance & Risk Agent** -- Assesses content risk, brand risk, legal risk, ethical risk, and geographic risk using DeepSeek V3.2. Generates executive summary via Z.AI GLM-4.5. Returns risk level and recommendation.
2. **Pricing Negotiator Agent** -- Analyzes talent preferences and market rates using Qwen3 235B. Proposes dynamic pricing with breakdown, confidence score, and SDG 8 alignment.
3. **IP Contract Agent** -- Generates a full UK-law-compliant IP license agreement using Z.AI GLM-4.5 (128K context). 12 sections covering parties, definitions, grant of rights, restrictions, compensation, IP ownership, data protection, warranties, termination, liability, dispute resolution, and general provisions. Falls back to FLock Qwen3 235B Thinking.
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

**OpenClaw Integration:**
- Full `openclaw.json` gateway config with all 9 agents, pipeline definition, model assignments, and SDG tags
- `/api/openclaw/config` endpoint serves the gateway configuration
- Pipeline steps, human-approval flow, and workspace paths defined per agent

**Multi-Channel Deployment:**
- **Web App** (Next.js, 19 pages) -- Full role-based dashboards for talent, agents, and brands
- **REST API** (42 endpoints) -- Complete programmatic access with Swagger docs
- **Telegram Bot** -- `/search`, `/status`, `/agents` commands via webhook at `/api/telegram/webhook`

**SDG Alignment:**
- **SDG 8 (Decent Work)** -- Creating fair economic opportunities for creators. Negotiator agent ensures pricing aligns with market rates. `/api/sdg/impact` endpoint tracks creator compensation metrics.
- **SDG 10 (Reduced Inequalities)** -- Ensuring individual creators have the same IP protection as large corporations. Compliance agent blocks unfair requests.
- **SDG 16 (Peace, Justice)** -- Building transparent, auditable licensing infrastructure with UK law compliance. Full audit trail on every transaction.

### 2. Z.AI -- Best Use of GLM Model ($4,000 USD)

Z.AI GLM models are used as a **core component** in two agents, with a resilient 3-tier fallback chain:

**Fallback chain:** Z.AI Direct API (GLM-4 Plus) → OpenRouter (GLM-4.5, thinking disabled) → FLock (Qwen3 235B Thinking)

1. **IP Contract Agent (Primary)** -- Generates full 12-section UK-law-compliant IP licensing agreements covering GDPR, Copyright Act 1988, Consumer Rights Act 2015, and dispute resolution. GLM's large context window is ideal for long structured legal documents.
2. **Compliance & Risk Agent (Summary)** -- After DeepSeek performs risk analysis, GLM generates concise executive summaries for talent review. This dual-model approach combines fast analysis with high-quality summarization.

The `openclaw.json` gateway registers Z.AI as a dedicated provider. The LLM client (`llm_client.py`) automatically routes GLM requests through the best available provider, ensuring Z.AI bounty compliance regardless of direct API availability.

### 3. Claw for Human -- Most Impactful AI Agent ($500)

Face Library is built entirely on the OpenClaw platform:
- `openclaw.json` gateway configuration with FLock + Z.AI + OpenRouter providers (7 models across 3 providers)
- 9 agent definitions with workspace paths, model assignments, tools, and SDG tags
- Pipeline definition with 7 steps, blocking/non-blocking config, and human-approval gate
- Multi-channel deployment (Web, API, Telegram)
- Anyway tracing plugin for full observability (session/agent/LLM/tool spans)
- Rich agent dashboard showing per-agent stats, model registry, and SDG badges
- Claw Console for real-time audit log viewing across all agents
- Demonstrates a real-world use case: protecting human identity rights in the age of generative AI

### 4. AnyWay -- Best Use of Anyway SDK (Mac Mini)

**Anyway SDK Integration:**
- `Traceloop.init()` from `anyway-sdk` for automatic LLM call instrumentation
- Auto-instruments all OpenAI client calls (FLock, Z.AI, OpenRouter) -- captures prompts, completions, tokens, latency
- Custom spans: session-level (pipeline), agent-level (per agent), LLM-level (per call), tool-level (DB ops)
- Exports to `https://trace-dev-collector.anyway.sh/` with Bearer token auth
- 100% sample rate, full content capture

**Commercialization (Stripe Connect):**
- `POST /api/payments/checkout` -- Creates Stripe Checkout sessions for license payments
- `POST /api/payments/webhook` -- Handles payment completion events
- `GET /api/payments/revenue` -- Revenue dashboard (total revenue, platform fees, talent payouts)
- 10% platform fee model: 90% goes to talent, 10% to Face Library
- Instant pricing API at `POST /api/pricing/estimate` for algorithmic estimates

**Setup:**
```python
from anyway.sdk import Traceloop
Traceloop.init(
    app_name="face-library",
    api_endpoint="https://trace-dev-collector.anyway.sh/",
    headers={"Authorization": "Bearer <ANYWAY_API_KEY>"},
)
```

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
| LLM Providers | FLock.io (Qwen3 30B/235B, DeepSeek V3.2, Kimi K2.5), Z.AI (GLM-4.5 via OpenRouter) |
| Agent Platform | OpenClaw (gateway config, 9 agent definitions, 3 providers, pipeline definition) |
| Observability | Anyway SDK (`anyway-sdk` -- auto-instruments OpenAI calls + custom spans) |
| Auth | Supabase Auth (primary) + SHA-256 salted password hashing (fallback) |
| Payments | Stripe Connect (license payments, 10% platform fee) |
| Multi-Channel | Web (Next.js), REST API (42 endpoints), Telegram Bot |
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
6. Pay for approved license via Stripe Checkout -> revenue tracked at `/api/payments/revenue`

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

# Create .env file in the project root
cp .env.example .env
# Edit .env with your API keys (see Environment Variables below)

# Run
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# For local development (backend at localhost:8000):
npm run dev

# For production (set backend URL):
NEXT_PUBLIC_API_URL=https://face-library.onrender.com npm run build
```

Open http://localhost:3000

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FLOCK_API_KEY` | FLock.io API key for AI models | Yes |
| `FLOCK_BASE_URL` | FLock API endpoint (`https://api.flock.io/v1`) | Yes |
| `FLOCK_MODEL_PRIMARY` | Primary model (`qwen3-30b-a3b-instruct-2507`) | Yes |
| `FLOCK_MODEL_REASONING` | Reasoning model (`qwen3-235b-a22b-thinking-2507`) | Yes |
| `FLOCK_MODEL_FAST` | Fast model (`deepseek-v3.2`) | Yes |
| `ZAI_API_KEY` | Z.AI API key for GLM-4 Plus (direct) | Optional |
| `ZAI_BASE_URL` | Z.AI endpoint (`https://open.bigmodel.cn/api/paas/v4`) | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API key (GLM-4.5 fallback for Z.AI) | Yes |
| `ANYWAY_API_KEY` | Anyway SDK key for tracing | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments (test mode) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Optional |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | Optional |
| `DATABASE_URL` | Database URL (SQLite or PostgreSQL) | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SECRET_KEY` | App secret for session signing | Yes |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend (Vercel env) | Production |

### Deployment

**Frontend (Vercel):**
1. Import `aswin-giridhar/face-library` on Vercel
2. Set Root Directory to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL=https://face-library.onrender.com`

**Backend (Render):**
1. Create Web Service from `aswin-giridhar/face-library`
2. Set Root Directory to `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables listed above

### API Documentation

- **Local**: http://localhost:8000/docs (Swagger UI)
- **Production**: https://face-library.onrender.com/docs

---

## API Endpoints (42 Routes)

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

### Payments (Stripe Connect)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout` | Create Stripe Checkout session for license payment |
| POST | `/api/payments/webhook` | Handle Stripe payment events |
| GET | `/api/payments/revenue` | Revenue dashboard (total, fees, payouts) |

### Multi-Channel (Telegram)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/telegram/webhook` | Handle Telegram bot messages |
| POST | `/api/telegram/setup` | Register webhook URL with Telegram |

### OpenClaw & Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/openclaw/config` | OpenClaw gateway configuration |
| POST | `/api/pricing/estimate` | Algorithmic pricing estimate |
| GET | `/api/sdg/impact` | SDG impact metrics |
| POST | `/api/chat/onboarding` | Onboarding chat (talent/brand/agent) |
| GET | `/api/health` | Health check (version, agents, channels, commercialization) |

---

## Documentation

- **[User Guide](USER_GUIDE.md)** -- Complete walkthrough for talent, agents, and brands
- **[Pitch Deck](PITCHDECK.md)** -- Hackathon presentation deck
- **[API Docs (Live)](https://face-library.onrender.com/docs)** -- Interactive Swagger UI
- **[OpenClaw Config](agents/openclaw.json)** -- Gateway configuration for 9 agents

---

## Team

**Not.Just.AI**

Built at the UK AI Agent Hackathon EP.4 x OpenClaw, Imperial College London, March 2026.

---

## License

MIT
