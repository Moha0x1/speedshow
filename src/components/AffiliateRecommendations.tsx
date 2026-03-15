"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Shield, Server, Router, Zap } from "lucide-react";
import { TestType, AffiliateRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AffiliateRecommendationsProps {
  type: TestType;
  results: any;
}

export const AffiliateRecommendations = ({ type, results }: AffiliateRecommendationsProps) => {
  const getContent = (): AffiliateRecommendation[] => {
    switch (type) {
      case 'gaming':
        if (results?.ping > 30 || results?.jitter > 5) {
          return [{
            id: 'gaming-router',
            title: 'Optimize Your Latency',
            description: 'Your jitter is higher than ideal. Switch to a dedicated gaming router with QoS to prioritize your traffic.',
            buttonText: 'View Top Gaming Routers',
            link: '#',
            type: 'router'
          }];
        }
        return [{
          id: 'gaming-vpn-low',
          title: 'Secure Competitive Play',
          description: 'Keep your IP hidden from DDoS attacks while maintaining low latency with our partner VPNs.',
          buttonText: 'Explore Gaming VPNs',
          link: '#',
          type: 'vpn'
        }];
        
      case 'vpn':
        if (results?.latencyImpact > 30) {
          return [{
            id: 'vpn-upgrade',
            title: 'Latency is too high?',
            description: 'Your current VPN is adding significant delay. These providers offer specialized high-speed protocols.',
            buttonText: 'Top High-Speed VPNs',
            link: '#',
            type: 'vpn'
          }];
        }
        return [{
          id: 'vpn-privacy',
          title: 'Maximum Privacy Protection',
          description: 'Ensure no logs are kept. Check out the most audited privacy-focused VPN services.',
          buttonText: 'See Privacy Leaders',
          link: '#',
          type: 'vpn'
        }];

      case 'streaming':
        if (results?.downloadSpeed < 100) {
          return [{
            id: 'isp-upgrade',
            title: 'Buffer-Free Future',
            description: 'Your download speed might struggle with concurrent 4K streams. Upgrade to Fiber for better stability.',
            buttonText: 'Check Local Fiber Plans',
            link: '#',
            type: 'isp'
          }];
        }
        return [{
          id: 'streaming-box',
          title: 'Ultimate 4K Experience',
          description: 'Your speed is excellent. Get the most out of your fiber connection with top-tier streaming hardware.',
          buttonText: 'Best 4K Streamers',
          link: '#',
          type: 'router'
        }];

      case 'web3':
        return [{
          id: 'hosting-nodes',
          title: 'Build Faster on Base',
          description: 'Deploy your nodes closer to the RPC entry points for sub-100ms response times.',
          buttonText: 'Node Hosting Partners',
          link: '#',
          type: 'hosting'
        }];
        
      default:
        return [];
    }
  };

  const recommendations = getContent();

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h4 className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-4">Contextual Recommendations</h4>
      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
            className="group relative overflow-hidden glass p-5 rounded-2xl border-primary/10 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              {rec.type === 'vpn' && <Shield size={24} />}
              {rec.type === 'router' && <Router size={24} />}
              {rec.type === 'isp' && <Zap size={24} />}
              {rec.type === 'hosting' && <Server size={24} />}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h5 className="text-white font-bold mb-1">{rec.title}</h5>
              <p className="text-muted text-sm leading-relaxed">{rec.description}</p>
            </div>
            
            <a 
              href={rec.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl transition-all text-sm font-bold border border-primary/20"
            >
              {rec.buttonText} <ExternalLink size={14} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
