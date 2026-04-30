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
    case 'streaming':
    case 'web3':
    case 'ping-test':
    case 'jitter-test':
    case 'packet-loss-test':
    case 'latency-test':
    case 'internet-speed-test':
      results = {}; // Workers handle the actual testing now
      break;
    case 'vpn':
      results = {
        vpnDetected: isDatacenter,
        proxyUsage: isDatacenter,
        ipType: isDatacenter ? 'Datacenter' : 'Residential',
      };
      break;
    default:
      return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
  }

  // Artificial delay removed as tests are real now

  return NextResponse.json({
    ...results,
    connectionInfo,
    timestamp: Date.now() // Useful for calibration

  });
}
