// Web Worker for High-Precision Network Measurements
// Implements sequential HTTP latency measurement to Edge API.

self.onmessage = async (e) => {
  const { type } = e.data;

  if (type === 'START_PINGS') {
    const results = [];
    const totalSamples = 60;
    let successfulSamples = 0;

    for (let i = 0; i < totalSamples; i++) {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch('/api/ping', { 
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
          // Drain body to accurately measure complete transaction
          await res.json();
          const end = performance.now();
          // Subtract ~5ms to roughly account for JSON parsing overhead
          const rtt = Math.max(1, (end - start) - 5);
          results.push(rtt);
          successfulSamples++;
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Ping error:", err);
      }
      
      const runningAvg = results.length > 0 ? results.reduce((a, b) => a + b, 0) / results.length : null;

      self.postMessage({ 
        type: 'PING_PROGRESS', 
        current: i + 1, 
        total: totalSamples,
        latestPing: runningAvg ? Math.round(runningAvg) : null
      });

      // 100ms gap between calls
      await new Promise(r => setTimeout(r, 100));
    }

    if (results.length === 0) {
      self.postMessage({ type: 'ERROR', error: 'All measurement samples failed.' });
      return;
    }

    const sorted = [...results].sort((a, b) => a - b);
    const avgPing = results.reduce((a, b) => a + b, 0) / results.length;
    const minPing = sorted[0];
    const maxPing = sorted[sorted.length - 1];
    
    // Calculate Jitter (mean of absolute differences between consecutive RTTs)
    let jitterSum = 0;
    for (let j = 1; j < results.length; j++) {
      jitterSum += Math.abs(results[j] - results[j - 1]);
    }
    const jitter = results.length > 1 ? jitterSum / (results.length - 1) : 0;
    
    const packetLoss = ((totalSamples - successfulSamples) / totalSamples) * 100;

    self.postMessage({
      type: 'PINGS_COMPLETE',
      metrics: {
        latency: Math.round(avgPing),
        minLatency: Math.round(minPing),
        maxLatency: Math.round(maxPing),
        jitter: parseFloat(jitter.toFixed(2)),
        packetLoss: parseFloat(packetLoss.toFixed(1)),
        samples: results.length,
        rawSamples: sorted 
      }
    });
  }
};
