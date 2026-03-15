import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gaming Speed Test | Best Ping & Jitter for Pro Gamers",
  description: "Test your internet for competitive gaming. Precise ping, jitter, and packet loss metrics to optimize your connection for Valorant, CS2, League of Legends and more.",
  alternates: { canonical: '/gaming-speed-test' }
};

export default function GamingTestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <section className="mb-6">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Gaming <span className="text-primary">Performance</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Test ping, jitter, and packet loss for optimal competitive play.
          </p>
        </section>

        <SpeedTestTool initialTest="gaming" />

        <SEOContent 
          title="Gaming Performance"
          description="Competitive gaming requires more than just high download speeds. It demands low latency (ping), minimal jitter, and zero packet loss. Even the fastest internet connection can be poor for gaming if these metrics are unstable.\n\nOur gaming test measures these critical KPIs by simulating real-world game server interactions across multiple global regions."
          faqs={[
            {
              question: "What is the most important metric for gaming?",
              answer: "Ping (latency) is usually the most important. However, high jitter or packet loss can be even more disruptive, causing 'teleporting' or disconnected sessions."
            },
            {
              question: "How do I improve my gaming ping?",
              answer: "Use an Ethernet cable instead of Wi-Fi, close background downloads, and ensure your router's QoS settings prioritize gaming traffic."
            },
            {
              question: "Does a VPN help with gaming lag?",
              answer: "Sometimes. If your ISP has poor routing to game servers, a specialized gaming VPN can provide a more direct path, potentially lowering your ping."
            }
          ]}
          additionalContent={
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">What is Jitter?</h3>
                <p className="text-muted text-sm font-medium leading-relaxed">
                  Jitter is the variance in time delay between data packets. High jitter causes &quot;rubber-banding&quot; in games like CS2, Valorant, or League of Legends. Ideally, keep it under 5ms.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Packet Loss Explained</h3>
                <p className="text-muted text-sm font-medium leading-relaxed">
                  Packet loss happens when data fails to reach its destination. Even 1% loss can cause noticeable stutters and missed shots in fast-paced games.
                </p>
              </div>
            </div>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
