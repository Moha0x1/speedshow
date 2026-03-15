import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
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
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <section className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Gaming <span className="text-primary">Performance</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium">
            Test ping, jitter, and packet loss for optimal competitive play.
          </p>
        </section>

        <SpeedTestTool initialTest="gaming" />

        <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-16">
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-2xl font-bold text-white mb-4">What is Jitter?</h3>
            <p className="text-muted font-medium leading-relaxed">
              Jitter is the variance in time delay between data packets over a network. High jitter causes 
              &quot;teleporting&quot; or &quot;rubber-banding&quot; in games like CS2, Valorant, or League of Legends. 
              Ideally, your jitter should be under 5ms.
            </p>
          </div>
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-2xl font-bold text-white mb-4">Packet Loss Explained</h3>
            <p className="text-muted font-medium leading-relaxed">
              Packet loss occurs when data packets fail to reach their destination. Even 1% packet loss 
              can cause noticeable stutters and missed shots in fast-paced games. This is usually 
              caused by network congestion or faulty hardware.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
