
export interface Attachment {
  data: string;
  mimeType: string;
}

export interface CompanyInfo {
  companyName: string;
  businessItem: string;
  devStatus: string;
  targetAudience: string;
  teamInfo: string;
  additionalInfo: string;
  attachments?: Attachment[];
}

export interface MarketData {
  name: string;
  value: number;
}

export interface BusinessPlanData {
  summary: {
    introduction: string;
    differentiation: string;
    targetMarket: string;
    goals: string;
  };
  problem: {
    motivation: string;
    purpose: string;
  };
  solution: {
    devPlan: string;
    stepwisePlan: string;
    budgetTable: Array<{ item: string; period: string; content: string }>;
    customerResponse: string;
    competitorAnalysis: string;
  };
  scaleUp: {
    fundingPlan: string;
    salesPlan: string;
    policyFundPlan: string;
    detailedBudget: Array<{ category: string; basis: string; amount: number }>;
    marketResearchDomestic: MarketData[];
    marketResearchDomesticText: string;
    marketApproachDomestic: string;
    marketPerformanceDomestic: string;
    marketResearchGlobal: MarketData[];
    marketResearchGlobalText: string;
    marketApproachGlobal: string;
    marketPerformanceGlobal: string;
  };
  team: {
    capability: string;
    hiringStatus: string;
    futureHiring: string;
    socialValue: string;
  };
}
