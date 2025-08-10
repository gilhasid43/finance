import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple serverless endpoint to classify an expense note into one of the given categories
// Expects POST { note: string, categories: string[] }
// Requires env var OPENAI_API_KEY to be set in the hosting platform

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: OPENAI_API_KEY not set' });
  }

  try {
    const { note, categories } = req.body || {};
    if (!note || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Invalid payload. Expected { note: string, categories: string[] }' });
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
      return res.status(502).json({ error: 'Upstream error', detail: text });
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return res.status(200).json({ category: categories[0] });
    }

    // Best-effort match to provided categories
    const normalized = content.toLowerCase();
    const exact = categories.find((c: string) => c.toLowerCase() === normalized);
    const partial = categories.find((c: string) => normalized.includes(c.toLowerCase()));
    const category = exact || partial || categories[0];

    return res.status(200).json({ category });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) });
  }
}


