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
    
    let totalBytesUploaded = 0;

    const controllers = Array.from({ length: streams }, () => new AbortController());

    try {
      const fetchPromises = controllers.map(async (controller) => {
        try {
          while (performance.now() - startTime < TEST_DURATION_MS) {
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
            
            const elapsedMs = chunkEndTime - startTime;
            if (elapsedMs > 250) {
              const currentTotalMbps = (totalBytesUploaded * 8) / (elapsedMs / 1000) / 1000000;
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

      const durationSeconds = Math.max((performance.now() - startTime) / 1000, 0.1);
      const sustainedMbps = (totalBytesUploaded * 8) / durationSeconds / 1000000;

      self.postMessage({
        type: 'UPLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(sustainedMbps.toFixed(2)),
          totalBytes: totalBytesUploaded,
          duration: durationSeconds
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
