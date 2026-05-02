const sampleEndpoint = async (url) => {
  const startedAt = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}_t=${Date.now()}-${Math.random()}`, {
      cache: "no-store",
      mode: "no-cors",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!response.ok && response.type !== "opaque") {
      throw new Error(`HTTP ${response.status}`);
    }

    return performance.now() - startedAt;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

self.onmessage = async (event) => {
  const { type, endpoints = [] } = event.data;
  if (type !== "START_PINGS") {
    return;
  }

  const totalSamples = 18;
  const successful = [];
  const ordered = [];
  let failedSamples = 0;

  for (let index = 0; index < totalSamples; index += 1) {
    const endpoint = endpoints[index % endpoints.length];

    try {
      const rtt = await sampleEndpoint(endpoint);
      successful.push(rtt);
      ordered.push(rtt);
      const runningAverage = successful.reduce((sum, value) => sum + value, 0) / successful.length;

      self.postMessage({
        type: "PING_PROGRESS",
        current: index + 1,
        total: totalSamples,
        latestPing: Math.round(runningAverage),
      });
    } catch {
      failedSamples += 1;
      self.postMessage({
        type: "PING_PROGRESS",
        current: index + 1,
        total: totalSamples,
        latestPing: successful.length > 0
          ? Math.round(successful.reduce((sum, value) => sum + value, 0) / successful.length)
          : undefined,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  if (successful.length === 0) {
    self.postMessage({ type: "ERROR", error: "All latency probes failed." });
    return;
  }

  const sorted = [...successful].sort((left, right) => left - right);
  const average = successful.reduce((sum, value) => sum + value, 0) / successful.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  let jitterTotal = 0;
  for (let index = 1; index < ordered.length; index += 1) {
    jitterTotal += Math.abs(ordered[index] - ordered[index - 1]);
  }

  const jitter = ordered.length > 1 ? jitterTotal / (ordered.length - 1) : 0;
  const packetLoss = (failedSamples / totalSamples) * 100;

  self.postMessage({
    type: "PINGS_COMPLETE",
    metrics: {
      latency: Math.round(average),
      minLatency: Math.round(min),
      maxLatency: Math.round(max),
      jitter: Number(jitter.toFixed(2)),
      packetLoss: Number(packetLoss.toFixed(1)),
      samples: totalSamples,
      successfulSamples: successful.length,
    },
  });
};
