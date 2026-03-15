import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packet Loss Test Online | Check How Much Data is Lost | SpeedShow",
  description: "Check your network for dropped packets. Even a small percentage of packet loss will cause stutter and lagging. Test your connection health.",
  alternates: { canonical: '/packet-loss-test' }
};

export default function PacketLossTestPage() {
  const faqs = [
    {
      question: "What is packet loss in a network?",
      answer: "Packet loss occurs when data packets fail to reach their destination. It results in stuttering, dropped calls, or disconnected session in gaming."
    },
    {
      question: "What is an acceptable level of packet loss?",
      answer: "A good connection has 0% packet loss. Anything above 1-2% is noticeable and can cause issues. For pro gamers, anything >0.1% is too high."
    },
    {
      question: "How do I fix packet loss on my connection?",
      answer: "Check your cables, restart your router, avoid Wi-Fi, or check with your ISP. Faulty network hardware is the most common cause of local packet loss."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <section className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Packet Loss <span className="text-primary">Test</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Check if your network packets are being dropped.
          </p>
        </section>

        <SpeedTestTool initialTest="gaming" />

        <SEOContent 
          title="Packet Loss"
          description="While ping and jitter are about time, packet loss is about data completion. It occurs when one or more packets of data travelling across a computer network fail to reach their destination.\n\nPacket loss is typically caused by errors in data transmission, hardware issues, or network congestion. 0% loss is always the goal for a healthy network connection."
          faqs={faqs}
          additionalContent={
            <>
              <h3 className="text-2xl font-bold text-white mb-4">Improve gaming latency</h3>
              <p className="text-muted font-medium mb-4">
                 Ensuring 0% packet loss is essential for improving perceived gaming latency. 
                 When a packet is lost, the network must retransmit it, which causes a huge jump 
                 in effective latency.
              </p>
              <ul className="text-muted font-medium list-disc ml-4 space-y-2">
                <li>Replace old network cables (Cat5/5e should be upgraded to Cat6+)</li>
                <li>Ensure router is not overheating</li>
                <li>Contact ISP to check for network-side issues</li>
              </ul>
            </>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
