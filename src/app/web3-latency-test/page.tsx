import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web3 Node Latency Test | SpeedShow",
  description: "Check RPC response times for Ethereum, Base, and Solana. Ensure your wallet and dApps are connected to the fastest available nodes.",
};

export default function Web3TestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <section className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
            Web3 <span className="text-orange-400">Latency</span>
          </h1>
          <p className="text-muted text-sm md:text-base font-medium leading-relaxed">
            Check RPC response times for professional trading and DeFi.
          </p>
        </section>

        <SpeedTestTool initialTest="web3" />

        <section className="mt-24">
          <div className="glass p-12 rounded-[3rem] border-orange-400/20 flex flex-col items-center text-center">
            <h3 className="text-3xl font-black text-white mb-6">Master the Mempool</h3>
            <p className="text-muted text-lg max-w-2xl mb-10 leading-relaxed font-medium">
              High RPC latency can lead to failed transactions or getting front-run by bots. 
              By measuring the response time of nodes on Base, Solana, and Ethereum, 
              you can ensure your dApp connection is as fast as possible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Ethereum', 'Base', 'Solana', 'Arbitrum', 'Polygon'].map(net => (
                <span key={net} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-muted">
                  {net}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
