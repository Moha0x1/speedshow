export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ ts: Date.now() });
}
