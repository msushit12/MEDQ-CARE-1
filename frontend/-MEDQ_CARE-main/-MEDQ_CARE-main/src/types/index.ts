export type AgentName = 'ATLAS' | 'ORACLE' | 'PULSE';
export type AgentSignal = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'UNAVAILABLE';
export type FinalSignal = 'BUY' | 'HOLD' | 'SELL';
export type RiskLevel = 'Conservative' | 'Moderate' | 'Aggressive';
export type InvestmentGoal = 'Wealth preservation' | 'Long-term growth' | 'Balanced growth' | 'Higher-risk opportunity';
export type TimeHorizon = 'Short' | 'Medium' | 'Long';

export interface InvestorProfile {
  riskLevel: RiskLevel;
  goal: InvestmentGoal;
  horizon: TimeHorizon;
}

export interface Portfolio {
  totalValue: number;
  cashBalance: number;
  concentrationScore: number;
  riskScore: number;
  topSector: string;
  allocations: { sector: string; percentage: number; status: string }[];
  holdings: any[];
}

export interface MarketData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: string;
  peRatio: number;
  momentum: number;
  trend: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  rsi: number;
  macd: { value: number; signal: number; histogram: number; };
  bollinger: { upper: number; middle: number; lower: number; };
  history: { timestamp: string; price: number; volume: number; ma20: number; ma50: number; }[];
}

export interface ReasoningTraceEvent {
  id: string;
  timestamp: string;
  stage: string;
  source: string;
  action: string;
  details: string;
  status: 'INIT' | 'RUNNING' | 'SUCCESS' | 'WARNING' | 'ERROR';
  durationMs?: number;
  confidence?: number;
}

export interface CouncilVerdict {
  symbol: string;
  stockName: string;
  timestamp: string;
  finalSignal: FinalSignal;
  overallConfidence: number;
  confidenceContributors: { technical: number; fundamental: number; sentiment: number; };
  confidenceBreakdown: any;
  confidenceWeather: 'CLEAR' | 'CLOUDY' | 'STORM';
  weatherReason: string;
  synthesisSummary: string;
  whyThisMattersToYou: string;
  whatCouldChangeVerdict: string[];
  riskAdjustedConviction: 'HIGH' | 'MODERATE' | 'LOW' | 'CAUTIONARY';
  portfolioImpact: { concentrationWarning: boolean; sectorExposure: number; sectorName: string; message: string; };
  evidenceStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  dataQuality: 'PRISTINE' | 'ADEQUATE' | 'DEGRADED';
  dataQualityWarning?: string;
  councilDisagreement: boolean;
  disagreementDetails?: string;
  agents: {
    atlas: any;
    oracle: any;
    pulse: any;
  };
  trace: ReasoningTraceEvent[];
  executionDurationTotalMs: number;
}

export interface SystemHealthState {
  feeds: { marketData: boolean; documentRetrieval: boolean; sentimentFeed: boolean; aiOrchestrator: boolean; portfolioService: boolean; };
  latencies: { atlasMs: number; oracleMs: number; pulseMs: number; orchestratorTotalMs: number; };
  sessionMetrics: { queriesRun: number; avgConfidence: number; degradedExecutions: number; lastQueryTimestamp: string; };
}
