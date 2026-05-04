"use client";

import React from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-[#0a0a0a]/80 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/20">
            <Zap className="text-primary w-4 h-4 fill-primary/20" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Speed<span className="text-primary">Show</span>
            </h1>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:block">
              casa, streaming y gaming
            </p>
          </div>
        </Link>


        {pathname !== '/privacy' && (
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-400 md:block">
              Datos reales sin registros
            </div>
            <Link 
              href="/privacy" 
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10"
            >
              Privacy
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
