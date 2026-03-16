export type TestType = 'gaming' | 'streaming' | 'vpn' | 'web3' | 'ping-test' | 'jitter-test' | 'packet-loss-test' | 'latency-test' | 'internet-speed-test';

export interface GamingResults {
  ping: number;
  jitter: number;
  packetLoss: number;
  minLatency?: number;
  maxLatency?: number;
  score: number;
}

export interface StreamingResults {
  downloadSpeed: number;
  stability: 'Low' | 'Medium' | 'High';
  bufferRisk: 'Low' | 'Medium' | 'High';
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

export interface AllResults {
  gaming?: GamingResults;
  streaming?: StreamingResults;
  vpn?: VPNResults;
  web3?: Web3Results;
  globalScore?: number;
}
