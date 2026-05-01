'use client';

import { useState, useEffect, useRef } from 'react';
import { SpeedGauge } from '@/components/SpeedGauge';
import { SpeedChart } from '@/components/SpeedChart';
import { ResultCard } from '@/components/ResultCard';
import { Activity, Download, Upload, Server, Shield, Globe } from 'lucide-react';
import { checkWebRTCLeak, WebRTCResult } from '@/lib/webrtc';
import { motion } from 'framer-motion';

type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'isp' | 'webrtc' | 'complete';

export default function Home() {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [ping, setPing] = useState<number>(0);
  const [jitter, setJitter] = useState<number>(0);
  const [download, setDownload] = useState<number>(0);
  const [upload, setUpload] = useState<number>(0);
  
  const [ispData, setIspData] = useState<any>(null);
  const [webrtcData, setWebrtcData] = useState<WebRTCResult | null>(null);

  // Chart data
  const [chartData, setChartData] = useState<{ time: number; speed: number }[]>([]);
  
  const pingWorkerRef = useRef<Worker | null>(null);
  const speedWorkerRef = useRef<Worker | null>(null);

  const startTest = async () => {
    setPhase('ping');
    setPing(0); setJitter(0); setDownload(0); setUpload(0);
    setIspData(null); setWebrtcData(null); setChartData([]);
    
    // 1. Ping Phase
    const pingResult = await new Promise<{ latency: number, jitter: number }>((resolve) => {
      pingWorkerRef.current = new Worker('/workers/ping-worker.js');
      pingWorkerRef.current.onmessage = (e) => {
        if (e.data.type === 'progress') setPing(e.data.value);
        if (e.data.type === 'result') resolve(e.data.value);
        if (e.data.type === 'error') resolve({ latency: 0, jitter: 0 });
      };
      pingWorkerRef.current.postMessage({ type: 'START_PING' });
    });
    setPing(pingResult.latency);
    setJitter(pingResult.jitter);
    pingWorkerRef.current?.terminate();
    
    // 2. Download Phase
    setPhase('download');
    setChartData([]); // Reset chart for download
    const downResult = await new Promise<number>((resolve) => {
      speedWorkerRef.current = new Worker('/workers/speed-worker.js');
      let startTime = Date.now();
      speedWorkerRef.current.onmessage = (e) => {
        if (e.data.type === 'progress' && e.data.metric === 'download') {
          setDownload(e.data.value);
          setChartData(prev => [...prev, { time: parseFloat(((Date.now() - startTime)/1000).toFixed(1)), speed: e.data.value }]);
        }
        if (e.data.type === 'result' && e.data.metric === 'download') resolve(e.data.value);
        if (e.data.type === 'error') resolve(0);
      };
      speedWorkerRef.current.postMessage({ type: 'START_DOWNLOAD' });
    });
    setDownload(downResult);
    
    // 3. Upload Phase
    setPhase('upload');
    setChartData([]); // Reset chart for upload
    const upResult = await new Promise<number>((resolve) => {
      let startTime = Date.now();
      if (!speedWorkerRef.current) return resolve(0);
      speedWorkerRef.current.onmessage = (e) => {
        if (e.data.type === 'progress' && e.data.metric === 'upload') {
          setUpload(e.data.value);
          setChartData(prev => [...prev, { time: parseFloat(((Date.now() - startTime)/1000).toFixed(1)), speed: e.data.value }]);
        }
        if (e.data.type === 'result' && e.data.metric === 'upload') resolve(e.data.value);
        if (e.data.type === 'error') resolve(0);
      };
      speedWorkerRef.current.postMessage({ type: 'START_UPLOAD' });
    });
    setUpload(upResult);
    speedWorkerRef.current?.terminate();

    // 4. ISP Phase
    setPhase('isp');
    try {
      const ispRes = await fetch('/api/isp');
      const ispJson = await ispRes.json();
      setIspData(ispJson);
      
      // 5. WebRTC Phase
      setPhase('webrtc');
      const webrtc = await checkWebRTCLeak(ispJson.query);
      setWebrtcData(webrtc);
    } catch {
      setIspData({ isp: 'Unknown', city: 'Unknown', query: 'Unknown' });
    }
    
    setPhase('complete');
  };

  useEffect(() => {
    return () => {
      pingWorkerRef.current?.terminate();
      speedWorkerRef.current?.terminate();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="flex flex-col items-center justify-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Activity className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-extrabold tracking-tight">SpeedShow</h1>
          </motion.div>
          <p className="text-gray-400 text-center max-w-md">
            Professional-grade internet diagnostics powered by Vercel Edge Runtime.
          </p>
        </header>

        {phase === 'idle' ? (
          <div className="flex flex-col items-center">
            <button
              onClick={startTest}
              className="w-48 h-48 rounded-full bg-yellow-500 hover:bg-yellow-400 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(234,179,8,0.3)]"
            >
              <span className="text-black font-black text-3xl tracking-widest uppercase">Go</span>
            </button>
          </div>
        ) : phase !== 'complete' ? (
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="text-xl font-medium text-yellow-500 mb-8 uppercase tracking-widest animate-pulse">
              Testing {phase}...
            </div>
            
            <SpeedGauge 
              value={phase === 'ping' ? ping : phase === 'download' ? download : upload}
              max={phase === 'ping' ? 100 : 1000}
              label={phase}
              unit={phase === 'ping' ? 'ms' : 'Mbps'}
            />
            
            {(phase === 'download' || phase === 'upload') && chartData.length > 0 && (
              <SpeedChart data={chartData} color="#eab308" />
            )}
            
            {phase === 'upload' && (
              <p className="mt-8 text-xs text-gray-500 max-w-xs text-center border border-[rgba(255,255,255,0.1)] p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                Upload limited to 4.5 MB per chunk on Vercel free plan.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResultCard delay={0.1} label="Ping" value={`${ping} ms`} icon={<Activity className="w-5 h-5" />} />
            <ResultCard delay={0.2} label="Jitter" value={`${jitter} ms`} icon={<Activity className="w-5 h-5 opacity-50" />} />
            <ResultCard delay={0.3} label="Download" value={`${download} Mbps`} icon={<Download className="w-5 h-5" />} />
            <ResultCard delay={0.4} label="Upload" value={`${upload} Mbps`} icon={<Upload className="w-5 h-5" />} />
            <ResultCard delay={0.5} label="ISP" value={ispData?.isp || 'Unknown'} icon={<Server className="w-5 h-5" />} />
            <ResultCard delay={0.6} label="Location" value={`${ispData?.city || 'Unknown'}, ${ispData?.countryCode || ''}`} icon={<Globe className="w-5 h-5" />} />
            
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="p-6 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${webrtcData?.isVpnLeak ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">WebRTC Leak Status</h3>
                    <p className="text-sm text-gray-400">
                      {webrtcData?.isVpnLeak 
                        ? 'Your real IP is exposed through WebRTC.' 
                        : 'No WebRTC IP leaks detected.'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Detected Public IP</div>
                  <div className="font-mono text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded border border-yellow-500/20">
                    {webrtcData?.publicIP || ispData?.query || 'N/A'}
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center mt-8">
               <button
                onClick={startTest}
                className="px-8 py-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white font-medium border border-[rgba(255,255,255,0.1)] transition-colors"
              >
                Test Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
