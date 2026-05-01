# ⚡ SpeedShow.app
> **"See the real performance of your internet"**

SpeedShow is a premium, visual internet diagnostics platform. Unlike generic speed tests, SpeedShow provides **contextual network analysis** tailored for high-performance use cases: Gaming, 4K Streaming, VPN Privacy, and Web3 Infrastructure.

![SpeedShow Preview](https://github.com/Moha0x1/speedshow/raw/main/public/preview.png) *(Placeholder for preview image)*

---

## 🚀 Key Features

- **🎯 Context-Specific Testing**: Specialized engines for Gaming (Ping/Jitter), Streaming (Buffer prediction), VPN (Latency overhead), and Web3 (RPC response).
- **🌍 Real-Time ISP Intelligence**: Dynamic detection of ISP, location, and connection type via Edge API integration.
- **🛡️ Privacy First**: No tracking, no cookies, no user login required. Includes professional legal & privacy frameworks.
- **📈 Fiber-Grade Engine**: Real-time Web Workers using massive uncompressable payloads (500MB) and multi-stream Web APIs (up to 4 streams) to saturate and accurately measure gigabit connections. Includes Active Bufferbloat Detection.
- **💰 Built-in Monetization**: Contextual affiliate recommendations and optimized Google AdSense placements.
- **⚡ Performance Optimized**: Built with Next.js 16+ (App Router), leveraging Edge Runtime and glassmorphism UI for a sub-second initial load.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS.
- **Engine**: Dedicated Web Workers (`speed-worker.js`, `ping-worker.js`, `upload-worker.js`) for non-blocking network I/O.
- **Animations**: Framer Motion & Lucide Icons.
- **Charts**: Recharts for performance visualization.
- **Backend**: Next.js Edge Functions.
- **Styling**: Modern premium aesthetics with neon accents and glassmorphism.

---

## 📈 Roadmap & Progress

### ✅ Phase 1: Foundation & UI (Completed)
- [x] Initial project setup with Next.js & TypeScript.
- [x] Premium Dark Mode UI with neon blue/purple accents.
- [x] Modular `SpeedTestTool` component.
- [x] Responsive layout for Desktop, Tablet, and Mobile.
- [x] SEO-optimized landing pages.

### ✅ Phase 2: Engine & Data (Completed)
- [x] Edge API integration for diagnostics.
- [x] Real-time ISP & Geo-location detection.
- [x] Global Performance Score calculation.
- [x] LocalStorage-powered Test History Dashboard.

### ✅ Phase 3: Monetization & Compliance (Completed)
- [x] Google AdSense integration slots (`AdBanner`).
- [x] Contextual Affiliate Recommendation engine.
- [x] Comprehensive Privacy & Legal Statement.
- [x] Security headers via Middleware.

### ✅ Phase 4: Fiber-Grade Real Connectivity (Completed)
- [x] **Web Workers**: Offload heavy diagnostic calculations (Ping, Download, Upload) to background threads.
- [x] **Multi-Stream & Uncompressable Payloads**: Measure symmetric gigabit fiber links without ISP compression interference.
- [x] **Active Bufferbloat Detection**: Latency spike measurement under load.
- [x] **Raw Diagnostic Terminal**: Technical transparency UI exposing real-time logs and WebRTC IP leak checks.

### 🔮 Phase 5: Advanced Optimization (Next Steps)
- [ ] **Vercel KV/Redis**: Store anonymized global stats for "ISP Leaderboards".
- [ ] **PWA Support**: Installable app for mobile diagnostics.
- [ ] **Multi-region Nodes**: Add a selection of testing servers (EU, US, ASIA).

---

## 👨‍💻 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Moha0x1/speedshow.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   [http://localhost:3000](http://localhost:3000)

---

## 📄 License
Copyright © 2026 SpeedShow.app. All rights reserved.
