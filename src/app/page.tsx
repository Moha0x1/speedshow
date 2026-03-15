"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-6 md:py-10 w-full flex flex-col items-center">
        {/* Simplified & Compressed Hero Section */}
        <div className="mb-4 text-center max-w-2xl px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-5xl font-black text-white mb-2"
          >
            Internet <span className="text-secondary">Diagnostics</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted text-sm md:text-base font-medium"
          >
            Professional network testing for your specific needs.
          </motion.p>
        </div>

        {/* Modular Speed Test Tool (includes AdBanners internally) */}
        <div className="w-full">
          <SpeedTestTool />
        </div>

        {/* Footer info moved or simplified */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12 opacity-80">
          <div className="text-center md:text-left p-4">
            <h4 className="text-white font-bold text-lg mb-2">Edge Precision</h4>
            <p className="text-muted text-sm font-medium">Testing directly from the edge for real-world accuracy.</p>
          </div>
          <div className="text-center md:text-left p-4">
            <h4 className="text-white font-bold text-lg mb-2">No Tracking</h4>
            <p className="text-muted text-sm font-medium">Privacy focused. No cookies, no history, just data.</p>
          </div>
          <div className="text-center md:text-left p-4">
            <h4 className="text-white font-bold text-lg mb-2">Contextual</h4>
            <p className="text-muted text-sm font-medium">Deeper metrics for Gaming, Streaming, and Web3.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
