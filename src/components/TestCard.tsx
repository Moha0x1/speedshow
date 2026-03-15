"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestType } from "@/lib/types";

interface TestCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  type: TestType;
  isActive: boolean;
  onClick: () => void;
}

export const TestCard = ({ title, description, icon: Icon, type, isActive, onClick }: TestCardProps) => {
  const getColors = () => {
    switch (type) {
      case 'gaming': return 'from-blue-500/20 to-purple-500/20 text-blue-400 group-hover:border-blue-500/50';
      case 'streaming': return 'from-purple-500/20 to-pink-500/20 text-purple-400 group-hover:border-purple-500/50';
      case 'vpn': return 'from-cyan-500/20 to-blue-500/20 text-cyan-400 group-hover:border-cyan-500/50';
      case 'web3': return 'from-orange-500/20 to-yellow-500/20 text-orange-400 group-hover:border-orange-500/50';
      default: return 'from-gray-500/20 to-slate-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative glass p-6 rounded-3xl cursor-pointer transition-all duration-300",
        isActive ? "border-primary/60 ring-1 ring-primary/30 bg-primary/5" : "hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
        getColors()
      )}>
        <Icon size={24} />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-muted text-sm mb-6 leading-relaxed">{description}</p>
      
      <button className={cn(
        "w-full py-3 rounded-xl text-sm font-bold transition-all",
        isActive 
          ? "bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" 
          : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
      )}>
        {isActive ? "Running..." : "Run Test"}
      </button>

      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
        />
      )}
    </motion.div>
  );
};
