# Face Library — User Guide

A complete walkthrough of the platform for talent, agents (talent agencies), and brands (advertisers).

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Talent Portal](#talent-portal)
3. [Agent (Talent Agency) Portal](#agent-portal)
4. [Brand (Advertiser) Portal](#brand-portal)
5. [AI Agent Pipeline](#ai-agent-pipeline)
6. [Claw Console](#claw-console)
7. [License Viewer](#license-viewer)
8. [Talent Library](#talent-library)
9. [API Reference](#api-reference)

---

## Getting Started

### Sign Up

1. Go to the landing page and click **Get Started** or **Sign In**
2. Choose your role: **Talent**, **Agent**, or **Brand**
3. Fill in your name, email, and password
4. You'll be redirected to the onboarding flow for your role

### Sign In

If you already have an account, click **Sign In** and enter your email and password. You'll be redirected to your role-specific dashboard.

---

## Talent Portal

### Registration (`/talent/register`)

Register as a talent to protect and monetize your likeness:

1. **Basic Info** — Enter your name, email, bio, and social media links
2. **Preferences** — Set your minimum price per use, geographic scope (UK/EU/Global), and approval mode (manual or auto-approve)
3. **Categories** — Select which ad categories you allow (Fashion, Beauty, Tech, etc.) and which you want to block (Alcohol, Gambling, etc.)
4. Submit to create your talent profile

### AI Chat Onboarding (`/onboarding/chat`)

An alternative, conversational way to set up your profile:

1. Chat with the Face Library AI assistant
2. It asks about your background, preferences, and restrictions
3. Your profile is built automatically from the conversation
4. Great for people who prefer a guided experience over forms

### Talent Dashboard (`/talent/dashboard`)

Your command center for managing your likeness:

- **Profile Card** — View your name, email, and geographic scope
- **Approval Settings** — Toggle auto-approve on/off, change geographic scope
- **Linked Agent** — See if a talent agency is managing your approvals
- **Ad Category Permissions** — Click categories to toggle between allowed (blue), blocked (red), and neutral. Click **Save** to update.
- **Incoming License Requests** — See all requests from brands:
  - View the brand name, content type, duration, regions, and proposed price
  - **Approve** or **Reject** pending requests
  - Click **View** to see the full license details, contract, and audit trail

### Talent Library (`/talent/library`)

Browse all registered talent on the platform. Each profile card shows:
- Name, bio, categories, geographic scope
- Minimum price per use
- Approval mode (manual/auto)

---

## Agent Portal

### Registration (`/agent/register`)

Register as a talent agent (agency) to manage talent rosters:

1. **Agency Info** — Enter your name, email, agency name, and website
2. **Approval Type** — Choose how approvals work:
   - **Agent Only** — You approve/reject on behalf of talent
   - **Talent Only** — Talent approves, you manage the pipeline
   - **Both Required** — Both you and the talent must approve

### Agent Onboarding (`/agent/onboarding`)

A guided AI chat that walks you through setting up your agency profile, understanding the platform, and learning how to manage talent.

### Agent Dashboard (`/agent/dashboard`)

Manage your talent roster and track licensing activity:

- **Linked Talent** — View all talent you represent
- **Pending Requests** — See license requests across your roster
- **Link New Talent** — Connect with talent on the platform using their ID
- **Approval Workflow** — Approve or reject requests based on your approval type setting

---

## Brand Portal

### Registration (`/brand/register`)

Register as a brand or advertiser to license talent likeness:

1. **Company Info** — Enter your name, email, company name, industry, and website
2. Submit to create your brand profile

### Brand Onboarding (`/brand/onboarding`)

A guided AI chat that helps brands understand:
- How licensing works
- What content types are available
- How the AI agent pipeline processes requests
- Pricing and compliance expectations

### Brand Dashboard (`/brand/dashboard`)

Your hub for creating and managing license requests:

#### Creating a License Request

1. **Select Talent** — Choose from the dropdown of registered talent
2. **Use Case** — Describe your campaign (e.g., "Fashion campaign for summer collection")
3. **Content Type** — Image, Video, or Both
4. **Duration** — How many days you need the license (e.g., 30, 60, 90)
5. **Regions** — Target regions (e.g., "UK, EU" or leave blank for Global)
6. Click **Submit Request**

#### Running the AI Agent Pipeline

After submitting a request, click the **Run Orchestrator** button to trigger the 7-agent pipeline. This processes your request through:
- Compliance check
- Price negotiation
- Contract generation
- License token issuance
- Avatar prompt generation
- Fingerprint scan
- Web3 metadata creation
- Audit logging

The pipeline takes ~60-120 seconds. Once complete, you'll see updated status, proposed price, and risk score.

#### Viewing Request Details

- Click **Details** to see the full license page
- Click **Logs** to expand the audit trail showing every agent's actions
- Click **AI Search** to use the talent discovery agent

### Brand Search (`/brand/search`)

AI-powered talent discovery:

1. Describe what you're looking for (e.g., "Female model, 25-35, fashion experience, UK-based")
2. The Talent Discovery Agent uses AI to rank and match talent from the database
3. Results show relevance scores and profile details
4. Click through to view profiles or start a license request

---

## AI Agent Pipeline

The core of Face Library is a 7-step autonomous agent pipeline. Here's what each agent does:

### Step 1: Compliance & Risk Agent
- **What it does:** Scans the request for content risk, brand risk, legal risk, ethical risk, and geographic risk
- **Models:** FLock DeepSeek V3.2 (analysis) + Z.AI GLM-4.5 (executive summary)
- **Output:** Risk level (low/medium/high/critical), recommendation (approve/reject/approve with conditions), detailed risk flags
- **If rejected:** Pipeline stops here — no further processing

### Step 2: Pricing Negotiator Agent
- **What it does:** Proposes fair pricing based on talent preferences, market rates, content type, duration, and regions
- **Model:** FLock Qwen3 235B
- **Output:** Proposed price (GBP), price breakdown, recommended terms, confidence score, SDG 8 alignment

### Step 3: IP Contract Agent
- **What it does:** Generates a full UK-law-compliant IP licensing agreement
- **Models:** Z.AI GLM-4.5 (primary) / FLock Qwen3 235B Thinking (fallback)
- **Output:** 12-section legal contract covering parties, definitions, grant of license, restrictions, compensation, IP, data protection, warranties, termination, liability, dispute resolution, and general provisions
- **Legal frameworks:** UK Copyright Act 1988, GDPR, Consumer Rights Act 2015, Equality Act 2010

### Step 4: License Token
- **What it does:** Issues a unique UUID license token for tracking
- **Output:** License token ID

### Step 5: Avatar Generation Agent
- **What it does:** Creates detailed image/avatar prompts for the licensed content
- **Model:** FLock DeepSeek V3.2
- **Output:** Professional prompt ready for image generation

### Step 6: Likeness Fingerprint Agent
- **What it does:** Simulates unauthorized use detection across platforms
- **Model:** FLock DeepSeek V3.2
- **Output:** Fingerprint ID, platforms scanned, violations found, risk score

### Step 7: Web3 Rights Agent
- **What it does:** Generates ERC-721 smart contract metadata for on-chain IP rights
- **Chain:** Polygon
- **Output:** Contract address, token metadata, estimated gas cost

### Audit & Logging
After all steps, the Audit Agent logs the full pipeline summary with agent count, models used, tokens consumed, and elapsed time.

---

## Claw Console

The Claw Console (`/claw-console`) is your real-time window into agent activity:

- **Live Audit Feed** — See every agent action across the platform in chronological order
- **Agent Filter** — Filter by specific agent (Compliance, Negotiator, Contract, etc.)
- **Details** — Each entry shows the agent name, action type, model used, tokens consumed, and timestamp
- **License Link** — Click through to see the full license details for any entry

Access via the **Console** button in the top navigation bar.

---

## License Viewer

The License Detail page (`/license/[id]`) shows everything about a specific license:

- **Status** — Pending, Awaiting Approval, Active, Rejected
- **Talent & Brand** — Who's involved
- **Request Details** — Use case, content type, duration, regions, exclusivity
- **Risk Assessment** — Risk level, risk flags, compliance notes
- **Proposed Price** — AI-negotiated price with breakdown
- **Generated Contract** — Full legal contract text (expandable)
- **License Token** — UUID for tracking
- **Avatar Prompt** — Generated image prompt
- **Fingerprint Report** — Scan results
- **Web3 Metadata** — Blockchain contract details (ERC-721, Polygon)
- **Audit Trail** — Complete timeline of all agent actions

For talent: **Approve** or **Reject** buttons appear on pending requests.

---

## Agents Dashboard

The Agents page (`/agents`) shows the full AI agent system:

- **9 Agent Cards** — Each showing name, role, provider, and model
- **Pipeline Visualization** — The 7-step flow from request to contract
- **Per-Agent Statistics** — Total actions and tokens used
- **Model Registry** — All configured models with availability status
- **SDG Alignment** — Which UN Sustainable Development Goals each agent supports

---

## API Reference

Full interactive API documentation is available at:

**Swagger UI:** https://face-library.onrender.com/docs

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Sign in |
| `/api/talent/register` | POST | Register talent |
| `/api/brand/register` | POST | Register brand |
| `/api/agent/register` | POST | Register agent |
| `/api/licensing/request` | POST | Create license request |
| `/api/licensing/{id}/process` | POST | Run 7-agent pipeline |
| `/api/licensing/{id}/approve` | POST | Approve/reject license |
| `/api/licensing/{id}` | GET | Full license details |
| `/api/talent/search` | POST | AI talent discovery |
| `/api/pricing/estimate` | POST | Instant price estimate |
| `/api/agents/status` | GET | Agent system status |
| `/api/agents/decisions` | GET | Agent decision history |
| `/api/audit/{id}` | GET | License audit trail |
| `/api/sdg/impact` | GET | SDG alignment metrics |
| `/api/chat/onboarding` | POST | AI onboarding chat |

---

## Quick Start Demo Flow

Want to test everything end-to-end? Follow these steps:

1. **Sign up as Talent** → `/signup` (select "talent" role)
2. **Complete onboarding** → Set preferences, categories, pricing
3. **Sign up as Brand** (in a different browser/incognito) → `/signup` (select "brand" role)
4. **Go to Brand Dashboard** → `/brand/dashboard`
5. **Create a License Request** → Select the talent, describe your campaign
6. **Click "Run Orchestrator"** → Watch the 7-agent pipeline process your request (~60-120s)
7. **View the results** → Click "Details" to see contract, pricing, risk assessment, Web3 metadata
8. **Switch to Talent** → Go to `/talent/dashboard`, see the incoming request
9. **Approve or Reject** → Review the AI-generated contract and agent recommendations
10. **Check the Claw Console** → `/claw-console` to see the full audit trail

---

*Built for the UK AI Agent Hackathon EP.4 x OpenClaw by team Not.Just.AI*
