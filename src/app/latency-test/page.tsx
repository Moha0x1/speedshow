import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latency Test Online | Check Network Latency & Ping | SpeedShow",
  description: "Check your network latency and ping in milliseconds. Detailed network delay statistics. High latency can cause slow web browsing and poor gaming performance.",
  alternates: { canonical: '/latency-test' }
};

export default function LatencyTestPage() {
  const faqs = [
    {
      question: "What is network latency?",
      answer: "Network latency is the time it takes for a data packet to travel from its source to its destination. It is often referred to as ping time."
    },
    {
      question: "What is a good latency speed?",
      answer: "A good latency speed is under 50ms. Between 50ms and 100ms is acceptable for most applications, but above 150ms is considered high latency."
    },
    {
      question: "Can I fix high latency?",
      answer: "To lower latency, you can switch to an Ethernet cable, close background processes, restart your router, or use a specialized gaming VPN."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <section className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Latency <span className="text-primary">Test</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Check network response speed with high-precision testing.
          </p>
        </section>

        <SpeedTestTool initialTest="gaming" />

        <SEOContent 
          title="Latency"
          description="Latency is the actual time it takes for data to travel across a network. It is the most critical metric for any real-time interaction, from online gaming to trading on decentralized exchanges.\n\nWhile bandwidth (speed) tells you how much data you can transfer, latency tells you how fast that transfer *starts*. A &apos;fast&apos; connection with high latency will still feel sluggish."
          faqs={faqs}
          additionalContent={
            <>
              <h3 className="text-2xl font-bold text-white mb-4">How to reduce latency</h3>
              <p className="text-muted font-medium mb-4">
                Reducing latency starts with local optimization. Ensure your network is not congested 
                and that your ISP's routing is direct.
              </p>
              <ul className="text-muted font-medium list-disc ml-4 space-y-2">
                <li>Optimize router settings for QoS (Quality of Service)</li>
                <li>Ensure network drivers are up-to-date</li>
                <li>Connect to more direct network routes using a VPN</li>
              </ul>
            </>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
