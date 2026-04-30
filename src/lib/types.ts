export type TestType = 'gaming' | 'streaming' | 'vpn' | 'web3' | 'ping-test' | 'jitter-test' | 'packet-loss-test' | 'latency-test' | 'internet-speed-test';

export interface GamingResults {
  ping: number;
  jitter: number;
  packetLoss: number;
  minLatency?: number;
  maxLatency?: number;
  bufferbloat?: number;
  score: number;
}

export interface StreamingResults {
  downloadSpeed: number;
  uploadSpeed?: number;
  stability: 'Low' | 'Medium' | 'High';
  bufferRisk: 'Low' | 'Medium' | 'High';
  bufferbloat?: number;
  score: number;
}

export interface VPNResults {
  vpnDetected: boolean;
  proxyUsage: boolean;
  ipType: 'Datacenter' | 'Residential' | 'Unknown';
  latencyImpact: number;
  score: number;
}

export interface Web3Results {
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
}

export type AnyResult = (GamingResults | StreamingResults | VPNResults | Web3Results) & {
  connectionInfo?: ConnectionInfo;
  [key: string]: unknown;
};

export interface AllResults {
  gaming?: GamingResults;
  streaming?: StreamingResults;
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
