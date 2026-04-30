"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { ScoreGauge } from "./ScoreGauge";
import { GamingResults, StreamingResults, VPNResults, Web3Results, TestType, TestProgress } from "@/lib/types";
import { Activity, Shield, Download, Upload, Cpu, Share2, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { AffiliateRecommendations } from "./AffiliateRecommendations";

interface TestPanelProps {
  type: TestType;
  results: GamingResults | StreamingResults | VPNResults | Web3Results | null;
  isTesting: boolean;
  progress: TestProgress;
  onShare: () => void;
}

export const TestPanel = ({ type, results, isTesting, progress, onShare }: TestPanelProps) => {
  const [showLogs, setShowLogs] = useState(false);

  const chartData = useMemo(() => {
    return progress.pingHistory.map((val, i) => ({ time: i, val }));
  }, [progress.pingHistory]);

  const currentScore = results?.score || 0;

  const renderGamingResults = (data: GamingResults | null) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data?.score || 0} label="Gaming Score" isTesting={isTesting} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricItem label="Avg Ping" value={isTesting ? `${progress.currentPing || '--'} ms` : `${data?.ping} ms`} icon={Activity} color="text-blue-400" delay={0.1} />
          <MetricItem label="Jitter" value={isTesting ? '-- ms' : `${data?.jitter} ms`} icon={Activity} color="text-purple-400" delay={0.2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MetricItem label="Min/Max" value={isTesting ? '--/-- ms' : `${data?.minLatency || data?.ping}/${data?.maxLatency || data?.ping} ms`} icon={Activity} color="text-cyan-400" small delay={0.3} />
          <MetricItem label="Loss" value={isTesting ? '--%' : `${data?.packetLoss}%`} icon={Activity} color="text-red-400" small delay={0.4} />
        </div>
        
        <div className="h-24 w-full glass rounded-xl p-2 mt-4 relative overflow-hidden">
           {isTesting && chartData.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-muted/50 text-sm font-bold uppercase tracking-widest">Awaiting Samples</div>
           )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderStreamingResults = (data: StreamingResults | null) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data?.score || 0} label="Streaming Score" isTesting={isTesting} />
      <div className="space-y-4">
        <MetricItem label="Download Speed" value={isTesting ? `${progress.currentDownload || '--'} Mbps` : `${data?.downloadSpeed} Mbps`} icon={Download} color="text-purple-400" delay={0.1} />
        <MetricItem label="Upload Speed" value={isTesting ? `${progress.currentUpload || '--'} Mbps` : `${data?.uploadSpeed || '--'} Mbps`} icon={Upload} color="text-pink-400" delay={0.2} />
        <div className="grid grid-cols-2 gap-4 mt-2">
          <MetricItem label="Stability" value={isTesting ? '--' : data?.stability} icon={Activity} color="text-green-400" small delay={0.3} />
          <MetricItem label="Buffer Risk" value={isTesting ? '--' : data?.bufferRisk} icon={Cpu} color="text-orange-400" small delay={0.4} />
        </div>
      </div>
    </div>
  );

  const renderVPNResults = (data: VPNResults | null) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data?.score || 0} label="Privacy Score" isTesting={isTesting} />
      <div className="space-y-6">
        <MetricItem label="VPN Detected" value={isTesting ? '--' : (data?.vpnDetected ? "Yes" : "No")} icon={Shield} color={data?.vpnDetected ? "text-yellow-400" : "text-green-400"} delay={0.1} />
        <MetricItem label="IP Type" value={isTesting ? '--' : data?.ipType} icon={Server} color="text-blue-400" delay={0.2} />
        <div className="grid grid-cols-2 gap-4">
          <MetricItem label="Latency Impact" value={isTesting ? '--' : `+${data?.latencyImpact} ms`} icon={Activity} color="text-red-400" small delay={0.3} />
          {/* @ts-ignore dynamic field */}
          <MetricItem label="WebRTC Leak" value={isTesting ? '--' : (data?.webrtcLeak ? "Yes" : "No")} icon={Shield} color={data?.webrtcLeak ? "text-red-500" : "text-green-500"} small delay={0.4} />
        </div>
      </div>
    </div>
  );

  const renderWeb3Results = (data: Web3Results | null) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data?.score || 0} label="Web3 Score" isTesting={isTesting} />
      <div className="grid grid-cols-2 gap-3">
        <MetricItem label="Bitcoin" value={isTesting ? '--' : `${data?.bitcoin} ms`} icon={Cpu} color="text-orange-400" small delay={0.1} />
        <MetricItem label="Ethereum" value={isTesting ? '--' : `${data?.ethereum} ms`} icon={Cpu} color="text-indigo-400" small delay={0.2} />
        <MetricItem label="Base" value={isTesting ? '--' : `${data?.base} ms`} icon={Cpu} color="text-blue-400" small delay={0.3} />
        <MetricItem label="Arbitrum" value={isTesting ? '--' : `${data?.arbitrum} ms`} icon={Cpu} color="text-cyan-400" small delay={0.4} />
        <MetricItem label="Solana" value={isTesting ? '--' : `${data?.solana} ms`} icon={Cpu} color="text-purple-400" small delay={0.5} />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full mt-8 overflow-hidden"
    >
      <div className="glass rounded-[2rem] p-8 md:p-12 border-primary/20 relative">
        {isTesting && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 rounded-t-[2rem] overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ ease: "linear", duration: 0.2 }}
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-black text-white capitalize">{type} Results</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted">Real-time performance analytics</p>
              {isTesting && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
                  {progress.phase}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onShare}
            disabled={isTesting || !results}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold border border-white/10"
          >
            <Share2 size={18} /> Share
          </button>
        </div>

        <div className="mt-8 relative">
           {/* Even if results are null, we render the panels if isTesting is true to show live data */}
           {(results || isTesting) && (
            <div className={cn("transition-opacity duration-300", isTesting ? "opacity-90" : "opacity-100")}>
              {type === 'gaming' && renderGamingResults((results as GamingResults) || null)}
              {type === 'streaming' && renderStreamingResults((results as StreamingResults) || null)}
              {type === 'vpn' && renderVPNResults((results as VPNResults) || null)}
              {type === 'web3' && renderWeb3Results((results as Web3Results) || null)}
              
              {!isTesting && results && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <AffiliateRecommendations type={type} results={results as any} />
                </div>
              )}
            </div>
           )}

           {/* Raw Diagnostic Logs */}
           <div className="mt-8 flex justify-center">
             <button
               onClick={() => setShowLogs(!showLogs)}
               className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors flex items-center gap-2"
             >
               <Activity size={12} />
               {showLogs ? 'Hide Raw Diagnostics' : 'View Raw Diagnostics'}
             </button>
           </div>

           {showLogs && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="mt-6 bg-[#0a0a0a] rounded-xl p-4 border border-white/10"
             >
               <pre className="text-[10px] text-green-400 font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                 {progress.logs && progress.logs.length > 0 
                   ? progress.logs.join('\n') 
                   : "Awaiting diagnostic data..."}
               </pre>
             </motion.div>
           )}
        </div>
      </div>
    </motion.div>
  );
};

interface MetricItemProps {
  label: string;
  value: string | number | boolean | undefined;
  icon: React.ElementType;
  color: string;
  small?: boolean;
  delay?: number;
}

const MetricItem = ({ label, value, icon: Icon, color, small = false, delay = 0 }: MetricItemProps) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    className={cn("flex items-center justify-between p-4 glass rounded-2xl", small && "p-3")}
  >
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg bg-white/5", color)}>
        <Icon size={small ? 16 : 20} />
      </div>
      <span className={cn("text-muted font-medium", small ? "text-xs" : "text-sm")}>{label}</span>
    </div>
    <span className={cn("text-white font-bold font-mono", small ? "text-sm" : "text-lg")}>{value}</span>
  </motion.div>
);
