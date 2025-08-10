export async function classifyCategoryServer(note: string, categories: string[]): Promise<string | null> {
  try {
    const resp = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note, categories })
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data?.category ?? null;
  } catch {
    return null;
  }
}


