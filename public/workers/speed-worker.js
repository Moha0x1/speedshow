// Web Worker for Throughput Measurement
// Handles both Download and Upload measurements natively to Edge API.

self.onmessage = async (e) => {
  const { type } = e.data;

  if (type === 'START_DOWNLOAD') {
    const TEST_DURATION_MS = 10000;
    const startTime = performance.now();
    let totalBytes = 0;
    
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
            type: 'progress',
            metric: 'download',
            value: parseFloat((rollingWindowBytes.length === 2 ? peakMbps : currentMbps).toFixed(2)),
            unit: 'Mbps'
          });
          
          lastReportTime = now;
          bytesSinceLastReport = 0;
        }
      }
      
      await reader.cancel();

      self.postMessage({
        type: 'result',
        metric: 'download',
        value: parseFloat(peakMbps.toFixed(2)),
        unit: 'Mbps'
      });

    } catch (err) {
      self.postMessage({ type: 'error', metric: 'download', error: err.message });
    }
  }

  if (type === 'START_UPLOAD') {
    const startTime = performance.now();
    const CHUNK_SIZE = 4000000; // 4MB
    const TOTAL_CHUNKS = 3;
    
    // Create an uncompressable payload
    const payload = new Uint8Array(CHUNK_SIZE);
    for (let i = 0; i < CHUNK_SIZE; i += 65536) {
      crypto.getRandomValues(new Uint8Array(payload.buffer, i, Math.min(65536, CHUNK_SIZE - i)));
    }
    
    const results = [];

    try {
      for (let i = 0; i < TOTAL_CHUNKS; i++) {
        const chunkStartTime = performance.now();
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: payload,
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
        
        if (!response.ok) {
          throw new Error("Upload chunk failed.");
        }

        const data = await response.json();
        const chunkEndTime = performance.now();
        
        const elapsedMs = chunkEndTime - chunkStartTime;
        const currentMbps = (data.bytes * 8) / (elapsedMs / 1000) / 1000000;
        
        results.push(currentMbps);
        
        self.postMessage({ 
          type: 'progress',
          metric: 'upload',
          value: parseFloat(currentMbps.toFixed(2)),
          unit: 'Mbps'
        });
      }

      // Median
      results.sort((a, b) => a - b);
      const medianMbps = results[Math.floor(results.length / 2)];

      self.postMessage({
        type: 'result',
        metric: 'upload',
        value: parseFloat(medianMbps.toFixed(2)),
        unit: 'Mbps'
      });

    } catch (err) {
      self.postMessage({ type: 'error', metric: 'upload', error: err.message });
    }
  }
};
