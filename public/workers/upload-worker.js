// Web Worker for Throughput Measurement (Upload)
// Implements chunk-based multi-stream measurement over a fixed time window.

self.onmessage = async (e) => {
  const { type, url, streams = 4 } = e.data;

  if (type === 'START_UPLOAD') {
    const TEST_DURATION_MS = 10000; // 10 seconds
    const startTime = performance.now();
    const CHUNK_SIZE = 4000000; // 4MB per chunk to prevent memory bloat
    
    // Create an uncompressable payload
    const payload = new Uint8Array(CHUNK_SIZE);
    for (let i = 0; i < CHUNK_SIZE; i += 65536) {
      crypto.getRandomValues(new Uint8Array(payload.buffer, i, Math.min(65536, CHUNK_SIZE - i)));
    }
    
    let peakTotalMbps = 0;
    const latestSpeeds = new Array(streams).fill(0);
    let totalBytesUploaded = 0;

    const controllers = Array.from({ length: streams }, () => new AbortController());

    try {
      const fetchPromises = controllers.map(async (controller, index) => {
        try {
          while (performance.now() - startTime < TEST_DURATION_MS) {
            const chunkStartTime = performance.now();
            const streamUrl = `${url}?_r=${Math.random()}`;
            
            const response = await fetch(streamUrl, {
              method: 'POST',
              body: payload,
              cache: 'no-store',
              signal: controller.signal,
              headers: {
                'Content-Type': 'application/octet-stream'
              }
            });
            
            if (!response.ok) continue;

            const chunkEndTime = performance.now();
            totalBytesUploaded += CHUNK_SIZE;
            
            const elapsedMs = chunkEndTime - chunkStartTime;
            if (elapsedMs > 0) {
              const chunkMbps = (CHUNK_SIZE * 8) / (elapsedMs / 1000) / 1000000;
              latestSpeeds[index] = chunkMbps;
              
              const currentTotalMbps = latestSpeeds.reduce((a, b) => a + b, 0);
              if (currentTotalMbps > peakTotalMbps) {
                peakTotalMbps = currentTotalMbps;
              }
              
              self.postMessage({ 
                type: 'UPLOAD_PROGRESS', 
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
        type: 'UPLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(peakTotalMbps.toFixed(2)), // Peak sustained value
          totalBytes: totalBytesUploaded,
          duration: TEST_DURATION_MS / 1000
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
