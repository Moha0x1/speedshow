import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";

const DOMAIN = "https://speedshow.vercel.app";
export const metadata: Metadata = {
  verification: {
    google: "z3bzwH4eVkRM4Tc1Aap92_dVcHuMy7vevk8QFTNtAK4",
  },
  title: {
    default: "SpeedShow | See the real performance of your internet",
    template: "%s | SpeedShow"
  },
  description: "Advanced internet diagnostics for Gaming, Streaming, VPN, and Web3. Get precise latency, jitter, and throughput metrics in seconds. Best ping test for competitive gamers and DeFi traders.",
  keywords: ["speed test", "ping test", "gaming speed", "jitter test", "web3 latency", "rpc ping", "vpn speed test", "network diagnostics", "internet speed"],
  authors: [{ name: "SpeedShow Team" }],
  creator: "SpeedShow",
  publisher: "SpeedShow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(DOMAIN),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  category: 'technology',
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: DOMAIN,
    siteName: "SpeedShow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpeedShow - Internet Diagnostics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeedShow | Professional Internet Diagnostics",
    description: "Check your real network performance for Gaming, Streaming, and Web3.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
