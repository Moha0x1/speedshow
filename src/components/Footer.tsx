"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-card-border mt-12 bg-black/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-6 h-6 bg-white/20 rounded-md" />
          <span className="font-bold text-sm tracking-tighter text-white">SPEEDSHOW</span>
        </div>
        
        <p className="text-muted text-xs font-bold uppercase tracking-widest order-3 md:order-2">
          &copy; 2026 crafted with ❤️ in Barcelona
        </p>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 text-xs font-bold uppercase tracking-widest text-muted order-2 md:order-3">
          <Link href="/gaming-speed-test" className="hover:text-white transition-colors">Gaming</Link>
          <Link href="/streaming-speed-test" className="hover:text-white transition-colors">Streaming</Link>
          <Link href="/vpn-performance-test" className="hover:text-white transition-colors">VPN</Link>
          <Link href="/web3-latency-test" className="hover:text-white transition-colors">Web3</Link>
          <Link href="/privacy" className="hover:text-white transition-colors text-primary/80">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};
