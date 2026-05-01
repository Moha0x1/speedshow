// Web Worker for Ping & Jitter
// Uses sequential HTTP fetching

self.onmessage = async (e) => {
  const { type } = e.data;

  if (type === 'START_PING') {
    const rtts = [];
    const totalSamples = 60;
    const discardCount = 5;

    for (let i = 0; i < totalSamples; i++) {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch('/api/ping', { 
          cache: 'no-store',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
          await res.json();
          const end = Date.now();
          // Subtract ~5ms to roughly account for JSON parsing overhead
          const rtt = Math.max(1, (end - start) - 5);
          rtts.push(rtt);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Ping error:", err);
      }
      
      // Send progress based on current array length to avoid jumping
      const currentAvg = rtts.length > 0 ? rtts.reduce((a, b) => a + b, 0) / rtts.length : 0;

      self.postMessage({ 
        type: 'progress',
        metric: 'ping',
        value: Math.round(currentAvg),
        unit: 'ms'
      });

      // 100ms gap between calls
      await new Promise(r => setTimeout(r, 100));
    }

    if (rtts.length < (discardCount * 2) + 1) {
      self.postMessage({ type: 'error', metric: 'ping', error: 'Not enough successful samples.' });
      return;
    }

    // Ping: mean of middle samples (discard first 5 and last 5)
    // Note: User said "discard first 5 and last 5", meaning chronological trimming, not value-based sorting trimming.
    // "discard first 5 and last 5 to skip cold start". This implies chronological order.
    const validSamples = rtts.slice(discardCount, rtts.length - discardCount);
    
    const avgPing = validSamples.reduce((a, b) => a + b, 0) / validSamples.length;
    
    // Jitter: mean absolute difference between consecutive RTTs
    let jitterSum = 0;
    for (let j = 1; j < validSamples.length; j++) {
      jitterSum += Math.abs(validSamples[j] - validSamples[j - 1]);
    }
    const jitter = validSamples.length > 1 ? jitterSum / (validSamples.length - 1) : 0;

    self.postMessage({
      type: 'result',
      metric: 'ping',
      value: {
        latency: Math.round(avgPing),
        jitter: parseFloat(jitter.toFixed(2))
      },
      unit: 'ms'
    });
  }
};
