"use client";

import React from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header = () => {
  const pathname = usePathname();
  
  return (
    <header className="py-4 px-6 border-b border-card-border sticky top-0 z-50 bg-[#0a0a0a]/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <Zap className="text-primary w-4 h-4 fill-primary/20" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Speed<span className="text-primary">Show</span>
          </h1>
        </Link>


        {pathname !== '/privacy' && (
          <Link 
            href="/privacy" 
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            Privacy
          </Link>
        )}
      </div>
    </header>
  );
};
