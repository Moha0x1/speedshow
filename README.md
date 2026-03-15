# ⚡ SpeedShow.app
> **"See the real performance of your internet"**

SpeedShow is a premium, visual internet diagnostics platform. Unlike generic speed tests, SpeedShow provides **contextual network analysis** tailored for high-performance use cases: Gaming, 4K Streaming, VPN Privacy, and Web3 Infrastructure.

![SpeedShow Preview](https://github.com/Moha0x1/speedshow/raw/main/public/preview.png) *(Placeholder for preview image)*

---

## 🚀 Key Features

- **🎯 Context-Specific Testing**: Specialized engines for Gaming (Ping/Jitter), Streaming (Buffer prediction), VPN (Latency overhead), and Web3 (RPC response).
- **🌍 Real-Time ISP Intelligence**: Dynamic detection of ISP, location, and connection type via Edge API integration.
- **🛡️ Privacy First**: No tracking, no cookies, no user login required. Includes professional legal & privacy frameworks.
- **💰 Built-in Monetization**: Contextual affiliate recommendations and optimized Google AdSense placements.
- **⚡ Performance Optimized**: Built with Next.js 15+, leveraging Edge Runtime and glassmorphism UI for a <1s initial load.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS.
- **Animations**: Framer Motion & Lucide Icons.
- **Charts**: Recharts for performance visualization.
- **Backend**: Next.js Edge Functions for sub-second API diagnostics.
- **Styling**: Modern premium aesthetics with neon accents and glassmorphism.

---

## 📈 Roadmap & Progress

### ✅ Phase 1: Foundation & UI (Completed)
- [x] Initial project setup with Next.js & TypeScript.
- [x] Premium Dark Mode UI with neon blue/purple accents.
- [x] Modular `SpeedTestTool` component.
- [x] Responsive layout for Desktop, Tablet, and Mobile.
- [x] SEO-optimized landing pages for each test type.

### ✅ Phase 2: Engine & Data (Completed)
- [x] Edge API integration for diagnostics.
- [x] **Real-time ISP & Geo-location detection** (Real viability).
- [x] Simulated test runners for all four specialized use cases.
- [x] Global Performance Score calculation.

### ✅ Phase 3: Monetization & Compliance (Completed)
- [x] Google AdSense integration slots (`AdBanner`).
- [x] Contextual Affiliate Recommendation engine.
- [x] Comprehensive Privacy & Legal Statement.
- [x] Security headers (CSP, X-Frame-Options, etc.) via Middleware.

### 🚧 Phase 4: Real Connectivity (Next Steps)
- [ ] **Web Workers integration**: Offload heavy diagnostic calculations to background threads.
- [ ] **Socket.io/WebRTC**: Implement real peer-to-peer pings to global servers.
- [ ] **Multi-region Nodes**: Add a selection of testing servers (EU, US, ASIA).
- [ ] **Advanced Sharing**: Export results as dynamic images/open-graph cards.

### 🔮 Phase 5: Advanced Optimization
- [ ] **Vercel KV/Redis**: Store anonymized global stats for "ISP Leaderboards".
- [ ] **PWA Support**: Installable app for mobile diagnostics.
- [ ] **Dark/Light Mode**: Dynamic theme switcher.

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
