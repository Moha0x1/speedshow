import {
  AudienceAssessment,
  BrowserNetworkHints,
  ConfidenceLevel,
  ConnectionInfo,
  GamingResults,
  InternetResults,
  ResultFact,
  SharedDiagnosticFields,
  StreamingResults,
  VPNResults,
  Web3Results,
} from "@/lib/types";

type LatencyMetrics = {
  latency: number;
  jitter: number;
  packetLoss: number;
  minLatency?: number;
  maxLatency?: number;
  samples?: number;
};

type ThroughputMetrics = LatencyMetrics & {
  downloadSpeed: number;
  uploadSpeed: number;
  bufferbloat: number;
};

type VpnMetrics = LatencyMetrics & {
  latencyImpact: number;
  webrtcLeak: boolean;
};

type Web3Metrics = {
  bitcoin: number;
  ethereum: number;
  base: number;
  arbitrum: number;
  solana: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const safeMetric = (value: number | undefined, fallback = 0) => {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
};

const statusFromScore = (score: number): ConfidenceLevel => {
  if (score >= 80) return "High";
  if (score >= 55) return "Medium";
  return "Low";
};

const readiness = (score: number) => {
  if (score >= 85) return "Ready" as const;
  if (score >= 65) return "Borderline" as const;
  return "Upgrade needed" as const;
};

const quality = (score: number) => {
  if (score >= 85) return "Excellent" as const;
  if (score >= 70) return "Good" as const;
  if (score >= 50) return "Fair" as const;
  return "Poor" as const;
};

const listConnectionFacts = (
  connectionInfo?: ConnectionInfo,
  networkHints?: BrowserNetworkHints,
  measuredWith?: string,
  samples?: number,
): ResultFact[] => {
  const facts: ResultFact[] = [];

  if (connectionInfo?.isp) {
    facts.push({ label: "Network", value: connectionInfo.isp });
  }

  if (connectionInfo?.location) {
    facts.push({ label: "Location", value: connectionInfo.location });
  }

  if (networkHints?.transport && networkHints.transport !== "Unknown") {
    facts.push({ label: "Local link", value: networkHints.transport });
  }

  if (networkHints?.effectiveType) {
    facts.push({ label: "Browser hint", value: networkHints.effectiveType.toUpperCase() });
  }

  if (typeof networkHints?.downlinkMbps === "number") {
    facts.push({ label: "OS estimate", value: `~${round(networkHints.downlinkMbps)} Mbps` });
  }

  if (measuredWith) {
    facts.push({ label: "Measured with", value: measuredWith });
  }

  if (samples) {
    facts.push({ label: "Samples", value: `${samples}` });
  }

  return facts.slice(0, 6);
};

const buildShared = (
  score: number,
  summary: string,
  headline: string,
  recommendations: string[],
  audience: AudienceAssessment[],
  connectionInfo?: ConnectionInfo,
  networkHints?: BrowserNetworkHints,
  measuredWith?: string,
  samples?: number,
): SharedDiagnosticFields => ({
  headline,
  summary,
  confidence: statusFromScore(score),
  recommendations: recommendations.slice(0, 3),
  audience,
  facts: listConnectionFacts(connectionInfo, networkHints, measuredWith, samples),
  measuredWith,
  samples,
  networkHints,
});

export const getBrowserNetworkHints = (): BrowserNetworkHints | undefined => {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  type NavigatorWithConnection = Navigator & {
    connection?: {
      type?: string;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  const connection = (navigator as NavigatorWithConnection).connection;
  if (!connection) {
    return undefined;
  }

  return {
    transport: connection.type || "Unknown",
    effectiveType: connection.effectiveType,
    downlinkMbps: connection.downlink,
    rttMs: connection.rtt,
    saveData: connection.saveData,
  };
};

export const buildGamingResults = (
  metrics: LatencyMetrics,
  connectionInfo?: ConnectionInfo,
  networkHints?: BrowserNetworkHints,
): GamingResults => {
  const ping = safeMetric(metrics.latency, 999);
  const jitter = safeMetric(metrics.jitter, 999);
  const packetLoss = safeMetric(metrics.packetLoss, 100);

  const score = Math.round(
    clamp(
      100
        - ping * 1.1
        - jitter * 3.5
        - packetLoss * 22,
      0,
      100,
    ),
  );

  const competitiveScore = clamp(100 - ping * 1.6 - jitter * 5 - packetLoss * 30, 0, 100);
  const partyScore = clamp(100 - ping * 0.9 - jitter * 2.5 - packetLoss * 12, 0, 100);
  const cloudScore = clamp(100 - ping * 1.2 - jitter * 4 - packetLoss * 18, 0, 100);

  const headline =
    score >= 85
      ? "Competitive-ready latency."
      : score >= 65
        ? "Solid for most online games."
        : "Playable, but the connection is not stable enough for serious matches.";

  const summary = `Browser RTT measured ${ping} ms with ${jitter} ms jitter and ${round(packetLoss)}% packet loss.`;

  const recommendations = [
    packetLoss > 0.5
      ? "Fix packet loss first: use Ethernet, reboot the router, and pause downloads on other devices."
      : "Keep the route stable: Ethernet or strong 5 GHz / Wi-Fi 6 beats weak Wi-Fi for gaming.",
    jitter > 8
      ? "High jitter usually means congestion or weak Wi-Fi. Check background traffic and router QoS/SQM."
      : "Low jitter means the line is stable; keep background traffic low during ranked play.",
    ping > 45
      ? "Server distance or ISP routing is adding delay. Pick nearby regions and test with game-specific routing if needed."
      : "Latency is in a good range; focus on eliminating packet loss and household congestion.",
  ];

  return {
    ping,
    jitter: round(jitter, 1),
    packetLoss: round(packetLoss, 1),
    minLatency: metrics.minLatency,
    maxLatency: metrics.maxLatency,
    score,
    ...buildShared(
      score,
      summary,
      headline,
      recommendations,
      [
        {
          title: "Competitive shooters",
          status: readiness(competitiveScore),
          detail: `Best when RTT stays under 30 ms and packet loss is near zero. You are at ${ping} ms.`,
        },
        {
          title: "Party games and co-op",
          status: readiness(partyScore),
          detail: `Casual play tolerates more delay, but jitter above 10 ms still causes rubber-banding.`,
        },
        {
          title: "Cloud gaming",
          status: readiness(cloudScore),
          detail: `Cloud gaming needs both low delay and stable packets. Jitter is the key risk here.`,
        },
      ],
      connectionInfo,
      networkHints,
      "18 HTTP RTT samples to Cloudflare edge endpoints",
      metrics.samples,
    ),
  };
};

export const buildStreamingResults = (
  metrics: ThroughputMetrics,
  connectionInfo?: ConnectionInfo,
  networkHints?: BrowserNetworkHints,
  variant: "streaming" | "internet-speed-test" = "streaming",
): StreamingResults | InternetResults => {
  const downloadSpeed = round(safeMetric(metrics.downloadSpeed), 1);
  const uploadSpeed = round(safeMetric(metrics.uploadSpeed), 1);
  const latency = safeMetric(metrics.latency, 999);
  const jitter = safeMetric(metrics.jitter, 999);
  const packetLoss = safeMetric(metrics.packetLoss, 100);
  const bufferbloat = safeMetric(metrics.bufferbloat, 0);

  const speedScore = clamp(downloadSpeed * 0.55 + uploadSpeed * 1.8, 0, 100);
  const stabilityPenalty = latency * 0.35 + jitter * 2.4 + packetLoss * 14 + bufferbloat * 0.2;
  const score = Math.round(clamp(speedScore + 30 - stabilityPenalty, 0, 100));
  const simultaneous4kStreams = Math.max(0, Math.floor(downloadSpeed / 25));

  const stabilityScore = clamp(100 - jitter * 4 - packetLoss * 18 - bufferbloat * 0.35, 0, 100);
  const bufferRiskScore = clamp(100 - bufferbloat * 1.3, 0, 100);

  const headline =
    score >= 85
      ? variant === "internet-speed-test"
        ? "Strong home internet with real headroom."
        : "Ready for streaming and creator uploads."
      : score >= 65
        ? variant === "internet-speed-test"
          ? "Good day-to-day internet, but heavy use can expose limits."
          : "Capable for streaming, but not much margin when the line gets busy."
        : variant === "internet-speed-test"
          ? "Usable for basics, but this line will struggle under load."
          : "Throughput is not strong enough for reliable creator or multi-device streaming.";

  const homeProfile =
    downloadSpeed >= 100 && uploadSpeed >= 20
      ? "Plenty of room for 4K, video calls, and cloud backups at the same time."
      : downloadSpeed >= 50 && uploadSpeed >= 10
        ? "Comfortable for work, browsing, and one or two 4K streams."
        : "Fine for light browsing and one main stream, but uploads and busy hours may hurt.";

  const creatorProfile =
    uploadSpeed >= 25
      ? "Strong enough for 1440p or 4K uploads and solid live streaming headroom."
      : uploadSpeed >= 10
        ? "Good for YouTube uploads and 1080p live streaming."
        : "Upload is the bottleneck. Large uploads and livestreams will feel tight.";

  const summary = `${downloadSpeed} Mbps down, ${uploadSpeed} Mbps up, ${latency} ms RTT, ${round(packetLoss)}% loss.`;

  const recommendations = [
    uploadSpeed < 10
      ? "If you stream or upload often, uplink is the first thing to improve. Wired upload tests are worth repeating."
      : "Upload is healthy enough for regular creator work; keep backups and sync jobs off during live sessions.",
    bufferbloat > 30
      ? "Latency spikes under load are high. SQM/QoS or pausing background downloads will help more than raw bandwidth."
      : "Latency under load looks controlled, which is what keeps calls and games smooth while someone else downloads.",
    simultaneous4kStreams < 1
      ? "This line is better suited to HD than 4K. Wi-Fi quality can make the experience worse than the raw speed suggests."
      : `Realistically you have room for about ${simultaneous4kStreams} concurrent 4K stream${simultaneous4kStreams === 1 ? "" : "s"} before contention starts.`,
  ];

  const baseResult: StreamingResults = {
    downloadSpeed,
    uploadSpeed,
    latency,
    jitter: round(jitter, 1),
    packetLoss: round(packetLoss, 1),
    stability: quality(stabilityScore),
    bufferRisk: quality(bufferRiskScore),
    bufferbloat: round(bufferbloat, 0),
    simultaneous4kStreams,
    creatorProfile,
    score,
    ...buildShared(
      score,
      summary,
      headline,
      recommendations,
      [
        {
          title: "Home and work",
          status: readiness(clamp(downloadSpeed * 1.2 + uploadSpeed * 3 - latency * 0.7 - packetLoss * 20, 0, 100)),
          detail: homeProfile,
        },
        {
          title: "Twitch / YouTube live",
          status: readiness(clamp(uploadSpeed * 5 - jitter * 2.2 - packetLoss * 18 - bufferbloat * 0.3, 0, 100)),
          detail: creatorProfile,
        },
        {
          title: "Gaming while others stream",
          status: readiness(clamp(100 - latency * 1.1 - jitter * 3 - bufferbloat * 0.7 - packetLoss * 18, 0, 100)),
          detail: "This mixes bandwidth and latency under load, which is what usually breaks shared home networks.",
        },
      ],
      connectionInfo,
      networkHints,
      "10 second multi-stream download and upload against Cloudflare speed endpoints",
      metrics.samples,
    ),
  };

  if (variant === "internet-speed-test") {
    return {
      ...baseResult,
      homeProfile,
    };
  }

  return baseResult;
};

export const buildVpnResults = (
  metrics: VpnMetrics,
  connectionInfo: ConnectionInfo | undefined,
  networkHints: BrowserNetworkHints | undefined,
  vpnDetected: boolean,
  ipType: VPNResults["ipType"],
): VPNResults => {
  const latencyImpact = safeMetric(metrics.latencyImpact, 0);
  const score = Math.round(
    clamp(100 - latencyImpact * 1.2 - (vpnDetected ? 18 : 0) - (metrics.webrtcLeak ? 30 : 0), 0, 100),
  );

  const headline = vpnDetected
    ? "Traffic appears to exit through a hosted or relay network."
    : "No hosted relay signal was detected from the visible IP.";
  const summary = metrics.webrtcLeak
    ? "WebRTC exposed an address different from the visible HTTP IP, so privacy is incomplete in the browser."
    : `Visible IP looks ${ipType.toLowerCase()} and added browser RTT is about ${latencyImpact} ms.`;

  return {
    vpnDetected,
    proxyUsage: vpnDetected,
    ipType,
    latencyImpact,
    webrtcLeak: metrics.webrtcLeak,
    relayConfidence: vpnDetected ? "Medium" : "Low",
    score,
    ...buildShared(
      score,
      summary,
      headline,
      [
        metrics.webrtcLeak
          ? "Disable WebRTC leaks in the browser or use a VPN client that blocks them."
          : "WebRTC did not expose a different public address during this browser check.",
        latencyImpact > 40
          ? "The privacy path is adding noticeable delay. Test a closer server or a faster protocol like WireGuard."
          : "Latency overhead is modest for browsing and streaming, but still test game-specific regions before ranked play.",
        "This signal is based on the visible network owner and browser behavior, not deep packet inspection.",
      ],
      [
        {
          title: "Private browsing",
          status: readiness(clamp(100 - (metrics.webrtcLeak ? 45 : 0) - (vpnDetected ? 0 : 20), 0, 100)),
          detail: "Checks whether the visible IP looks like a relay and whether WebRTC exposes a different address.",
        },
        {
          title: "Streaming over VPN",
          status: readiness(clamp(100 - latencyImpact * 1.1, 0, 100)),
          detail: "High RTT overhead usually means more buffering risk and slower page loads.",
        },
        {
          title: "Gaming over VPN",
          status: readiness(clamp(100 - latencyImpact * 1.8 - (metrics.webrtcLeak ? 10 : 0), 0, 100)),
          detail: "Gaming is more sensitive to VPN routing than browsing or video playback.",
        },
      ],
      connectionInfo,
      networkHints,
      "Edge metadata plus browser WebRTC leak probe",
      metrics.samples,
    ),
  };
};

export const buildWeb3Results = (
  metrics: Web3Metrics,
  connectionInfo?: ConnectionInfo,
  networkHints?: BrowserNetworkHints,
): Web3Results => {
  const values = [metrics.ethereum, metrics.base, metrics.arbitrum, metrics.solana].filter((value) => value < 999);
  const average = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 999;
  const score = Math.round(clamp(100 - average / 4.5, 0, 100));

  return {
    ...metrics,
    score,
    ...buildShared(
      score,
      `Median RPC responsiveness sits around ${round(average, 0)} ms across the sampled chains.`,
      score >= 80 ? "Fast enough for most wallet and dApp interactions." : "RPC responsiveness is usable, but confirmations and quote refreshes may feel slower.",
      [
        "Web3 latency depends on both your internet and the public RPC you hit. Retry during less busy periods if numbers swing heavily.",
        "If you trade actively, use a provider or region closer to your wallet traffic instead of relying only on public RPCs.",
        "Compare multiple chains because the bottleneck is often the RPC network, not your home internet.",
      ],
      [
        {
          title: "Wallet and swaps",
          status: readiness(clamp(100 - average * 0.8, 0, 100)),
          detail: "Responsive RPC helps balances, quotes, and confirmations refresh quickly.",
        },
        {
          title: "NFT and dashboard use",
          status: readiness(clamp(100 - average * 0.55, 0, 100)),
          detail: "Less sensitive than trading, but still affected by slow public endpoints.",
        },
        {
          title: "Bot or power-user workflows",
          status: readiness(clamp(100 - average * 1.1, 0, 100)),
          detail: "Power users feel regional routing issues sooner than casual wallet usage.",
        },
      ],
      connectionInfo,
      networkHints,
      "Live JSON-RPC POST requests to public chain endpoints",
      values.length,
    ),
  };
};
