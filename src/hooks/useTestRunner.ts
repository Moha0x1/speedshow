"use client";

import { useCallback, useState } from "react";
import { useTestHistory } from "@/hooks/useTestHistory";
import {
  AnyResult,
  BrowserNetworkHints,
  ConnectionInfo,
  TestProgress,
  TestType,
  VPNResults,
} from "@/lib/types";
import {
  buildGamingResults,
  buildStreamingResults,
  buildVpnResults,
  buildWeb3Results,
  getBrowserNetworkHints,
} from "@/lib/networkDiagnostics";

type LatencyMetrics = {
  latency: number;
  jitter: number;
  packetLoss: number;
  minLatency?: number;
  maxLatency?: number;
  samples?: number;
};

type ThroughputMetrics = {
  speedMbps: number;
  totalBytes: number;
  duration: number;
};

type DiagnosticsApiResponse = {
  clientIp: string;
  connectionInfo?: ConnectionInfo;
  vpnDetected?: boolean;
  ipType?: VPNResults["ipType"];
};

const percentile = (values: number[], target: number) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((target / 100) * sorted.length) - 1));
  return sorted[index];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function measureHttpProbe(url: string): Promise<number | null> {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    await fetch(`${url}?_t=${Date.now()}-${Math.random()}`, {
      cache: "no-store",
      mode: "no-cors",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return performance.now() - startedAt;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function checkWebRTCLeak(httpIp: string): Promise<{ leaks: string[]; details: string }> {
  return new Promise((resolve) => {
    const hostIps = new Set<string>();
    const srflxIps = new Set<string>();
    const relayIps = new Set<string>();
    let finished = false;

    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("diagnostic");

      const finalize = () => {
        if (finished) {
          return;
        }

        finished = true;
        const leaks: string[] = [];
        Array.from(srflxIps).forEach((ip) => {
          if (ip !== httpIp) {
            leaks.push(ip);
          }
        });

        pc.close();
        resolve({
          leaks,
          details: `Host: ${hostIps.size}, Srflx: ${srflxIps.size}, Relay: ${relayIps.size}`,
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          finalize();
          return;
        }

        const candidate = event.candidate;
        const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i.exec(candidate.candidate);
        if (!ipMatch) {
          return;
        }

        const ip = ipMatch[1];
        if (candidate.type === "host") hostIps.add(ip);
        if (candidate.type === "srflx") srflxIps.add(ip);
        if (candidate.type === "relay") relayIps.add(ip);
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finalize());

      setTimeout(finalize, 3000);
    } catch {
      resolve({ leaks: [], details: "WebRTC unavailable" });
    }
  });
}

const runLatencyWorker = (
  onProgress: (current: number, total: number, latestPing?: number) => void,
): Promise<LatencyMetrics> => {
  const endpoints = [
    "https://speed.cloudflare.com/cdn-cgi/trace",
    "https://cp.cloudflare.com/generate_204",
    "https://www.cloudflare.com/cdn-cgi/trace",
  ];

  return new Promise((resolve) => {
    const worker = new Worker("/workers/ping-worker.js");
    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({ latency: 999, jitter: 999, packetLoss: 100, samples: 0 });
    }, 20000);

    worker.onmessage = (event) => {
      if (event.data.type === "PING_PROGRESS") {
        onProgress(event.data.current, event.data.total, event.data.latestPing);
      }

      if (event.data.type === "PINGS_COMPLETE") {
        clearTimeout(timeout);
        worker.terminate();
        resolve(event.data.metrics);
      }

      if (event.data.type === "ERROR") {
        clearTimeout(timeout);
        worker.terminate();
        resolve({ latency: 999, jitter: 999, packetLoss: 100, samples: 0 });
      }
    };

    worker.postMessage({ type: "START_PINGS", endpoints });
  });
};

const runThroughputWorker = (
  workerUrl: string,
  workerType: "START_DOWNLOAD" | "START_UPLOAD",
  url: string,
  onProgress: (speedMbps: number, elapsedSeconds: number) => void,
): Promise<ThroughputMetrics> => {
  return new Promise((resolve) => {
    const worker = new Worker(workerUrl);
    const timeout = setTimeout(() => {
      worker.terminate();
      resolve({ speedMbps: 0, totalBytes: 0, duration: 0 });
    }, 18000);

    worker.onmessage = (event) => {
      if (event.data.type === "DOWNLOAD_PROGRESS" || event.data.type === "UPLOAD_PROGRESS") {
        onProgress(event.data.speedMbps, event.data.elapsedSeconds);
      }

      if (event.data.type === "DOWNLOAD_COMPLETE" || event.data.type === "UPLOAD_COMPLETE") {
        clearTimeout(timeout);
        worker.terminate();
        resolve(event.data.metrics);
      }

      if (event.data.type === "ERROR") {
        clearTimeout(timeout);
        worker.terminate();
        resolve({ speedMbps: 0, totalBytes: 0, duration: 0 });
      }
    };

    worker.postMessage({ type: workerType, url, streams: 4 });
  });
};

export const useTestRunner = () => {
  const [activeTest, setActiveTest] = useState<TestType | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Record<string, AnyResult>>({});
  const { addHistoryEntry } = useTestHistory();

  const [progress, setProgress] = useState<TestProgress>({
    phase: "idle",
    percent: 0,
    pingHistory: [],
    logs: [],
  });

  const addLog = useCallback((message: string) => {
    setProgress((current) => ({
      ...current,
      logs: [...current.logs, `[${new Date().toISOString().substring(11, 19)}] ${message}`],
    }));
  }, []);

  const reset = useCallback(() => {
    setActiveTest(null);
    setIsTesting(false);
    setProgress({ phase: "idle", percent: 0, pingHistory: [], logs: [] });
  }, []);

  const runTest = useCallback(async (type: TestType) => {
    if (isTesting) {
      return;
    }

    setActiveTest(type);
    setIsTesting(true);
    setProgress({ phase: "connecting", percent: 0, pingHistory: [], logs: [] });

    try {
      const apiResponse = await fetch(`/api/diagnostics/${type}`, { cache: "no-store" });
      const apiData = (await apiResponse.json()) as DiagnosticsApiResponse;
      const connectionInfo = apiData.connectionInfo;
      const networkHints = getBrowserNetworkHints();

      const latencyDrivenTests: TestType[] = [
        "gaming",
        "ping-test",
        "jitter-test",
        "packet-loss-test",
        "latency-test",
      ];
      const throughputTests: TestType[] = ["streaming", "internet-speed-test"];
      const needsLatency = latencyDrivenTests.includes(type) || throughputTests.includes(type) || type === "vpn";

      let latencyMetrics: LatencyMetrics | null = null;
      let downloadMetrics: ThroughputMetrics | null = null;
      let uploadMetrics: ThroughputMetrics | null = null;
      let bufferProbeActive = false;
      let bufferProbeTask: Promise<void> | null = null;
      const loadLatencySamples: number[] = [];

      const startBufferProbe = () => {
        bufferProbeActive = true;
        bufferProbeTask = (async () => {
          while (bufferProbeActive) {
            const sample = await measureHttpProbe("https://cp.cloudflare.com/generate_204");
            if (sample !== null) {
              loadLatencySamples.push(sample);
            }
            await delay(300);
          }
        })();
      };

      const stopBufferProbe = async () => {
        bufferProbeActive = false;
        if (bufferProbeTask) {
          await bufferProbeTask;
        }
      };

      if (needsLatency) {
        setProgress((current) => ({ ...current, phase: "ping", percent: 0 }));
        addLog("Measuring browser RTT against Cloudflare edge endpoints.");

        latencyMetrics = await runLatencyWorker((current, total, latestPing) => {
          setProgress((state) => ({
            ...state,
            percent: (current / total) * 100,
            currentPing: latestPing,
            pingHistory: latestPing ? [...state.pingHistory, latestPing] : state.pingHistory,
          }));
        });

        addLog(
          `Latency ${latencyMetrics.latency} ms, jitter ${latencyMetrics.jitter} ms, loss ${latencyMetrics.packetLoss}%.`,
        );
      }

      if (throughputTests.includes(type)) {
        setProgress((current) => ({ ...current, phase: "download", percent: 0, currentDownload: 0 }));
        addLog("Running sustained multi-stream download test.");
        startBufferProbe();

        downloadMetrics = await runThroughputWorker(
          "/workers/speed-worker.js",
          "START_DOWNLOAD",
          "https://speed.cloudflare.com/__down",
          (speedMbps, elapsedSeconds) => {
            setProgress((state) => ({
              ...state,
              percent: Math.min(100, (elapsedSeconds / 10) * 100),
              currentDownload: speedMbps,
            }));
          },
        );

        await stopBufferProbe();
        addLog(
          `Sustained download ${downloadMetrics.speedMbps} Mbps over ${downloadMetrics.duration.toFixed(1)} s.`,
        );

        setProgress((current) => ({ ...current, phase: "upload", percent: 0, currentUpload: 0 }));
        addLog("Running sustained multi-stream upload test.");
        startBufferProbe();

        uploadMetrics = await runThroughputWorker(
          "/workers/upload-worker.js",
          "START_UPLOAD",
          "/api/upload",
          (speedMbps, elapsedSeconds) => {
            setProgress((state) => ({
              ...state,
              percent: Math.min(100, (elapsedSeconds / 10) * 100),
              currentUpload: speedMbps,
            }));
          },
        );

        await stopBufferProbe();
        addLog(`Sustained upload ${uploadMetrics.speedMbps} Mbps over ${uploadMetrics.duration.toFixed(1)} s.`);
      }

      let finalResult: AnyResult;

      if (type === "web3") {
        setProgress((current) => ({ ...current, phase: "connecting", percent: 40 }));
        addLog("Querying live public RPC endpoints.");

        const networks = [
          {
            name: "bitcoin",
            url: "https://blockstream.info/api/blocks/tip/height",
            request: () => ({ method: "GET" }),
          },
          {
            name: "ethereum",
            url: "https://eth.llamarpc.com",
            request: () => ({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
            }),
          },
          {
            name: "base",
            url: "https://base.llamarpc.com",
            request: () => ({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
            }),
          },
          {
            name: "arbitrum",
            url: "https://arbitrum.llamarpc.com",
            request: () => ({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
            }),
          },
          {
            name: "solana",
            url: "https://api.mainnet-beta.solana.com",
            request: () => ({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
            }),
          },
        ] as const;

        const rpcMetrics = {
          bitcoin: 999,
          ethereum: 999,
          base: 999,
          arbitrum: 999,
          solana: 999,
        };

        for (const [index, network] of networks.entries()) {
          const startedAt = performance.now();

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            await fetch(network.url, {
              ...network.request(),
              cache: "no-store",
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            rpcMetrics[network.name] = Math.round(performance.now() - startedAt);
            addLog(`${network.name} RPC ${rpcMetrics[network.name]} ms.`);
          } catch {
            rpcMetrics[network.name] = 999;
            addLog(`${network.name} RPC probe failed.`);
          }

          setProgress((current) => ({
            ...current,
            percent: Math.round(((index + 1) / networks.length) * 100),
          }));
        }

        finalResult = buildWeb3Results(rpcMetrics, connectionInfo, networkHints);
      } else if (type === "vpn") {
        const latency = latencyMetrics || { latency: 999, jitter: 999, packetLoss: 100, samples: 0 };
        setProgress((current) => ({ ...current, phase: "connecting", percent: 80 }));
        addLog("Checking WebRTC exposure.");

        const webrtcResults = await checkWebRTCLeak(apiData.clientIp);
        const hasLeak = webrtcResults.leaks.length > 0;

        addLog(`WebRTC: ${webrtcResults.details}`);
        if (hasLeak) {
          addLog(`WebRTC leak detected: ${webrtcResults.leaks.join(", ")}`);
        }

        finalResult = buildVpnResults(
          {
            ...latency,
            latencyImpact: latency.latency,
            webrtcLeak: hasLeak,
          },
          connectionInfo,
          networkHints,
          Boolean(apiData.vpnDetected),
          apiData.ipType || "Unknown",
        );
      } else if (throughputTests.includes(type)) {
        const latency = latencyMetrics || { latency: 999, jitter: 999, packetLoss: 100, samples: 0 };
        const bufferbloat = Math.max(0, Math.round(percentile(loadLatencySamples, 90) - latency.latency));
        finalResult = buildStreamingResults(
          {
            ...latency,
            downloadSpeed: downloadMetrics?.speedMbps || 0,
            uploadSpeed: uploadMetrics?.speedMbps || 0,
            bufferbloat,
          },
          connectionInfo,
          networkHints,
          type === "internet-speed-test" ? "internet-speed-test" : "streaming",
        );

        addLog(`Latency under load peaked about +${bufferbloat} ms over baseline.`);
      } else {
        const latency = latencyMetrics || { latency: 999, jitter: 999, packetLoss: 100, samples: 0 };
        finalResult = buildGamingResults(latency, connectionInfo, networkHints);
      }

      setProgress((current) => ({ ...current, phase: "complete", percent: 100 }));
      setResults((current) => ({
        ...current,
        [type]: {
          ...finalResult,
          connectionInfo,
          networkHints: (finalResult.networkHints || networkHints) as BrowserNetworkHints | undefined,
        },
      }));

      addHistoryEntry(type, finalResult.score, {
        ...finalResult,
        connectionInfo,
      });
    } catch (error) {
      console.error("Diagnostic failed:", error);
      addLog(`ERROR: ${error instanceof Error ? error.message : "Unknown error"}`);
      setProgress((current) => ({ ...current, phase: "idle", percent: 0 }));
    } finally {
      setIsTesting(false);
    }
  }, [addHistoryEntry, addLog, isTesting]);

  return { activeTest, isTesting, progress, results, runTest, reset };
};
