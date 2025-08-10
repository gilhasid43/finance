// Edge runtime (ESM) to avoid CommonJS issues
export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server misconfiguration: OPENAI_API_KEY not set' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const { note, categories } = await req.json();
    if (!note || !Array.isArray(categories) || categories.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload. Expected { note: string, categories: string[] }' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const system = `You are an expense categorization assistant. Given a free-text expense description, choose the single best category from the provided list. Respond with ONLY the category text from the list.`;
    const user = JSON.stringify({ note, categories });

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: 'Upstream error', detail: text }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    const normalized = (content ?? '').toLowerCase();
    const exact = categories.find((c: string) => c.toLowerCase() === normalized);
    const partial = categories.find((c: string) => normalized.includes(c.toLowerCase()));
    const category = exact || partial || categories[0];

    return new Response(JSON.stringify({ category }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', detail: String(err?.message || err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}


