export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startTime = Date.now();
  let totalBytes = 0;

  if (request.body) {
    const reader = request.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
        }
      }
    } catch (err) {
      console.error('Upload stream read error:', err);
    }
  }

  const elapsedMs = Date.now() - startTime;
  
  // Calculate Mbps: (bytes * 8) / (elapsedMs / 1000) / 1,000,000
  let mbps = 0;
  if (elapsedMs > 0 && totalBytes > 0) {
    mbps = (totalBytes * 8) / (elapsedMs / 1000) / 1000000;
  }

  return Response.json({
    bytes: totalBytes,
    elapsedMs,
    mbps: parseFloat(mbps.toFixed(2))
  });
}
