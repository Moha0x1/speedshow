import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streaming Speed Test | SpeedShow",
  description: "Verify your connection for 4K and 8K streaming. Check stability and download speeds for Netflix, YouTube, and Twitch.",
};

export default function StreamingTestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <section className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Streaming <span className="text-secondary">Readiness</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium leading-relaxed">
            Ensure your connection handles 4K and 8K streams without buffering.
          </p>
        </section>

        <SpeedTestTool initialTest="streaming" />

        <section className="mt-24 glass p-10 rounded-[2.5rem] border-secondary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] -z-10" />
          <h3 className="text-2xl font-bold text-white mb-6">Streaming Speed Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
              <div className="text-secondary font-bold text-xl mb-2">1080p HD</div>
              <div className="text-3xl font-black text-white mb-2">5 Mbps</div>
              <p className="text-muted text-sm">Consistent speed required for standard high-def streaming.</p>
            </div>
            <div className="p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
              <div className="text-purple-400 font-bold text-xl mb-2">4K Ultra HD</div>
              <div className="text-3xl font-black text-white mb-2">25 Mbps</div>
              <p className="text-muted text-sm">Recommended for stable 4K playback on platforms like Netflix.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-primary/10">
              <div className="text-primary font-bold text-xl mb-2">Multi-Stream 8K</div>
              <div className="text-3xl font-black text-white mb-2">100+ Mbps</div>
              <p className="text-muted text-sm">Future-proof speed for 8K video and multiple concurrent users.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
