"""API endpoints for due diligence workflow."""

from typing import Dict, Any, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.models import (
    DueDiligenceModel,
    DDInputs,
    DDWorkItem,
    DDFinding,
    QoEAdjustment,
    RiskItem,
    DDVertical,
    DDPhase,
    FindingSeverity,
    FindingCategory,
    FindingStatus,
    RiskLikelihood,
    RiskImpact,
)

router = APIRouter(prefix="/due-diligence", tags=["Due Diligence"])


# ===== Request Models =====

class WorkItemRequest(BaseModel):
    """DD work item request."""
    id: str
    category: str
    title: str
    description: str = ""
    owner: str = ""
    due_date: Optional[str] = None
    status: str = "pending"
    completion_percent: float = 0
    documents_required: List[str] = []
    documents_received: List[str] = []
    notes: str = ""


class FindingRequest(BaseModel):
    """DD finding request."""
    id: str
    category: str
    severity: str
    title: str
    description: str
    impact_amount: float = 0
    impact_description: str = ""
    status: str = "open"
    recommendation: str = ""
    mitigation: str = ""
    owner: str = ""
    date_identified: str = ""
    source_documents: List[str] = []
    related_findings: List[str] = []


class QoEAdjustmentRequest(BaseModel):
    """QoE adjustment request."""
    id: str
    category: str
    description: str
    amount: float
    is_addback: bool = True
    is_recurring: bool = False
    confidence_level: float = 1.0
    notes: str = ""


class RiskItemRequest(BaseModel):
    """Risk matrix item request."""
    id: str
    category: str
    title: str
    description: str
    likelihood: str
    impact: str
    mitigation_strategy: str = ""
    contingency_plan: str = ""
    owner: str = ""
    monitoring_frequency: str = ""
    related_findings: List[str] = []


class TeamMemberRequest(BaseModel):
    """Team member request."""
    name: str
    role: str
    email: str = ""


class DDAnalysisRequest(BaseModel):
    """Due diligence analysis request."""
    target_name: str
    transaction_type: str = "acquisition"
    deal_value: float = 0
    vertical: str = "general"
    current_phase: str = "phase_1"
    reported_revenue: float = 0
    reported_ebitda: float = 0
    reported_net_income: float = 0
    work_items: List[WorkItemRequest] = []
    findings: List[FindingRequest] = []
    qoe_adjustments: List[QoEAdjustmentRequest] = []
    risks: List[RiskItemRequest] = []
    dd_start_date: str = ""
    dd_end_date: str = ""
    closing_date: str = ""
    team_members: List[TeamMemberRequest] = []


class AddFindingRequest(BaseModel):
    """Request to add a finding."""
    finding: FindingRequest


class AddRiskRequest(BaseModel):
    """Request to add a risk."""
    risk: RiskItemRequest


class QoERequest(BaseModel):
    """Quality of earnings analysis request."""
    reported_ebitda: float
    adjustments: List[QoEAdjustmentRequest]


class RiskMatrixRequest(BaseModel):
    """Risk matrix analysis request."""
    risks: List[RiskItemRequest]


# ===== Endpoints =====

@router.post("/analyze")
async def analyze_due_diligence(request: DDAnalysisRequest):
    """Run comprehensive due diligence analysis."""
    try:
        # Convert work items
        work_items = [
            DDWorkItem(
                id=w.id,
                category=FindingCategory(w.category),
                title=w.title,
                description=w.description,
                owner=w.owner,
                due_date=w.due_date,
                status=w.status,
                completion_percent=w.completion_percent,
                documents_required=w.documents_required,
                documents_received=w.documents_received,
                notes=w.notes,
            )
            for w in request.work_items
        ]

        # Convert findings
        findings = [
            DDFinding(
                id=f.id,
                category=FindingCategory(f.category),
                severity=FindingSeverity(f.severity),
                title=f.title,
                description=f.description,
                impact_amount=f.impact_amount,
                impact_description=f.impact_description,
                status=FindingStatus(f.status),
                recommendation=f.recommendation,
                mitigation=f.mitigation,
                owner=f.owner,
                date_identified=f.date_identified,
                source_documents=f.source_documents,
                related_findings=f.related_findings,
            )
            for f in request.findings
        ]

        # Convert QoE adjustments
        qoe_adjustments = [
            QoEAdjustment(
                id=q.id,
                category=q.category,
                description=q.description,
                amount=q.amount,
                is_addback=q.is_addback,
                is_recurring=q.is_recurring,
                confidence_level=q.confidence_level,
                notes=q.notes,
            )
            for q in request.qoe_adjustments
        ]

        # Convert risks
        risks = [
            RiskItem(
                id=r.id,
                category=FindingCategory(r.category),
                title=r.title,
                description=r.description,
                likelihood=RiskLikelihood(r.likelihood),
                impact=RiskImpact(r.impact),
                mitigation_strategy=r.mitigation_strategy,
                contingency_plan=r.contingency_plan,
                owner=r.owner,
                monitoring_frequency=r.monitoring_frequency,
                related_findings=r.related_findings,
            )
            for r in request.risks
        ]

        # Convert team members
        team_members = [
            {"name": t.name, "role": t.role, "email": t.email}
            for t in request.team_members
        ]

        inputs = DDInputs(
            target_name=request.target_name,
            transaction_type=request.transaction_type,
            deal_value=request.deal_value,
            vertical=DDVertical(request.vertical),
            current_phase=DDPhase(request.current_phase),
            reported_revenue=request.reported_revenue,
            reported_ebitda=request.reported_ebitda,
            reported_net_income=request.reported_net_income,
            work_items=work_items,
            findings=findings,
            qoe_adjustments=qoe_adjustments,
            risks=risks,
            dd_start_date=request.dd_start_date,
            dd_end_date=request.dd_end_date,
            closing_date=request.closing_date,
            team_members=team_members,
        )

        model = DueDiligenceModel(dd_id="api", name="DD Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Analysis failed: {result['errors']}"
            )

        return {"success": True, "outputs": result["outputs"]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/checklist/{vertical}")
async def get_dd_checklist(vertical: str):
    """Get vertical-specific DD checklist."""
    try:
        try:
            dd_vertical = DDVertical(vertical)
        except ValueError:
            dd_vertical = DDVertical.GENERAL

        inputs = DDInputs(
            target_name="Checklist Request",
            vertical=dd_vertical,
        )

        model = DueDiligenceModel(dd_id="checklist", name="Checklist")
        model.set_inputs(inputs)

        # Just generate checklist
        checklist = model._generate_checklist()

        return {"success": True, "checklist": checklist}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate checklist: {str(e)}"
        )


@router.post("/qoe")
async def calculate_quality_of_earnings(request: QoERequest):
    """Calculate Quality of Earnings analysis."""
    try:
        qoe_adjustments = [
            QoEAdjustment(
                id=q.id,
                category=q.category,
                description=q.description,
                amount=q.amount,
                is_addback=q.is_addback,
                is_recurring=q.is_recurring,
                confidence_level=q.confidence_level,
                notes=q.notes,
            )
            for q in request.adjustments
        ]

        inputs = DDInputs(
            target_name="QoE Analysis",
            reported_ebitda=request.reported_ebitda,
            qoe_adjustments=qoe_adjustments,
        )

        model = DueDiligenceModel(dd_id="qoe", name="QoE")
        model.set_inputs(inputs)

        qoe_summary = model._calculate_qoe()

        return {"success": True, "qoe_analysis": qoe_summary}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"QoE calculation failed: {str(e)}"
        )


@router.post("/risk-matrix")
async def calculate_risk_matrix(request: RiskMatrixRequest):
    """Calculate risk matrix analysis."""
    try:
        risks = [
            RiskItem(
                id=r.id,
                category=FindingCategory(r.category),
                title=r.title,
                description=r.description,
                likelihood=RiskLikelihood(r.likelihood),
                impact=RiskImpact(r.impact),
                mitigation_strategy=r.mitigation_strategy,
                contingency_plan=r.contingency_plan,
                owner=r.owner,
                monitoring_frequency=r.monitoring_frequency,
            )
            for r in request.risks
        ]

        inputs = DDInputs(
            target_name="Risk Analysis",
            risks=risks,
        )

        model = DueDiligenceModel(dd_id="risk", name="Risk Matrix")
        model.set_inputs(inputs)

        risk_summary = model._calculate_risk_matrix()
        risk_detail = [model._risk_to_dict(r) for r in risks]

        return {
            "success": True,
            "risk_summary": risk_summary,
            "risk_detail": risk_detail,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk analysis failed: {str(e)}"
        )


@router.post("/findings/summarize")
async def summarize_findings(findings: List[FindingRequest]):
    """Summarize DD findings."""
    try:
        finding_objs = [
            DDFinding(
                id=f.id,
                category=FindingCategory(f.category),
                severity=FindingSeverity(f.severity),
                title=f.title,
                description=f.description,
                impact_amount=f.impact_amount,
                status=FindingStatus(f.status),
            )
            for f in findings
        ]

        inputs = DDInputs(
            target_name="Findings Summary",
            findings=finding_objs,
        )

        model = DueDiligenceModel(dd_id="findings", name="Findings")
        model.set_inputs(inputs)

        findings_summary = model._summarize_findings()

        return {"success": True, "findings_summary": findings_summary}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Findings summarization failed: {str(e)}"
        )


@router.post("/recommendations")
async def get_recommendations(request: DDAnalysisRequest):
    """Get DD recommendations based on findings and risks."""
    try:
        findings = [
            DDFinding(
                id=f.id,
                category=FindingCategory(f.category),
                severity=FindingSeverity(f.severity),
                title=f.title,
                description=f.description,
                impact_amount=f.impact_amount,
                status=FindingStatus(f.status),
            )
            for f in request.findings
        ]

        risks = [
            RiskItem(
                id=r.id,
                category=FindingCategory(r.category),
                title=r.title,
                description=r.description,
                likelihood=RiskLikelihood(r.likelihood),
                impact=RiskImpact(r.impact),
            )
            for r in request.risks
        ]

        qoe_adjustments = [
            QoEAdjustment(
                id=q.id,
                category=q.category,
                description=q.description,
                amount=q.amount,
                is_addback=q.is_addback,
                is_recurring=q.is_recurring,
                confidence_level=q.confidence_level,
            )
            for q in request.qoe_adjustments
        ]

        inputs = DDInputs(
            target_name=request.target_name,
            reported_ebitda=request.reported_ebitda,
            findings=findings,
            risks=risks,
            qoe_adjustments=qoe_adjustments,
        )

        model = DueDiligenceModel(dd_id="recs", name="Recommendations")
        model.set_inputs(inputs)

        findings_summary = model._summarize_findings()
        risk_summary = model._calculate_risk_matrix()
        recommendations = model._generate_recommendations(findings_summary, risk_summary)

        return {
            "success": True,
            "recommendations": recommendations,
            "findings_summary": findings_summary,
            "risk_summary": risk_summary,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendations failed: {str(e)}"
        )


@router.get("/verticals")
async def get_available_verticals():
    """Get list of available DD verticals."""
    return {
        "verticals": [
            {"value": v.value, "label": v.value.replace("_", " ").title()}
            for v in DDVertical
        ]
    }


@router.get("/categories")
async def get_finding_categories():
    """Get list of finding categories."""
    return {
        "categories": [
            {"value": c.value, "label": c.value.replace("_", " ").title()}
            for c in FindingCategory
        ]
    }


@router.get("/severities")
async def get_severity_levels():
    """Get list of severity levels."""
    return {
        "severities": [
            {"value": s.value, "label": s.value.title()}
            for s in FindingSeverity
        ]
    }
