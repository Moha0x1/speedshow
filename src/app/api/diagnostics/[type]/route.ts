import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type MetaResponse = {
  clientIp?: string;
  city?: string;
  region?: string;
  country?: string;
  asOrganization?: string;
  colo?: string;
};

const readHeader = (request: NextRequest, names: string[]) => {
  for (const name of names) {
    const value = request.headers.get(name);
    if (value) {
      return value;
    }
  }

  return undefined;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  let ip = '127.0.0.1';
  if (forwardedFor) {
    ip = forwardedFor.split(',')[0].trim();
  } else {
    ip = readHeader(request, ['cf-connecting-ip', 'x-real-ip']) || '127.0.0.1';
  }
  
  const { type } = await params;
  let results: Record<string, string | number | boolean | object> = {};
  
  let connectionInfo = {
    isp: "Unknown network",
    location: "Unknown",
    type: "Measured in browser",
    status: "Live measurement",
    network: "Unknown",
    colo: "Unknown"
  };

  let meta: MetaResponse | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const metaResponse = await fetch('https://speed.cloudflare.com/meta', {
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (metaResponse.ok) {
      meta = await metaResponse.json();
    }
  } catch (e) {
    console.error("Edge metadata fetch failed", e);
  }

  const locationParts = [
    meta?.city || readHeader(request, ['x-vercel-ip-city']),
    meta?.region || readHeader(request, ['x-vercel-ip-country-region']),
    meta?.country || readHeader(request, ['x-vercel-ip-country', 'cf-ipcountry']),
  ].filter(Boolean);

  const isp =
    meta?.asOrganization ||
    readHeader(request, ['x-vercel-ip-as-organization', 'x-vercel-ip-org']) ||
    "Unknown network";

  connectionInfo = {
    isp,
    location: locationParts.length > 0 ? locationParts.join(', ') : "Unknown",
    type: "Real browser test",
    status: "Measured live",
    network: meta?.asOrganization || isp,
    colo: meta?.colo || "Unknown"
  };

  if (meta?.clientIp) {
    ip = meta.clientIp;
  }

  const ispLower = isp.toLowerCase();
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
    ispLower.includes('microsoft') ||
    ispLower.includes('oracle') ||
    ispLower.includes('cloudflare');

  switch (type) {
    case 'gaming':
    case 'streaming':
    case 'web3':
    case 'ping-test':
    case 'jitter-test':
    case 'packet-loss-test':
    case 'latency-test':
    case 'internet-speed-test':
      results = {};
      break;
    case 'vpn':
      results = {
        vpnDetected: isDatacenter,
        proxyUsage: isDatacenter,
        ipType: isDatacenter ? 'Hosted' : 'Residential',
      };
      break;
    default:
      return NextResponse.json({ error: "Invalid test type" }, { status: 400 });
  }

  return NextResponse.json({
    ...results,
    connectionInfo,
    clientIp: ip,
    timestamp: Date.now(),
    edgeMeta: meta || null
  });
}
