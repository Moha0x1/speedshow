"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
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

        <div className="w-full">
          <SpeedTestTool />
        </div>

        <SEOContent 
          title="SpeedShow Diagnostics"
          description="SpeedShow is a comprehensive network diagnostic tool designed for modern high-performance internet needs. Unlike basic speed tests, we focus on the metrics that actually matter: gaming ping, streaming stability, VPN overhead, and Web3 RPC latency.\n\nOur tool runs high-precision tests directly from edge locations to provide you with real-world performance data, helping you optimize your connection for any task."
          faqs={[
            {
              question: "How accurate is SpeedShow compared to other tests?",
              answer: "SpeedShow utilizes professional-grade ping and download workers that measure latency and jitter at a millisecond level, providing a more granular view of connection stability than traditional speed tests."
            },
            {
              question: "What is a good internet score?",
              answer: "An internet score above 80/100 is considered excellent for all tasks including competitive gaming and 4K streaming. Scores between 60-80 are good, while anything below 40 may indicate serious network issues."
            },
            {
              question: "Does SpeedShow store my data?",
              answer: "No. SpeedShow is privacy-focused. We do not use tracking cookies or store your IP address. Each test is stateless and transient."
            }
          ]}
          additionalContent={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 glass rounded-2xl border-white/5">
                <h4 className="text-white font-bold text-lg mb-2">Edge Precision</h4>
                <p className="text-muted text-sm font-medium">Testing directly from the edge for real-world accuracy.</p>
              </div>
              <div className="p-6 glass rounded-2xl border-white/5">
                <h4 className="text-white font-bold text-lg mb-2">Contextual Recommendations</h4>
                <p className="text-muted text-sm font-medium">Get tailored advice for VPNs, routers, and ISPs based on your results.</p>
              </div>
            </div>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
