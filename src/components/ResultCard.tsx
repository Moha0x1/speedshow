'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ResultCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  delay?: number;
}

export function ResultCard({ label, value, icon, delay = 0 }: ResultCardProps) {
  return (
    <motion.div 
      className="flex flex-col items-center p-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-2xl w-full"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-2 mb-3 text-gray-400">
        {icon}
        <span className="text-sm font-semibold tracking-wider uppercase">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white text-center">
        {value}
      </div>
    </motion.div>
  );
}
