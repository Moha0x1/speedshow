// Web Worker for Throughput Measurement (Download)
// Implements chunk-based measurement over a fixed time window.

self.onmessage = async (e) => {
  const { type, url } = e.data;

  if (type === 'START_DOWNLOAD') {
    const TEST_DURATION_MS = 5000;
    const startTime = performance.now();
    let totalBytes = 0;
    let chunks = 0;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error("Network response was not ok");

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
            loadedBytes: totalBytes
          });
        }
      }

      // If we finished before the timer, cancel the stream
      await reader.cancel();

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
