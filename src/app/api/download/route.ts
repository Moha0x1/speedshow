export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const CHUNK_SIZE = 64 * 1024; // 64 KB
  const MAX_DURATION_MS = 10000; // 10 seconds

  let seed = Date.now() & 0xffffffff;
  
  // Pre-generate a 64KB chunk of random pseudo-uncompressable data
  // Using LCG: (seed * 1664525 + 1013904223)
  const baseChunk = new Uint8Array(CHUNK_SIZE);
  for (let i = 0; i < CHUNK_SIZE; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    baseChunk[i] = (seed >>> 16) & 0xff; // Use upper bits for better randomness
  }

  const stream = new ReadableStream({
    start(controller) {
      const startTime = Date.now();
      
      function pump() {
        if (Date.now() - startTime >= MAX_DURATION_MS) {
          controller.close();
          return;
        }

        // We can just enqueue the pre-generated chunk. 
        // Vercel edge will stream it to the client.
        // To be safe and actually uncompressable at the network layer if gzip is somehow forced,
        // we'd want unique data per chunk. But a 64KB block repeated over and over 
        // is somewhat uncompressable if deflate window is smaller. 
        // Better: mutate it slightly or just send it since we strictly set 'identity'.
        
        // Let's modify a few bytes to ensure it's not perfectly identical
        baseChunk[0] = Math.random() * 255;
        baseChunk[1] = Math.random() * 255;

        controller.enqueue(new Uint8Array(baseChunk));
        
        // We use setImmediate or setTimeout to yield to the event loop
        // but Edge runtime doesn't have setImmediate. 
        // Using setTimeout(pump, 0) might cap throughput. 
        // We can just pump synchronously in small batches or push as fast as backpressure allows.
        
        // Since we don't have direct access to backpressure here (controller.desiredSize is tricky in Edge sometimes),
        // we will pump synchronously until we yield.
        
        // Actually, just looping recursively via setTimeout(..., 0) is safe.
        // Wait, setTimeout(0) in Edge limits us to ~250 iterations/sec = ~16MB/s = 128 Mbps.
        // If we want gigabit, we need to push more chunks per tick.
        for(let j=0; j<20; j++) {
            if (Date.now() - startTime >= MAX_DURATION_MS) break;
            baseChunk[0] = (Math.random() * 255) & 0xff;
            controller.enqueue(new Uint8Array(baseChunk));
        }
        
        setTimeout(pump, 0);
      }
      
      pump();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'identity',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
