"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTestHistory } from "@/hooks/useTestHistory";
import { Clock, Trash2, Activity, PlaySquare, ShieldCheck, Network, Gamepad2 } from "lucide-react";
import { TestType } from "@/lib/types";
import { cn } from "@/lib/utils";

const getIconForType = (type: TestType) => {
  switch (type) {
    case 'gaming': return Gamepad2;
    case 'streaming': return PlaySquare;
    case 'vpn': return ShieldCheck;
    case 'web3': return Network;
    default: return Activity;
  }
};

export const TestHistoryList = () => {
  const { history, clearHistory } = useTestHistory();

  if (history.length === 0) return null;

  return (
    <div className="w-full mt-12">
      <div className="flex justify-between items-center mb-6 px-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock size={20} className="text-primary" /> Past Results
        </h3>
        <button 
          onClick={clearHistory}
          className="text-xs font-bold uppercase tracking-wider text-muted hover:text-red-400 transition-colors flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((entry, index) => {
          const Icon = getIconForType(entry.type);
          const date = new Date(entry.timestamp);
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white capitalize">{entry.type}</h4>
                  <p className="text-xs text-muted">
                    {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-xl font-black",
                  entry.score >= 80 ? "text-green-500" :
                  entry.score >= 60 ? "text-yellow-500" :
                  "text-red-500"
                )}>
                  {entry.score}
                </span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Score</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
