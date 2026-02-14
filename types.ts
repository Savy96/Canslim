export enum AnalysisStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NEUTRAL = 'NEUTRAL',
  UNKNOWN = 'UNKNOWN'
}

export interface CanslimCriterion {
  letter: string;
  name: string;
  description: string;
  status: AnalysisStatus;
  finding: string;
  dataPoints?: string[];
}

export interface StockAnalysis {
  symbol: string;
  companyName: string;
  currentPrice: string;
  canslimScore: number; // 0 to 100
  criteria: {
    C: CanslimCriterion;
    A: CanslimCriterion;
    N: CanslimCriterion;
    S: CanslimCriterion;
    L: CanslimCriterion;
    I: CanslimCriterion;
    M: CanslimCriterion;
  };
  summary: string;
  epsTrend: { quarter: string; value: number }[];
  sources: { title: string; uri: string }[];
}

export interface DiscoveryResult {
  candidates: { symbol: string; reason: string }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
