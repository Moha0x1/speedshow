import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedTestTool } from "@/components/SpeedTestTool";
import { SEOContent } from "@/components/SEOContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web3 RPC Latency | Crypto Trader Network Diagnostic",
  description: "Ping Ethereum, Solana, and Bitcoin RPC nodes. Milliseconds matter in DeFi and NFT trading - find your fastest connection now.",
  alternates: { canonical: '/web3-latency-test' }
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

        <SpeedTestTool initialTest="web3" />

        <SEOContent 
          title="Web3 RPC Latency"
          description="In the world of DeFi, NFTs, and high-frequency crypto trading, milliseconds are the difference between a successful trade and a front-run failure. RPC (Remote Procedure Call) latency measures how long it takes for your request to reach a blockchain node and get a response.\n\nLower RPC latency ensures your transactions hit the mempool faster, giving you a competitive edge on networks like Solana, Base, and Ethereum."
          faqs={[
            {
              question: "Why does RPC latency matter for trading?",
              answer: "High RPC latency can lead to failed transactions or getting front-run by bots. The faster your connection to the node, the more likely your transaction will be included in the next block."
            },
            {
              question: "How can I lower my Web3 latency?",
              answer: "Use premium RPC providers (like Ankr or Alchemy), choose nodes geographically close to you, or use a high-speed fiber connection instead of Wi-Fi."
            },
            {
              question: "What is a good RPC ping?",
              answer: "For professional trading, sub-50ms is excellent. Anything above 200ms is considered slow and may cause issues with real-time dApp interactions."
            }
          ]}
          additionalContent={
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-6">Supported Networks</h3>
              <div className="flex flex-wrap gap-3">
                {['Ethereum', 'Base', 'Solana', 'Arbitrum', 'Polygon', 'Bitcoin'].map(net => (
                  <span key={net} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold text-muted">
                    {net}
                  </span>
                ))}
              </div>
              <p className="text-muted text-sm font-medium leading-relaxed mt-4">
                We measure response times across major Layer 1 and Layer 2 networks to ensure your trading setup is optimized.
              </p>
            </div>
          }
        />
      </main>

      <Footer />
    </div>
  );
}
