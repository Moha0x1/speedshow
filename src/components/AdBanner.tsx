"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  position: "top" | "bottom";
  className?: string;
}

export const AdBanner = ({ position, className }: AdBannerProps) => {
  return (
    <div className={cn(
      "w-full flex flex-col items-center justify-center p-4 my-8 relative overflow-hidden",
      "border border-white/5 bg-white/[0.02] rounded-2xl min-h-[120px]",
      className
    )}>
      <div className="absolute top-2 right-3 text-[10px] font-bold text-muted/50 uppercase tracking-widest">
        Advertisement
      </div>
      
      {/* AdSense Placeholder */}
      <div className="text-muted/40 text-sm font-medium italic">
        {position === "top" ? "Featured Content" : "Sponsored Related Links"}
      </div>
      
      <div className="mt-2 w-full max-w-2xl h-16 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center">
        <span className="text-muted/20 text-xs">Ad Slot (responsive_banner_ad)</span>
      </div>
      
      {/* This is where the actual AdSense code would go */}
      {/* 
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
           data-ad-slot="XXXXXXXXXX"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      */}
    </div>
  );
};
