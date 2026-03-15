import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streaming Quality Test | 4K & 8K Buffer Diagnostic",
  description: "Measure sustained download speeds and connection stability for 4K and 8K streaming. Ensure zero buffering on Netflix, YouTube, and Twitch.",
  alternates: { canonical: '/streaming-speed-test' }
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

        <SEOContent 
          title="Streaming Quality"
          description="Streaming high-quality video content requires a consistent and fast download speed. While standard HD may work on 5 Mbps, 4K Ultra HD demands at least 25 Mbps per device. Beyond speed, connection stability is key to preventing mid-movie buffering."
          faqs={[
            {
              question: "How much speed do I need for Netflix 4K?",
              answer: "Netflix recommends at least 15 Mbps for 4K streaming, but 25 Mbps is safer for consistent quality and to account for other devices on your network."
            },
            {
              question: "Why does my video keep buffering even with fast internet?",
              answer: "Buffering can be caused by high jitter, server congestion, or weak Wi-Fi signal. Even if your peak speed is high, instability can drop the connection intermittently."
            },
            {
              question: "Does using a VPN affect streaming quality?",
              answer: "It can. A VPN adds encryption overhead. However, if your ISP throttles streaming traffic, a VPN might actually improve your speeds by hiding your activity."
            }
          ]}
          additionalContent={
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Speed Requirements</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                  <span className="text-secondary font-bold">1080p HD</span>
                  <span className="text-white font-black">5 Mbps</span>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                  <span className="text-purple-400 font-bold">4K Ultra HD</span>
                  <span className="text-white font-black">25 Mbps</span>
                </div>
                <div className="flex items-center justify-between p-4 glass rounded-xl border-primary/20 bg-primary/5">
                  <span className="text-primary font-bold">8K / Multi-Stream</span>
                  <span className="text-white font-black">100+ Mbps</span>
                </div>
              </div>
            </div>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
