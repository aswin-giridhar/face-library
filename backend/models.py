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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
