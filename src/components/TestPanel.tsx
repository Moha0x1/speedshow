"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ScoreGauge } from "./ScoreGauge";
import { GamingResults, StreamingResults, VPNResults, Web3Results, TestType } from "@/lib/types";
import { Activity, Shield, Download, Cpu, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AffiliateRecommendations } from "./AffiliateRecommendations";

interface TestPanelProps {
  type: TestType;
  results: GamingResults | StreamingResults | VPNResults | Web3Results | null;
  isTesting: boolean;
  onShare: () => void;
}

export const TestPanel = ({ type, results, isTesting, onShare }: TestPanelProps) => {
  const [mockChartData] = useState(() => Array.from({ length: 20 }, (_, i) => ({
    time: i,
    val: 10 + Math.random() * 20
  })));

  const renderGamingResults = (data: GamingResults) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data.score} label="Gaming Score" />
      <div className="space-y-6">
        <MetricItem label="Ping" value={`${data.ping} ms`} icon={Activity} color="text-blue-400" />
        <MetricItem label="Jitter" value={`${data.jitter} ms`} icon={Activity} color="text-purple-400" />
        <MetricItem label="Packet Loss" value={`${data.packetLoss}%`} icon={Activity} color="text-cyan-400" />
        
        <div className="h-24 w-full glass rounded-xl p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderStreamingResults = (data: StreamingResults) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data.score} label="Streaming Score" />
      <div className="space-y-6">
        <MetricItem label="Download Speed" value={`${data.downloadSpeed} Mbps`} icon={Download} color="text-purple-400" />
        <MetricItem label="Stability" value={data.stability} icon={Activity} color="text-green-400" />
        <MetricItem label="Buffer Risk" value={data.bufferRisk} icon={Cpu} color="text-orange-400" />
      </div>
    </div>
  );

  const renderVPNResults = (data: VPNResults) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data.score} label="Privacy Score" />
      <div className="space-y-6">
        <MetricItem label="VPN Detected" value={data.vpnDetected ? "Yes" : "No"} icon={Shield} color={data.vpnDetected ? "text-yellow-400" : "text-green-400"} />
        <MetricItem label="IP Type" value={data.ipType} icon={Activity} color="text-blue-400" />
        <MetricItem label="Latency Impact" value={`+${data.latencyImpact} ms`} icon={Activity} color="text-red-400" />
      </div>
    </div>
  );

  const renderWeb3Results = (data: Web3Results) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <ScoreGauge score={data.score} label="Web3 Score" />
      <div className="grid grid-cols-2 gap-4">
        <MetricItem label="Ethereum" value={`${data.ethereum} ms`} icon={Cpu} color="text-indigo-400" small />
        <MetricItem label="Base" value={`${data.base} ms`} icon={Cpu} color="text-blue-400" small />
        <MetricItem label="Arbitrum" value={`${data.arbitrum} ms`} icon={Cpu} color="text-cyan-400" small />
        <MetricItem label="Solana" value={`${data.solana} ms`} icon={Cpu} color="text-purple-400" small />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="w-full mt-12 overflow-hidden"
    >
      <div className="glass rounded-[2rem] p-8 md:p-12 border-primary/20 relative">
        {isTesting && (
          <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[2rem]">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-white font-bold animate-pulse">Running Diagnostics...</p>
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-white capitalize">{type} Results</h2>
            <p className="text-muted">Real-time performance analytics</p>
          </div>
          <button 
            onClick={onShare}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold border border-white/10"
          >
            <Share2 size={18} /> Share
          </button>
        </div>

        <div className="mt-8">
          {results && (
            <>
              {type === 'gaming' && renderGamingResults(results as GamingResults)}
              {type === 'streaming' && renderStreamingResults(results as StreamingResults)}
              {type === 'vpn' && renderVPNResults(results as VPNResults)}
              {type === 'web3' && renderWeb3Results(results as Web3Results)}
              
              {!isTesting && results && (
                <div className="mt-12 pt-12 border-t border-white/5">
                  <AffiliateRecommendations type={type} results={results} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface MetricItemProps {
  label: string;
  value: string | number | boolean;
  icon: any;
  color: string;
  small?: boolean;
}

const MetricItem = ({ label, value, icon: Icon, color, small = false }: MetricItemProps) => (
  <div className={cn("flex items-center justify-between p-4 glass rounded-2xl", small && "p-3")}>
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg bg-white/5", color)}>
        <Icon size={small ? 16 : 20} />
      </div>
      <span className={cn("text-muted font-medium", small ? "text-xs" : "text-sm")}>{label}</span>
    </div>
    <span className={cn("text-white font-bold font-mono", small ? "text-sm" : "text-lg")}>{value}</span>
  </div>
);
