// Web Worker for Throughput Measurement (Download)
// Implements chunk-based multi-stream measurement over a fixed time window.

self.onmessage = async (e) => {
  const { type, url, streams = 3 } = e.data;

  if (type === 'START_DOWNLOAD') {
    const TEST_DURATION_MS = 5000;
    const startTime = performance.now();
    let totalBytes = 0;
    let chunks = 0;

    const controllers = Array.from({ length: streams }, () => new AbortController());

    try {
      const fetchPromises = controllers.map(async (controller) => {
        try {
          // Add random query param to prevent caching
          const streamUrl = `${url}&_r=${Math.random()}`;
          const response = await fetch(streamUrl, { 
            cache: 'no-store',
            signal: controller.signal
          });
          
          if (!response.ok) return;

          const reader = response.body.getReader();

          while (performance.now() - startTime < TEST_DURATION_MS) {
            const { done, value } = await reader.read();
            if (done) break;

            totalBytes += value.length;
            chunks++;

            // Periodically report progress
            if (chunks % 50 === 0) {
              const currentTime = performance.now();
              const elapsedSeconds = (currentTime - startTime) / 1000;
              const currentMbps = (totalBytes * 8) / (elapsedSeconds * 1024 * 1024);
              
              self.postMessage({ 
                type: 'DOWNLOAD_PROGRESS', 
                speedMbps: parseFloat(currentMbps.toFixed(2)),
                loadedBytes: totalBytes,
                elapsedSeconds
              });
            }
          }
          await reader.cancel();
        } catch (err) {
          // Ignore abort errors
          if (err.name !== 'AbortError') console.error("Stream error:", err);
        }
      });

      // Await duration, then abort everything to be safe
      await new Promise(resolve => setTimeout(resolve, TEST_DURATION_MS));
      controllers.forEach(c => c.abort());
      await Promise.allSettled(fetchPromises);

      const finalTime = performance.now();
      const durationSeconds = (finalTime - startTime) / 1000;
      const finalSpeedMbps = (totalBytes * 8) / (durationSeconds * 1024 * 1024);

      self.postMessage({
        type: 'DOWNLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(finalSpeedMbps.toFixed(2)),
          totalBytes: totalBytes,
          duration: durationSeconds
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
