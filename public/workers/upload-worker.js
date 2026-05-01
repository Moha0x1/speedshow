// Web Worker for Throughput Measurement (Upload)
// Implements sequential chunk uploads to Edge API.

self.onmessage = async (e) => {
  const { type } = e.data;

  if (type === 'START_UPLOAD') {
    const startTime = performance.now();
    const CHUNK_SIZE = 4000000; // 4MB per chunk to stay under Vercel 4.5MB limit
    const TOTAL_CHUNKS = 3;
    
    // Create an uncompressable payload
    const payload = new Uint8Array(CHUNK_SIZE);
    for (let i = 0; i < CHUNK_SIZE; i += 65536) {
      crypto.getRandomValues(new Uint8Array(payload.buffer, i, Math.min(65536, CHUNK_SIZE - i)));
    }
    
    const results = [];
    let totalBytesUploaded = 0;

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
        
        totalBytesUploaded += data.bytes;
        
        // Edge API returns data.elapsedMs and data.mbps, but we can also calculate it
        // The API's elapsedMs doesn't include full network transport time back to client, 
        // so client-side RTT is more accurate for end-to-end throughput.
        const elapsedMs = chunkEndTime - chunkStartTime;
        const currentMbps = (data.bytes * 8) / (elapsedMs / 1000) / 1000000;
        
        results.push(currentMbps);
        
        self.postMessage({ 
          type: 'UPLOAD_PROGRESS', 
          speedMbps: parseFloat(currentMbps.toFixed(2)),
          elapsedSeconds: (performance.now() - startTime) / 1000
        });
      }

      // Calculate median
      results.sort((a, b) => a - b);
      const medianMbps = results[Math.floor(results.length / 2)];

      self.postMessage({
        type: 'UPLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(medianMbps.toFixed(2)),
          totalBytes: totalBytesUploaded,
          duration: (performance.now() - startTime) / 1000
        }
      });

    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
