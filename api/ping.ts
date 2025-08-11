export const config = { runtime: 'edge' } as const;

export default function handler(_req: Request): Response {
  return new Response(
    JSON.stringify({ ok: true, now: new Date().toISOString(), runtime: 'edge' }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
}


