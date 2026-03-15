// Web Worker for Throughput Measurement
// Downloads small chunks of data to estimate transfer speed.

self.onmessage = async (e) => {
  const { type, url } = e.data;

  if (type === 'START_DOWNLOAD') {
    const startTime = performance.now();
    try {
      // Fetch a small file (or a blob from a neutral CDN)
      // To avoid massive bandwidth cost, we pick a small but sufficient chunk
      const response = await fetch(url, { cache: 'no-store' });
      const reader = response.body.getReader();
      let receivedLength = 0;
      
      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        receivedLength += value.length;
        
        // Post partial progress
        // self.postMessage({ type: 'PROGRESS', loaded: receivedLength });
      }

      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const bitsLoaded = receivedLength * 8;
      const speedBps = bitsLoaded / durationSeconds;
      const speedMbps = speedBps / (1024 * 1024);

      self.postMessage({
        type: 'DOWNLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(speedMbps.toFixed(2)),
          sizeBytes: receivedLength,
          duration: durationSeconds
        }
      });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
