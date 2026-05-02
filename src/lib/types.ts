export type TestType = 'gaming' | 'streaming' | 'vpn' | 'web3' | 'ping-test' | 'jitter-test' | 'packet-loss-test' | 'latency-test' | 'internet-speed-test';

export type ReadinessLevel = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type AudienceStatus = 'Ready' | 'Borderline' | 'Upgrade needed';

export interface AudienceAssessment {
  title: string;
  status: AudienceStatus;
  detail: string;
}

export interface ResultFact {
  label: string;
  value: string;
}

export interface BrowserNetworkHints {
  transport: string;
  effectiveType?: string;
  downlinkMbps?: number;
  rttMs?: number;
  saveData?: boolean;
}

export interface SharedDiagnosticFields {
  headline: string;
  summary: string;
  confidence: ConfidenceLevel;
  recommendations: string[];
  audience: AudienceAssessment[];
  facts: ResultFact[];
  measuredWith?: string;
  samples?: number;
  networkHints?: BrowserNetworkHints;
  [key: string]: unknown;
}

export interface GamingResults extends SharedDiagnosticFields {
  ping: number;
  jitter: number;
  packetLoss: number;
  minLatency?: number;
  maxLatency?: number;
  bufferbloat?: number;
  score: number;
}

export interface StreamingResults extends SharedDiagnosticFields {
  downloadSpeed: number;
  uploadSpeed?: number;
  latency?: number;
  jitter?: number;
  packetLoss?: number;
  stability: ReadinessLevel;
  bufferRisk: ReadinessLevel;
  bufferbloat?: number;
  simultaneous4kStreams?: number;
  creatorProfile?: string;
  score: number;
}

export interface InternetResults extends StreamingResults {
  homeProfile?: string;
}

export interface VPNResults extends SharedDiagnosticFields {
  vpnDetected: boolean;
  proxyUsage: boolean;
  ipType: 'Hosted' | 'Residential' | 'Unknown';
  latencyImpact: number;
  webrtcLeak?: boolean;
  relayConfidence?: ConfidenceLevel;
  score: number;
}

export interface Web3Results extends SharedDiagnosticFields {
  bitcoin: number;
  ethereum: number;
  base: number;
  arbitrum: number;
  solana: number;
  score: number;
}

export interface AffiliateRecommendation {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
  type: 'vpn' | 'router' | 'isp' | 'hosting';
}

export interface ConnectionInfo {
  isp: string;
  location: string;
  type: string;
  status: string;
  network?: string;
  colo?: string;
}

export type AnyResult = (GamingResults | StreamingResults | InternetResults | VPNResults | Web3Results) & {
  connectionInfo?: ConnectionInfo;
  [key: string]: unknown;
};

export interface AllResults {
  gaming?: GamingResults;
  streaming?: StreamingResults;
  'internet-speed-test'?: InternetResults;
  vpn?: VPNResults;
  web3?: Web3Results;
  globalScore?: number;
}

export type QualityGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface TestProgress {
  phase: 'idle' | 'connecting' | 'ping' | 'download' | 'upload' | 'complete';
  percent: number;
  currentPing?: number;
  currentDownload?: number;
  currentUpload?: number;
  pingHistory: number[];
  logs: string[];
}

export interface TestHistoryEntry {
  id: string;
  timestamp: number;
  type: TestType;
  score: number;
  metrics: AnyResult;
}
