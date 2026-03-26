# Face Library

**Secure AI Likeness Licensing Platform**

Face Library is a licensing platform for human identity in generative AI. Creators upload their face/likeness, clients submit requests to use it, and an AI-powered contract agent generates UK-law-compliant licensing agreements.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://face-library.vercel.app |
| Backend API | https://face-library.onrender.com |
| API Docs | https://face-library.onrender.com/docs |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Talent | test@gmail.com | test |
| Agent | agent@gmail.com | test |
| Brand | brand@gmail.com | test |

## Features

- **Talent Registration** -- Photo upload, profile creation, licensing preferences
- **Client/Brand Registration** -- Company profiles with industry and role selection
- **Agency Registration** -- Manage talent roster and approve campaigns
- **3 License Types** -- Standard (90 days), Exclusive (180 days), Time-Limited (30 days)
- **AI Contract Agent** -- UK-law-compliant IP licensing agreement generation, validation, and improvement
- **Manual Review Workflow** -- Admin reviews requests before talent approval
- **Discover Talent** -- Browse with 6 filters (gender, age, category, skin, hair, usage)
- **Campaign Management** -- Create, track, and manage licensing campaigns
- **Watermark Tracking** -- Placeholder for watermark tracing technology partner
- **Stripe Payments** -- Secure checkout (90% to talent, 10% platform fee)
- **Full Audit Trail** -- Every action logged

## Architecture

```
   Vercel                    Render                    Supabase
+------------------+    +------------------+    +------------------+
|   Next.js 16     |    |   FastAPI        |    |   PostgreSQL     |
|   React 19       |--->|   Python 3.11    |--->|   9 Tables       |
|   Tailwind CSS   |    |   Supabase REST  |    |   RLS Enabled    |
|   26 Pages       |    |   25+ Endpoints  |    |   6 Users Seeded |
+------------------+    +------------------+    +------------------+
                              |
               +--------------+--------------+
               |              |              |
         +-----+----+  +-----+----+  +------+------+
         |AI Contract|  |Watermark |  |   Stripe    |
         |Agent      |  |Tracking  |  |   Payments  |
         |DeepSeek   |  |Detection |  |   Checkout  |
         |via FLock  |  |Reporting |  |   Webhooks  |
         +-----------+  +----------+  +-------------+
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Python 3.11, FastAPI, Supabase REST API (supabase-py) |
| Database | Supabase PostgreSQL (no direct Postgres connection needed) |
| LLM | DeepSeek v3.2 via FLock API (OpenAI-compatible) |
| Auth | Supabase Auth + bcrypt password hashing |
| Payments | Stripe (test mode) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Pages (26 Routes)

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page -- dark hero, face library grid, nav dropdowns |
| `/login` | Login with quick-fill demo buttons |
| `/signup` | Role selector (Talent / Brand / Agency) |
| `/how-it-works` | Dark theme 6-step pipeline |
| `/for-talent` | Talent info page |
| `/for-agents` | Agency info page |
| `/for-brands` | Brand info page |
| `/talent/library` | Face gallery with watermark overlay |
| `/discover-talent` | Browse talent with 6 filters |
| `/talent-profile/[id]` | Talent detail with portfolio and pricing |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |

### Registration
| Route | Description |
|-------|-------------|
| `/talent/register` | Role, name, DOB, social media, password |
| `/client/register` | 3-column: company, email, industry, role, referral |
| `/agent/register` | Account Info + Agency Details + Platform Info |
| `/verify-email` | Email verification with demo skip |

### Dashboards
| Route | Description |
|-------|-------------|
| `/talent/dashboard` | 3-column: profile, license passports, active licenses |
| `/client/dashboard` | 3-column: profile, find talent, AI assistant, spend |
| `/agent/dashboard` | 3-column: agency profile, requests, AI assistant |

### Campaigns & Licensing
| Route | Description |
|-------|-------------|
| `/campaigns` | Campaign management grid |
| `/campaign/[id]` | Campaign detail (talent, duration, budget) |
| `/license/[id]` | License detail with contract and watermark tracking |

### Avatar Creation
| Route | Description |
|-------|-------------|
| `/create-avatar` | Face + body photo upload with angle examples |
| `/avatar-generating` | Animated 7-step generation progress |

## API Endpoints

### Auth
- `POST /api/auth/signup` -- Create account (talent/client/agent)
- `POST /api/auth/login` -- Sign in
- `GET /api/auth/me/{id}` -- Get user

### Talent
- `POST /api/talent/register` -- Register talent profile
- `POST /api/talent/{id}/upload-image` -- Upload face photo
- `GET /api/talent/{id}` -- Get profile with linked agent info
- `PUT /api/talent/{id}/preferences` -- Update licensing preferences
- `GET /api/talent/{id}/requests` -- Get incoming requests
- `GET /api/talents` -- List all talents

### Client
- `POST /api/client/register` -- Register client/brand
- `GET /api/client/{id}` -- Get profile
- `GET /api/client/{id}/requests` -- Get outgoing requests

### Agent
- `POST /api/agent/register` -- Register agency
- `GET /api/agent/{id}` -- Get profile with managed talents
- `GET /api/agent/{id}/requests` -- Get requests for managed talents

### Talent-Agent Linking
- `POST /api/talent-agent/link` -- Link talent to agent
- `DELETE /api/talent-agent/link/{id}` -- Unlink
- `GET /api/talent-agent/links/{agent_id}` -- Get links

### Licensing
- `POST /api/licensing/request` -- Create license request
- `GET /api/licensing/{id}` -- Get full license details
- `GET /api/licenses` -- List all licenses
- `POST /api/licensing/{id}/generate-contract` -- AI contract generation
- `POST /api/licensing/{id}/validate-contract` -- AI contract validation
- `POST /api/licensing/{id}/improve-contract` -- AI contract improvement
- `POST /api/licensing/{id}/review` -- Manual admin review
- `POST /api/licensing/{id}/approve` -- Talent approve/reject

### Watermark Tracking
- `POST /api/watermark/report` -- Report detection
- `GET /api/watermark/license/{id}` -- Get by license
- `GET /api/watermark/talent/{id}` -- Get by talent

### Payments
- `POST /api/payments/checkout` -- Create Stripe checkout session
- `POST /api/payments/webhook` -- Handle Stripe payment events
- `GET /api/payments/revenue` -- Get revenue stats

### Other
- `GET /api/license-templates` -- Get 3 license type templates
- `GET /api/health` -- Health check

## Database Schema (Supabase)

| Table | Records | Description |
|-------|---------|-------------|
| `users` | 6 | Auth accounts (talent/client/agent) |
| `talent_profiles` | 3 | Likeness profiles with preferences |
| `client_profiles` | 2 | Brand/advertiser company profiles |
| `agent_profiles` | 1 | Talent agency profiles |
| `license_requests` | 1 | Licensing requests with review workflow |
| `contracts` | 1 | AI-generated UK-law contracts |
| `audit_logs` | 0+ | Action audit trail |
| `watermark_tracking` | 0+ | Watermark detection records |
| `talent_agent_links` | 0+ | Talent-agency relationships |

## Getting Started (Local Development)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Environment Variables

Create `.env` in the project root:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend) |
| `LLM_API_KEY` | LLM provider API key |
| `LLM_BASE_URL` | LLM API endpoint |
| `LLM_MODEL` | Model name (e.g. deepseek-v3.2) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `SECRET_KEY` | App secret key |

Frontend `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. http://localhost:8000) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Design

Built from a Figma prototype using standard Tailwind CSS:
- Clean black & white theme
- FL logo (black square)
- Cards: `border-gray-200 rounded-xl shadow-sm`
- Buttons: `bg-black text-white rounded-lg`
- Inputs: `bg-gray-50 border-gray-200 focus:ring-black`
- Unsplash images for demo talent faces

## License

MIT
