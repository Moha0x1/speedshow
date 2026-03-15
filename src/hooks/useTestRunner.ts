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
      // 1. Fetch backend data (ISP, location)
      const apiResponse = await fetch(`/api/diagnostics/${type}`);
      if (!apiResponse.ok) throw new Error("API failed");
      const apiData = await apiResponse.json();

      // 2. Real Client-Side Measurement for specific tests
      if (type === 'gaming' || type === 'web3') {
        const endpoints = type === 'gaming' 
          ? ['https://1.1.1.1/cdn-cgi/trace', 'https://8.8.8.8/'] 
          : ['https://cloudflare-eth.com', 'https://rpc.ankr.com/eth'];

        const worker = new Worker('/workers/ping-worker.js');
        
        const realMetrics = await new Promise<{
          latency: number;
          minLatency: number;
          jitter: number;
          samples: number;
        }>((resolve) => {
          worker.onmessage = (e) => {
            if (e.data.type === 'PINGS_COMPLETE') {
              worker.terminate();
              resolve(e.data.metrics);
            }
          };
          worker.postMessage({ type: 'START_PINGS', endpoints });
        });

        // Merge real client data with backend metadata
        setResults(prev => ({ 
          ...prev, 
          [type]: { 
            ...apiData, 
            ping: realMetrics.latency,
            jitter: realMetrics.jitter,
            // Adjust score based on real ping
            score: Math.max(0, 100 - (realMetrics.latency / 2) - (realMetrics.jitter * 2))
          } 
        }));
      } else if (type === 'streaming') {
        const url = 'https://speed.cloudflare.com/__down?bytes=1000000'; // 1MB for quick check
        const worker = new Worker('/workers/speed-worker.js');
        
        const realMetrics = await new Promise<{
          speedMbps: number;
          sizeBytes: number;
          duration: number;
        }>((resolve) => {
          worker.onmessage = (e) => {
            if (e.data.type === 'DOWNLOAD_COMPLETE') {
              worker.terminate();
              resolve(e.data.metrics);
            }
          };
          worker.postMessage({ type: 'START_DOWNLOAD', url });
        });

        setResults(prev => ({ 
          ...prev, 
          [type]: { 
            ...apiData, 
            downloadSpeed: realMetrics.speedMbps,
            stability: realMetrics.speedMbps > 25 ? 'High' : 'Medium',
            score: Math.min(100, (realMetrics.speedMbps / 100) * 100) // Scale to 100Mbps base
          } 
        }));
      } else {
        // For other tests (VPN/Web3 already handled or using backend logic)
        await new Promise(resolve => setTimeout(resolve, 2000));
        setResults(prev => ({ ...prev, [type]: apiData }));
      }
    } catch (error: unknown) { // Added type annotation for error
      console.error("Test failed:", error);
    } finally {
      setIsTesting(false);
    }
  }, [isTesting]);

  return { activeTest, isTesting, results, runTest };
};
