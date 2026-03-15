import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VPN & Privacy Test | Measure Encryption Overhead",
  description: "Detect VPNs and measure the latency impact of your encryption layers. Precision tool for privacy-conscious users and remote workers.",
  alternates: { canonical: '/vpn-performance-test' }
};

export default function VPNTestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <section className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            VPN <span className="text-cyan-400">Analysis</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium leading-relaxed">
            Measure the exact latency overhead added by your encryption layers.
          </p>
        </section>

        <SpeedTestTool initialTest="vpn" />

        <SpeedTestTool initialTest="vpn" />

        <SEOContent 
          title="VPN & Privacy"
          description="A VPN (Virtual Private Network) is essential for privacy, but it inevitably adds some latency due to the encryption process and the extra distance data must travel to the VPN server. Our test measures this 'latency impact'—the difference between your normal ping and your VPN ping.\n\nWe also analyze your IP type to determine if you appear as a datacenter (common for VPNs) or residential user, which affects how websites treat your connection."
          faqs={[
            {
              question: "How much latency does a VPN add?",
              answer: "A well-optimized VPN using modern protocols like WireGuard typically adds 10-20ms if you are connected to a nearby server. Poorly routed or distant servers can add over 100ms."
            },
            {
              question: "Does a VPN hide my real IP address?",
              answer: "Yes, a VPN replaces your IP with the IP of the VPN server. However, some websites can still detect you are using a VPN if the IP is flagged as belonging to a datacenter."
            },
            {
              question: "Can a VPN improve my internet speed?",
              answer: "Generally no, but it can help if your ISP is specifically throttling certain types of traffic (like streaming) or has poor routing to specific servers."
            }
          ]}
          additionalContent={
            <div className="space-y-6">
              <div className="glass p-6 rounded-2xl border-cyan-400/10">
                <h4 className="text-xl font-bold text-white mb-2">Latency Overhead</h4>
                <p className="text-muted text-sm leading-relaxed">
                  If your &quot;ping delta&quot; is over 50ms, your VPN might be poorly optimized or too far from your physical location.
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border-cyan-400/10">
                <h4 className="text-xl font-bold text-white mb-2">IP Type Leaks</h4>
                <p className="text-muted text-sm leading-relaxed">
                  We analyze your IP footprint to see if you appear as a Residential user or a tracked VPN server.
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
