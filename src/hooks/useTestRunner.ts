"use client";

import { useState, useCallback } from "react";
import { TestType } from "@/lib/types";

export const useTestRunner = () => {
  const [activeTest, setActiveTest] = useState<TestType | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({});

  const runTest = useCallback(async (type: TestType) => {
    if (isTesting) return;

    setActiveTest(type);
    setIsTesting(true);
    
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
      if (isLatencyTest || isThroughputTest) {
        const endpoints = ['https://1.1.1.1/cdn-cgi/trace', 'https://8.8.8.8/', 'https://www.google.com/generate_204'];
        const pingWorker = new Worker('/workers/ping-worker.js');
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const latencyData = await new Promise<Record<string, any>>((resolve) => {
          pingWorker.onmessage = (e) => {
            if (e.data.type === 'PINGS_COMPLETE') {
              pingWorker.terminate();
              resolve(e.data.metrics);
            }
          };
          pingWorker.postMessage({ type: 'START_PINGS', endpoints });
        });
        realMetrics = { ...latencyData };
      }

      // 3. Throughput / Download Measurement
      if (isThroughputTest) {
        const speedWorker = new Worker('/workers/speed-worker.js');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const speedData = await new Promise<Record<string, any>>((resolve) => {
          speedWorker.onmessage = (e) => {
            if (e.data.type === 'DOWNLOAD_COMPLETE') {
              speedWorker.terminate();
              resolve(e.data.metrics);
            }
          };
          // Request a larger file for sustained measurement
          speedWorker.postMessage({ type: 'START_DOWNLOAD', url: 'https://speed.cloudflare.com/__down?bytes=50000000' });
        });
        realMetrics.downloadSpeed = speedData.speedMbps;
      }

      // 4. Web3 RPC Measurement
      if (isWeb3Test) {
        const { JsonRpcProvider } = await import('ethers');
        const networks = [
          { name: 'ethereum', url: 'https://eth.llamarpc.com' },
          { name: 'base', url: 'https://base.llamarpc.com' },
          { name: 'arbitrum', url: 'https://arbitrum.llamarpc.com' },
          { name: 'solana', url: 'https://api.mainnet-beta.solana.com' }
        ];

        for (const net of networks) {
          const start = performance.now();
          try {
            if (net.name === 'solana') {
              await fetch(net.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" })
              });
            } else {
              const provider = new JsonRpcProvider(net.url);
              await provider.getBlockNumber();
            }
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
           score = (score * 0.4) + (Math.min(100, (realMetrics.downloadSpeed / 2)) * 0.6);
        }
      } else if (isWeb3Test) {
        const avg = (realMetrics.ethereum + realMetrics.solana + realMetrics.base) / 3;
        score = Math.max(0, 100 - (avg / 5));
      }

      setResults(prev => ({ 
        ...prev, 
        [type]: { 
          ...apiData, 
          ...realMetrics,
          ping: realMetrics.latency || apiData.ping,
          score: Math.round(score)
        } 
      }));

    } catch (error) {
      console.error("Diagnostic failed:", error);
    } finally {
      setIsTesting(false);
    }
  }, [isTesting]);

  return { activeTest, isTesting, results, runTest };
};
