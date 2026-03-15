"use client";

import React from "react";
import { motion } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOContentProps {
  title: string;
  description: string;
  faqs: FAQItem[];
  additionalContent?: React.ReactNode;
}

export const SEOContent = ({ title, description, faqs, additionalContent }: SEOContentProps) => {
  return (
    <div className="mt-12 space-y-8 border-t border-white/5 pt-10">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-[2rem] border-primary/10">
          <h2 className="text-xl font-bold text-white mb-3">Understanding {title}</h2>
          <div className="text-muted text-sm font-medium leading-relaxed space-y-3">
             {description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
             ))}
          </div>
        </div>
        
        {additionalContent && (
          <div className="glass p-6 rounded-[2rem] border-primary/10">
            {additionalContent}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-black text-white mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass p-5 rounded-2xl border-white/5"
            >
              <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
              <p className="text-muted text-sm font-medium leading-relaxed">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
        
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
      </section>
    </div>
  );
};
