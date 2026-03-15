import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jitter Test Online | Check Consistency of Your Ping | SpeedShow",
  description: "Check your network jitter online. Fluctuating ping can ruin streaming and gaming. Test your jitter and get suggestions for a stable connection.",
  alternates: { canonical: '/jitter-test' }
};

export default function JitterTestPage() {
  const faqs = [
    {
      question: "What is Jitter in a network test?",
      answer: "Jitter is the variation in the latency (ping) between packets of data transferred. High jitter means your ping is fluctuating significantly, which can cause 'teleporting' in games."
    },
    {
      question: "What is an acceptable jitter level?",
      answer: "A good jitter level is typically below 5ms. Anything above 20-30ms is considered high and will cause issues with real-time applications."
    },
    {
      question: "How do I fix high jitter?",
      answer: "High jitter is usually due to network congestion or Wi-Fi interference. Switching to an Ethernet cable is the most effective fix for jitter problems."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <section className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Jitter <span className="text-primary">Test</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Test and measure network ping variance for stability.
          </p>
        </section>

        <SpeedTestTool initialTest="gaming" />

        <SEOContent 
          title="Jitter"
          description="In simplest terms, jitter is the discrepancy in time between when data packets leave the source and when they arrive at the destination. It indicates the stability of your connection.\n\nWhile ping measures how fast data travels, jitter measures how consistently it travels. High jitter can feel like lag even if your average ping is low."
          faqs={faqs}
          additionalContent={
            <>
              <h3 className="text-2xl font-bold text-white mb-4">How VPN affects speed</h3>
              <p className="text-muted font-medium mb-4">
                A VPN encrypts your traffic and routes it through an extra server, which can sometimes 
                increase jitter if the VPN server is congested. However, a high-quality VPN can actually 
                reduce jitter if it bypasses poor ISP routing.
              </p>
              <ul className="text-muted font-medium list-disc ml-4 space-y-2">
                <li>Optimize VPN protocol for speed (e.g., WireGuard)</li>
                <li>Ensure you have a modern, high-quality network cable (Cat6+)</li>
              </ul>
            </>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
