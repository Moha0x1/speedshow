import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Statement | SpeedShow",
  description: "Learn how SpeedShow.app handles your data and protects your privacy during network diagnostics.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        <section className="mb-12">
          <h1 className="text-4xl font-black text-white mb-6">
            Privacy <span className="text-primary">Statement</span>
          </h1>
          <p className="text-muted text-sm font-bold uppercase tracking-widest mb-8">
            Last Updated: March 15, 2026
          </p>
          
          <div className="prose prose-invert max-w-none space-y-8 text-muted leading-relaxed">
            <p>
              This Privacy Statement explains our practices regarding the collection, use, and disclosure of certain information, 
              including your personal information in connection with the <strong>SpeedShow.app</strong> internet diagnostics service.
            </p>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Contacting Us</h2>
              <p>
                For questions specifically about this Privacy Statement, or our use of your personal information, please contact 
                us by email at <span className="text-primary">legal@speedshow.app</span>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Collection of Information</h2>
              <p>We receive and store information about you such as:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong>Information you provide:</strong> We collect information when you choose to provide configuration 
                  preferences or interact with our diagnostic tools.
                </li>
                <li>
                  <strong>Information collected automatically:</strong> We collect information regarding your network, 
                  network devices, and your computer or mobile phone used to access our service. This includes IP address 
                  (which tells us your general location and internet service provider (ISP)), connection information 
                  such as speed and latency measurements, connection type (wifi, cellular), and browser details.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Use of Information</h2>
              <p>We use information to provide, analyze, administer, and enhance the SpeedShow diagnostics service. This includes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Determining your general geographic location and ISP to support network troubleshooting.</li>
                <li>Securing our systems and preventing fraud.</li>
                <li>Analyzing and understanding our audience to improve our user interface and service performance.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Disclosure of Information</h2>
              <p>
                We disclose your information for certain purposes and to third parties, such as service providers who 
                assist us with security, infrastructure, and analytics. We do not sell your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Security</h2>
              <p>
                We use reasonable administrative, logical, physical and managerial measures to safeguard your personal 
                information against loss, theft and unauthorized access. No measures can be guaranteed to provide 100% security.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl border-white/5 bg-white/[0.02] mt-12">
              <p className="text-sm font-medium">
                Individuals under the age of 18 may utilize the service only with the involvement, supervision, and approval 
                of a parent or legal guardian. By using SpeedShow.app, you acknowledge the terms described in this statement.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
