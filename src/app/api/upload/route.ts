export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startTime = Date.now();
  let totalBytes = 0;

  try {
    if (request.body) {
      const reader = request.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
        }
      }
    }
  } catch (err) {
    console.error('Upload API: Stream read error:', err);
    // Even on error, we return what we got so far to help with measurement
  }

  const elapsedMs = Math.max(Date.now() - startTime, 1);
  
  // Calculate Mbps: (bytes * 8) / (elapsedMs / 1000) / 1,000,000
  const mbps = (totalBytes * 8) / (elapsedMs / 1000) / 1000000;

  return Response.json({
    bytes: totalBytes,
    elapsedMs,
    mbps: parseFloat(mbps.toFixed(2))
  });
}
