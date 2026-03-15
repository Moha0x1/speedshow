"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
}

export const ScoreGauge = ({ score, label, size = 200 }: ScoreGaugeProps) => {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
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
            className="stroke-primary"
            strokeWidth={size * 0.08}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))"
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-black text-white"
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-xs font-bold text-muted uppercase tracking-widest">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
