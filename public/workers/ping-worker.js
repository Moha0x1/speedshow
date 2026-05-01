// Web Worker for High-Precision Network Measurements
// Implements WebSocket-based multi-sample latency measurement and statistical analysis.

self.onmessage = async (e) => {
  const { type } = e.data;

  if (type === 'START_PINGS') {
    const results = [];
    const totalSamples = 60;
    let successfulSamples = 0;
    const wsUrl = 'wss://ws.postman-echo.com/raw';
    
    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: 'Failed to connect to WebSocket ping server.' });
      return;
    }

    const connectPromise = new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
      // 5 second timeout for connection
      setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
    });

    try {
      await connectPromise;
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: 'WebSocket connection failed or timed out.' });
      return;
    }

    let i = 0;
    
    const pingLoop = async () => {
      return new Promise((resolveComplete) => {
        ws.onmessage = (event) => {
          const sendTime = parseFloat(event.data);
          if (!isNaN(sendTime)) {
            const rtt = performance.now() - sendTime;
            results.push(rtt);
            successfulSamples++;
            
            const runningAvg = results.reduce((a, b) => a + b, 0) / results.length;
            self.postMessage({ 
              type: 'PING_PROGRESS', 
              current: i, 
              total: totalSamples,
              latestPing: Math.round(runningAvg)
            });
          }
        };

        const interval = setInterval(() => {
          if (i >= totalSamples) {
            clearInterval(interval);
            ws.close();
            resolveComplete();
            return;
          }
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(performance.now().toString());
          }
          i++;
        }, 200);
        
        setTimeout(() => {
            clearInterval(interval);
            if (ws.readyState === WebSocket.OPEN) ws.close();
            resolveComplete();
        }, totalSamples * 200 + 2000); // 12s + 2s padding
      });
    };

    await pingLoop();

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
