import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ping Test Online | Check Your Network Latency | SpeedShow",
  description: "Accurately measure your network ping. Low latency (ping) is essential for gaming, VoIP, and smooth web browsing. Test your connection speed instantly.",
  alternates: { canonical: '/ping-test' }
};

export default function PingTestPage() {
  const faqs = [
    {
      question: "What is a good ping for gaming?",
      answer: "A good ping for gaming is typically below 50ms. Pro gamers aim for sub-20ms. Anything above 100ms can cause noticeable lag in competitive play."
    },
    {
      question: "How can I lower my ping?",
      answer: "To reduce latency, use a wired Ethernet connection, close background downloads, restart your router, or use a gaming-optimized VPN."
    },
    {
      question: "Why is my ping so high today?",
      answer: "High ping can be caused by network congestion, ISP maintenance, distance from the server, or faulty local network hardware."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <section className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Ping <span className="text-primary">Test</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Measure your millisecond-level network latency in real-time.
          </p>
        </section>

        <SpeedTestTool initialTest="gaming" />

        <SEOContent 
          title="Ping & Latency"
          description="Ping is the reaction time of your connection—how fast you get a response after you&apos;ve sent out a request. A low ping means a more responsive connection, especially important in applications where timing is everything.\n\nLatency is the actual time it takes for data to travel from your device to a server and back. It is measured in milliseconds (ms)."
          faqs={faqs}
          additionalContent={
            <>
              <h3 className="text-2xl font-bold text-white mb-4">How to reduce latency</h3>
              <ul className="text-muted font-medium list-disc ml-4 space-y-2">
                <li>Switch to a wired Ethernet connection</li>
                <li>Close high-bandwidth background applications</li>
                <li>Ensure your network router's firmware is up-to-date</li>
                <li>Connect to gaming servers closest to your physical location</li>
                <li>Use a specialized gaming VPN like ExitLag</li>
              </ul>
            </>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
