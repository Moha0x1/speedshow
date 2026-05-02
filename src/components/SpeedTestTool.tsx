"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, House, Network, Radio, ShieldCheck } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";
import { TestPanel } from "@/components/TestPanel";
import { useTestRunner } from "@/hooks/useTestRunner";
import { AnyResult, TestType } from "@/lib/types";

interface SpeedTestToolProps {
  initialTest?: TestType;
  showAllCards?: boolean;
}

const TESTS = [
  {
    type: "internet-speed-test" as const,
    title: "Home & Work",
    description: "Real download, upload and latency data for everyday internet use.",
    icon: House,
  },
  {
    type: "streaming" as const,
    title: "Creator",
    description: "See if your line is ready for Twitch, YouTube uploads and live streaming.",
    icon: Radio,
  },
  {
    type: "gaming" as const,
    title: "Gaming",
    description: "Check ping, jitter and packet loss for shooters, co-op and cloud gaming.",
    icon: Gamepad2,
  },
  {
    type: "vpn" as const,
    title: "Privacy",
    description: "Check visible IP clues, latency cost and WebRTC exposure.",
    icon: ShieldCheck,
  },
  {
    type: "web3" as const,
    title: "Web3",
    description: "Measure live RPC responsiveness on major public blockchain endpoints.",
    icon: Network,
  },
];

export const SpeedTestTool = ({ initialTest, showAllCards = true }: SpeedTestToolProps) => {
  const { activeTest, isTesting, progress, results, runTest, reset } = useTestRunner();

  React.useEffect(() => {
    if (initialTest && !activeTest && !isTesting) {
      runTest(initialTest);
    }
  }, [activeTest, initialTest, isTesting, runTest]);

  const handleShare = () => {
    if (!activeTest || !results[activeTest]) {
      return;
    }

    const activeResult = results[activeTest];
    const score = Math.round(activeResult.score);
    const summary = activeResult.summary || "Live network diagnostic";
    const text = `SpeedShow ${score}/100. ${summary}`;

    if (navigator.share) {
      navigator.share({
        title: "SpeedShow result",
        text,
        url: window.location.href,
      }).catch(console.error);
      return;
    }

    navigator.clipboard.writeText(text).catch(console.error);
  };

  const globalScore = React.useMemo(() => {
    const scores = Object.values(results).map((result) => result.score);
    if (scores.length === 0) {
      return 0;
    }

    return Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  }, [results]);

  const latestResult = React.useMemo<AnyResult | null>(() => {
    const values = Object.values(results);
    return values.length > 0 ? values[values.length - 1] : null;
  }, [results]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {latestResult && !isTesting && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid gap-4 rounded-[2rem] border border-white/8 bg-white/[0.03] p-5 md:grid-cols-[auto,1fr]"
        >
          <div className="flex justify-center">
            <ScoreGauge score={globalScore} label="Overall" size={128} />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white">Useful, real-world network snapshot</h3>
              <p className="mt-1 text-sm text-muted">{latestResult.headline}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {latestResult.audience.slice(0, 3).map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{item.status}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.detail}</p>
                </div>
              ))}
            </div>

            {latestResult.connectionInfo && (
              <p className="text-xs text-muted">
                Measured live from {latestResult.connectionInfo.location} on {latestResult.connectionInfo.isp}.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {showAllCards && !activeTest && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TESTS.map((test, index) => (
            <motion.button
              key={test.type}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => runTest(test.type)}
              className="group rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 text-left transition-all hover:border-primary/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary transition-transform group-hover:scale-105">
                  <test.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  Live test
                </span>
              </div>

              <h4 className="mt-5 text-xl font-bold text-white">{test.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{test.description}</p>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTest && (
          <div className="flex flex-col gap-6">
            <TestPanel
              key={activeTest}
              type={activeTest}
              isTesting={isTesting}
              progress={progress}
              results={results[activeTest] || null}
              onShare={handleShare}
            />

            {!isTesting && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white/10"
                >
                  {initialTest ? "Run Again" : "Pick Another Test"}
                </button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
