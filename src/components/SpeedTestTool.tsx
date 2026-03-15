"use client";

import React from "react";
import { TestCard } from "@/components/TestCard";
import { TestPanel } from "@/components/TestPanel";
import { useTestRunner } from "@/hooks/useTestRunner";
import { Gamepad2, PlaySquare, ShieldCheck, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoreGauge } from "@/components/ScoreGauge";
import { AdBanner } from "@/components/AdBanner";
import { TestType } from "@/lib/types";

interface SpeedTestToolProps {
  initialTest?: TestType;
  showAllCards?: boolean;
}

export const SpeedTestTool = ({ initialTest, showAllCards = true }: SpeedTestToolProps) => {
  const { activeTest, isTesting, results, runTest } = useTestRunner();

  // Initialize with specific test if provided
  React.useEffect(() => {
    if (initialTest && !activeTest) {
      runTest(initialTest);
    }
  }, [initialTest, activeTest, runTest]);

  const handleShare = () => {
    if (activeTest && results[activeTest]) {
      const score = Math.round((results[activeTest] as {score: number}).score);
      const text = `My Internet Score: ${score}/100 — Tested on SpeedShow.app`;
      
      if (navigator.share) {
        navigator.share({
          title: 'SpeedShow Internet Test',
          text: text,
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(text);
        alert("Results copied to clipboard: " + text);
      }
    }
  };

  const tests = [
    {
      type: 'gaming' as const,
      title: 'Gaming',
      description: 'Test ping, jitter, and packet loss for pros.',
      icon: Gamepad2,
    },
    {
      type: 'streaming' as const,
      title: 'Streaming',
      description: 'Check 4K stability and buffer protection.',
      icon: PlaySquare,
    },
    {
      type: 'vpn' as const,
      title: 'VPN',
      description: 'Detect latency impact and privacy leaks.',
      icon: ShieldCheck,
    },
    {
      type: 'web3' as const,
      title: 'Web3',
      description: 'Measure RPC response for DeFi and NFTs.',
      icon: Network,
    },
  ];

  const calculateGlobalScore = () => {
    const scores = Object.values(results).map((r) => r.score as number);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const globalScore = calculateGlobalScore();

  return (
    <div className="w-full">
      {/* MONETIZATION: TOP BANNER */}
      <AdBanner position="top" className="mb-12" />

      {/* Global Score Panel */}
      {Object.keys(results).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 glass rounded-[2.5rem] p-8 border-primary/30 flex flex-col md:flex-row items-center justify-between gap-8 h-auto overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10 group-hover:bg-primary/20 transition-all" />
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreGauge score={globalScore} label="Internet Score" size={160} />
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Overall Performance</h3>
              <p className="text-muted font-medium">Your connection is performing at its peak potential.</p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                {Object.entries(results).map(([type, data]) => (
                  <div key={type} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted capitalize flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                     {type}: {Math.round((data as {score: number}).score)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-[1px] h-20 bg-white/10" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
              {(() => {
                const latestResult = Object.values(results)[Object.values(results).length - 1];
                const conn = (latestResult as any)?.connectionInfo || {
                  isp: "Cloudflare",
                  location: "New York, US",
                  type: "Fiber Optic",
                  status: "Excellent"
                };
                return (
                  <>
                    <div className="text-sm font-bold text-muted">ISP: <span className="text-white">{conn.isp}</span></div>
                    <div className="text-sm font-bold text-muted">Location: <span className="text-white">{conn.location}</span></div>
                    <div className="text-sm font-bold text-muted">Type: <span className="text-white">{conn.type}</span></div>
                    <div className="text-sm font-bold text-muted">Status: <span className="text-white text-green-400">{conn.status}</span></div>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Cards Grid */}
      {showAllCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tests.map((test, index) => (
            <motion.div
              key={test.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <TestCard
                {...test}
                isActive={activeTest === test.type}
                onClick={() => runTest(test.type)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Results Panel */}
      <AnimatePresence mode="wait">
        {activeTest && (
          <div className="flex flex-col gap-8">
            <TestPanel
              key={activeTest}
              type={activeTest}
              isTesting={isTesting}
              results={results[activeTest] as any}
              onShare={handleShare}
            />
            
            {/* MONETIZATION: BOTTOM BANNER AND RECOMMENDATIONS */}
            {!isTesting && results[activeTest] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <AdBanner position="bottom" />
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
