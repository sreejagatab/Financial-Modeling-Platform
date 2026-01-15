# Financial Modeling Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![React](https://img.shields.io/badge/react-18.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-3178c6.svg)
![Tests](https://img.shields.io/badge/tests-196%20passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

**Enterprise-grade SaaS platform for financial modeling, valuation analysis, and deal execution**

[Features](#-features) | [Quick Start](#-quick-start) | [Documentation](#-documentation) | [API Reference](#-api-reference) | [AI Features](#-ai-powered-features)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [AI-Powered Features](#-ai-powered-features)
- [Frontend API Service Layer](#-frontend-api-service-layer)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Financial Models](#-financial-models)
- [Workflows](#-workflows)
- [API Reference](#-api-reference)
- [WebSocket Real-time](#-websocket-real-time)
- [Excel Add-in](#-excel-add-in)
- [Testing](#-testing)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## Overview

A comprehensive SaaS platform for financial modeling, valuation analysis, and deal execution. Built with **Python/FastAPI backend**, **React/TypeScript frontend**, and **Excel Add-in integration**.

### Key Highlights

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 47,500+ |
| **Backend Files** | 80 Python files (21,313 LOC) |
| **Frontend Files** | 79 TypeScript files (23,000+ LOC) |
| **Excel Add-in** | 11 TypeScript files (3,128 LOC) |
| **Test Coverage** | 196 tests passing |
| **Backend API Endpoints** | 50+ REST endpoints |
| **Frontend API Services** | 97 endpoint integrations |
| **Financial Models** | 11 model types |
| **AI Components** | 6 AI-powered features |

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ARCHITECTURE                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│   │   WEB CLIENT    │    │  EXCEL ADD-IN   │    │           MOBILE (Future)           │ │
│   │   React 18 +    │    │   Office.js +   │    │                                     │ │
│   │   TypeScript    │    │   React        │    │                                     │ │
│   └────────┬────────┘    └────────┬────────┘    └─────────────────────────────────────┘ │
│            │                      │                                                      │
│            └──────────┬───────────┘                                                      │
│                       │                                                                  │
│                       ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           API GATEWAY / LOAD BALANCER                            │   │
│   │                         (nginx / AWS ALB / CloudFlare)                           │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                       │                                                                  │
│                       ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              FASTAPI BACKEND                                     │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │   │
│   │  │  REST API    │  │  WebSocket   │  │  Background  │  │     Middleware       │ │   │
│   │  │  Endpoints   │  │   Manager    │  │    Tasks     │  │  - Rate Limiting     │ │   │
│   │  │  - Auth      │  │  - Presence  │  │  - PDF Gen   │  │  - Request Logging   │ │   │
│   │  │  - Models    │  │  - Sync      │  │  - PPTX Gen  │  │  - Error Handling    │ │   │
│   │  │  - Valuation │  │  - Comments  │  │  - Email     │  │  - CORS              │ │   │
│   │  │  - Export    │  │  - Locks     │  │              │  │                      │ │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘ │   │
│   │                                                                                  │   │
│   │  ┌─────────────────────────────────────────────────────────────────────────────┐│   │
│   │  │                      FINANCIAL CALCULATION ENGINE                            ││   │
│   │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               ││   │
│   │  │  │ Base Model │ │ Calc Graph │ │  Scenario  │ │ Sensitivity │               ││   │
│   │  │  │ (Abstract) │ │    DAG     │ │  Manager   │ │  Analysis   │               ││   │
│   │  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘               ││   │
│   │  │                                                                              ││   │
│   │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               ││   │
│   │  │  │    LBO     │ │   DCF      │ │   Merger   │ │ 3-Statement │               ││   │
│   │  │  │   Model    │ │  Model     │ │   Model    │ │   Model     │               ││   │
│   │  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘               ││   │
│   │  │                                                                              ││   │
│   │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐               ││   │
│   │  │  │ Operating  │ │  13-Week   │ │   REIT     │ │    NAV      │               ││   │
│   │  │  │   Model    │ │  Cash Flow │ │   Model    │ │   Model     │               ││   │
│   │  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘               ││   │
│   │  │                                                                              ││   │
│   │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                               ││   │
│   │  │  │   Spinoff  │ │    IP      │ │    RMT     │                               ││   │
│   │  │  │   Model    │ │ Licensing  │ │   Model    │                               ││   │
│   │  │  └────────────┘ └────────────┘ └────────────┘                               ││   │
│   │  └─────────────────────────────────────────────────────────────────────────────┘│   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                       │                                                                  │
│                       ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              DATA LAYER                                          │   │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │   │
│   │  │   PostgreSQL     │  │      Redis       │  │   S3 / MinIO     │               │   │
│   │  │   - Users        │  │   - Sessions     │  │   - Exports      │               │   │
│   │  │   - Models       │  │   - Cache        │  │   - Snapshots    │               │   │
│   │  │   - Cells        │  │   - Pub/Sub      │  │   - Templates    │               │   │
│   │  │   - Comments     │  │   - Rate Limits  │  │                  │               │   │
│   │  │   - Versions     │  │                  │  │                  │               │   │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘               │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                               DATA FLOW ARCHITECTURE                                  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   USER INPUT                  PROCESSING                         OUTPUT              │
│   ──────────                  ──────────                         ──────              │
│                                                                                       │
│   ┌─────────┐                ┌─────────────┐                    ┌─────────────┐      │
│   │ Web UI  │──────────────▶│   API       │──────────────────▶│  Dashboard  │      │
│   │ Input   │                │   Gateway   │                    │  Display    │      │
│   └─────────┘                └──────┬──────┘                    └─────────────┘      │
│                                     │                                                 │
│   ┌─────────┐                       ▼                           ┌─────────────┐      │
│   │ Excel   │──────────────▶┌─────────────┐──────────────────▶│  Excel      │      │
│   │ Add-in  │                │ Calculation │                    │  Results    │      │
│   └─────────┘                │   Engine    │                    └─────────────┘      │
│                              └──────┬──────┘                                          │
│                                     │                                                 │
│                                     ▼                                                 │
│                              ┌─────────────┐                    ┌─────────────┐      │
│                              │  Financial  │──────────────────▶│  Reports    │      │
│                              │   Models    │                    │  PDF/PPTX   │      │
│                              └──────┬──────┘                    └─────────────┘      │
│                                     │                                                 │
│                                     ▼                                                 │
│                              ┌─────────────┐                    ┌─────────────┐      │
│                              │  Database   │──────────────────▶│  Version    │      │
│                              │  Storage    │                    │  History    │      │
│                              └─────────────┘                    └─────────────┘      │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND ARCHITECTURE                                    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                              App.tsx (Root)                                  │    │
│   │                         ErrorBoundary + Providers                            │    │
│   └────────────────────────────────────┬────────────────────────────────────────┘    │
│                                        │                                              │
│          ┌─────────────────────────────┼─────────────────────────────┐               │
│          │                             │                             │               │
│          ▼                             ▼                             ▼               │
│   ┌─────────────┐              ┌─────────────┐              ┌─────────────┐          │
│   │ PublicLayout│              │  AppLayout  │              │ Auth Pages  │          │
│   │ (Marketing) │              │ (Dashboard) │              │ Login/Reg   │          │
│   └──────┬──────┘              └──────┬──────┘              └─────────────┘          │
│          │                            │                                               │
│          ▼                            ▼                                               │
│   ┌─────────────────┐   ┌────────────────────────────────────────────────────┐       │
│   │ Public Pages    │   │                 Feature Modules                     │       │
│   │ - Home          │   │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │       │
│   │ - Features      │   │  │Dashboard │ │  Model   │ │Valuation │            │       │
│   │ - Pricing       │   │  │  Page    │ │ Builder  │ │  Suite   │            │       │
│   │ - About         │   │  └──────────┘ └──────────┘ └──────────┘            │       │
│   │ - Docs          │   │                                                     │       │
│   │ - Blog          │   │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │       │
│   │ - Careers       │   │  │   Deal   │ │   Due    │ │ Industry │            │       │
│   │ - Help          │   │  │ Analysis │ │Diligence │ │  Models  │            │       │
│   │ - etc.          │   │  └──────────┘ └──────────┘ └──────────┘            │       │
│   └─────────────────┘   └────────────────────────────────────────────────────┘       │
│                                        │                                              │
│                                        ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                          Shared Components                                   │    │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │    │
│   │  │     AI     │ │    UI      │ │   Charts   │ │   Layout   │                │    │
│   │  │ Components │ │ Components │ │ Components │ │ Components │                │    │
│   │  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                        │                                              │
│                                        ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                           State Management                                   │    │
│   │        Redux Toolkit (Models, Auth)    +    Zustand (UI State)              │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### Financial Models

| Model Type | Description | Key Outputs |
|------------|-------------|-------------|
| **3-Statement Model** | Integrated IS/BS/CF with circular references | Revenue, Net Income, Cash Flow, ROIC |
| **Operating Model** | Revenue build with product lines & cost drivers | Unit economics, Margins, Headcount |
| **13-Week Cash Flow** | Short-term liquidity forecasting | Weekly cash, Revolver usage, Minimum cash |
| **LBO Model** | Leveraged buyout analysis | IRR, MOIC, Sources/Uses, Debt schedule |
| **Merger Model** | M&A accretion/dilution analysis | EPS impact, Synergies, Contribution |
| **DCF Model** | Discounted cash flow valuation | Enterprise value, Equity value, WACC |
| **Trading Comps** | Comparable company analysis | EV/EBITDA, P/E, Percentiles |
| **Precedent Transactions** | Historical deal multiples | Transaction premiums, Deal metrics |
| **Sale-Leaseback** | Real estate transaction analysis | Rent coverage, NPV, Cap rates |
| **REIT Model** | REIT valuation & metrics | FFO/AFFO, Dividend yield, NAV |
| **NAV Model** | Sum-of-the-parts valuation | GAV, NAV per share, Discount analysis |

### Bespoke Transactions

| Transaction Type | Description | Key Analysis |
|------------------|-------------|--------------|
| **Spin-Off/Carve-Out** | Corporate separation analysis | Value creation, Stranded costs, TSA |
| **IP Licensing** | Intellectual property deals | Royalty streams, NPV, Milestone payments |
| **Reverse Morris Trust** | Tax-efficient spin-merger | Tax savings, Ownership, Accretion/dilution |

### Platform Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              PLATFORM CAPABILITIES                                    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   AUTHENTICATION           COLLABORATION              VERSION CONTROL                │
│   ──────────────           ─────────────              ───────────────                │
│   ✓ JWT-based auth         ✓ Real-time sync          ✓ Git-like versioning          │
│   ✓ Role-based access      ✓ User presence           ✓ Branch/scenario mgmt         │
│   ✓ Password encryption    ✓ Cell locking            ✓ Audit trail                  │
│   ✓ Token refresh          ✓ Comments/annotations    ✓ Rollback support             │
│                                                                                       │
│   EXPORT                   DUE DILIGENCE             EXCEL INTEGRATION              │
│   ──────                   ─────────────             ─────────────────              │
│   ✓ PDF reports            ✓ Vertical checklists    ✓ Custom functions (UDFs)      │
│   ✓ PowerPoint decks       ✓ Findings tracker       ✓ Bidirectional sync           │
│   ✓ Custom templates       ✓ Risk matrix            ✓ Offline support              │
│   ✓ Chart embedding        ✓ QoE analysis           ✓ Streaming data               │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Analyst** | Create, edit, delete models; manage scenarios; full model access | Investment analysts, associates |
| **Stakeholder** | View models and dashboards; add comments | Executives, clients, board members |
| **Admin** | Full access + user management | Platform administrators |

---

## AI-Powered Features

The platform includes 6 AI-powered components for intelligent financial analysis.

### AI Components Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                              AI-POWERED FEATURES                                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                         AI Chat Assistant                                    │    │
│   │   Location: Dashboard (floating button)                                      │    │
│   │   Purpose: Natural language Q&A for financial modeling guidance              │    │
│   │   Features:                                                                  │    │
│   │     • DCF modeling help and formulas                                         │    │
│   │     • LBO structuring advice                                                 │    │
│   │     • WACC calculation guidance                                              │    │
│   │     • Valuation multiple explanations                                        │    │
│   │     • Industry-specific assumptions                                          │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                         AI Insights Panel                                    │    │
│   │   Location: Dashboard (right sidebar)                                        │    │
│   │   Purpose: Automated analysis and recommendations across models              │    │
│   │   Insight Types:                                                             │    │
│   │     • Opportunity - Valuation upside potential                               │    │
│   │     • Risk - Leverage ratio concerns, anomalies                              │    │
│   │     • Recommendation - Model optimization suggestions                        │    │
│   │     • Trend - Market multiple changes                                        │    │
│   │     • Anomaly - Working capital deviations                                   │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                       AI Scenario Generator                                  │    │
│   │   Location: Model Builder (toolbar button)                                   │    │
│   │   Purpose: Generate Bull/Base/Bear/Stress scenarios automatically            │    │
│   │   Features:                                                                  │    │
│   │     • Industry-aware scenario generation                                     │    │
│   │     • Probability weighting (25%/50%/20%/5%)                                 │    │
│   │     • Detailed reasoning for each scenario                                   │    │
│   │     • One-click apply to model                                               │    │
│   │     • Assumptions: revenue growth, EBITDA margin, exit multiple              │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                      AI Assumptions Helper                                   │    │
│   │   Location: Model Builder (toolbar button)                                   │    │
│   │   Purpose: Industry benchmark suggestions for model assumptions              │    │
│   │   Supported Industries:                                                      │    │
│   │     • Technology, Healthcare, Manufacturing, Retail, Financial               │    │
│   │   Assumptions Provided:                                                      │    │
│   │     • Revenue growth rate (with min/max/median)                              │    │
│   │     • EBITDA margin benchmarks                                               │    │
│   │     • CapEx as % of revenue                                                  │    │
│   │     • Working capital requirements                                           │    │
│   │     • Terminal growth rate                                                   │    │
│   │     • WACC with confidence levels                                            │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                        AI Comps Finder                                       │    │
│   │   Location: Valuation Suite                                                  │    │
│   │   Purpose: Find and rank comparable companies automatically                  │    │
│   │   Features:                                                                  │    │
│   │     • Relevance scoring (0-100%)                                             │    │
│   │     • Multiple metrics: EV/Revenue, EV/EBITDA, P/E                           │    │
│   │     • Reasoning for each comparable                                          │    │
│   │     • Revenue growth and margin comparisons                                  │    │
│   │     • Market cap matching                                                    │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                        AI Risk Analyzer                                      │    │
│   │   Location: Due Diligence                                                    │    │
│   │   Purpose: Analyze DD findings and generate risk assessment                  │    │
│   │   Outputs:                                                                   │    │
│   │     • Overall risk score (0-100)                                             │    │
│   │     • Risk categorization (low/medium/high/critical)                         │    │
│   │     • Individual risk breakdown with mitigation                              │    │
│   │     • Deal recommendations                                                   │    │
│   │     • Integration risk assessment                                            │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### AI Service Types

```typescript
// AI Message for Chat Assistant
interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// AI Scenario for Scenario Generator
interface AIScenario {
  id: string;
  name: string;
  type: 'bull' | 'base' | 'bear' | 'stress';
  description: string;
  assumptions: Record<string, number>;
  reasoning: string;
  probability: number;  // 0.25, 0.50, 0.20, 0.05
}

// AI Insight for Insights Panel
interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'trend' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  relatedModel?: string;
  actionItems?: string[];
  metrics?: Record<string, number>;
}

// AI Comparable for Comps Finder
interface AIComparable {
  id: string;
  name: string;
  ticker: string;
  industry: string;
  marketCap: number;
  evRevenue: number;
  evEbitda: number;
  relevanceScore: number;  // 0-1
  reasoning: string;
}

// AI Risk Assessment for Risk Analyzer
interface AIRiskAssessment {
  overallScore: number;
  category: 'low' | 'medium' | 'high' | 'critical';
  risks: Array<{
    title: string;
    category: string;
    severity: string;
    likelihood: string;
    impact: string;
    mitigation: string;
  }>;
  summary: string;
  recommendations: string[];
}
```

### AI Feature Locations

| Feature | Page | Access | Trigger |
|---------|------|--------|---------|
| AI Chat Assistant | Dashboard | Floating button (bottom-right) | Click chat icon |
| AI Insights Panel | Dashboard | Right sidebar | Automatic on load |
| AI Scenario Generator | Model Builder | Toolbar button "AI Scenarios" | Click button |
| AI Assumptions Helper | Model Builder | Toolbar button "AI Assumptions" | Click button |
| AI Comps Finder | Valuation Suite | Tab "AI Comps" | Switch to tab |
| AI Risk Analyzer | Due Diligence | Tab "AI Analysis" | Switch to tab |

---

## Frontend API Service Layer

The frontend includes a comprehensive API service layer that connects to all backend endpoints.

### API Services Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND API SERVICE LAYER                                   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                           API Client (Axios)                                 │    │
│   │   • JWT authentication interceptor                                           │    │
│   │   • Automatic token refresh                                                  │    │
│   │   • Request ID tracing                                                       │    │
│   │   • Error handling with auto-logout                                          │    │
│   └────────────────────────────────────┬────────────────────────────────────────┘    │
│                                        │                                              │
│          ┌──────────┬──────────┬──────┴───────┬──────────┬──────────┐               │
│          │          │          │              │          │          │               │
│          ▼          ▼          ▼              ▼          ▼          ▼               │
│   ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐          │
│   │  Auth    ││  Models  ││  Collab  ││Valuations││    DD    ││  Export  │          │
│   │  API     ││   API    ││   API    ││   API    ││   API    ││   API    │          │
│   │ 9 endpts ││22 endpts ││12 endpts ││ 8 endpts ││10 endpts ││12 endpts │          │
│   └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘└──────────┘          │
│                                                                                       │
│   ┌──────────┐┌──────────┐                                                           │
│   │ Industry ││  Excel   │                                                           │
│   │   API    ││   API    │                                                           │
│   │12 endpts ││12 endpts │                                                           │
│   └──────────┘└──────────┘                                                           │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                         Redux Async Thunks                                   │    │
│   │   • login, register, logout, getCurrentUser                                  │    │
│   │   • fetchModels, createModel, updateModel, deleteModel                       │    │
│   │   • fetchModel, createSheet, updateCells, calculateModel                     │    │
│   │   • createScenario                                                           │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### API Services Summary

| Service | File | Endpoints | Description |
|---------|------|-----------|-------------|
| **authApi** | `auth.api.ts` | 9 | Login, register, logout, profile, password reset |
| **modelsApi** | `models.api.ts` | 22 | Model CRUD, sheets, cells, scenarios, versions, LBO |
| **collaborationApi** | `collaboration.api.ts` | 12 | Comments, annotations, presence, edit history |
| **valuationsApi** | `valuations.api.ts` | 8 | DCF, Trading Comps, Precedents, Merger analysis |
| **dueDiligenceApi** | `dueDiligence.api.ts` | 10 | DD analysis, checklists, QoE, risk matrix |
| **exportApi** | `export.api.ts` | 12 | PDF/PPTX generation, templates, download |
| **industryApi** | `industry.api.ts` | 12 | Sale-leaseback, REIT, NAV analysis |
| **excelApi** | `excel.api.ts` | 12 | Cell linking, sync, audit, WebSocket |
| **Total** | | **97** | |

### Usage Examples

```typescript
// Using Redux thunks (recommended for state management)
import { useAppDispatch, useAppSelector, login, fetchModels } from '@/app/store';

function LoginComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const handleLogin = async () => {
    await dispatch(login({ email: 'user@example.com', password: 'pass' }));
    await dispatch(fetchModels());
  };
}

// Direct API calls (for one-off requests)
import { modelsApi, valuationsApi } from '@/services/api';

async function runAnalysis() {
  // LBO Analysis
  const lboResult = await modelsApi.analyzeLBO({
    enterprise_value: 500,
    equity_purchase_price: 450,
    senior_debt_amount: 250,
    // ...
  });
  console.log(`IRR: ${(lboResult.outputs.irr * 100).toFixed(1)}%`);

  // DCF Valuation
  const dcfResult = await valuationsApi.runDCF({
    revenue_base: 100000000,
    revenue_growth_rates: [0.1, 0.08, 0.06, 0.05, 0.05],
    // ...
  });
  console.log(`Enterprise Value: $${dcfResult.outputs.enterprise_value.toLocaleString()}`);
}
```

### TypeScript Types

All API types are fully typed and match backend models:

```typescript
import type {
  User, UserRole,
  FinancialModel, ModelType,
  Sheet, Cell, CellValue,
  Scenario, Comment, Annotation,
  LBORequest, LBOResponse,
  DCFRequest, DCFResponse,
  DDFinding, QoEAdjustment,
} from '@/services/api';
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/financial-modeling-platform.git
cd financial-modeling-platform
```

#### 2. Database Setup

```bash
# Using Docker
docker run -d \
  --name finmodel-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=finmodel \
  -p 5432:5432 \
  postgres:14

# Using Docker for Redis
docker run -d \
  --name finmodel-redis \
  -p 6379:6379 \
  redis:7
```

#### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8001
```

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 5. Access Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8001 |
| API Documentation (Swagger) | http://localhost:8001/docs |
| API Documentation (ReDoc) | http://localhost:8001/redoc |
| WebSocket | ws://localhost:8001/ws/models/{id} |

---

## Project Structure

```
micro1/
├── backend/                          # Python FastAPI Backend
│   ├── app/                          # Application Core
│   │   ├── main.py                   # FastAPI entry point with middleware
│   │   ├── config.py                 # Pydantic settings management
│   │   └── dependencies.py           # Auth dependencies (get_current_user)
│   │
│   ├── api/v1/                       # REST API Endpoints
│   │   ├── router.py                 # Route aggregation
│   │   ├── auth/                     # Authentication (login, register, refresh)
│   │   ├── models/                   # Financial model CRUD
│   │   ├── collaboration/            # WebSocket, comments, presence
│   │   ├── valuations/               # DCF, Comps, Precedents
│   │   ├── deals/                    # LBO, Merger analysis
│   │   ├── exports/                  # PDF, PPTX generation
│   │   ├── excel/                    # Excel add-in API
│   │   ├── industry/                 # Sale-leaseback, REIT, NAV
│   │   ├── bespoke/                  # Spinoff, IP licensing, RMT
│   │   └── due_diligence/            # DD workflows
│   │
│   ├── core/                         # Business Logic
│   │   ├── engine/                   # Calculation Engine
│   │   │   ├── base_model.py         # Abstract BaseFinancialModel
│   │   │   ├── calculation_graph.py  # Dependency DAG
│   │   │   └── scenario_manager.py   # Scenario management
│   │   │
│   │   └── models/                   # Financial Model Implementations
│   │       ├── lbo_model.py          # LBO with IRR/MOIC
│   │       ├── three_statement.py    # 3-Statement model
│   │       ├── operating_model.py    # Operating model
│   │       ├── cash_flow_13week.py   # 13-week cash flow
│   │       ├── sale_leaseback.py     # Sale-leaseback
│   │       ├── reit_model.py         # REIT valuation
│   │       ├── nav_model.py          # NAV model
│   │       ├── spinoff_model.py      # Spin-off/carve-out
│   │       ├── ip_licensing_model.py # IP licensing
│   │       ├── rmt_model.py          # Reverse Morris Trust
│   │       └── due_diligence.py      # DD workflows
│   │
│   ├── services/                     # Business Services
│   │   ├── auth_service.py           # Authentication logic
│   │   ├── model_service.py          # Model CRUD operations
│   │   ├── websocket_manager.py      # WebSocket connection manager
│   │   ├── collaboration_service.py  # Comments/annotations
│   │   ├── pdf_service.py            # PDF report generation
│   │   ├── pptx_service.py           # PowerPoint generation
│   │   └── report_templates.py       # Template management
│   │
│   ├── middleware/                   # Production Middleware
│   │   ├── rate_limiter.py           # Token bucket rate limiting
│   │   ├── request_logger.py         # Request logging with timing
│   │   └── error_handler.py          # Global error handling
│   │
│   ├── db/                           # Database Layer
│   │   └── models/                   # SQLAlchemy models
│   │       ├── user.py               # User model
│   │       ├── financial_model.py    # Model, Sheet, Cell
│   │       └── collaboration.py      # Comments, Annotations
│   │
│   ├── alembic/                      # Database Migrations
│   │   └── versions/                 # Migration files
│   │
│   └── tests/                        # Test Suite (196 tests)
│       ├── test_lbo_model.py         # LBO model tests
│       ├── test_auth.py              # Authentication tests
│       ├── test_websocket.py         # WebSocket tests
│       ├── test_financial_models.py  # Financial model tests
│       ├── test_export.py            # Export tests
│       ├── test_excel_api.py         # Excel API tests
│       ├── test_industry_models.py   # Industry model tests
│       ├── test_bespoke_models.py    # Bespoke transaction tests
│       ├── test_due_diligence.py     # Due diligence tests
│       └── test_production.py        # Production middleware tests
│
├── frontend/                         # React TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx                   # Root component with routes
│   │   ├── main.tsx                  # Entry point
│   │   │
│   │   ├── app/                      # App Configuration
│   │   │   ├── store/                # Redux Toolkit
│   │   │   │   ├── index.ts          # Store config + typed hooks
│   │   │   │   ├── slices/           # Redux slices
│   │   │   │   │   ├── auth.slice.ts
│   │   │   │   │   ├── models.slice.ts
│   │   │   │   │   └── collaboration.slice.ts
│   │   │   │   └── thunks/           # Async thunks (API integration)
│   │   │   │       ├── index.ts
│   │   │   │       ├── auth.thunks.ts    # login, register, logout
│   │   │   │       └── models.thunks.ts  # fetchModels, createModel, etc.
│   │   │   │
│   │   │   └── providers/            # React Context Providers
│   │   │       ├── role-provider.tsx       # RBAC provider
│   │   │       └── websocket-provider.tsx  # WebSocket provider
│   │   │
│   │   ├── features/                 # Feature Modules
│   │   │   ├── dashboard/            # Executive Dashboard
│   │   │   │   └── Dashboard.tsx
│   │   │   │
│   │   │   ├── model-builder/        # Model Builder (AG Grid)
│   │   │   │   └── ModelBuilder.tsx
│   │   │   │
│   │   │   ├── deal-analysis/        # Deal Analysis
│   │   │   │   ├── LBOAnalysis.tsx
│   │   │   │   └── MergerAnalysis.tsx
│   │   │   │
│   │   │   ├── valuation/            # Valuation Suite
│   │   │   │   └── ValuationSuite.tsx
│   │   │   │
│   │   │   ├── due-diligence/        # Due Diligence
│   │   │   │   ├── DueDiligence.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── FindingsTracker.tsx
│   │   │   │   │   ├── RiskMatrix.tsx
│   │   │   │   │   ├── QoECalculator.tsx
│   │   │   │   │   ├── DDChecklist.tsx
│   │   │   │   │   └── DDSummary.tsx
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── industry/             # Industry-Specific Models
│   │   │   │   ├── SaleLeasebackPage.tsx
│   │   │   │   ├── REITAnalysisPage.tsx
│   │   │   │   └── NAVAnalysisPage.tsx
│   │   │   │
│   │   │   ├── export/               # Export Module
│   │   │   │   └── ExportPage.tsx
│   │   │   │
│   │   │   ├── auth/                 # Authentication
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   │
│   │   │   ├── public/               # Public Marketing Pages
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── FeaturesPage.tsx
│   │   │   │   ├── PricingPage.tsx
│   │   │   │   ├── AboutPage.tsx
│   │   │   │   ├── DocsPage.tsx
│   │   │   │   ├── BlogPage.tsx
│   │   │   │   └── ... (18 public pages)
│   │   │   │
│   │   │   ├── settings/             # User Settings
│   │   │   │   └── SettingsPage.tsx
│   │   │   │
│   │   │   └── notifications/        # Notifications
│   │   │       └── NotificationsPage.tsx
│   │   │
│   │   ├── shared/                   # Shared Components
│   │   │   ├── components/
│   │   │   │   ├── ai/               # AI Components (6)
│   │   │   │   │   ├── AIChatAssistant.tsx
│   │   │   │   │   ├── AIInsightsPanel.tsx
│   │   │   │   │   ├── AIScenarioGenerator.tsx
│   │   │   │   │   ├── AIAssumptionsHelper.tsx
│   │   │   │   │   ├── AICompsFinder.tsx
│   │   │   │   │   └── AIRiskAnalyzer.tsx
│   │   │   │   │
│   │   │   │   ├── layout/           # Layout Components
│   │   │   │   │   ├── AppLayout.tsx
│   │   │   │   │   └── PublicLayout.tsx
│   │   │   │   │
│   │   │   │   ├── errors/           # Error Components
│   │   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   │   ├── NotFoundPage.tsx
│   │   │   │   │   └── ServerErrorPage.tsx
│   │   │   │   │
│   │   │   │   └── ui/               # UI Components
│   │   │   │
│   │   │   └── hooks/                # Custom Hooks
│   │   │
│   │   └── services/                 # Frontend Services
│   │       ├── index.ts              # Services index
│   │       ├── aiService.ts          # AI Service Layer
│   │       └── api/                  # Backend API Integration (97 endpoints)
│   │           ├── client.ts         # Axios client with interceptors
│   │           ├── types.ts          # TypeScript types (matches backend)
│   │           ├── auth.api.ts       # Authentication (9 endpoints)
│   │           ├── models.api.ts     # Financial models (22 endpoints)
│   │           ├── collaboration.api.ts  # Comments, presence (12 endpoints)
│   │           ├── valuations.api.ts # DCF, Comps, Mergers (8 endpoints)
│   │           ├── dueDiligence.api.ts   # DD, QoE, Risk (10 endpoints)
│   │           ├── export.api.ts     # PDF, PPTX export (12 endpoints)
│   │           ├── industry.api.ts   # REIT, NAV, Sale-LB (12 endpoints)
│   │           ├── excel.api.ts      # Excel integration (12 endpoints)
│   │           └── index.ts          # Central exports
│   │
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── excel-addin/                      # Office.js Excel Add-in
│   ├── src/
│   │   ├── functions/                # Custom Functions (UDFs)
│   │   │   └── platformFunctions.ts  # FP.GET, FP.LINK, FP.LIVE, etc.
│   │   │
│   │   ├── sync/                     # Sync Engine
│   │   │   └── SyncEngine.ts         # WebSocket sync with conflict resolution
│   │   │
│   │   ├── offline/                  # Offline Support
│   │   │   └── IndexedDBStore.ts     # IndexedDB for offline storage
│   │   │
│   │   └── taskpane/                 # Task Pane UI
│   │       ├── components/
│   │       │   ├── App.tsx
│   │       │   ├── Header.tsx
│   │       │   ├── LoginDialog.tsx
│   │       │   └── tabs/
│   │       │       ├── HomeTab.tsx
│   │       │       ├── LinksTab.tsx
│   │       │       ├── SyncTab.tsx
│   │       │       └── SettingsTab.tsx
│   │       └── index.tsx
│   │
│   ├── manifest.xml                  # Office Add-in manifest
│   └── package.json
│
├── docker-compose.yml                # Docker orchestration
├── docker-compose.dev.yml            # Development overrides
├── docker-compose.prod.yml           # Production overrides
├── .env.example                      # Environment template
└── README.md                         # This file
```

---

## Financial Models

### Calculation Engine Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          CALCULATION ENGINE ARCHITECTURE                              │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                         BaseFinancialModel (Abstract)                        │    │
│   │                                                                              │    │
│   │   Methods:                                                                   │    │
│   │     • calculate() -> CalculationResult                                       │    │
│   │     • get_dependencies() -> DependencyGraph                                  │    │
│   │     • run_sensitivity(params) -> SensitivityMatrix                           │    │
│   │     • validate_inputs() -> ValidationResult                                  │    │
│   │     • get_outputs() -> Dict[str, Any]                                        │    │
│   │                                                                              │    │
│   └────────────────────────────────────┬────────────────────────────────────────┘    │
│                                        │                                              │
│          ┌─────────────────────────────┼─────────────────────────────┐               │
│          │                             │                             │               │
│          ▼                             ▼                             ▼               │
│   ┌─────────────┐              ┌─────────────┐              ┌─────────────┐          │
│   │  LBOModel   │              │  DCFModel   │              │ MergerModel │          │
│   │             │              │             │              │             │          │
│   │ • IRR/MOIC  │              │ • WACC      │              │ • Accretion │          │
│   │ • Debt sched│              │ • Terminal  │              │ • Synergies │          │
│   │ • Returns   │              │ • NPV       │              │ • EPS impact│          │
│   └─────────────┘              └─────────────┘              └─────────────┘          │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                          CalculationGraph (DAG)                              │    │
│   │                                                                              │    │
│   │   ┌───────┐     ┌───────┐     ┌───────┐     ┌───────┐                       │    │
│   │   │ Input │────▶│ Calc  │────▶│ Calc  │────▶│Output │                       │    │
│   │   │ Cell  │     │ Cell  │     │ Cell  │     │ Cell  │                       │    │
│   │   └───────┘     └───────┘     └───────┘     └───────┘                       │    │
│   │                      │             ▲                                         │    │
│   │                      └─────────────┘                                         │    │
│   │                    (Circular Reference)                                      │    │
│   │                                                                              │    │
│   │   Features:                                                                  │    │
│   │     • Topological sorting for calculation order                              │    │
│   │     • Circular reference detection and iteration                             │    │
│   │     • Incremental recalculation on input change                              │    │
│   │     • Formula AST parsing and evaluation                                     │    │
│   │                                                                              │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                          ScenarioManager                                     │    │
│   │                                                                              │    │
│   │   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐                     │    │
│   │   │  Base   │   │  Bull   │   │  Bear   │   │ Stress  │                     │    │
│   │   │  Case   │   │  Case   │   │  Case   │   │  Test   │                     │    │
│   │   │  50%    │   │  25%    │   │  20%    │   │   5%    │                     │    │
│   │   └─────────┘   └─────────┘   └─────────┘   └─────────┘                     │    │
│   │                                                                              │    │
│   │   Features:                                                                  │    │
│   │     • Scenario branching from base                                           │    │
│   │     • Probability-weighted outputs                                           │    │
│   │     • Monte Carlo simulation support                                         │    │
│   │     • Scenario comparison and diff                                           │    │
│   │                                                                              │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### LBO Model Example

```python
from core.models import LBOModel, LBOInputs

inputs = LBOInputs(
    enterprise_value=500,
    equity_purchase_price=450,
    senior_debt_amount=250,
    senior_debt_rate=0.06,
    sponsor_equity=200,
    projection_years=5,
    revenue_base=300,
    revenue_growth_rates=[0.05, 0.05, 0.05, 0.05, 0.05],
    ebitda_margins=[0.20, 0.21, 0.22, 0.22, 0.23],
    exit_year=5,
    exit_multiple=8.0,
)

model = LBOModel(model_id="lbo-1", name="Project Alpha")
model.set_inputs(inputs)
result = model.calculate()

print(f"IRR: {result.outputs['irr']:.1%}")      # IRR: 24.3%
print(f"MOIC: {result.outputs['moic']:.2f}x")   # MOIC: 2.97x
```

### 3-Statement Model Example

```python
from core.models import ThreeStatementModel, ThreeStatementInputs

inputs = ThreeStatementInputs(
    base_revenue=1_000_000,
    base_cogs=600_000,
    projection_years=5,
    revenue_growth_rates=[0.08, 0.07, 0.06, 0.05, 0.05],
    cogs_percent_revenue=[0.60, 0.59, 0.58, 0.58, 0.57],
    ar_days=45,
    inventory_days=50,
    ap_days=35,
    tax_rate=0.25,
)

model = ThreeStatementModel(model_id="3stmt-1", name="Company Forecast")
model.set_inputs(inputs)
result = model.calculate()

# Access integrated financial statements
income_statement = result.outputs['income_statement']
balance_sheet = result.outputs['balance_sheet']
cash_flow = result.outputs['cash_flow']
```

---

## Workflows

### User Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATION WORKFLOW                                    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   REGISTRATION                                                                        │
│   ────────────                                                                        │
│                                                                                       │
│   ┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐               │
│   │ Client │────▶│  POST      │────▶│  Validate  │────▶│   Hash     │               │
│   │  Form  │     │  /register │     │   Email    │     │  Password  │               │
│   └────────┘     └────────────┘     └────────────┘     └─────┬──────┘               │
│                                                               │                       │
│                                                               ▼                       │
│   ┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐               │
│   │ Tokens │◀────│  Generate  │◀────│   Store    │◀────│   Create   │               │
│   │ Sent   │     │   JWT      │     │   User     │     │   User     │               │
│   └────────┘     └────────────┘     └────────────┘     └────────────┘               │
│                                                                                       │
│   LOGIN                                                                               │
│   ─────                                                                               │
│                                                                                       │
│   ┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐               │
│   │ Client │────▶│  POST      │────▶│   Verify   │────▶│  Compare   │               │
│   │  Form  │     │  /login    │     │   User     │     │  Password  │               │
│   └────────┘     └────────────┘     └────────────┘     └─────┬──────┘               │
│                                                               │                       │
│                                                               ▼                       │
│   ┌────────┐     ┌────────────┐     ┌────────────┐                                   │
│   │ Tokens │◀────│  Generate  │◀────│   Create   │                                   │
│   │ Sent   │     │ JWT Tokens │     │  Session   │                                   │
│   └────────┘     └────────────┘     └────────────┘                                   │
│                                                                                       │
│   TOKEN REFRESH                                                                       │
│   ─────────────                                                                       │
│                                                                                       │
│   ┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐               │
│   │ Client │────▶│  POST      │────▶│  Validate  │────▶│  Generate  │               │
│   │Refresh │     │  /refresh  │     │  Refresh   │     │  New Access│               │
│   │ Token  │     │            │     │   Token    │     │   Token    │               │
│   └────────┘     └────────────┘     └────────────┘     └────────────┘               │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Model Calculation Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          MODEL CALCULATION WORKFLOW                                   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   1. INPUT VALIDATION                                                                 │
│   ────────────────────                                                                │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐                               │
│   │   User     │────▶│  Validate  │────▶│   Parse    │                               │
│   │   Input    │     │   Types    │     │  Formulas  │                               │
│   └────────────┘     └────────────┘     └─────┬──────┘                               │
│                                               │                                       │
│   2. BUILD DEPENDENCY GRAPH                   ▼                                       │
│   ─────────────────────────                                                           │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐                               │
│   │   Scan     │────▶│   Build    │────▶│  Detect    │                               │
│   │  Formulas  │     │    DAG     │     │  Cycles    │                               │
│   └────────────┘     └────────────┘     └─────┬──────┘                               │
│                                               │                                       │
│   3. TOPOLOGICAL SORT                         ▼                                       │
│   ───────────────────                                                                 │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐                               │
│   │   Sort     │────▶│  Handle    │────▶│  Generate  │                               │
│   │   Nodes    │     │  Circular  │     │  Order     │                               │
│   └────────────┘     └────────────┘     └─────┬──────┘                               │
│                                               │                                       │
│   4. CALCULATE                                ▼                                       │
│   ────────────                                                                        │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐                               │
│   │  Execute   │────▶│   Store    │────▶│   Return   │                               │
│   │  In Order  │     │  Results   │     │  Outputs   │                               │
│   └────────────┘     └────────────┘     └────────────┘                               │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Real-time Collaboration Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                       REAL-TIME COLLABORATION WORKFLOW                                │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   USER A                  SERVER                        USER B                        │
│   ──────                  ──────                        ──────                        │
│     │                       │                             │                           │
│     │──── WS Connect ──────▶│                             │                           │
│     │                       │◀──── WS Connect ────────────│                           │
│     │                       │                             │                           │
│     │◀─── User Joined ──────│────── User Joined ─────────▶│                           │
│     │                       │                             │                           │
│     │◀─── Presence ─────────│────── Presence ────────────▶│                           │
│     │                       │                             │                           │
│     │                       │                             │                           │
│     │──── Lock Cell B5 ────▶│                             │                           │
│     │                       │                             │                           │
│     │◀─── Lock Confirmed ───│────── Cell B5 Locked ──────▶│                           │
│     │                       │                             │                           │
│     │                       │                             │                           │
│     │──── Update B5 ───────▶│                             │                           │
│     │                       │                             │                           │
│     │◀─── Update Ack ───────│────── Cell Update ─────────▶│                           │
│     │                       │                             │                           │
│     │                       │                             │                           │
│     │──── Unlock B5 ───────▶│                             │                           │
│     │                       │                             │                           │
│     │◀─── Unlock Ack ───────│────── B5 Unlocked ─────────▶│                           │
│     │                       │                             │                           │
│     │                       │                             │                           │
│     │──── Add Comment ─────▶│                             │                           │
│     │                       │                             │                           │
│     │◀─── Comment Added ────│────── New Comment ─────────▶│                           │
│     │                       │                             │                           │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Due Diligence Workflow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           DUE DILIGENCE WORKFLOW                                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   PHASE 1: SETUP                                                                      │
│   ──────────────                                                                      │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│   │   Select    │──▶│   Load      │──▶│  Assign     │──▶│   Set       │              │
│   │  Vertical   │   │  Checklist  │   │   Team      │   │ Deadlines   │              │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                                       │
│   Supported Verticals:                                                                │
│   • Technology     • Healthcare     • Manufacturing                                   │
│   • Real Estate    • Financial      • Retail                                          │
│                                                                                       │
│   PHASE 2: DATA COLLECTION                                                            │
│   ────────────────────────                                                            │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│   │  Request    │──▶│   Upload    │──▶│    AI       │──▶│   Review    │              │
│   │  Documents  │   │   Files     │   │  Analysis   │   │  Findings   │              │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                                       │
│   PHASE 3: ANALYSIS                                                                   │
│   ─────────────────                                                                   │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│   │   Log       │──▶│   QoE       │──▶│    Risk     │──▶│    AI       │              │
│   │  Findings   │   │ Calculation │   │   Matrix    │   │   Risks     │              │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                                       │
│   Severity Levels: Critical | High | Medium | Low | Info                              │
│   Risk Score: Likelihood (1-5) × Impact (1-5) = 1-25                                  │
│                                                                                       │
│   PHASE 4: RECOMMENDATIONS                                                            │
│   ────────────────────────                                                            │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                                │
│   │  Generate   │──▶│   Deal      │──▶│   Export    │                                │
│   │  Summary    │   │   Rec       │   │   Report    │                                │
│   └─────────────┘   └─────────────┘   └─────────────┘                                │
│                                                                                       │
│   Recommendations: PROCEED | PROCEED WITH CAUTION | DO NOT PROCEED                    │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Export Generation Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           EXPORT GENERATION WORKFLOW                                  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│   PDF EXPORT                                                                          │
│   ──────────                                                                          │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐     │
│   │  Select   │──▶│   Load    │──▶│  Generate │──▶│   Add     │──▶│  Stream   │     │
│   │ Template  │   │   Data    │   │   Pages   │   │  Charts   │   │   File    │     │
│   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘     │
│                                                                                       │
│   Templates: LBO Report | 3-Statement | 13-Week CF | Custom                           │
│                                                                                       │
│   POWERPOINT EXPORT                                                                   │
│   ─────────────────                                                                   │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐     │
│   │  Select   │──▶│   Build   │──▶│   Add     │──▶│  Format   │──▶│  Stream   │     │
│   │   Type    │   │  Slides   │   │ Charts/   │   │  Styling  │   │   File    │     │
│   │           │   │           │   │  Tables   │   │           │   │           │     │
│   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘     │
│                                                                                       │
│   Types: LBO Presentation | Valuation Deck | Scenario Comparison | Custom             │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Reference

### Complete Endpoint List

#### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login and get tokens | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout and revoke token | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update user profile | Yes |
| POST | `/change-password` | Change password | Yes |

#### Financial Models (`/api/v1/models`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create new model | Yes |
| GET | `/` | List user's models | Yes |
| GET | `/{id}` | Get model by ID | Yes |
| PUT | `/{id}` | Update model | Yes |
| DELETE | `/{id}` | Delete (archive) model | Yes |
| PUT | `/{id}/cells` | Batch update cells | Yes |
| POST | `/{id}/calculate` | Trigger recalculation | Yes |
| POST | `/lbo/analyze` | Run LBO analysis | No |
| POST | `/lbo/sensitivity` | LBO sensitivity analysis | No |

#### Valuations (`/api/v1/valuations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/dcf` | DCF valuation | No |
| POST | `/comps` | Trading comparables | No |
| POST | `/precedents` | Precedent transactions | No |

#### Deal Analysis (`/api/v1/deals`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/merger/accretion` | M&A accretion/dilution | No |
| POST | `/spinoff` | Spin-off analysis | No |
| POST | `/contribution` | Contribution analysis | No |

#### Collaboration (`/api/v1/collaboration`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| WS | `/ws/models/{id}` | Real-time WebSocket | Yes |
| POST | `/comments` | Create comment | Yes |
| GET | `/comments` | Get comments for model | Yes |
| PUT | `/comments/{id}` | Update/resolve comment | Yes |
| DELETE | `/comments/{id}` | Delete comment | Yes |
| POST | `/annotations` | Create annotation | Yes |
| GET | `/annotations` | Get annotations | Yes |
| DELETE | `/annotations/{id}` | Delete annotation | Yes |
| GET | `/presence/{model_id}` | Get active users | Yes |

#### Industry Models (`/api/v1/industry`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/sale-leaseback/analyze` | Sale-leaseback analysis | No |
| POST | `/sale-leaseback/sensitivity` | Sale-leaseback sensitivity | No |
| POST | `/reit/analyze` | REIT valuation | No |
| POST | `/reit/ffo-affo` | FFO/AFFO calculation | No |
| POST | `/reit/sensitivity` | REIT sensitivity | No |
| POST | `/nav/analyze` | NAV calculation | No |
| POST | `/nav/sotp` | Sum-of-the-parts | No |
| POST | `/nav/sensitivity` | NAV sensitivity | No |

#### Bespoke Transactions (`/api/v1/bespoke`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/spinoff/analyze` | Spin-off analysis | No |
| POST | `/spinoff/value-creation` | Value creation | No |
| POST | `/ip-licensing/analyze` | IP licensing analysis | No |
| POST | `/ip-licensing/valuation` | IP license valuation | No |
| POST | `/rmt/analyze` | RMT analysis | No |
| POST | `/rmt/tax-analysis` | RMT tax implications | No |
| POST | `/rmt/accretion-dilution` | RMT accretion/dilution | No |

#### Due Diligence (`/api/v1/due-diligence`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/analyze` | Comprehensive DD analysis | No |
| POST | `/checklist/{vertical}` | Vertical-specific checklist | No |
| POST | `/qoe` | Quality of Earnings | No |
| POST | `/risk-matrix` | Risk matrix calculation | No |
| POST | `/findings/summarize` | Summarize findings | No |
| POST | `/recommendations` | Get recommendations | No |
| GET | `/verticals` | List available verticals | No |
| GET | `/categories` | List finding categories | No |
| GET | `/severities` | List severity levels | No |

#### Export (`/api/v1/export`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/pdf/lbo` | Generate LBO PDF | No |
| POST | `/pdf/three-statement` | Generate 3-statement PDF | No |
| POST | `/pdf/13-week-cash-flow` | Generate 13-week CF PDF | No |
| POST | `/pdf/custom` | Generate custom PDF | No |
| POST | `/pptx/lbo` | Generate LBO presentation | No |
| POST | `/pptx/valuation` | Generate valuation deck | No |
| POST | `/pptx/scenario-comparison` | Scenario comparison | No |
| POST | `/pptx/custom` | Generate custom PPTX | No |
| GET | `/templates` | List report templates | No |
| POST | `/templates` | Create custom template | No |
| DELETE | `/templates/{id}` | Delete template | No |

#### Excel Add-in (`/api/v1/excel`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/get-value` | Fetch value from model | No |
| POST | `/create-link` | Create bidirectional link | No |
| POST | `/scenario-value` | Get scenario-specific value | No |
| POST | `/sync` | Sync cell change | No |
| POST | `/sync-batch` | Batch sync operations | No |
| POST | `/sensitivity` | Calculate sensitivity | No |
| POST | `/audit` | Get cell audit info | No |
| POST | `/comments` | Get cell comments | No |
| POST | `/unlink` | Remove cell link | No |
| GET | `/links/{client_id}` | Get client's linked cells | No |
| WS | `/ws` | Real-time Excel sync | No |

#### Health & Monitoring

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Basic health check | No |
| GET | `/health/live` | Kubernetes liveness | No |
| GET | `/health/ready` | Kubernetes readiness | No |
| GET | `/health/detailed` | Detailed health + metrics | No |
| GET | `/health/version` | Version and build info | No |
| GET | `/metrics` | Prometheus metrics | No |

### API Examples

#### LBO Analysis

```bash
curl -X POST http://localhost:8001/api/v1/models/lbo/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "enterprise_value": 500,
    "equity_purchase_price": 450,
    "senior_debt_amount": 250,
    "senior_debt_rate": 0.06,
    "sponsor_equity": 200,
    "projection_years": 5,
    "revenue_base": 300,
    "revenue_growth_rates": [0.05, 0.05, 0.05, 0.05, 0.05],
    "ebitda_margins": [0.20, 0.21, 0.22, 0.22, 0.23],
    "exit_year": 5,
    "exit_multiple": 8.0
  }'
```

**Response:**
```json
{
  "success": true,
  "outputs": {
    "irr": 0.243,
    "moic": 2.97,
    "entry_ev_ebitda": 8.3,
    "exit_equity_value": 593685,
    "sources": {
      "Senior Debt": 250,
      "Sponsor Equity": 200
    },
    "uses": {
      "Equity Purchase Price": 450
    }
  }
}
```

#### Quality of Earnings

```bash
curl -X POST http://localhost:8001/api/v1/due-diligence/qoe \
  -H "Content-Type: application/json" \
  -d '{
    "reported_ebitda": 10000000,
    "adjustments": [
      {
        "id": "q1",
        "category": "One-time",
        "description": "Legal settlement expense",
        "amount": 500000,
        "is_addback": true,
        "is_recurring": false,
        "confidence_level": 0.95
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "qoe_analysis": {
    "reported_ebitda": 10000000,
    "total_addbacks": 500000,
    "total_deductions": 0,
    "adjusted_ebitda": 10500000,
    "adjustment_count": 1,
    "confidence_weighted_ebitda": 10475000
  }
}
```

---

## WebSocket Real-time

### Connection

```javascript
const ws = new WebSocket(
  `ws://localhost:8001/ws/models/${modelId}?token=${accessToken}`
);

ws.onopen = () => {
  console.log('Connected to model collaboration');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};

ws.onclose = () => {
  console.log('Disconnected');
};
```

### Message Types

| Type | Direction | Payload |
|------|-----------|---------|
| `join` | Server→Client | `{ user_id, user_name }` |
| `leave` | Server→Client | `{ user_id, user_name }` |
| `presence` | Server→Client | `{ users: [...] }` |
| `cursor` | Bidirectional | `{ cell, user_id }` |
| `cell_lock` | Bidirectional | `{ cell, user_id?, user_name? }` |
| `cell_unlock` | Bidirectional | `{ cell }` |
| `cell_update` | Bidirectional | `{ cell, value, formula? }` |
| `comment_add` | Bidirectional | `{ cell, content, user_name }` |
| `comment_update` | Bidirectional | `{ comment_id, content?, is_resolved? }` |
| `comment_delete` | Bidirectional | `{ comment_id }` |
| `ping`/`pong` | Bidirectional | `{}` |
| `error` | Server→Client | `{ code, message }` |

### Cell Locking Example

```javascript
// Request lock before editing
ws.send(JSON.stringify({
  type: 'cell_lock',
  payload: { cell: 'B5' }
}));

// Listen for confirmation
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'cell_lock' && msg.payload.cell === 'B5') {
    // Lock confirmed, safe to edit
    editCell('B5');
  } else if (msg.type === 'error' && msg.payload.code === 'CELL_LOCKED') {
    // Cell is locked by another user
    showLockWarning(msg.payload.message);
  }
};

// Release lock when done
ws.send(JSON.stringify({
  type: 'cell_unlock',
  payload: { cell: 'B5' }
}));
```

---

## Excel Add-in

### Custom Functions (UDFs)

| Function | Description | Example |
|----------|-------------|---------|
| `=FP.GET(model, cell, [version])` | Fetch value from platform | `=FP.GET("LBO/Deal1", "IRR")` |
| `=FP.LINK(model, cell)` | Bidirectional sync link | `=FP.LINK("DCF/Base", "WACC")` |
| `=FP.SCENARIO(name, cell)` | Scenario-specific value | `=FP.SCENARIO("Bear_Case", "B5")` |
| `=FP.LIVE(source, id, field)` | Streaming real-time data | `=FP.LIVE("market", "AAPL", "price")` |
| `=FP.SENSITIVITY(in, out, steps)` | Sensitivity table | `=FP.SENSITIVITY("B2", "C10", 10)` |
| `=FP.AUDIT(cell, field)` | Audit information | `=FP.AUDIT("B5", "last_modified_by")` |
| `=FP.COMMENT(cell)` | Get latest comment | `=FP.COMMENT("B5")` |

### Task Pane Tabs

| Tab | Features |
|-----|----------|
| **Home** | Connection status, Quick function insertion, Function reference |
| **Links** | View linked cells, Refresh values, Unlink cells, Navigate to cells |
| **Sync** | Online/offline status, Pending operations, Force sync, Clear cache |
| **Settings** | Account management, Theme toggle, Auto-sync config, API URL |

### Offline Support

The add-in supports full offline operation:

1. **IndexedDB Storage** - Pending operations stored locally
2. **Value Cache** - Fetched values cached for offline access
3. **Auto-Sync** - Changes sync when connection restored
4. **Conflict Resolution** - Last-write-wins with timestamps

---

## Testing

### Backend Tests (196 total)

```bash
cd backend

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=core --cov=services --cov-report=html

# Run specific test files
pytest tests/test_lbo_model.py -v          # 13 tests
pytest tests/test_auth.py -v               # 8 tests
pytest tests/test_websocket.py -v          # 12 tests
pytest tests/test_financial_models.py -v   # 23 tests
pytest tests/test_export.py -v             # 28 tests
pytest tests/test_excel_api.py -v          # 21 tests
pytest tests/test_industry_models.py -v    # 21 tests
pytest tests/test_bespoke_models.py -v     # 24 tests
pytest tests/test_due_diligence.py -v      # 16 tests
pytest tests/test_production.py -v         # 30 tests
```

### Test Coverage by Module

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| `test_lbo_model.py` | 13 | LBO calculations, IRR/MOIC, debt schedules |
| `test_auth.py` | 8 | Registration, login, JWT, password hashing |
| `test_websocket.py` | 12 | Connection, presence, cell locking, comments |
| `test_financial_models.py` | 23 | 3-statement, operating, 13-week models |
| `test_export.py` | 28 | PDF generation, PPTX, templates |
| `test_excel_api.py` | 21 | Custom functions, sync, links |
| `test_industry_models.py` | 21 | Sale-leaseback, REIT, NAV |
| `test_bespoke_models.py` | 24 | Spinoff, IP licensing, RMT |
| `test_due_diligence.py` | 16 | Checklists, QoE, risk matrix |
| `test_production.py` | 30 | Rate limiting, logging, error handling |

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test -- --coverage
```

### End-to-End Testing Checklist

- [ ] User registration and login
- [ ] Create new LBO model
- [ ] Input assumptions
- [ ] Verify real-time calculation updates
- [ ] Open model in Excel add-in
- [ ] Modify cell in Excel, verify web sync
- [ ] View stakeholder dashboard
- [ ] Export to PDF
- [ ] Export to PowerPoint
- [ ] Create scenario branch
- [ ] Compare scenarios
- [ ] Add comments
- [ ] Resolve comments
- [ ] Test offline mode in Excel

---

## Docker Deployment

### Quick Start

```bash
# Clone and navigate
cd micro1

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Mode

```bash
# Start with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Includes:
# - Backend with uvicorn --reload
# - Frontend with Vite dev server
# - pgAdmin at http://localhost:5050
# - Redis Commander at http://localhost:8081
```

### Production Mode

```bash
# Start with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Includes:
# - Optimized builds
# - Resource limits
# - Multiple replicas
# - Environment validation
```

### Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Docker Network (fmp-network)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────────────────┐  │
│   │ Frontend │◀──▶│ Backend  │◀──▶│ PostgreSQL + Redis   │  │
│   │ (nginx)  │    │ (FastAPI)│    │                      │  │
│   │ :3000    │    │ :8001    │    │ :5432      :6379     │  │
│   └──────────┘    └──────────┘    └──────────────────────┘  │
│                                                              │
│   Optional:                                                  │
│   ┌──────────┐    ┌──────────────┐    ┌────────────────┐    │
│   │ MinIO    │    │ pgAdmin      │    │ Redis Commander│    │
│   │ :9000    │    │ :5050        │    │ :8081          │    │
│   └──────────┘    └──────────────┘    └────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Volumes

| Volume | Purpose |
|--------|---------|
| `fmp-postgres-data` | PostgreSQL data persistence |
| `fmp-redis-data` | Redis AOF persistence |
| `fmp-backend-logs` | Application logs |
| `fmp-backend-data` | Uploaded files, exports |
| `fmp-minio-data` | S3-compatible object storage |

### Health Checks

```bash
# Backend health
curl http://localhost:8001/health

# Frontend health
curl http://localhost:3000/health

# Detailed health with system metrics
curl http://localhost:8001/health/detailed

# Prometheus metrics
curl http://localhost:8001/metrics
```

---

## Environment Variables

### Backend Configuration

```env
# Application
APP_NAME="Financial Modeling Platform"
DEBUG=true
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/finmodel
DATABASE_ECHO=false

# Redis
REDIS_URL=redis://localhost:6379/0

# Authentication
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Storage (S3/MinIO)
S3_ENDPOINT_URL=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET_NAME=finmodel-storage

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Frontend Configuration

```env
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
```

### Docker Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | fmp_user | PostgreSQL username |
| `POSTGRES_PASSWORD` | fmp_password | PostgreSQL password |
| `POSTGRES_DB` | financial_platform | Database name |
| `REDIS_URL` | redis://redis:6379/0 | Redis connection |
| `SECRET_KEY` | (required) | JWT signing key |
| `VITE_API_URL` | http://localhost:8001 | Backend API URL |
| `VITE_WS_URL` | ws://localhost:8001 | WebSocket URL |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.109+ | Web framework |
| SQLAlchemy | 2.0+ | ORM |
| PostgreSQL | 14+ | Database |
| Redis | 7+ | Cache, sessions |
| Alembic | 1.13+ | Migrations |
| python-jose | 3.3+ | JWT |
| bcrypt | 4.0+ | Password hashing |
| numpy | 1.26+ | Calculations |
| pandas | 2.2+ | Data analysis |
| ReportLab | 4.0+ | PDF generation |
| python-pptx | 0.6+ | PPTX generation |
| pytest | 8.0+ | Testing |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| TypeScript | 5.3 | Type safety |
| Redux Toolkit | 2.0 | State management |
| React Router | 6.21 | Routing |
| AG Grid | 31.0 | Spreadsheet |
| Recharts | 2.10 | Charts |
| Visx | 3.5 | Visualizations |
| Zustand | 4.4 | UI state |
| Axios | 1.6 | HTTP client |
| Tailwind CSS | 3.4 | Styling |
| Vite | 5.0 | Build tool |
| Vitest | 1.0 | Testing |

### Excel Add-in

| Technology | Version | Purpose |
|------------|---------|---------|
| Office.js | Latest | Excel integration |
| React | 18.2 | Task pane UI |
| TypeScript | 5.3 | Type safety |
| IndexedDB | Native | Offline storage |

---

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and write tests
4. Run tests: `pytest tests/ -v`
5. Commit: `git commit -m 'Add new feature'`
6. Push: `git push origin feature/new-feature`
7. Open a Pull Request

### Code Style

- **Python**: Black formatter, Ruff linter, MyPy type checking
- **TypeScript**: ESLint with React plugin, Prettier
- **Commits**: Conventional commits format

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Type annotations complete

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Links

- [API Documentation (Swagger)](http://localhost:8001/docs)
- [API Documentation (ReDoc)](http://localhost:8001/redoc)
- [Frontend Application](http://localhost:3000)
- [Health Check](http://localhost:8001/health)
- [Prometheus Metrics](http://localhost:8001/metrics)

---

<div align="center">

**Financial Modeling Platform** - Built with Python, React, and TypeScript

Phase 10 Complete | 196 Tests Passing | Production Ready

</div>
