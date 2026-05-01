'use client';

import { motion } from 'framer-motion';

interface SpeedGaugeProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
}

export function SpeedGauge({ value, max = 1000, label, unit = 'Mbps' }: SpeedGaugeProps) {
  // SVG Math for a semi-circle arc
  const radius = 90;
  const circumference = Math.PI * radius; // Half circle
  
  // Calculate fill percentage (clamped to 1)
  const percent = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-64 h-48">
      <svg className="w-full h-full transform -rotate-180" viewBox="0 0 200 100">
        {/* Background Arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Animated Fill Arc */}
        <motion.path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#eab308" /* Yellow color per user request */
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center bottom-6">
        <motion.div 
          className="text-4xl font-bold text-yellow-500 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={value} // Re-animate slightly on value change could be noisy, so omit key to let text just update, but framer motion handles text updates well without key if we just render it. 
        >
          {value.toFixed(1)}
        </motion.div>
        <div className="text-sm text-gray-400 font-medium tracking-widest uppercase mt-1">
          {unit}
        </div>
      </div>
      
      <div className="absolute bottom-0 text-xs text-gray-500 tracking-widest uppercase">
        {label}
      </div>
    </div>
  );
}
