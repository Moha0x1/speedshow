import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
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

        <section className="mt-24 space-y-12">
          <h3 className="text-3xl font-black text-white text-center">Why test your VPN?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-3xl border-cyan-400/20">
              <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" /> Latency Overhead
              </h4>
              <p className="text-muted leading-relaxed">
                Every VPN adds some delay as data is encrypted and routed through a remote server. 
                If your &quot;ping delta&quot; is over 50ms, your VPN might be poorly optimized or too far from 
                your physical location.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl border-cyan-400/20">
              <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" /> IP Type Leaks
              </h4>
              <p className="text-muted leading-relaxed">
                Websites can often tell if you&apos;re using a VPN by checking if your IP belongs to a 
                Datacenter. We analyze your IP footprint to see if you appear as a Residential 
                user or a tracked VPN server.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
