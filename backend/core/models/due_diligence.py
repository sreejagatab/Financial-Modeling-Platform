"""
Due Diligence Financial Model

Comprehensive due diligence workflow management including:
- Vertical-specific checklists and workflows
- Findings tracker with severity levels
- Risk matrix and scoring
- Recommendation engine
- Quality of earnings adjustments
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime


class DDVertical(str, Enum):
    """Industry verticals for due diligence."""
    TECHNOLOGY = "technology"
    HEALTHCARE = "healthcare"
    MANUFACTURING = "manufacturing"
    RETAIL = "retail"
    FINANCIAL_SERVICES = "financial_services"
    REAL_ESTATE = "real_estate"
    ENERGY = "energy"
    CONSUMER = "consumer"
    INDUSTRIAL = "industrial"
    GENERAL = "general"


class DDPhase(str, Enum):
    """Due diligence phases."""
    PRELIMINARY = "preliminary"
    PHASE_1 = "phase_1"  # Initial review
    PHASE_2 = "phase_2"  # Detailed analysis
    FINAL = "final"


class FindingSeverity(str, Enum):
    """Severity levels for findings."""
    CRITICAL = "critical"  # Deal breaker
    HIGH = "high"  # Significant impact
    MEDIUM = "medium"  # Moderate impact
    LOW = "low"  # Minor issue
    INFORMATIONAL = "informational"  # FYI only


class FindingCategory(str, Enum):
    """Categories of DD findings."""
    FINANCIAL = "financial"
    OPERATIONAL = "operational"
    LEGAL = "legal"
    TAX = "tax"
    COMMERCIAL = "commercial"
    TECHNOLOGY = "technology"
    HR = "hr"
    ENVIRONMENTAL = "environmental"
    REGULATORY = "regulatory"
    SYNERGIES = "synergies"


class FindingStatus(str, Enum):
    """Status of findings."""
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    ACCEPTED = "accepted"
    MITIGATED = "mitigated"


class RiskLikelihood(str, Enum):
    """Likelihood of risk occurring."""
    RARE = "rare"  # < 10%
    UNLIKELY = "unlikely"  # 10-25%
    POSSIBLE = "possible"  # 25-50%
    LIKELY = "likely"  # 50-75%
    ALMOST_CERTAIN = "almost_certain"  # > 75%


class RiskImpact(str, Enum):
    """Impact severity of risk."""
    NEGLIGIBLE = "negligible"
    MINOR = "minor"
    MODERATE = "moderate"
    MAJOR = "major"
    SEVERE = "severe"


@dataclass
class DDWorkItem:
    """Individual due diligence work item."""
    id: str
    category: FindingCategory
    title: str
    description: str = ""
    owner: str = ""
    due_date: Optional[str] = None
    status: str = "pending"
    completion_percent: float = 0
    documents_required: List[str] = field(default_factory=list)
    documents_received: List[str] = field(default_factory=list)
    notes: str = ""


@dataclass
class DDFinding:
    """Due diligence finding."""
    id: str
    category: FindingCategory
    severity: FindingSeverity
    title: str
    description: str
    impact_amount: float = 0  # Financial impact if quantifiable
    impact_description: str = ""
    status: FindingStatus = FindingStatus.OPEN
    recommendation: str = ""
    mitigation: str = ""
    owner: str = ""
    date_identified: str = ""
    date_resolved: Optional[str] = None
    source_documents: List[str] = field(default_factory=list)
    related_findings: List[str] = field(default_factory=list)


@dataclass
class QoEAdjustment:
    """Quality of Earnings adjustment."""
    id: str
    category: str  # Revenue, COGS, SG&A, One-time, etc.
    description: str
    amount: float
    is_addback: bool = True  # True = add to EBITDA, False = subtract
    is_recurring: bool = False
    confidence_level: float = 1.0  # 0-1 confidence in adjustment
    notes: str = ""


@dataclass
class RiskItem:
    """Risk matrix item."""
    id: str
    category: FindingCategory
    title: str
    description: str
    likelihood: RiskLikelihood
    impact: RiskImpact
    risk_score: float = 0  # Calculated
    mitigation_strategy: str = ""
    contingency_plan: str = ""
    owner: str = ""
    monitoring_frequency: str = ""
    related_findings: List[str] = field(default_factory=list)


@dataclass
class DDInputs:
    """Inputs for due diligence analysis."""
    # Target company
    target_name: str = ""
    transaction_type: str = "acquisition"  # acquisition, merger, investment
    deal_value: float = 0

    # Vertical and phase
    vertical: DDVertical = DDVertical.GENERAL
    current_phase: DDPhase = DDPhase.PHASE_1

    # Financials for QoE
    reported_revenue: float = 0
    reported_ebitda: float = 0
    reported_net_income: float = 0

    # Work items
    work_items: List[DDWorkItem] = field(default_factory=list)

    # Findings
    findings: List[DDFinding] = field(default_factory=list)

    # QoE adjustments
    qoe_adjustments: List[QoEAdjustment] = field(default_factory=list)

    # Risk items
    risks: List[RiskItem] = field(default_factory=list)

    # Timeline
    dd_start_date: str = ""
    dd_end_date: str = ""
    closing_date: str = ""

    # Team
    team_members: List[Dict[str, str]] = field(default_factory=list)


class DueDiligenceModel:
    """Due diligence analysis model."""

    # Vertical-specific checklist templates
    VERTICAL_CHECKLISTS = {
        DDVertical.TECHNOLOGY: {
            FindingCategory.TECHNOLOGY: [
                "Source code review and IP ownership",
                "Technical architecture assessment",
                "Scalability and infrastructure analysis",
                "Cybersecurity assessment",
                "Technical debt evaluation",
                "Key technology dependencies",
                "Open source license compliance",
            ],
            FindingCategory.COMMERCIAL: [
                "Customer concentration analysis",
                "Contract review (SaaS terms, SLAs)",
                "Churn rate analysis",
                "NRR/GRR metrics validation",
                "Sales pipeline quality",
            ],
            FindingCategory.HR: [
                "Key employee retention risk",
                "Engineering team assessment",
                "Compensation benchmarking",
                "Non-compete agreements",
            ],
        },
        DDVertical.HEALTHCARE: {
            FindingCategory.REGULATORY: [
                "Licensing and accreditation status",
                "HIPAA compliance review",
                "Medicare/Medicaid certification",
                "FDA approvals and compliance",
                "Clinical trial status",
            ],
            FindingCategory.OPERATIONAL: [
                "Physician contracts review",
                "Payor mix analysis",
                "Reimbursement rate trends",
                "Quality metrics and outcomes",
            ],
            FindingCategory.LEGAL: [
                "Medical malpractice history",
                "Stark Law compliance",
                "Anti-kickback statute compliance",
            ],
        },
        DDVertical.MANUFACTURING: {
            FindingCategory.OPERATIONAL: [
                "Plant capacity utilization",
                "Equipment condition assessment",
                "Supply chain dependencies",
                "Quality control processes",
                "Inventory management review",
            ],
            FindingCategory.ENVIRONMENTAL: [
                "Environmental permits and compliance",
                "Remediation liabilities",
                "OSHA compliance history",
                "Hazardous materials handling",
            ],
            FindingCategory.COMMERCIAL: [
                "Customer concentration",
                "Long-term contract analysis",
                "Pricing power assessment",
            ],
        },
        DDVertical.REAL_ESTATE: {
            FindingCategory.OPERATIONAL: [
                "Property condition assessments",
                "Lease roll analysis",
                "Tenant credit quality",
                "Capital expenditure needs",
                "Property management review",
            ],
            FindingCategory.ENVIRONMENTAL: [
                "Phase I/II environmental reports",
                "Zoning compliance",
                "Building code compliance",
            ],
            FindingCategory.LEGAL: [
                "Title review",
                "Lease audit",
                "Litigation review",
            ],
        },
        DDVertical.GENERAL: {
            FindingCategory.FINANCIAL: [
                "Quality of earnings analysis",
                "Working capital normalization",
                "Revenue recognition review",
                "Cost structure analysis",
                "Cash flow validation",
            ],
            FindingCategory.OPERATIONAL: [
                "Management team assessment",
                "Operational efficiency review",
                "IT systems evaluation",
                "Facilities review",
            ],
            FindingCategory.LEGAL: [
                "Litigation review",
                "Contract review",
                "IP ownership verification",
                "Corporate structure review",
            ],
            FindingCategory.TAX: [
                "Tax return review",
                "Tax position analysis",
                "Transfer pricing review",
                "Tax attribute assessment",
            ],
            FindingCategory.HR: [
                "Employee benefit plans review",
                "Labor relations assessment",
                "Key employee analysis",
                "Compensation structure review",
            ],
        },
    }

    # Risk scoring matrix (likelihood x impact)
    RISK_SCORES = {
        (RiskLikelihood.RARE, RiskImpact.NEGLIGIBLE): 1,
        (RiskLikelihood.RARE, RiskImpact.MINOR): 2,
        (RiskLikelihood.RARE, RiskImpact.MODERATE): 3,
        (RiskLikelihood.RARE, RiskImpact.MAJOR): 4,
        (RiskLikelihood.RARE, RiskImpact.SEVERE): 5,
        (RiskLikelihood.UNLIKELY, RiskImpact.NEGLIGIBLE): 2,
        (RiskLikelihood.UNLIKELY, RiskImpact.MINOR): 4,
        (RiskLikelihood.UNLIKELY, RiskImpact.MODERATE): 6,
        (RiskLikelihood.UNLIKELY, RiskImpact.MAJOR): 8,
        (RiskLikelihood.UNLIKELY, RiskImpact.SEVERE): 10,
        (RiskLikelihood.POSSIBLE, RiskImpact.NEGLIGIBLE): 3,
        (RiskLikelihood.POSSIBLE, RiskImpact.MINOR): 6,
        (RiskLikelihood.POSSIBLE, RiskImpact.MODERATE): 9,
        (RiskLikelihood.POSSIBLE, RiskImpact.MAJOR): 12,
        (RiskLikelihood.POSSIBLE, RiskImpact.SEVERE): 15,
        (RiskLikelihood.LIKELY, RiskImpact.NEGLIGIBLE): 4,
        (RiskLikelihood.LIKELY, RiskImpact.MINOR): 8,
        (RiskLikelihood.LIKELY, RiskImpact.MODERATE): 12,
        (RiskLikelihood.LIKELY, RiskImpact.MAJOR): 16,
        (RiskLikelihood.LIKELY, RiskImpact.SEVERE): 20,
        (RiskLikelihood.ALMOST_CERTAIN, RiskImpact.NEGLIGIBLE): 5,
        (RiskLikelihood.ALMOST_CERTAIN, RiskImpact.MINOR): 10,
        (RiskLikelihood.ALMOST_CERTAIN, RiskImpact.MODERATE): 15,
        (RiskLikelihood.ALMOST_CERTAIN, RiskImpact.MAJOR): 20,
        (RiskLikelihood.ALMOST_CERTAIN, RiskImpact.SEVERE): 25,
    }

    def __init__(self, dd_id: str, name: str):
        self.dd_id = dd_id
        self.name = name
        self.inputs: Optional[DDInputs] = None
        self.outputs: Dict[str, Any] = {}

    def set_inputs(self, inputs: DDInputs) -> None:
        """Set DD inputs."""
        self.inputs = inputs

    def validate_inputs(self) -> tuple[bool, List[str]]:
        """Validate DD inputs."""
        errors = []

        if not self.inputs:
            errors.append("No inputs provided")
            return (False, errors)

        if not self.inputs.target_name:
            errors.append("Target company name required")

        return (len(errors) == 0, errors)

    def get_key_outputs(self) -> Dict[str, Any]:
        """Get key DD metrics."""
        if not self.outputs:
            return {}
        return {
            "completion_percent": self.outputs.get("progress", {}).get("overall_completion", 0),
            "critical_findings_count": self.outputs.get("findings_summary", {}).get("critical", 0),
            "adjusted_ebitda": self.outputs.get("qoe_summary", {}).get("adjusted_ebitda", 0),
            "total_risk_score": self.outputs.get("risk_summary", {}).get("total_weighted_risk", 0),
        }

    def calculate(self) -> Dict[str, Any]:
        """Run DD analysis."""
        is_valid, errors = self.validate_inputs()
        if not is_valid:
            return {"success": False, "errors": errors, "outputs": {}}

        try:
            outputs = self._run_analysis()
            self.outputs = outputs
            return {"success": True, "errors": [], "outputs": outputs}
        except Exception as e:
            return {"success": False, "errors": [str(e)], "outputs": {}}

    def _run_analysis(self) -> Dict[str, Any]:
        """Perform DD analysis."""
        inputs = self.inputs

        # Generate checklist based on vertical
        checklist = self._generate_checklist()

        # Calculate progress
        progress = self._calculate_progress()

        # Summarize findings
        findings_summary = self._summarize_findings()

        # Quality of earnings
        qoe_summary = self._calculate_qoe()

        # Risk matrix
        risk_summary = self._calculate_risk_matrix()

        # Recommendations
        recommendations = self._generate_recommendations(findings_summary, risk_summary)

        # Timeline analysis
        timeline = self._analyze_timeline()

        return {
            "dd_summary": {
                "target_name": inputs.target_name,
                "transaction_type": inputs.transaction_type,
                "deal_value": inputs.deal_value,
                "vertical": inputs.vertical.value,
                "current_phase": inputs.current_phase.value,
            },
            "checklist": checklist,
            "progress": progress,
            "findings_summary": findings_summary,
            "findings_detail": [self._finding_to_dict(f) for f in inputs.findings],
            "qoe_summary": qoe_summary,
            "risk_summary": risk_summary,
            "risk_detail": [self._risk_to_dict(r) for r in inputs.risks],
            "recommendations": recommendations,
            "timeline": timeline,
        }

    def _generate_checklist(self) -> Dict[str, Any]:
        """Generate vertical-specific checklist."""
        inputs = self.inputs
        vertical = inputs.vertical

        # Get base checklist
        base_checklist = self.VERTICAL_CHECKLISTS.get(vertical, {})

        # Merge with general checklist
        general = self.VERTICAL_CHECKLISTS.get(DDVertical.GENERAL, {})

        checklist = {}
        for category in FindingCategory:
            items = []

            # Add vertical-specific items
            if category in base_checklist:
                items.extend(base_checklist[category])

            # Add general items if not a duplicate
            if category in general:
                for item in general[category]:
                    if item not in items:
                        items.append(item)

            if items:
                checklist[category.value] = {
                    "items": items,
                    "count": len(items),
                }

        return {
            "vertical": vertical.value,
            "categories": checklist,
            "total_items": sum(c["count"] for c in checklist.values()),
        }

    def _calculate_progress(self) -> Dict[str, Any]:
        """Calculate DD progress."""
        inputs = self.inputs

        if not inputs.work_items:
            return {
                "overall_completion": 0,
                "by_category": {},
                "items_completed": 0,
                "items_total": 0,
                "documents_received": 0,
                "documents_required": 0,
            }

        # Calculate by category
        by_category = {}
        total_completion = 0
        docs_required = 0
        docs_received = 0

        for item in inputs.work_items:
            cat = item.category.value if isinstance(item.category, FindingCategory) else item.category

            if cat not in by_category:
                by_category[cat] = {"items": 0, "completion": 0}

            by_category[cat]["items"] += 1
            by_category[cat]["completion"] += item.completion_percent

            total_completion += item.completion_percent
            docs_required += len(item.documents_required)
            docs_received += len(item.documents_received)

        # Average completion
        for cat in by_category:
            by_category[cat]["average_completion"] = by_category[cat]["completion"] / by_category[cat]["items"]

        overall = total_completion / len(inputs.work_items) if inputs.work_items else 0

        return {
            "overall_completion": overall,
            "by_category": by_category,
            "items_completed": sum(1 for i in inputs.work_items if i.completion_percent >= 100),
            "items_total": len(inputs.work_items),
            "items_in_progress": sum(1 for i in inputs.work_items if 0 < i.completion_percent < 100),
            "documents_received": docs_received,
            "documents_required": docs_required,
            "document_completion": docs_received / docs_required if docs_required > 0 else 0,
        }

    def _summarize_findings(self) -> Dict[str, Any]:
        """Summarize findings by severity and category."""
        inputs = self.inputs

        by_severity = {s.value: 0 for s in FindingSeverity}
        by_category = {c.value: 0 for c in FindingCategory}
        by_status = {s.value: 0 for s in FindingStatus}
        total_impact = 0

        for finding in inputs.findings:
            sev = finding.severity.value if isinstance(finding.severity, FindingSeverity) else finding.severity
            cat = finding.category.value if isinstance(finding.category, FindingCategory) else finding.category
            stat = finding.status.value if isinstance(finding.status, FindingStatus) else finding.status

            by_severity[sev] = by_severity.get(sev, 0) + 1
            by_category[cat] = by_category.get(cat, 0) + 1
            by_status[stat] = by_status.get(stat, 0) + 1

            if finding.impact_amount:
                total_impact += finding.impact_amount

        return {
            "total_findings": len(inputs.findings),
            "critical": by_severity.get("critical", 0),
            "high": by_severity.get("high", 0),
            "medium": by_severity.get("medium", 0),
            "low": by_severity.get("low", 0),
            "informational": by_severity.get("informational", 0),
            "by_severity": by_severity,
            "by_category": {k: v for k, v in by_category.items() if v > 0},
            "by_status": by_status,
            "total_quantified_impact": total_impact,
            "open_findings": by_status.get("open", 0) + by_status.get("in_review", 0),
            "resolved_findings": by_status.get("resolved", 0) + by_status.get("accepted", 0) + by_status.get("mitigated", 0),
        }

    def _calculate_qoe(self) -> Dict[str, Any]:
        """Calculate Quality of Earnings."""
        inputs = self.inputs

        reported_ebitda = inputs.reported_ebitda
        total_addbacks = 0
        total_deductions = 0
        recurring_adjustments = 0
        non_recurring_adjustments = 0

        adjustments_detail = []

        for adj in inputs.qoe_adjustments:
            weighted_amount = adj.amount * adj.confidence_level

            if adj.is_addback:
                total_addbacks += weighted_amount
            else:
                total_deductions += weighted_amount

            if adj.is_recurring:
                recurring_adjustments += weighted_amount if adj.is_addback else -weighted_amount
            else:
                non_recurring_adjustments += weighted_amount if adj.is_addback else -weighted_amount

            adjustments_detail.append({
                "id": adj.id,
                "category": adj.category,
                "description": adj.description,
                "amount": adj.amount,
                "weighted_amount": weighted_amount,
                "is_addback": adj.is_addback,
                "is_recurring": adj.is_recurring,
            })

        adjusted_ebitda = reported_ebitda + total_addbacks - total_deductions
        net_adjustment = total_addbacks - total_deductions
        adjustment_percent = net_adjustment / reported_ebitda if reported_ebitda > 0 else 0

        return {
            "reported_ebitda": reported_ebitda,
            "total_addbacks": total_addbacks,
            "total_deductions": total_deductions,
            "net_adjustment": net_adjustment,
            "adjusted_ebitda": adjusted_ebitda,
            "adjustment_percent": adjustment_percent,
            "recurring_adjustments": recurring_adjustments,
            "non_recurring_adjustments": non_recurring_adjustments,
            "adjustments": adjustments_detail,
            "adjustment_count": len(inputs.qoe_adjustments),
        }

    def _calculate_risk_matrix(self) -> Dict[str, Any]:
        """Calculate risk matrix scores."""
        inputs = self.inputs

        if not inputs.risks:
            return {
                "total_risks": 0,
                "total_weighted_risk": 0,
                "risk_distribution": {},
                "high_priority_risks": [],
            }

        total_score = 0
        risk_distribution = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        high_priority = []

        for risk in inputs.risks:
            # Calculate score
            likelihood = risk.likelihood if isinstance(risk.likelihood, RiskLikelihood) else RiskLikelihood(risk.likelihood)
            impact = risk.impact if isinstance(risk.impact, RiskImpact) else RiskImpact(risk.impact)

            score = self.RISK_SCORES.get((likelihood, impact), 0)
            risk.risk_score = score
            total_score += score

            # Categorize
            if score >= 20:
                risk_distribution["critical"] += 1
                high_priority.append({
                    "id": risk.id,
                    "title": risk.title,
                    "score": score,
                    "category": risk.category.value if isinstance(risk.category, FindingCategory) else risk.category,
                })
            elif score >= 12:
                risk_distribution["high"] += 1
                high_priority.append({
                    "id": risk.id,
                    "title": risk.title,
                    "score": score,
                    "category": risk.category.value if isinstance(risk.category, FindingCategory) else risk.category,
                })
            elif score >= 6:
                risk_distribution["medium"] += 1
            else:
                risk_distribution["low"] += 1

        return {
            "total_risks": len(inputs.risks),
            "total_weighted_risk": total_score,
            "average_risk_score": total_score / len(inputs.risks) if inputs.risks else 0,
            "risk_distribution": risk_distribution,
            "high_priority_risks": sorted(high_priority, key=lambda x: x["score"], reverse=True),
            "max_possible_score": 25 * len(inputs.risks) if inputs.risks else 0,
            "risk_index": total_score / (25 * len(inputs.risks)) if inputs.risks else 0,
        }

    def _generate_recommendations(self, findings: Dict, risks: Dict) -> Dict[str, Any]:
        """Generate recommendations based on findings and risks."""
        recommendations = []
        priority_actions = []

        # Based on critical findings
        if findings.get("critical", 0) > 0:
            recommendations.append({
                "type": "critical_finding",
                "priority": "immediate",
                "description": f"Address {findings['critical']} critical findings before proceeding",
                "action": "Review critical findings with management; may require deal renegotiation",
            })
            priority_actions.append("Resolve critical findings")

        # Based on high findings
        if findings.get("high", 0) > 2:
            recommendations.append({
                "type": "high_findings",
                "priority": "high",
                "description": f"Multiple ({findings['high']}) high-severity issues identified",
                "action": "Develop mitigation plan and quantify potential impact",
            })

        # Based on risk score
        risk_index = risks.get("risk_index", 0)
        if risk_index > 0.5:
            recommendations.append({
                "type": "high_risk",
                "priority": "high",
                "description": "Overall risk profile is elevated",
                "action": "Consider enhanced indemnification or purchase price adjustment",
            })
            priority_actions.append("Risk mitigation required")

        # Based on QoE adjustments
        if hasattr(self, 'inputs') and self.inputs:
            adjustment_percent = sum(a.amount for a in self.inputs.qoe_adjustments if a.is_addback) / self.inputs.reported_ebitda if self.inputs.reported_ebitda > 0 else 0
            if adjustment_percent > 0.15:
                recommendations.append({
                    "type": "qoe_adjustment",
                    "priority": "medium",
                    "description": f"Significant QoE adjustments ({adjustment_percent:.1%} of EBITDA)",
                    "action": "Verify sustainability of adjusted earnings; stress test assumptions",
                })

        # Deal recommendation
        critical_issues = findings.get("critical", 0) + risks.get("risk_distribution", {}).get("critical", 0)
        high_issues = findings.get("high", 0) + risks.get("risk_distribution", {}).get("high", 0)

        if critical_issues > 0:
            deal_recommendation = "PROCEED_WITH_CAUTION"
            rationale = "Critical issues identified that require resolution"
        elif high_issues > 5:
            deal_recommendation = "PROCEED_WITH_ADJUSTMENTS"
            rationale = "Multiple high-priority issues suggest price/terms adjustment"
        else:
            deal_recommendation = "PROCEED"
            rationale = "No material issues identified; standard closing conditions apply"

        return {
            "recommendations": recommendations,
            "priority_actions": priority_actions,
            "deal_recommendation": deal_recommendation,
            "recommendation_rationale": rationale,
            "recommendation_count": len(recommendations),
        }

    def _analyze_timeline(self) -> Dict[str, Any]:
        """Analyze DD timeline."""
        inputs = self.inputs

        return {
            "start_date": inputs.dd_start_date,
            "end_date": inputs.dd_end_date,
            "closing_date": inputs.closing_date,
            "current_phase": inputs.current_phase.value,
            "team_size": len(inputs.team_members),
        }

    def _finding_to_dict(self, finding: DDFinding) -> Dict[str, Any]:
        """Convert finding to dictionary."""
        return {
            "id": finding.id,
            "category": finding.category.value if isinstance(finding.category, FindingCategory) else finding.category,
            "severity": finding.severity.value if isinstance(finding.severity, FindingSeverity) else finding.severity,
            "status": finding.status.value if isinstance(finding.status, FindingStatus) else finding.status,
            "title": finding.title,
            "description": finding.description,
            "impact_amount": finding.impact_amount,
            "impact_description": finding.impact_description,
            "recommendation": finding.recommendation,
            "mitigation": finding.mitigation,
            "owner": finding.owner,
            "date_identified": finding.date_identified,
        }

    def _risk_to_dict(self, risk: RiskItem) -> Dict[str, Any]:
        """Convert risk to dictionary."""
        return {
            "id": risk.id,
            "category": risk.category.value if isinstance(risk.category, FindingCategory) else risk.category,
            "title": risk.title,
            "description": risk.description,
            "likelihood": risk.likelihood.value if isinstance(risk.likelihood, RiskLikelihood) else risk.likelihood,
            "impact": risk.impact.value if isinstance(risk.impact, RiskImpact) else risk.impact,
            "risk_score": risk.risk_score,
            "mitigation_strategy": risk.mitigation_strategy,
            "contingency_plan": risk.contingency_plan,
            "owner": risk.owner,
        }

    def add_finding(self, finding: DDFinding) -> None:
        """Add a finding to the DD."""
        if self.inputs:
            self.inputs.findings.append(finding)

    def add_risk(self, risk: RiskItem) -> None:
        """Add a risk to the DD."""
        if self.inputs:
            self.inputs.risks.append(risk)

    def add_qoe_adjustment(self, adjustment: QoEAdjustment) -> None:
        """Add a QoE adjustment."""
        if self.inputs:
            self.inputs.qoe_adjustments.append(adjustment)
