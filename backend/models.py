"""Face Library Database Models -- SQLAlchemy ORM for all platform entities.

Tables:
- User: Authentication accounts (talent, brand, agent roles)
- TalentProfile: Likeness licensing preferences (pricing, restrictions, social links)
- BrandProfile: Advertiser company profiles
- AgentProfile: Talent agency profiles (manages talent rosters)
- TalentAgentLink: Many-to-many link between talents and their agents
- LicenseRequest: Brand-to-talent licensing requests (tracks full pipeline state)
- Contract: AI-generated UK-law-compliant licensing contracts
- AuditLog: Immutable audit trail for all agent actions (Claw Console)
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./face_library.db")

# Support both SQLite and PostgreSQL (Supabase)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    """Three platform roles: talent (licensor), brand (licensee), agent (manager)."""
    TALENT = "talent"
    BRAND = "brand"
    AGENT = "agent"


class LicenseStatus(str, enum.Enum):
    """Tracks the license through the 7-agent pipeline stages."""
    PENDING = "pending"
    NEGOTIATING = "negotiating"
    COMPLIANCE_CHECK = "compliance_check"
    AWAITING_APPROVAL = "awaiting_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ApprovalType(str, enum.Enum):
    """Who must approve a license when talent has an agent."""
    TALENT_ONLY = "talent_only"
    AGENT_ONLY = "agent_only"
    BOTH_REQUIRED = "both_required"


# ── Core Tables ──────────────────────────────────────────────────────────────

class User(Base):
    """Authentication account. Each user has exactly one role and one profile."""
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    company = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    supabase_uid = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TalentProfile(Base):
    """Talent's likeness licensing preferences, pricing, and social media links."""
    __tablename__ = "talent_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bio = Column(Text, nullable=True)
    categories = Column(String, nullable=True)
    restricted_categories = Column(String, nullable=True)
    min_price_per_use = Column(Float, default=100.0)
    max_license_duration_days = Column(Integer, default=365)
    allow_ai_training = Column(Boolean, default=False)
    allow_video_generation = Column(Boolean, default=True)
    allow_image_generation = Column(Boolean, default=True)
    geo_restrictions = Column(String, nullable=True)
    geo_scope = Column(String, default="global")
    approval_mode = Column(String, default="manual")
    portfolio_description = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    watermark_id = Column(String, nullable=True)
    # Social media links
    instagram = Column(String, nullable=True)
    tiktok = Column(String, nullable=True)
    youtube = Column(String, nullable=True)
    # Agency representation
    has_agent = Column(Boolean, default=False)
    agent_email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")


class BrandProfile(Base):
    """Brand/advertiser company profile for licensing requests."""
    __tablename__ = "brand_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")


class AgentProfile(Base):
    """Talent agent/agency profile — manages rosters of talent."""
    __tablename__ = "agent_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agency_name = Column(String, nullable=False)
    website = Column(String, nullable=True)
    country = Column(String, nullable=True)
    team_size = Column(String, nullable=True)
    default_restricted_categories = Column(String, nullable=True)
    approval_workflow = Column(String, default="both_required")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")


class TalentAgentLink(Base):
    """Links a talent to their agent with configurable approval workflow."""
    __tablename__ = "talent_agent_links"
    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talent_profiles.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agent_profiles.id"), nullable=False)
    approval_type = Column(String, default=ApprovalType.BOTH_REQUIRED.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    talent = relationship("TalentProfile")
    agent = relationship("AgentProfile")


# ── Licensing Pipeline Tables ─────────────────────────────────────────────────

class LicenseRequest(Base):
    """A brand's request to license a talent's likeness. Tracks the full 7-agent pipeline state."""
    __tablename__ = "license_requests"
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brand_profiles.id"), nullable=False)
    talent_id = Column(Integer, ForeignKey("talent_profiles.id"), nullable=False)
    status = Column(String, default=LicenseStatus.PENDING.value)
    use_case = Column(Text, nullable=False)
    campaign_description = Column(Text, nullable=True)
    desired_duration_days = Column(Integer, default=30)
    desired_regions = Column(String, nullable=True)
    content_type = Column(String, default="image")
    exclusivity = Column(Boolean, default=False)

    # Agent-populated fields
    proposed_price = Column(Float, nullable=True)
    risk_score = Column(String, nullable=True)
    risk_details = Column(Text, nullable=True)
    negotiation_notes = Column(Text, nullable=True)
    compliance_notes = Column(Text, nullable=True)
    license_token = Column(String, nullable=True)
    orchestration_status = Column(String, default="not_started")
    fingerprint_id = Column(String, nullable=True)
    gen_prompt = Column(Text, nullable=True)
    web3_contract = Column(Text, nullable=True)

    # Payment (Stripe Connect for Anyway bounty commercialization)
    payment_status = Column(String, default="unpaid")
    stripe_session_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    brand = relationship("BrandProfile")
    talent = relationship("TalentProfile")


class Contract(Base):
    """AI-generated UK-law-compliant licensing contract (produced by Contract Agent)."""
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    license_id = Column(Integer, ForeignKey("license_requests.id"), nullable=False)
    contract_text = Column(Text, nullable=False)
    generated_by = Column(String, default="contract_agent")
    model_used = Column(String, nullable=True)
    uk_law_compliant = Column(Boolean, default=True)
    ip_clauses = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    license = relationship("LicenseRequest")


# ── Audit & Observability ─────────────────────────────────────────────────────

class AuditLog(Base):
    """Immutable audit trail entry — every agent action is logged here (powers Claw Console)."""
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    license_id = Column(Integer, ForeignKey("license_requests.id"), nullable=True)
    agent_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    model_used = Column(String, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def seed_demo_data():
    """Populate DB with demo data if empty (so deploys aren't blank)."""
    import hashlib
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # already seeded

        # --- Users ---
        talent_user = User(
            email="emma@demo.test", name="Emma Clarke", role="talent",
            password_hash=hashlib.sha256("demo123".encode()).hexdigest(),
        )
        brand_user = User(
            email="james@luxbrand.test", name="James Wilson", role="brand",
            company="LuxFashion UK",
            password_hash=hashlib.sha256("demo123".encode()).hexdigest(),
        )
        talent_user2 = User(
            email="marcus@demo.test", name="Marcus Chen", role="talent",
            password_hash=hashlib.sha256("demo123".encode()).hexdigest(),
        )
        db.add_all([talent_user, brand_user, talent_user2])
        db.flush()

        # --- Talent Profiles ---
        talent1 = TalentProfile(
            user_id=talent_user.id,
            bio="Award-winning fashion model and digital creator with 10+ years of experience in luxury and editorial campaigns across Europe and Asia.",
            categories="Fashion,Beauty,Technology,Entertainment",
            restricted_categories="Alcohol,Gambling,Political",
            min_price_per_use=5000.0,
            max_license_duration_days=365,
            allow_ai_training=False,
            allow_video_generation=True,
            allow_image_generation=True,
            geo_scope="global",
            approval_mode="manual",
            portfolio_description="High-fashion editorial, luxury brand campaigns, tech product launches",
            instagram="@emmaclarke",
            tiktok="@emmaclarke_official",
        )
        talent2 = TalentProfile(
            user_id=talent_user2.id,
            bio="Professional athlete and fitness influencer. Former Olympic sprinter turned brand ambassador for sports and wellness brands.",
            categories="Sports,Healthcare,Technology,Food & Beverage",
            restricted_categories="Alcohol,Gambling,Tobacco",
            min_price_per_use=3500.0,
            max_license_duration_days=180,
            allow_ai_training=False,
            allow_video_generation=True,
            allow_image_generation=True,
            geo_scope="UK,EU",
            approval_mode="manual",
            portfolio_description="Sports campaigns, fitness brand endorsements, wellness product launches",
            instagram="@marcuschen",
            youtube="@MarcusChenFitness",
        )
        db.add_all([talent1, talent2])
        db.flush()

        # --- Brand Profile ---
        brand = BrandProfile(
            user_id=brand_user.id,
            company_name="LuxFashion UK",
            industry="Fashion",
            website="https://luxfashion.example.com",
            description="Premium British fashion house specialising in sustainable luxury wear.",
        )
        db.add(brand)
        db.flush()

        # --- License Request (fully processed) ---
        license1 = LicenseRequest(
            brand_id=brand.id,
            talent_id=talent1.id,
            status="awaiting_approval",
            use_case="Summer 2026 luxury fashion campaign — digital ads, social media, and e-commerce product pages featuring AI-generated lifestyle imagery.",
            content_type="image",
            desired_duration_days=90,
            desired_regions="UK, EU",
            proposed_price=6750.0,
            risk_score="low",
            risk_details='{"content_risk":"low","brand_risk":"low","legal_risk":"low","ethical_risk":"low","geographic_risk":"low"}',
            negotiation_notes="Base price £5,000 adjusted to £6,750 for 90-day multi-region (UK+EU) image license. Includes 10% platform fee. Fair market rate for fashion editorial talent.",
            compliance_notes="All checks passed. No restricted category overlap. GDPR-compliant processing. UK Copyright Act 1988 alignment confirmed.",
            orchestration_status="completed",
            fingerprint_id="FP-EMMA-2026-001",
            gen_prompt="Professional fashion photography style. Emma Clarke, female model, early 30s, elegant features. Luxury summer collection setting — natural light, Mediterranean terrace backdrop. Wearing flowing silk dress in champagne gold. Confident, approachable expression. High-end editorial quality, soft bokeh background.",
            payment_status="unpaid",
        )
        db.add(license1)
        db.flush()

        # --- Contract ---
        contract = Contract(
            license_id=license1.id,
            contract_text="""INTELLECTUAL PROPERTY LICENSING AGREEMENT

THIS AGREEMENT is made on the date of digital execution between:

LICENSOR: Emma Clarke ("the Talent")
LICENSEE: LuxFashion UK ("the Brand")

1. DEFINITIONS AND INTERPRETATION
"Licensed Material" means the AI-generated likeness of the Talent.
"Permitted Use" means digital advertising, social media content, and e-commerce imagery.
"Territory" means United Kingdom and European Union member states.
"License Period" means 90 calendar days from the Effective Date.

2. GRANT OF LICENSE
The Licensor grants to the Licensee a non-exclusive, non-transferable license to use the Licensed Material for the Permitted Use within the Territory for the License Period.

3. CONSIDERATION
The Licensee shall pay the Licensor the sum of GBP 6,750 (six thousand seven hundred and fifty pounds) inclusive of platform fees.

4. INTELLECTUAL PROPERTY RIGHTS
All intellectual property rights in the Talent's likeness remain vested in the Licensor. The Licensee acquires no ownership rights.

5. AI TRAINING RESTRICTION
The Licensed Material shall NOT be used for training artificial intelligence models, machine learning systems, or any automated learning processes.

6. DATA PROTECTION (GDPR)
Both parties shall comply with the UK General Data Protection Regulation and the Data Protection Act 2018.

7. CONTENT RESTRICTIONS
The Licensed Material shall not be used in connection with: alcohol, gambling, political campaigns, tobacco, or any content that may bring the Talent into disrepute.

8. MORAL RIGHTS
The Licensor asserts their moral rights under Chapter IV of the Copyright, Designs and Patents Act 1988.

9. TERMINATION
Either party may terminate this Agreement with 30 days written notice. Upon termination, the Licensee shall cease all use of the Licensed Material within 14 days.

10. DISPUTE RESOLUTION
Any dispute shall be resolved through mediation under the CEDR Model Mediation Procedure, followed by arbitration under the Arbitration Act 1996 if necessary.

11. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of England and Wales.

12. CONSUMER RIGHTS
Nothing in this Agreement affects the statutory rights of either party under the Consumer Rights Act 2015.

Executed as a digital agreement through the Face Library platform.
""",
            generated_by="contract_agent",
            model_used="glm-4-plus",
            uk_law_compliant=True,
            ip_clauses="Sections 4, 5, 8: IP retention, AI training restriction, moral rights assertion",
        )
        db.add(contract)

        # --- Audit Logs ---
        audit_entries = [
            ("orchestrator", "pipeline_started", "License #1 pipeline initiated", "local", 0),
            ("compliance", "risk_assessment", "Risk assessment completed: LOW risk across all 5 dimensions", "deepseek-v3.2", 1847),
            ("compliance", "compliance_summary", "Executive summary generated — all checks passed", "glm-4-plus", 923),
            ("negotiator", "price_negotiation", "Price set at £6,750 for 90-day UK+EU image license", "qwen3-235b-a22b-instruct-2507", 2105),
            ("contract", "contract_generation", "12-section UK-law-compliant IP licensing agreement generated", "glm-4-plus", 3842),
            ("gen_orchestrator", "avatar_prompt", "Generation prompt created for fashion editorial style", "deepseek-v3.2", 1203),
            ("fingerprint", "likeness_scan", "Fingerprint ID FP-EMMA-2026-001 registered", "deepseek-v3.2", 856),
            ("web3_contract", "onchain_rights", "ERC-721 metadata generated for Polygon deployment", "local", 0),
            ("orchestrator", "pipeline_completed", "All 7 pipeline steps completed successfully", "local", 0),
        ]
        for agent, action, details, model, tokens in audit_entries:
            db.add(AuditLog(
                license_id=license1.id,
                agent_name=agent,
                action=action,
                details=details,
                model_used=model,
                tokens_used=tokens,
            ))

        db.commit()
        print("[Seed] Demo data inserted: 3 users, 2 talents, 1 brand, 1 license, 1 contract, 9 audit logs")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error seeding demo data: {e}")
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
