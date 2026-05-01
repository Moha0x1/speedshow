// Web Worker for Throughput Measurement (Download)
// Implements Vercel-native edge streaming.

self.onmessage = async (e) => {
  const { type } = e.data;

  if (type === 'START_DOWNLOAD') {
    const TEST_DURATION_MS = 10000;
    const startTime = performance.now();
    let totalBytes = 0;
    
    // We want the peak sustained 1-second window.
    // We will measure bytes transferred every 500ms.
    let rollingWindowBytes = [];
    let rollingWindowTimes = [];
    let peakMbps = 0;
    
    let lastReportTime = startTime;
    let bytesSinceLastReport = 0;

    try {
      const response = await fetch('/api/download', { cache: 'no-store' });
      
      if (!response.ok || !response.body) {
        throw new Error("Failed to start download stream.");
      }

      const reader = response.body.getReader();

      while (performance.now() - startTime < TEST_DURATION_MS) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunkLen = value.length;
        totalBytes += chunkLen;
        bytesSinceLastReport += chunkLen;

        const now = performance.now();
        if (now - lastReportTime >= 500) {
          const elapsed = now - lastReportTime;
          const currentMbps = (bytesSinceLastReport * 8) / (elapsed / 1000) / 1000000;
          
          rollingWindowBytes.push(bytesSinceLastReport);
          rollingWindowTimes.push(elapsed);
          
          // Keep only the last 2 samples (1 second window = 2 * 500ms)
          if (rollingWindowBytes.length > 2) {
            rollingWindowBytes.shift();
            rollingWindowTimes.shift();
          }
          
          if (rollingWindowBytes.length === 2) {
            const windowBytes = rollingWindowBytes[0] + rollingWindowBytes[1];
            const windowTime = rollingWindowTimes[0] + rollingWindowTimes[1];
            const windowMbps = (windowBytes * 8) / (windowTime / 1000) / 1000000;
            if (windowMbps > peakMbps) {
              peakMbps = windowMbps;
            }
          } else {
            if (currentMbps > peakMbps) peakMbps = currentMbps;
          }

          self.postMessage({ 
            type: 'DOWNLOAD_PROGRESS', 
            speedMbps: parseFloat((rollingWindowBytes.length === 2 ? peakMbps : currentMbps).toFixed(2)),
            elapsedSeconds: (now - startTime) / 1000
          });
          
          lastReportTime = now;
          bytesSinceLastReport = 0;
        }
      }
      
      // Cleanup the reader gracefully to stop the edge function if we hit 10s client side first
      await reader.cancel();

      self.postMessage({
        type: 'DOWNLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(peakMbps.toFixed(2)),
          totalBytes,
          duration: (performance.now() - startTime) / 1000
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
