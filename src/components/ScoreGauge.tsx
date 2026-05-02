"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
  isTesting?: boolean;
}

export const ScoreGauge = ({ score, label, size = 200, isTesting = false }: ScoreGaugeProps) => {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  const getColor = () => {
    if (isTesting || score === 0) return { stroke: "#eab308", text: "text-primary" }; // yellow
    if (score >= 80) return { stroke: "#22c55e", text: "text-green-500" }; // green
    if (score >= 60) return { stroke: "#eab308", text: "text-yellow-500" }; // yellow
    return { stroke: "#ef4444", text: "text-red-500" }; // red
  };

  const getQualityLabel = () => {
    if (isTesting) return "Testing...";
    if (score === 0) return "Idle";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const colors = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative transition-all duration-500", isTesting && "animate-pulse")} style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-white/5"
            strokeWidth={size * 0.08}
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={size * 0.08}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.stroke}80)`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("text-4xl font-black transition-colors duration-500", colors.text)}
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
            {label}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80", colors.text)}>
            {getQualityLabel()}
          </span>
        </div>
      </div>
    </div>
  );
};
