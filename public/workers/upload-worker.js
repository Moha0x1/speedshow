// Web Worker for Throughput Measurement (Upload)
// Implements chunk-based multi-stream measurement using XHR for accurate real-time progress.

self.onmessage = async (e) => {
  const { type, url, streams = 4 } = e.data;

  if (type === 'START_UPLOAD') {
    const TEST_DURATION_MS = 10000; // 10 seconds
    const startTime = performance.now();
    const CHUNK_SIZE = 1048576; // 1MB per chunk
    
    // Create an uncompressable payload
    const payload = new Uint8Array(CHUNK_SIZE);
    for (let i = 0; i < CHUNK_SIZE; i += 65536) {
      crypto.getRandomValues(new Uint8Array(payload.buffer, i, Math.min(65536, CHUNK_SIZE - i)));
    }
    
    let completedBytes = 0;
    const activeStreamsProgress = new Array(streams).fill(0);
    let isRunning = true;
    const xhrs = [];
    
    const reportProgress = () => {
      if (!isRunning) return;
      const currentActiveBytes = activeStreamsProgress.reduce((a, b) => a + b, 0);
      const totalBytes = completedBytes + currentActiveBytes;
      const elapsedMs = performance.now() - startTime;
      
      if (elapsedMs > 100) {
        const currentTotalMbps = (totalBytes * 8) / (elapsedMs / 1000) / 1000000;
        self.postMessage({ 
          type: 'UPLOAD_PROGRESS', 
          speedMbps: parseFloat(currentTotalMbps.toFixed(2)),
          elapsedSeconds: elapsedMs / 1000
        });
      }
    };
    
    const progressInterval = setInterval(reportProgress, 250);

    const runStream = (streamIndex) => {
      return new Promise((resolve) => {
        const nextRequest = () => {
          if (performance.now() - startTime >= TEST_DURATION_MS || !isRunning) {
            resolve();
            return;
          }
          
          const xhr = new XMLHttpRequest();
          xhrs.push(xhr);
          
          xhr.upload.onprogress = (event) => {
            if (isRunning && event.lengthComputable) {
              activeStreamsProgress[streamIndex] = event.loaded;
            }
          };
          
          xhr.onload = () => {
            if (!isRunning) return;
            // Only count if it's a success
            if (xhr.status >= 200 && xhr.status < 300) {
              completedBytes += CHUNK_SIZE;
            }
            activeStreamsProgress[streamIndex] = 0;
            const index = xhrs.indexOf(xhr);
            if (index > -1) xhrs.splice(index, 1);
            nextRequest();
          };
          
          xhr.onerror = () => {
            if (!isRunning) return;
            activeStreamsProgress[streamIndex] = 0;
            const index = xhrs.indexOf(xhr);
            if (index > -1) xhrs.splice(index, 1);
            setTimeout(nextRequest, 500); // Wait before retry on error
          };
          
          xhr.open('POST', `${url}?_r=${Math.random()}`);
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          xhr.send(payload);
        };
        
        nextRequest();
      });
    };

    const streamPromises = Array.from({ length: streams }, (_, i) => runStream(i));

    setTimeout(() => {
      isRunning = false;
      clearInterval(progressInterval);
      xhrs.forEach(xhr => xhr.abort());
      
      const currentActiveBytes = activeStreamsProgress.reduce((a, b) => a + b, 0);
      const totalBytes = completedBytes + currentActiveBytes;
      
      if (totalBytes === 0) {
        self.postMessage({ type: 'ERROR', error: 'All upload requests failed.' });
        return;
      }
      
      const durationSeconds = Math.max((performance.now() - startTime) / 1000, 0.1);
      const sustainedMbps = (totalBytes * 8) / durationSeconds / 1000000;
      
      self.postMessage({
        type: 'UPLOAD_COMPLETE',
        metrics: {
          speedMbps: parseFloat(sustainedMbps.toFixed(2)),
          totalBytes: totalBytes,
          duration: durationSeconds
        }
      });
    }, TEST_DURATION_MS);
  }
};
