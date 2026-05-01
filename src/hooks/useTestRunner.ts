"use client";

import { useState, useCallback } from "react";
import { TestType, TestProgress } from "@/lib/types";
import { useTestHistory } from "@/hooks/useTestHistory";

async function checkWebRTCLeak(): Promise<string[]> {
  return new Promise((resolve) => {
    const ips = new Set<string>();
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("");
      pc.createOffer().then((offer) => pc.setLocalDescription(offer));
      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          resolve(Array.from(ips));
          return;
        }
        const ipMatch = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(event.candidate.candidate);
        if (ipMatch) ips.add(ipMatch[1]);
      };
      setTimeout(() => resolve(Array.from(ips)), 2000);
    } catch {
      resolve([]);
    }
  });
}

export const useTestRunner = () => {
  const [activeTest, setActiveTest] = useState<TestType | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({});
  const { addHistoryEntry } = useTestHistory();
  
  const [progress, setProgress] = useState<TestProgress>({
    phase: 'idle',
    percent: 0,
    pingHistory: [],
    logs: []
  });

  const addLog = useCallback((msg: string) => {
    setProgress(p => ({ ...p, logs: [...p.logs, `[${new Date().toISOString().substring(11, 19)}] ${msg}`] }));
  }, []);

  const runTest = useCallback(async (type: TestType) => {
    if (isTesting) return;

    setActiveTest(type);
    setIsTesting(true);
    setProgress({ phase: 'connecting', percent: 0, pingHistory: [], logs: [] });
    
    try {
      // 1. Initial metadata fetch
      const apiResponse = await fetch(`/api/diagnostics/${type}`);
      const apiData = await apiResponse.json();

      // Categorization for unified logic
      const isLatencyTest = ['gaming', 'ping-test', 'jitter-test', 'packet-loss-test', 'latency-test', 'internet-speed-test'].includes(type);
      const isThroughputTest = ['streaming', 'internet-speed-test'].includes(type);
      const isWeb3Test = type === 'web3';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let realMetrics: Record<string, any> = {};

      // 2. Latency / Ping Measurement
      if (isLatencyTest || isThroughputTest || type === 'vpn') {
        setProgress(p => ({ ...p, phase: 'ping', percent: 0 }));
        addLog(`Starting latency test with ${type}...`);
        const endpoints = ['https://1.1.1.1/cdn-cgi/trace', 'https://speed.cloudflare.com/cdn-cgi/trace', 'https://cp.cloudflare.com/generate_204'];
        const pingWorker = new Worker('/workers/ping-worker.js');
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const latencyData = await new Promise<Record<string, any>>((resolve) => {
          const timeout = setTimeout(() => {
             pingWorker.terminate();
             resolve({ latency: 999, jitter: 999, packetLoss: 100 });
          }, 15000); // 15s timeout
          
          pingWorker.onmessage = (e) => {
            if (e.data.type === 'PING_PROGRESS') {
              setProgress(p => ({
                ...p,
                percent: (e.data.current / e.data.total) * 100,
                currentPing: e.data.latestPing,
                pingHistory: e.data.latestPing ? [...p.pingHistory, e.data.latestPing] : p.pingHistory
              }));
            } else if (e.data.type === 'PINGS_COMPLETE') {
              clearTimeout(timeout);
              pingWorker.terminate();
              resolve(e.data.metrics);
            }
          };
          pingWorker.postMessage({ type: 'START_PINGS', endpoints });
        });
        realMetrics = { ...latencyData };
        addLog(`Base Latency: ${latencyData.latency}ms, Jitter: ${latencyData.jitter}ms`);
      }

      // 3. Throughput / Download Measurement
      let activePingSpikes: number[] = [];

      const runActivePing = async () => {
        const start = performance.now();
        try {
          await fetch('https://1.1.1.1/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' });
          activePingSpikes.push(performance.now() - start);
        } catch { /* ignore */ }
      };

      if (isThroughputTest) {
        setProgress(p => ({ ...p, phase: 'download', percent: 0, currentDownload: 0 }));
        addLog(`Initiating multi-stream download (500MB payload, 4 streams)...`);
        
        let pingInterval = setInterval(runActivePing, 500);

        const speedWorker = new Worker('/workers/speed-worker.js');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const speedData = await new Promise<Record<string, any>>((resolve) => {
          const timeout = setTimeout(() => {
             speedWorker.terminate();
             resolve({ speedMbps: 0, totalBytes: 0, duration: 0 });
          }, 15000);

          speedWorker.onmessage = (e) => {
            if (e.data.type === 'DOWNLOAD_PROGRESS') {
              setProgress(p => ({
                ...p,
                percent: Math.min(100, (e.data.elapsedSeconds / 5) * 100),
                currentDownload: e.data.speedMbps
              }));
            } else if (e.data.type === 'DOWNLOAD_COMPLETE') {
              clearTimeout(timeout);
              speedWorker.terminate();
              resolve(e.data.metrics);
            }
          };
          // Request a massive file for sustained gigabit measurement
          speedWorker.postMessage({ type: 'START_DOWNLOAD', url: 'https://speed.cloudflare.com/__down?bytes=500000000', streams: 4 });
        });
        
        clearInterval(pingInterval);
        realMetrics.downloadSpeed = speedData.speedMbps;
        addLog(`Download complete: ${speedData.speedMbps} Mbps. Bytes transferred: ${(speedData.totalBytes / 1e6).toFixed(2)} MB`);

        // 3.5 Throughput / Upload Measurement
        setProgress(p => ({ ...p, phase: 'upload', percent: 0, currentUpload: 0 }));
        addLog(`Initiating multi-stream upload (incompressible data, 4 streams)...`);
        
        pingInterval = setInterval(runActivePing, 500);
        
        const uploadWorker = new Worker('/workers/upload-worker.js');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadData = await new Promise<Record<string, any>>((resolve) => {
          const timeout = setTimeout(() => {
             uploadWorker.terminate();
             resolve({ speedMbps: 0, totalBytes: 0, duration: 0 });
          }, 15000);

          uploadWorker.onmessage = (e) => {
            if (e.data.type === 'UPLOAD_PROGRESS') {
              setProgress(p => ({
                ...p,
                percent: Math.min(100, (e.data.elapsedSeconds / 5) * 100),
                currentUpload: e.data.speedMbps
              }));
            } else if (e.data.type === 'UPLOAD_COMPLETE') {
              clearTimeout(timeout);
              uploadWorker.terminate();
              resolve(e.data.metrics);
            }
          };
          uploadWorker.postMessage({ type: 'START_UPLOAD', url: 'https://speed.cloudflare.com/__up', streams: 4 });
        });
        
        clearInterval(pingInterval);
        realMetrics.uploadSpeed = uploadData.speedMbps;
        addLog(`Upload complete: ${uploadData.speedMbps} Mbps. Bytes transferred: ${(uploadData.totalBytes / 1e6).toFixed(2)} MB`);

        // Calculate Bufferbloat
        if (activePingSpikes.length > 0 && realMetrics.latency) {
          const avgActivePing = activePingSpikes.reduce((a, b) => a + b, 0) / activePingSpikes.length;
          realMetrics.bufferbloat = Math.max(0, Math.round(avgActivePing - realMetrics.latency));
          addLog(`Bufferbloat (Load Latency Increase): +${realMetrics.bufferbloat}ms`);
        } else {
          realMetrics.bufferbloat = 0;
        }
      }

      if (isWeb3Test) {
        setProgress(p => ({ ...p, phase: 'connecting', percent: 50 }));
        const networks = [
          { name: 'ethereum', url: 'https://eth.llamarpc.com' },
          { name: 'base', url: 'https://base.llamarpc.com' },
          { name: 'arbitrum', url: 'https://arbitrum.llamarpc.com' },
          { name: 'solana', url: 'https://api.mainnet-beta.solana.com' }
        ];

        for (const net of networks) {
          const start = performance.now();
          try {
            let body;
            if (net.name === 'solana') {
              body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" });
            } else {
              body = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] });
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            await fetch(net.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            realMetrics[net.name] = Math.round(performance.now() - start);
          } catch {
            realMetrics[net.name] = 999;
          }
        }
      }

      // 5. Finalize Results & Scoring
      let score = 50;
      if (isLatencyTest || isThroughputTest) {
        score = Math.max(0, 100 - (realMetrics.latency / 2) - (realMetrics.jitter * 2) - (realMetrics.packetLoss * 10));
        if (isThroughputTest) {
           // Bonus for high speed
           const speedScore = ((realMetrics.downloadSpeed || 0) + (realMetrics.uploadSpeed || 0)) / 2;
           score = (score * 0.4) + (Math.min(100, (speedScore / 2)) * 0.6);
        }
      } else if (isWeb3Test) {
        const avg = (realMetrics.ethereum + realMetrics.solana + realMetrics.base) / 3;
        score = Math.max(0, 100 - (avg / 5));
      } else if (type === 'vpn') {
        setProgress(p => ({ ...p, phase: 'connecting', percent: 80 }));
        addLog('Running WebRTC Leak check...');
        const leakedIps = await checkWebRTCLeak();
        const hasLeak = leakedIps.length > 1; // Basic assumption: multiple IPs could indicate a leak
        
        if (hasLeak) addLog(`WARNING: WebRTC Leak detected! IPs: ${leakedIps.join(', ')}`);
        else addLog('WebRTC check passed. No leaks.');

        const impact = realMetrics.latency || 0;
        const vpnPenalty = apiData.vpnDetected ? 20 : 0;
        const leakPenalty = hasLeak ? 30 : 0;
        score = Math.max(0, 100 - impact - vpnPenalty - leakPenalty);
        
        realMetrics.latencyImpact = impact;
        realMetrics.webrtcLeak = hasLeak;
      }

      const finalScore = Math.round(score);
      const finalMetrics = {
        ...apiData, 
        ...realMetrics,
        ping: realMetrics.latency || apiData.ping || 0,
        score: finalScore
      };

      setProgress(p => ({ ...p, phase: 'complete', percent: 100 }));
      setResults(prev => ({ 
        ...prev, 
        [type]: finalMetrics
      }));
      
      addHistoryEntry(type, finalScore, finalMetrics);

    } catch (error) {
      console.error("Diagnostic failed:", error);
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(p => ({ ...p, phase: 'idle', percent: 0 }));
    } finally {
      setIsTesting(false);
    }
  }, [isTesting, addLog]);

  return { activeTest, isTesting, progress, results, runTest };
};
