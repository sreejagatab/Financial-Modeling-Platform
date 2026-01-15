// Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIScenario {
  id: string;
  name: string;
  type: 'bull' | 'base' | 'bear' | 'stress';
  description: string;
  assumptions: Record<string, number>;
  reasoning: string;
  probability: number;
}

export interface AIInsight {
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

export interface AIAssumption {
  id: string;
  name: string;
  suggestedValue: number;
  unit: string;
  category: string;
  industry: string;
  confidence: number;
  percentile: number;
  range: { min: number; max: number; median: number };
  source: string;
  rationale: string;
}

export interface AIComparable {
  id: string;
  name: string;
  ticker: string;
  industry: string;
  marketCap: number;
  revenue: number;
  ebitda: number;
  evRevenue: number;
  evEbitda: number;
  peRatio: number;
  revenueGrowth: number;
  ebitdaMargin: number;
  relevanceScore: number;
  reasoning: string;
}

export interface AIRiskAssessment {
  overallScore: number;
  category: 'low' | 'medium' | 'high' | 'critical';
  risks: Array<{
    id: string;
    title: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }>;
  summary: string;
  recommendations: string[];
}

export interface AIDocumentInsight {
  documentName: string;
  summary: string;
  keyFindings: Array<{
    category: string;
    finding: string;
    importance: 'high' | 'medium' | 'low';
    pageReference?: number;
  }>;
  financialMetrics: Record<string, number>;
  risks: string[];
  opportunities: string[];
}

// Mock AI responses (simulating backend AI service)
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// AI Service
export const aiService = {
  // Chat Assistant
  async sendMessage(messages: AIMessage[], _context?: string): Promise<AIMessage> {
    await simulateDelay(1000 + Math.random() * 1000);

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content.toLowerCase();

    let response = '';

    if (userQuery.includes('dcf') || userQuery.includes('discounted cash flow')) {
      response = `**DCF Valuation Guide**\n\nA DCF model values a company based on the present value of its expected future cash flows. Key steps:\n\n1. **Project Free Cash Flows** - Typically 5-10 years\n2. **Calculate WACC** - Your discount rate based on cost of equity and debt\n3. **Determine Terminal Value** - Using perpetuity growth or exit multiple\n4. **Discount to Present Value** - Apply WACC to all cash flows\n5. **Calculate Equity Value** - Subtract net debt from enterprise value\n\n**Tips:**\n- Use conservative growth rates (2-3% terminal)\n- Sensitize on WACC (±1%) and growth\n- Cross-check with trading comps\n\nWould you like me to help you build a specific DCF model?`;
    } else if (userQuery.includes('lbo') || userQuery.includes('leveraged buyout')) {
      response = `**LBO Modeling Best Practices**\n\nAn LBO model evaluates returns for a leveraged acquisition. Key components:\n\n1. **Sources & Uses** - How the deal is financed\n2. **Debt Schedule** - Senior, sub debt, revolver\n3. **Operating Model** - Revenue, EBITDA projections\n4. **Cash Flow Sweep** - Mandatory & optional prepayments\n5. **Returns Analysis** - IRR and MOIC calculations\n\n**Target Returns:**\n- IRR: 20-25%+ typically required\n- MOIC: 2.0-3.0x over 5 years\n- Max leverage: 4-6x EBITDA\n\n**Key Sensitivities:**\n- Entry/exit multiple\n- EBITDA growth\n- Debt paydown\n\nNeed help structuring your LBO?`;
    } else if (userQuery.includes('wacc') || userQuery.includes('cost of capital')) {
      response = `**WACC Calculation**\n\nWACC = (E/V × Re) + (D/V × Rd × (1-T))\n\nWhere:\n- E = Market value of equity\n- D = Market value of debt\n- V = E + D (total value)\n- Re = Cost of equity (use CAPM)\n- Rd = Cost of debt\n- T = Tax rate\n\n**CAPM for Cost of Equity:**\nRe = Rf + β × (Rm - Rf)\n\n**Typical Ranges:**\n- Risk-free rate: 4-5% (10Y Treasury)\n- Equity risk premium: 5-6%\n- Beta: 0.8-1.5 depending on industry\n- WACC result: 8-12% for most companies\n\nWant me to calculate WACC for your specific case?`;
    } else if (userQuery.includes('multiple') || userQuery.includes('valuation multiple')) {
      response = `**Valuation Multiples Guide**\n\n**Enterprise Value Multiples:**\n- EV/Revenue: 1-5x (SaaS: 5-15x)\n- EV/EBITDA: 8-15x (varies by industry)\n- EV/EBIT: 10-18x\n\n**Equity Multiples:**\n- P/E Ratio: 15-25x\n- P/B Ratio: 1-3x\n- PEG Ratio: 1-2x\n\n**Industry Benchmarks:**\n- Technology: Higher multiples (growth)\n- Industrials: 6-10x EBITDA\n- Healthcare: 10-15x EBITDA\n- Consumer: 8-12x EBITDA\n\n**Selection Tips:**\n- Use EV multiples for capital structure neutrality\n- Match LTM vs NTM consistently\n- Consider growth rates when comparing\n\nWhat industry are you analyzing?`;
    } else if (userQuery.includes('assumption') || userQuery.includes('growth rate')) {
      response = `**Financial Assumptions Best Practices**\n\n**Revenue Growth:**\n- Early stage: 20-50%+\n- Growth stage: 10-20%\n- Mature: 2-5%\n- Terminal: GDP growth (2-3%)\n\n**Margins:**\n- Gross margin: Industry dependent\n- EBITDA margin: 15-30% typical\n- Net margin: 5-15%\n\n**Working Capital:**\n- DSO: 30-60 days\n- DIO: 30-90 days\n- DPO: 30-60 days\n\n**CapEx:**\n- Maintenance: 2-3% of revenue\n- Growth: 5-10% of revenue\n\nNeed industry-specific assumptions? Tell me your sector!`;
    } else if (userQuery.includes('hello') || userQuery.includes('hi') || userQuery.includes('hey')) {
      response = `Hello! I'm your AI Financial Modeling Assistant. I can help you with:\n\n- **DCF Valuations** - Building and reviewing models\n- **LBO Analysis** - Returns, debt structuring\n- **M&A Modeling** - Accretion/dilution, synergies\n- **Comps Analysis** - Finding and analyzing comparables\n- **Assumptions** - Industry benchmarks and best practices\n- **Excel Tips** - Formulas, shortcuts, best practices\n\nWhat would you like help with today?`;
    } else {
      response = `I can help you with that! Here are some resources:\n\n**For Financial Modeling:**\n- DCF, LBO, and M&A model structures\n- Industry-standard assumptions\n- Sensitivity analysis techniques\n\n**For Valuations:**\n- Trading comps methodology\n- Precedent transactions\n- Football field analysis\n\n**For Deal Analysis:**\n- Due diligence best practices\n- Risk assessment frameworks\n- Return optimization\n\nCould you provide more details about what you're working on? I'll give you specific guidance.`;
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
  },

  // Scenario Generator
  async generateScenarios(
    _modelType: string,
    baseAssumptions: Record<string, number>,
    industry?: string
  ): Promise<AIScenario[]> {
    await simulateDelay(2000 + Math.random() * 1000);

    const baseGrowth = baseAssumptions.revenueGrowth || 0.10;
    const baseMargin = baseAssumptions.ebitdaMargin || 0.20;

    return [
      {
        id: 'scenario_bull',
        name: 'Bull Case',
        type: 'bull',
        description: 'Optimistic scenario with strong market tailwinds and successful execution',
        assumptions: {
          revenueGrowth: baseGrowth * 1.5,
          ebitdaMargin: baseMargin * 1.15,
          exitMultiple: 12,
          capexPercent: 0.03,
          workingCapitalPercent: 0.08,
        },
        reasoning: `Based on ${industry || 'industry'} analysis, bull case assumes: (1) Market share gains from weaker competitors, (2) Successful new product launches driving 50% higher growth, (3) Operating leverage improving margins by 15%, (4) Premium exit multiple reflecting strategic value.`,
        probability: 0.25,
      },
      {
        id: 'scenario_base',
        name: 'Base Case',
        type: 'base',
        description: 'Most likely scenario based on current trajectory and market conditions',
        assumptions: {
          revenueGrowth: baseGrowth,
          ebitdaMargin: baseMargin,
          exitMultiple: 10,
          capexPercent: 0.04,
          workingCapitalPercent: 0.10,
        },
        reasoning: `Base case reflects management guidance and consensus estimates. Assumes: (1) Continuation of current growth trends, (2) Stable competitive positioning, (3) Gradual margin improvement from scale, (4) Exit at current market multiples.`,
        probability: 0.50,
      },
      {
        id: 'scenario_bear',
        name: 'Bear Case',
        type: 'bear',
        description: 'Conservative scenario accounting for potential headwinds',
        assumptions: {
          revenueGrowth: baseGrowth * 0.5,
          ebitdaMargin: baseMargin * 0.85,
          exitMultiple: 8,
          capexPercent: 0.05,
          workingCapitalPercent: 0.12,
        },
        reasoning: `Bear case accounts for: (1) Economic slowdown reducing demand, (2) Increased competition pressuring pricing, (3) Margin compression from input cost inflation, (4) Multiple contraction in risk-off environment.`,
        probability: 0.20,
      },
      {
        id: 'scenario_stress',
        name: 'Stress Test',
        type: 'stress',
        description: 'Extreme downside scenario for risk assessment',
        assumptions: {
          revenueGrowth: baseGrowth * 0.25,
          ebitdaMargin: baseMargin * 0.70,
          exitMultiple: 6,
          capexPercent: 0.06,
          workingCapitalPercent: 0.15,
        },
        reasoning: `Stress scenario models severe conditions: (1) Recession-level demand destruction, (2) Major competitive disruption, (3) Significant margin erosion, (4) Distressed exit conditions. Used for downside protection analysis.`,
        probability: 0.05,
      },
    ];
  },

  // AI Insights
  async getInsights(_models: any[], _userId?: string): Promise<AIInsight[]> {
    await simulateDelay(1500 + Math.random() * 1000);

    return [
      {
        id: 'insight_1',
        type: 'opportunity',
        title: 'Valuation Upside Potential',
        description: 'Based on recent market trends, your Tech Corp DCF model may be undervaluing the company by 15-20%. Comparable transactions in Q4 showed premium multiples.',
        impact: 'high',
        confidence: 0.85,
        relatedModel: 'Tech Corp DCF',
        actionItems: [
          'Review exit multiple assumptions against recent transactions',
          'Consider adjusting terminal growth rate',
          'Run sensitivity analysis on WACC',
        ],
        metrics: {
          currentValuation: 850,
          suggestedValuation: 1020,
          upside: 0.20,
        },
      },
      {
        id: 'insight_2',
        type: 'risk',
        title: 'Leverage Ratio Concern',
        description: 'The Acme LBO model shows debt/EBITDA of 6.2x, which exceeds typical lender thresholds. Consider restructuring the capital stack.',
        impact: 'high',
        confidence: 0.92,
        relatedModel: 'Acme Corp LBO',
        actionItems: [
          'Reduce senior debt by $50M',
          'Explore mezzanine financing options',
          'Negotiate equity co-invest from management',
        ],
        metrics: {
          currentLeverage: 6.2,
          targetLeverage: 5.0,
          debtReduction: 50,
        },
      },
      {
        id: 'insight_3',
        type: 'recommendation',
        title: 'Model Optimization Available',
        description: 'AI analysis detected that 3 of your models share similar assumptions. Consider creating a linked template to improve consistency and reduce errors.',
        impact: 'medium',
        confidence: 0.78,
        actionItems: [
          'Create master assumptions template',
          'Link common inputs across models',
          'Set up automatic sync for market data',
        ],
      },
      {
        id: 'insight_4',
        type: 'trend',
        title: 'Market Multiple Expansion',
        description: 'Healthcare sector EV/EBITDA multiples have expanded 1.5x over the past quarter. Your HealthCo valuation may need updating.',
        impact: 'medium',
        confidence: 0.88,
        relatedModel: 'HealthCo Valuation',
        metrics: {
          previousMultiple: 12.5,
          currentMultiple: 14.0,
          change: 0.12,
        },
      },
      {
        id: 'insight_5',
        type: 'anomaly',
        title: 'Working Capital Anomaly',
        description: 'Detected unusual working capital pattern in Retail Co model. Days Sales Outstanding jumped 40% vs industry average.',
        impact: 'low',
        confidence: 0.72,
        relatedModel: 'Retail Co Analysis',
        actionItems: [
          'Verify DSO assumptions with management',
          'Check for seasonality adjustments',
          'Compare against peer benchmarks',
        ],
      },
    ];
  },

  // Assumptions Helper
  async getAssumptionSuggestions(
    industry: string,
    companySize: 'small' | 'medium' | 'large',
    _modelType: string
  ): Promise<AIAssumption[]> {
    await simulateDelay(1500 + Math.random() * 500);

    const industryData: Record<string, any> = {
      technology: {
        revenueGrowth: { min: 0.10, max: 0.40, median: 0.20 },
        ebitdaMargin: { min: 0.15, max: 0.35, median: 0.25 },
        capex: { min: 0.03, max: 0.08, median: 0.05 },
      },
      healthcare: {
        revenueGrowth: { min: 0.05, max: 0.15, median: 0.08 },
        ebitdaMargin: { min: 0.18, max: 0.30, median: 0.22 },
        capex: { min: 0.04, max: 0.10, median: 0.06 },
      },
      manufacturing: {
        revenueGrowth: { min: 0.02, max: 0.08, median: 0.04 },
        ebitdaMargin: { min: 0.10, max: 0.20, median: 0.14 },
        capex: { min: 0.05, max: 0.12, median: 0.07 },
      },
      retail: {
        revenueGrowth: { min: 0.02, max: 0.10, median: 0.05 },
        ebitdaMargin: { min: 0.05, max: 0.15, median: 0.08 },
        capex: { min: 0.02, max: 0.05, median: 0.03 },
      },
      financial: {
        revenueGrowth: { min: 0.03, max: 0.12, median: 0.06 },
        ebitdaMargin: { min: 0.25, max: 0.45, median: 0.35 },
        capex: { min: 0.02, max: 0.05, median: 0.03 },
      },
    };

    const data = industryData[industry.toLowerCase()] || industryData.technology;

    return [
      {
        id: 'assumption_1',
        name: 'Revenue Growth Rate',
        suggestedValue: data.revenueGrowth.median,
        unit: '%',
        category: 'growth',
        industry,
        confidence: 0.85,
        percentile: 50,
        range: data.revenueGrowth,
        source: 'Industry benchmarks, S&P Capital IQ',
        rationale: `Median growth rate for ${companySize} ${industry} companies. Adjust higher for market leaders or emerging segments, lower for mature markets.`,
      },
      {
        id: 'assumption_2',
        name: 'EBITDA Margin',
        suggestedValue: data.ebitdaMargin.median,
        unit: '%',
        category: 'profitability',
        industry,
        confidence: 0.82,
        percentile: 50,
        range: data.ebitdaMargin,
        source: 'Public company filings, industry reports',
        rationale: `Typical EBITDA margin for ${industry} sector. Consider operating leverage potential and competitive positioning when adjusting.`,
      },
      {
        id: 'assumption_3',
        name: 'CapEx (% of Revenue)',
        suggestedValue: data.capex.median,
        unit: '%',
        category: 'capital',
        industry,
        confidence: 0.78,
        percentile: 50,
        range: data.capex,
        source: 'Industry analysis, company guidance',
        rationale: `Maintenance and growth capex combined. ${industry} typically requires ${data.capex.median * 100}% for sustaining operations and growth investments.`,
      },
      {
        id: 'assumption_4',
        name: 'Working Capital (% of Revenue)',
        suggestedValue: 0.10,
        unit: '%',
        category: 'capital',
        industry,
        confidence: 0.75,
        percentile: 50,
        range: { min: 0.05, max: 0.15, median: 0.10 },
        source: 'Industry benchmarks',
        rationale: 'Net working capital as percentage of revenue. Varies significantly by business model - asset-light vs inventory-heavy.',
      },
      {
        id: 'assumption_5',
        name: 'Terminal Growth Rate',
        suggestedValue: 0.025,
        unit: '%',
        category: 'valuation',
        industry,
        confidence: 0.90,
        percentile: 50,
        range: { min: 0.02, max: 0.03, median: 0.025 },
        source: 'Long-term GDP growth estimates',
        rationale: 'Should not exceed long-term GDP growth. 2.5% is standard for US-based companies in stable industries.',
      },
      {
        id: 'assumption_6',
        name: 'WACC',
        suggestedValue: 0.10,
        unit: '%',
        category: 'valuation',
        industry,
        confidence: 0.80,
        percentile: 50,
        range: { min: 0.08, max: 0.14, median: 0.10 },
        source: 'CAPM calculation with industry beta',
        rationale: `Based on current risk-free rate plus equity risk premium adjusted for ${industry} beta. Increase for smaller companies or higher risk profiles.`,
      },
    ];
  },

  // Comparable Companies Finder
  async findComparables(
    targetCompany: {
      name?: string;
      industry: string;
      revenue: number;
      ebitda: number;
      marketCap?: number;
    }
  ): Promise<AIComparable[]> {
    await simulateDelay(2000 + Math.random() * 1000);

    const baseRevenue = targetCompany.revenue || 100000000;

    // Simulated comparable companies based on industry
    const comps: AIComparable[] = [
      {
        id: 'comp_1',
        name: 'Alpha Technologies Inc.',
        ticker: 'ALPH',
        industry: targetCompany.industry,
        marketCap: baseRevenue * 4.5,
        revenue: baseRevenue * 1.2,
        ebitda: baseRevenue * 0.24,
        evRevenue: 4.2,
        evEbitda: 14.5,
        peRatio: 22.3,
        revenueGrowth: 0.18,
        ebitdaMargin: 0.28,
        relevanceScore: 0.92,
        reasoning: 'Closest match based on revenue size, growth profile, and business model. Similar customer base and geographic footprint.',
      },
      {
        id: 'comp_2',
        name: 'Beta Systems Corp.',
        ticker: 'BSYS',
        industry: targetCompany.industry,
        marketCap: baseRevenue * 3.8,
        revenue: baseRevenue * 0.95,
        ebitda: baseRevenue * 0.19,
        evRevenue: 3.5,
        evEbitda: 12.0,
        peRatio: 18.5,
        revenueGrowth: 0.12,
        ebitdaMargin: 0.25,
        relevanceScore: 0.87,
        reasoning: 'Strong operational comparability. Slightly lower growth but similar margin profile and market positioning.',
      },
      {
        id: 'comp_3',
        name: 'Gamma Solutions Ltd.',
        ticker: 'GSOL',
        industry: targetCompany.industry,
        marketCap: baseRevenue * 5.2,
        revenue: baseRevenue * 1.5,
        ebitda: baseRevenue * 0.30,
        evRevenue: 5.0,
        evEbitda: 16.0,
        peRatio: 28.0,
        revenueGrowth: 0.25,
        ebitdaMargin: 0.30,
        relevanceScore: 0.82,
        reasoning: 'Premium valuation comp. Higher growth and margins - useful for bull case benchmarking.',
      },
      {
        id: 'comp_4',
        name: 'Delta Industries',
        ticker: 'DELT',
        industry: targetCompany.industry,
        marketCap: baseRevenue * 2.8,
        revenue: baseRevenue * 0.8,
        ebitda: baseRevenue * 0.14,
        evRevenue: 2.5,
        evEbitda: 9.0,
        peRatio: 14.0,
        revenueGrowth: 0.05,
        ebitdaMargin: 0.22,
        relevanceScore: 0.75,
        reasoning: 'Value comp with lower multiples. Useful for bear case and understanding downside scenarios.',
      },
      {
        id: 'comp_5',
        name: 'Epsilon Group PLC',
        ticker: 'EPSG',
        industry: targetCompany.industry,
        marketCap: baseRevenue * 4.0,
        revenue: baseRevenue * 1.1,
        ebitda: baseRevenue * 0.22,
        evRevenue: 3.8,
        evEbitda: 13.5,
        peRatio: 20.0,
        revenueGrowth: 0.15,
        ebitdaMargin: 0.26,
        relevanceScore: 0.85,
        reasoning: 'International peer with similar scale. Provides geographic diversification perspective.',
      },
    ];

    return comps.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  // Risk Analyzer
  async analyzeRisks(
    findings: Array<{ category: string; severity: string; description: string }>,
    industry: string
  ): Promise<AIRiskAssessment> {
    await simulateDelay(2000 + Math.random() * 1000);

    const likelihoodOptions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const impactOptions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

    const risks = findings.map((finding, index) => {
      const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'critical',
        info: 'low',
      };

      return {
        id: `risk_${index + 1}`,
        title: finding.description.slice(0, 50) + (finding.description.length > 50 ? '...' : ''),
        category: finding.category,
        severity: severityMap[finding.severity] || 'medium',
        likelihood: likelihoodOptions[Math.floor(Math.random() * 3)],
        impact: impactOptions[Math.floor(Math.random() * 3)],
        description: finding.description,
        mitigation: `Conduct detailed ${finding.category.toLowerCase()} review and negotiate appropriate representations and warranties. Consider purchase price adjustment mechanism if material.`,
      };
    });

    const severityScores = { low: 25, medium: 50, high: 75, critical: 100 };
    const avgScore = risks.reduce((sum, r) => sum + severityScores[r.severity], 0) / risks.length || 0;
    const category: 'low' | 'medium' | 'high' | 'critical' = avgScore > 75 ? 'critical' : avgScore > 50 ? 'high' : avgScore > 25 ? 'medium' : 'low';

    return {
      overallScore: Math.round(100 - avgScore), // Invert for "health" score
      category,
      risks,
      summary: `AI analysis identified ${risks.length} risk factors across the ${industry} transaction. Overall risk profile is ${category}. Key concerns center around ${risks[0]?.category || 'operational'} risks requiring immediate attention.`,
      recommendations: [
        `Prioritize mitigation of top ${Math.min(3, risks.length)} risks before closing`,
        'Consider escrow holdback for identified contingencies',
        'Engage specialized advisors for high-impact areas',
        'Develop detailed 100-day integration plan addressing key risks',
        'Establish clear risk ownership in transaction documents',
      ],
    };
  },

  // Document Analyzer
  async analyzeDocument(
    documentName: string,
    documentType: 'financial' | 'legal' | 'operational' | 'market'
  ): Promise<AIDocumentInsight> {
    await simulateDelay(3000 + Math.random() * 1000);

    return {
      documentName,
      summary: `AI analysis of ${documentName} reveals a ${documentType} document containing critical information for deal evaluation. The document spans multiple topics including financial performance, operational metrics, and forward-looking projections.`,
      keyFindings: [
        {
          category: 'Financial Performance',
          finding: 'Revenue CAGR of 15% over past 3 years with accelerating growth in recent quarters',
          importance: 'high',
          pageReference: 12,
        },
        {
          category: 'Profitability',
          finding: 'EBITDA margins expanded 300bps YoY driven by operational efficiencies',
          importance: 'high',
          pageReference: 15,
        },
        {
          category: 'Working Capital',
          finding: 'DSO increased to 45 days from 38 days - potential collection issues',
          importance: 'medium',
          pageReference: 23,
        },
        {
          category: 'Customer Concentration',
          finding: 'Top 3 customers represent 35% of revenue - moderate concentration risk',
          importance: 'medium',
          pageReference: 28,
        },
        {
          category: 'Capital Expenditure',
          finding: 'Planned $25M facility expansion in 2024 - growth investment',
          importance: 'low',
          pageReference: 34,
        },
      ],
      financialMetrics: {
        revenue: 150000000,
        revenueGrowth: 0.15,
        ebitda: 30000000,
        ebitdaMargin: 0.20,
        netIncome: 18000000,
        totalDebt: 45000000,
        cash: 12000000,
      },
      risks: [
        'Customer concentration in top 3 accounts',
        'Increasing DSO may indicate collection challenges',
        'Facility expansion requires significant capital',
        'Key person dependencies in management team',
      ],
      opportunities: [
        'Strong growth trajectory with expanding margins',
        'Operational improvements driving profitability',
        'New facility enables capacity for growth',
        'Market position supports premium valuation',
      ],
    };
  },
};

export default aiService;
