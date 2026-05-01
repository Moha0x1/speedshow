// Web Worker for Throughput Measurement (Download)
// Implements chunk-based multi-stream measurement over a fixed time window.

self.onmessage = async (e) => {
  const { type, url, streams = 4 } = e.data;

  if (type === 'START_DOWNLOAD') {
    const TEST_DURATION_MS = 10000; // 10 seconds
    const startTime = performance.now();
    const CHUNK_SIZE = 8000000; // 8MB
    
    let peakTotalMbps = 0;
    const latestSpeeds = new Array(streams).fill(0);
    let totalBytesDownloaded = 0;

    const controllers = Array.from({ length: streams }, () => new AbortController());

    try {
      const fetchPromises = controllers.map(async (controller, index) => {
        try {
          while (performance.now() - startTime < TEST_DURATION_MS) {
            const chunkStartTime = performance.now();
            const streamUrl = `${url}?bytes=${CHUNK_SIZE}&_r=${Math.random()}`;
            
            const response = await fetch(streamUrl, { 
              cache: 'no-store',
              signal: controller.signal
            });
            
            if (!response.ok) continue;

            const arrayBuffer = await response.arrayBuffer();
            const chunkEndTime = performance.now();
            
            totalBytesDownloaded += arrayBuffer.byteLength;
            
            const elapsedMs = chunkEndTime - chunkStartTime;
            if (elapsedMs > 0) {
              const chunkMbps = (arrayBuffer.byteLength * 8) / (elapsedMs / 1000) / 1000000;
              latestSpeeds[index] = chunkMbps;
              
              const currentTotalMbps = latestSpeeds.reduce((a, b) => a + b, 0);
              if (currentTotalMbps > peakTotalMbps) {
                peakTotalMbps = currentTotalMbps;
              }
              
              self.postMessage({ 
                type: 'DOWNLOAD_PROGRESS', 
                speedMbps: parseFloat(currentTotalMbps.toFixed(2)),
                elapsedSeconds: (performance.now() - startTime) / 1000
              });
            }
          }
        } catch (err) {
          if (err.name !== 'AbortError') console.error("Stream error:", err);
        }
      });

      // Await duration, then abort everything to be safe
      await new Promise(resolve => setTimeout(resolve, TEST_DURATION_MS));
      controllers.forEach(c => c.abort());
      await Promise.allSettled(fetchPromises);

      self.postMessage({
        type: 'DOWNLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(peakTotalMbps.toFixed(2)), // Peak sustained value
          totalBytes: totalBytesDownloaded,
          duration: TEST_DURATION_MS / 1000
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
