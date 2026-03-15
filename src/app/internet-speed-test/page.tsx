import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internet Speed Test Online | Check Download & Upload | SpeedShow",
  description: "Check your internet speed instantly. Accurate and fast testing for download speed and connection quality. Optimized for 4K streaming and high bandwidth tasks.",
  alternates: { canonical: '/internet-speed-test' }
};

export default function InternetSpeedTestPage() {
  const faqs = [
    {
      question: "What is a good internet speed for streaming?",
      answer: "A good download speed for standard 1080p streaming is 5Mbps. For 4K UHD streaming, 25Mbps is recommended per device."
    },
    {
      question: "How do I get faster internet speed?",
      answer: "To increase your speed, check your plan with your ISP, use an Ethernet cable, close concurrent downloads, and ensure your router is modern."
    },
    {
      question: "Why is my speed slower than what I pay for?",
      answer: "ISPs often say 'up to' a certain speed. Your actual speed can be limited by Wi-Fi, background usage, ISP congestion, or your local network hardware."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <section className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Internet Speed <span className="text-primary">Test</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Fast, accurate check for your bandwidth and streaming quality.
          </p>
        </section>

        <SpeedTestTool initialTest="streaming" />

        <SEOContent 
          title="Internet Speed"
          description="Your internet speed refers to how much data can be transferred in a set amount of time. It is typically divided into download speed (receiving data) and upload speed (sending data).\n\nMeasuring in Mbps (Megabits per second), your internet speed determines how quickly you can download large files, how well videos stream, and whether multiple people can use the same connection simultaneously."
          faqs={faqs}
          additionalContent={
            <>
              <h3 className="text-2xl font-bold text-white mb-4">How VPN affects speed</h3>
              <p className="text-muted font-medium mb-4">
                VPNs typically cause a slight drop in internet speed due to the overhead of encryption 
                and rerouting. To minimize this, use high-speed protocols like WireGuard or NordLynx 
                and select a server close to your location.
              </p>
              <ul className="text-muted font-medium list-disc ml-4 space-y-2">
                <li>Upgrade your Wi-Fi router (e.g., to Wi-Fi 6 or 6E)</li>
                <li>Limit the number of devices connected simultaneously</li>
              </ul>
            </>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
