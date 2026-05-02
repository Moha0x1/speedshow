"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import {
  Activity,
  Cpu,
  Download,
  Gamepad2,
  Gauge,
  House,
  Network,
  Radio,
  Server,
  Share2,
  Shield,
  Upload,
  Wifi,
} from "lucide-react";
import { ScoreGauge } from "./ScoreGauge";
import {
  AnyResult,
  GamingResults,
  InternetResults,
  StreamingResults,
  TestProgress,
  TestType,
  VPNResults,
  Web3Results,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface TestPanelProps {
  type: TestType;
  results: AnyResult | null;
  isTesting: boolean;
  progress: TestProgress;
  onShare: () => void;
}

const PANEL_COPY: Record<TestType, { title: string; subtitle: string; gauge: string }> = {
  gaming: {
    title: "Gaming check",
    subtitle: "Low latency, low jitter and zero loss matter more than raw speed.",
    gauge: "Gaming",
  },
  streaming: {
    title: "Creator check",
    subtitle: "Upload stability and latency under load decide whether a stream stays smooth.",
    gauge: "Creator",
  },
  vpn: {
    title: "Privacy check",
    subtitle: "Visible IP clues plus WebRTC behavior show whether the browser still exposes you.",
    gauge: "Privacy",
  },
  web3: {
    title: "Web3 check",
    subtitle: "Public RPC responsiveness affects how fast wallets, swaps and dashboards feel.",
    gauge: "Web3",
  },
  "internet-speed-test": {
    title: "Home & work check",
    subtitle: "Useful for normal households, remote work, streaming and shared Wi-Fi.",
    gauge: "Home",
  },
  "ping-test": {
    title: "Ping check",
    subtitle: "Browser RTT gives a practical view of responsiveness for real-time tasks.",
    gauge: "Ping",
  },
  "jitter-test": {
    title: "Jitter check",
    subtitle: "Jitter tracks how much your latency moves around from one sample to the next.",
    gauge: "Jitter",
  },
  "packet-loss-test": {
    title: "Packet loss check",
    subtitle: "Loss breaks calls, streams and games even when speed looks fine.",
    gauge: "Loss",
  },
  "latency-test": {
    title: "Latency check",
    subtitle: "This focuses on responsiveness rather than sheer bandwidth.",
    gauge: "Latency",
  },
};

const readinessTone = (status: string) => {
  if (status === "Ready") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (status === "Borderline") return "border-amber-500/20 bg-amber-500/10 text-amber-200";
  return "border-rose-500/20 bg-rose-500/10 text-rose-200";
};

const factTone = (index: number) => {
  const tones = [
    "text-primary",
    "text-cyan-300",
    "text-emerald-300",
    "text-amber-300",
  ];
  return tones[index % tones.length];
};

export const TestPanel = ({ type, results, isTesting, progress, onShare }: TestPanelProps) => {
  const [showLogs, setShowLogs] = useState(false);

  const chartData = useMemo(() => progress.pingHistory.map((value, index) => ({ time: index, value })), [progress.pingHistory]);
  const copy = PANEL_COPY[type];
  const displayType =
    type === "internet-speed-test"
      ? "internet"
      : ["ping-test", "jitter-test", "packet-loss-test", "latency-test"].includes(type)
        ? "gaming"
        : type;

  const renderMetricRows = () => {
    if (displayType === "gaming") {
      const data = results as GamingResults | null;

      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricItem label="Ping" value={isTesting ? `${progress.currentPing || "--"} ms` : `${data?.ping ?? "--"} ms`} icon={Gauge} color="text-primary" />
          <MetricItem label="Jitter" value={isTesting ? "-- ms" : `${data?.jitter ?? "--"} ms`} icon={Activity} color="text-violet-300" />
          <MetricItem label="Packet loss" value={isTesting ? "--%" : `${data?.packetLoss ?? "--"}%`} icon={Wifi} color="text-rose-300" />
          <MetricItem label="Best / worst" value={isTesting ? "-- / --" : `${data?.minLatency ?? "--"} / ${data?.maxLatency ?? "--"} ms`} icon={Server} color="text-cyan-300" />
        </div>
      );
    }

    if (displayType === "streaming" || displayType === "internet") {
      const data = results as StreamingResults | InternetResults | null;

      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricItem label="Download" value={isTesting ? `${progress.currentDownload || "--"} Mbps` : `${data?.downloadSpeed ?? "--"} Mbps`} icon={Download} color="text-primary" />
          <MetricItem label="Upload" value={isTesting ? `${progress.currentUpload || "--"} Mbps` : `${data?.uploadSpeed ?? "--"} Mbps`} icon={Upload} color="text-pink-300" />
          <MetricItem label="Latency" value={isTesting ? `${progress.currentPing || "--"} ms` : `${data?.latency ?? "--"} ms`} icon={Activity} color="text-cyan-300" />
          <MetricItem label="Load spike" value={isTesting ? "-- ms" : `+${data?.bufferbloat ?? "--"} ms`} icon={Cpu} color="text-amber-300" />
        </div>
      );
    }

    if (displayType === "vpn") {
      const data = results as VPNResults | null;

      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricItem label="Likely relay" value={isTesting ? "--" : data?.vpnDetected ? "Yes" : "No"} icon={Shield} color={data?.vpnDetected ? "text-amber-300" : "text-emerald-300"} />
          <MetricItem label="IP type" value={isTesting ? "--" : data?.ipType} icon={Server} color="text-primary" />
          <MetricItem label="Added RTT" value={isTesting ? "-- ms" : `+${data?.latencyImpact ?? "--"} ms`} icon={Activity} color="text-rose-300" />
          <MetricItem label="WebRTC leak" value={isTesting ? "--" : data?.webrtcLeak ? "Detected" : "Not seen"} icon={Wifi} color={data?.webrtcLeak ? "text-rose-300" : "text-emerald-300"} />
        </div>
      );
    }

    const data = results as Web3Results | null;
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricItem label="Bitcoin" value={isTesting ? "-- ms" : `${data?.bitcoin ?? "--"} ms`} icon={Network} color="text-amber-300" />
        <MetricItem label="Ethereum" value={isTesting ? "-- ms" : `${data?.ethereum ?? "--"} ms`} icon={Network} color="text-indigo-300" />
        <MetricItem label="Base" value={isTesting ? "-- ms" : `${data?.base ?? "--"} ms`} icon={Network} color="text-primary" />
        <MetricItem label="Arbitrum" value={isTesting ? "-- ms" : `${data?.arbitrum ?? "--"} ms`} icon={Network} color="text-cyan-300" />
        <MetricItem label="Solana" value={isTesting ? "-- ms" : `${data?.solana ?? "--"} ms`} icon={Network} color="text-violet-300" />
      </div>
    );
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full overflow-hidden"
    >
      <div className="relative rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 md:p-8">
        {isTesting && (
          <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-[2rem] bg-white/5">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              {isTesting ? progress.phase : "Measured live"}
            </div>
            <h2 className="mt-4 text-3xl font-black text-white">{copy.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{copy.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onShare}
            disabled={isTesting || !results}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[300px,1fr]">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-5">
              <ScoreGauge score={results?.score || 0} label={copy.gauge} isTesting={isTesting} size={220} />
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">{results?.headline || "Running live checks..."}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {results?.summary || "Collecting data from live browser probes and public endpoints."}
                </p>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Latency history</span>
                  <span className="text-xs text-muted">{chartData.length} samples</span>
                </div>
                <div className="mt-4 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <YAxis domain={["auto", "auto"]} hide />
                      <Line type="monotone" dataKey="value" stroke="#facc15" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {renderMetricRows()}

            {results && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  {results.audience.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                      <div className={cn("inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]", readinessTone(item.status))}>
                        {item.status}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-white">
                        {index === 0 && <House className="h-4 w-4 text-primary" />}
                        {index === 1 && <Radio className="h-4 w-4 text-primary" />}
                        {index === 2 && <Gamepad2 className="h-4 w-4 text-primary" />}
                        <h3 className="text-sm font-bold">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
                  <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">What to do next</h3>
                    <div className="mt-4 space-y-3">
                      {results.recommendations.map((recommendation, index) => (
                        <div key={`${recommendation}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <p className="text-sm leading-relaxed text-muted">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">How this was measured</h3>
                    <div className="mt-4 grid gap-3">
                      {results.facts.map((fact, index) => (
                        <div key={`${fact.label}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <div className={cn("text-[11px] font-bold uppercase tracking-[0.2em]", factTone(index))}>{fact.label}</div>
                          <div className="mt-1 text-sm font-semibold text-white">{fact.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <button
                type="button"
                onClick={() => setShowLogs((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <div className="text-sm font-bold text-white">Technical notes</div>
                  <div className="text-xs text-muted">Useful if you want to inspect the raw run and timing phases.</div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  {showLogs ? "Hide" : "Show"}
                </span>
              </button>

              {showLogs && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 text-[11px] leading-relaxed text-emerald-300"
                >
                  {progress.logs.length > 0 ? progress.logs.join("\n") : "Awaiting diagnostic data..."}
                </motion.pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface MetricItemProps {
  label: string;
  value: string | number | undefined;
  icon: React.ElementType;
  color: string;
}

const MetricItem = ({ label, value, icon: Icon, color }: MetricItemProps) => (
  <div className="flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
    <div className="flex items-center gap-3">
      <div className={cn("rounded-xl border border-white/8 bg-white/[0.03] p-2", color)}>
        <Icon size={18} />
      </div>
      <span className="text-sm font-medium text-muted">{label}</span>
    </div>
    <span className="text-right text-base font-bold text-white">{value}</span>
  </div>
);
