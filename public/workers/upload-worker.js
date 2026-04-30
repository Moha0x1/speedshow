// Web Worker for Throughput Measurement (Upload)
// Implements chunk-based multi-stream measurement over a fixed time window.

self.onmessage = async (e) => {
  const { type, url, streams = 4 } = e.data;

  if (type === 'START_UPLOAD') {
    const TEST_DURATION_MS = 5000;
    const startTime = performance.now();
    let totalBytesUploaded = 0;

    try {
      // Create a 1MB payload of random, uncompressable data
      const payloadSize = 1024 * 1024;
      const payload = new Uint8Array(payloadSize);
      for (let i = 0; i < payloadSize; i += 65536) {
        crypto.getRandomValues(new Uint8Array(payload.buffer, i, Math.min(65536, payloadSize - i)));
      }
      
      const controllers = Array.from({ length: streams }, () => new AbortController());

      const fetchPromises = controllers.map(async (controller) => {
        try {
          while (performance.now() - startTime < TEST_DURATION_MS) {
            const streamUrl = `${url}?_r=${Math.random()}`;
            await fetch(streamUrl, {
              method: 'POST',
              body: payload,
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/octet-stream'
              },
              signal: controller.signal
            });
            
            totalBytesUploaded += payloadSize;

            const currentTime = performance.now();
            const elapsedSeconds = (currentTime - startTime) / 1000;
            const currentMbps = (totalBytesUploaded * 8) / (elapsedSeconds * 1024 * 1024);
            
            self.postMessage({ 
              type: 'UPLOAD_PROGRESS', 
              speedMbps: parseFloat(currentMbps.toFixed(2)),
              elapsedSeconds
            });
          }
        } catch (err) {
          if (err.name !== 'AbortError') console.error("Upload stream error:", err);
        }
      });

      // Await duration, then abort everything to be safe
      await new Promise(resolve => setTimeout(resolve, TEST_DURATION_MS));
      controllers.forEach(c => c.abort());
      await Promise.allSettled(fetchPromises);

      const finalTime = performance.now();
      const durationSeconds = (finalTime - startTime) / 1000;
      const finalSpeedMbps = (totalBytesUploaded * 8) / (durationSeconds * 1024 * 1024);

      self.postMessage({
        type: 'UPLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(finalSpeedMbps.toFixed(2)),
          totalBytes: totalBytesUploaded,
          duration: durationSeconds
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
