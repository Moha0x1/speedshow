import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://pagead2.googlesyndication.com; connect-src 'self' https://pagead2.googlesyndication.com https://1.1.1.1 https://8.8.8.8 https://cloudflare-eth.com https://rpc.ankr.com https://speed.cloudflare.com; frame-src 'self' https://googleads.g.doubleclick.net;"
  );

  return response;
}

export const config = {
  matcher: '/:path*',
};
