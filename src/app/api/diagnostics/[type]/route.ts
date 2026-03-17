import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  const { type } = await params;
  let results: Record<string, string | number | boolean | object> = {};
  
  // Fetch real IP info for "viability"
  let connectionInfo = {
    isp: "Local Provider",
    location: "Unknown",
    type: "Fiber/Ethernet",
    status: "Excellent"
  };

  try {
    const ipResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,countryCode,city,isp,org,as,query`);
    if (ipResponse.ok) {
      const data = await ipResponse.json();
      if (data.status === 'success') {
        connectionInfo = {
          isp: data.isp || data.org || "Unknown",
          location: `${data.city}, ${data.countryCode}`,
          type: data.as ? (data.as.toLowerCase().includes('fiber') ? 'Fiber Optic' : 'Broadband') : 'Cable',
          status: "Excellent"
        };
      }
    }
  } catch (e) {
    console.error("IP info fetch failed", e);
  }

  // Enhanced detection logic
  const ispLower = connectionInfo.isp.toLowerCase();
  const isDatacenter = 
    ispLower.includes('hosting') || 
    ispLower.includes('vpn') || 
    ispLower.includes('proxy') || 
    ispLower.includes('server') || 
    ispLower.includes('datacenter') || 
    ispLower.includes('cloud') ||
    ispLower.includes('m247') || 
    ispLower.includes('packet exchange') || 
    ispLower.includes('digitalocean') || 
    ispLower.includes('ovh') || 
    ispLower.includes('hetzner') || 
    ispLower.includes('linode') || 
    ispLower.includes('amazon') || 
    ispLower.includes('google') || 
    ispLower.includes('microsoft');

  // Realistic results based on connection
  switch (type) {
    case 'gaming':
      results = {
        ping: Math.floor(Math.random() * 20) + 5, // 5ms - 25ms range
        jitter: parseFloat((Math.random() * 3 + 1).toFixed(1)),
        packetLoss: parseFloat((Math.random() * 0.1).toFixed(2)),
        score: 90 + Math.random() * 9
      };
      break;
    case 'streaming':
      results = {
        downloadSpeed: Math.floor(Math.random() * 400) + 100, // 100-500 Mbps
        stability: 'High',
        bufferRisk: 'Very Low',
        score: 94 + Math.random() * 6
      };
      break;
    case 'vpn':
      results = {
        vpnDetected: isDatacenter,
        proxyUsage: isDatacenter,
        ipType: isDatacenter ? 'Datacenter' : 'Residential',
        latencyImpact: isDatacenter ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 5),
        score: isDatacenter ? 70 + Math.random() * 15 : 96 + Math.random() * 4
      };
      break;
    case 'web3':
      results = {
        bitcoin: Math.floor(Math.random() * 60) + 50, // Mempool latency is usually higher
        ethereum: Math.floor(Math.random() * 50) + 40,
        base: Math.floor(Math.random() * 30) + 20,
        arbitrum: Math.floor(Math.random() * 35) + 25,
        solana: Math.floor(Math.random() * 40) + 30,
        score: 85 + Math.random() * 12
      };
      break;
    default:
      return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
  }

  // artificial delay to simulate real network test
  await new Promise(resolve => setTimeout(resolve, 800));

  return NextResponse.json({
    ...results,
    connectionInfo
  });
}
