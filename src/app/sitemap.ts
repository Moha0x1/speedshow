import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://speedshow.app';
  
  const routes = [
    '',
    '/gaming-speed-test',
    '/streaming-speed-test',
    '/vpn-performance-test',
    '/web3-latency-test',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}
