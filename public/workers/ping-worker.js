// Web Worker for Precise Network Measurements
// This runs on a separate thread to avoid UI-induced jitter.

self.onmessage = async (e) => {
  const { type, endpoints } = e.data;

  if (type === 'START_PINGS') {
    const results = [];
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        // We use cache: 'no-store' to ensure we a re-measuring the network path
        await fetch(endpoints[i % endpoints.length], { 
          mode: 'no-cors', 
          cache: 'no-store',
          priority: 'high'
        });
        const end = performance.now();
        results.push(end - start);
      } catch {
        // Ignore individual failures
      }
      // Small randomized delay between pings to avoid burst issues
      await new Promise(r => setTimeout(r, 100 + Math.random() * 50));
    }

    // Calculate metrics
    const avgPing = results.length > 0 ? (results.reduce((a, b) => a + b, 0) / results.length) : 0;
    const sorted = [...results].sort((a, b) => a - b);
    const minPing = results.length > 0 ? sorted[0] : 0;
    const jitter = results.length > 1 
      ? results.slice(1).reduce((acc, current, idx) => acc + Math.abs(current - results[idx]), 0) / (results.length - 1)
      : 0;

    self.postMessage({
      type: 'PINGS_COMPLETE',
      metrics: {
        latency: Math.round(avgPing),
        minLatency: Math.round(minPing),
        jitter: parseFloat(jitter.toFixed(2)),
        samples: results.length
      }
    });
  }
};
