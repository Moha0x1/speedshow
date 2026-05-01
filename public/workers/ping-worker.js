// Web Worker for High-Precision Network Measurements
// Implements multi-sample latency measurement and statistical analysis.

self.onmessage = async (e) => {
  const { type, endpoints } = e.data;

  if (type === 'START_PINGS') {
    const results = [];
    const totalSamples = 40;
    let successfulSamples = 0;
    
    for (let i = 0; i < totalSamples; i++) {
      const start = performance.now();
      try {
        // Use a short timeout to detect packet loss/unresponsive endpoints
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await fetch(endpoints[i % endpoints.length], { 
          mode: 'no-cors', 
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const end = performance.now();
        results.push(end - start);
        successfulSamples++;
      } catch (err) {
        // Sample failed, count as packet loss later
        console.error("Ping sample failed:", err);
      }
      
      // Small randomized delay to simulate real-world traffic intervals
      await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
      
      const runningAvg = results.length > 0 ? results.reduce((a, b) => a + b, 0) / results.length : null;

      // Post progress updates for UI smoothness
      self.postMessage({ 
        type: 'PING_PROGRESS', 
        current: i + 1, 
        total: totalSamples,
        latestPing: runningAvg ? Math.round(runningAvg) : null
      });
    }

    if (results.length === 0) {
      self.postMessage({ type: 'ERROR', error: 'All measurement samples failed.' });
      return;
    }

    // Sort to easily get min/max/median
    const sorted = [...results].sort((a, b) => a - b);
    
    // Average Latency
    const avgPing = results.reduce((a, b) => a + b, 0) / results.length;
    
    // Min/Max
    const minPing = sorted[0];
    const maxPing = sorted[sorted.length - 1];
    
    // Standard Deviation (Used for Jitter calculation)
    const variance = results.reduce((a, b) => a + Math.pow(b - avgPing, 2), 0) / results.length;
    const stdDev = Math.sqrt(variance);
    
    // Packet Loss Percentage
    const packetLoss = ((totalSamples - successfulSamples) / totalSamples) * 100;

    self.postMessage({
      type: 'PINGS_COMPLETE',
      metrics: {
        latency: Math.round(avgPing),
        minLatency: Math.round(minPing),
        maxLatency: Math.round(maxPing),
        jitter: parseFloat(stdDev.toFixed(2)),
        packetLoss: parseFloat(packetLoss.toFixed(1)),
        samples: results.length,
        rawSamples: sorted // Useful for distribution charts
      }
    });
  }
};
