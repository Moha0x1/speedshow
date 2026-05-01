export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const headers = request.headers;
  
  let clientIp = '127.0.0.1';
  
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  } else {
    clientIp = headers.get('x-real-ip') || headers.get('cf-connecting-ip') || '127.0.0.1';
  }

  // Handle localhost (dev mode)
  if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost') {
    return Response.json({
      status: "success",
      isp: "Localhost Dev Network",
      org: "Development Environment",
      as: "AS00000 Local",
      city: "Dev City",
      country: "Local Country",
      countryCode: "LC",
      lat: 0,
      lon: 0,
      timezone: "UTC",
      query: clientIp,
      dev: true
    });
  }

  try {
    const url = `http://ip-api.com/json/${clientIp}?fields=status,isp,org,as,city,country,countryCode,lat,lon,timezone,query`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ status: "fail", message: "ISP API failed", query: clientIp }, { status: 500 });
  }
}
