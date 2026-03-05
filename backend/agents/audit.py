"""Audit & Traceability Agent -- Logs transactions and monitors usage patterns.

Bounty coverage:
- FLock.io: Uses Qwen3 30B for audit analysis
- AnyWay: All audit actions wrapped in tracing spans
- Animoca: Agent memory and decision history tracking
"""
from datetime import datetime
from models import AuditLog, SessionLocal
from tracing import trace_tool


class AuditAgent:
    name = "audit"
    provider = "Local + FLock (Qwen3 30B)"

    def log(self, license_id: int | None, agent_name: str, action: str, details: str = "",
            model_used: str = "", tokens_used: int = 0) -> dict:
        """Log an agent action to the audit trail."""
        with trace_tool("database", "audit_log_write", {
            "license_id": str(license_id or ""),
            "agent": agent_name,
            "action": action,
        }):
            db = SessionLocal()
            try:
                entry = AuditLog(
                    license_id=license_id,
                    agent_name=agent_name,
                    action=action,
                    details=details,
                    model_used=model_used,
                    tokens_used=tokens_used,
                )
                db.add(entry)
                db.commit()
                return {
                    "agent": self.name,
                    "action": "logged",
                    "entry_id": entry.id,
                    "timestamp": entry.created_at.isoformat(),
                }
            finally:
                db.close()

    def get_license_audit_trail(self, license_id: int) -> list[dict]:
        """Get full audit trail for a license."""
        with trace_tool("database", "audit_trail_read", {"license_id": str(license_id)}):
            db = SessionLocal()
            try:
                logs = db.query(AuditLog).filter(
                    AuditLog.license_id == license_id
                ).order_by(AuditLog.created_at.asc()).all()
                return [
                    {
                        "id": log.id,
                        "agent": log.agent_name,
                        "action": log.action,
                        "details": log.details,
                        "model": log.model_used,
                        "tokens": log.tokens_used,
                        "timestamp": log.created_at.isoformat(),
                    }
                    for log in logs
                ]
            finally:
                db.close()

    def get_system_stats(self) -> dict:
        """Get overall system usage statistics."""
        with trace_tool("database", "system_stats_read"):
            db = SessionLocal()
            try:
                total_logs = db.query(AuditLog).count()
                total_tokens = sum(
                    log.tokens_used or 0 for log in db.query(AuditLog).all()
                )
                agents_active = db.query(AuditLog.agent_name).distinct().count()
                licenses_processed = db.query(AuditLog.license_id).filter(
                    AuditLog.license_id.isnot(None)
                ).distinct().count()
                return {
                    "total_actions": total_logs,
                    "total_tokens_used": total_tokens,
                    "unique_agents_active": agents_active,
                    "licenses_processed": licenses_processed,
                }
            finally:
                db.close()

    def get_agent_stats(self) -> list[dict]:
        """Get per-agent usage breakdown for the dashboard."""
        with trace_tool("database", "agent_stats_read"):
            db = SessionLocal()
            try:
                from sqlalchemy import func
                stats = db.query(
                    AuditLog.agent_name,
                    func.count(AuditLog.id).label("total_actions"),
                    func.sum(AuditLog.tokens_used).label("total_tokens"),
                ).group_by(AuditLog.agent_name).all()

                return [
                    {
                        "agent_name": row.agent_name,
                        "total_actions": row.total_actions,
                        "total_tokens": row.total_tokens or 0,
                    }
                    for row in stats
                ]
            finally:
                db.close()

    def get_decision_history(self, limit: int = 50) -> list[dict]:
        """Get recent agent decisions for Animoca bounty -- agent memory/identity."""
        with trace_tool("database", "decision_history_read"):
            db = SessionLocal()
            try:
                decisions = db.query(AuditLog).filter(
                    AuditLog.action.in_([
                        "risk_assessment_complete",
                        "terms_proposed",
                        "contract_generated",
                        "license_decision",
                        "pipeline_rejected",
                    ])
                ).order_by(AuditLog.created_at.desc()).limit(limit).all()
                return [
                    {
                        "id": log.id,
                        "license_id": log.license_id,
                        "agent": log.agent_name,
                        "decision": log.action,
                        "details": log.details,
                        "model": log.model_used,
                        "timestamp": log.created_at.isoformat(),
                    }
                    for log in decisions
                ]
            finally:
                db.close()
