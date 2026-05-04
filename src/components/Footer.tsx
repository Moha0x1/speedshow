"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="mt-8 border-t border-card-border bg-black/40 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 opacity-70">
            <div className="h-6 w-6 rounded-md bg-white/20" />
            <span className="text-sm font-bold tracking-tighter text-white">SPEEDSHOW</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Una forma mas clara de ver si tu conexion da la talla para casa, streaming y gaming.
          </p>
        </div>
        
        <p className="order-3 text-xs font-bold uppercase tracking-widest text-muted md:order-2">
          &copy; 2026 crafted in Barcelona
        </p>
        
        <div className="order-2 flex flex-wrap justify-center gap-x-6 gap-y-4 text-xs font-bold uppercase tracking-widest text-muted md:order-3">
          <Link href="/internet-speed-test" className="transition-colors hover:text-white">Casa</Link>
          <Link href="/streaming-speed-test" className="transition-colors hover:text-white">Streaming</Link>
          <Link href="/gaming-speed-test" className="transition-colors hover:text-white">Gaming</Link>
          <Link href="/vpn-performance-test" className="transition-colors hover:text-white">Privacy</Link>
        </div>
      </div>
    </footer>
  );
};
