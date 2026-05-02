"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 md:py-20 w-full flex flex-col items-center">
        {/* Minimal Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-3xl text-center"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Speed<span className="text-primary">Show</span>
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-muted md:text-lg">
            Datos reales para saber si tu internet va bien para casa, streaming en Twitch o YouTube, partidas online y privacidad. Nada de numeritos sin contexto.
          </p>
        </motion.div>

        <div className="w-full">
          <SpeedTestTool />
        </div>
      </main>

      <Footer />
    </div>
  );
}
