import { CanslimCriterion, AnalysisStatus, StockAnalysis } from './types';

export const CANSLIM_DEFINITIONS: Record<string, Omit<CanslimCriterion, 'status' | 'finding'>> = {
  C: {
    letter: 'C',
    name: 'Current Earnings',
    description: 'Current quarterly earnings per share (EPS) should be up significantly (ideally 25%+) and accelerating compared to the same quarter prior year.'
  },
  A: {
    letter: 'A',
    name: 'Annual Earnings',
    description: 'Annual earnings should show meaningful growth in *each* of the last 3 years. Look for Return on Equity (ROE) of 17% or higher.'
  },
  N: {
    letter: 'N',
    name: 'New Product/Service/Highs',
    description: 'New products, management, or new highs. Stock must emerge from a proper base (Cup with Handle, Double Bottom, Flat Base) at the correct pivot point.'
  },
  S: {
    letter: 'S',
    name: 'Supply and Demand',
    description: 'Volume should dry up during base consolidation and spike (40%+) above average on breakout. Demand must overwhelm supply.'
  },
  L: {
    letter: 'L',
    name: 'Leader or Laggard',
    description: 'Buy the leading stock in a leading industry group. Relative Strength (RS) Rating should be 80+ (preferably 90+).'
  },
  I: {
    letter: 'I',
    name: 'Institutional Sponsorship',
    description: 'Rising institutional ownership in recent quarters. Look for "A+" quality funds taking positions.'
  },
  M: {
    letter: 'M',
    name: 'Market Direction',
    description: '3 out of 4 stocks follow the market trend. Only buy in a confirmed market uptrend (look for follow-through days on indices).'
  }
};

export const INITIAL_ANALYSIS_STATE: StockAnalysis = {
  symbol: '',
  companyName: '',
  currentPrice: '',
  canslimScore: 0,
  criteria: {
    C: { ...CANSLIM_DEFINITIONS.C, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
    A: { ...CANSLIM_DEFINITIONS.A, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
    N: { ...CANSLIM_DEFINITIONS.N, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
    S: { ...CANSLIM_DEFINITIONS.S, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
    L: { ...CANSLIM_DEFINITIONS.L, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
    I: { ...CANSLIM_DEFINITIONS.I, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
    M: { ...CANSLIM_DEFINITIONS.M, status: AnalysisStatus.UNKNOWN, finding: 'Pending analysis...' },
  },
  summary: '',
  epsTrend: [],
  sources: []
};