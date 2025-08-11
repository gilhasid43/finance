import { createClient } from '@supabase/supabase-js';

// Node runtime (not Edge) for wider compatibility with supabase-js
export const config = { runtime: 'nodejs' } as const;

type ExpenseRow = {
  id: string;
  household_token: string;
  date: string; // ISO string
  amount: number;
  category: string;
  method: string;
  note: string;
  updated_at?: string;
};

type BudgetRow = {
  household_token: string;
  category: string;
  amount: number;
};

function getAuthToken(req: Request): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const url = new URL(req.url);
  return url.searchParams.get('token');
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server misconfiguration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: Request): Promise<Response> {
  const token = getAuthToken(req);
  const requiredToken = process.env.HOUSEHOLD_TOKEN || process.env.VITE_HOUSEHOLD_TOKEN;
  if (!token || (requiredToken && token !== requiredToken)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  try {
    const supabase = getSupabase();

    if (req.method === 'GET') {
      const [exp, bud] = await Promise.all([
        supabase.from<ExpenseRow>('expenses').select('*').eq('household_token', token).order('date', { ascending: false }),
        supabase.from<BudgetRow>('budgets').select('*').eq('household_token', token),
      ]);

      if (exp.error) throw exp.error;
      if (bud.error) throw bud.error;

      return new Response(
        JSON.stringify({ expenses: exp.data ?? [], budgets: Object.fromEntries((bud.data ?? []).map(b => [b.category, b.amount])) }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const action = String(body?.action || '');

      if (action === 'upsertExpense') {
        const e = body?.expense as Omit<ExpenseRow, 'household_token'> | undefined;
        if (!e || !e.id) {
          return new Response(JSON.stringify({ error: 'Invalid expense payload' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        const payload: ExpenseRow = { ...e, household_token: token } as ExpenseRow;
        const { error } = await supabase.from('expenses').upsert(payload, { onConflict: 'id' });
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      if (action === 'deleteExpense') {
        const id = String(body?.id || '');
        if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'content-type': 'application/json' } });
        const { error } = await supabase.from('expenses').delete().eq('id', id).eq('household_token', token);
        if (error) throw error;
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      if (action === 'setBudgets') {
        const budgets = body?.budgets as Record<string, number> | undefined;
        if (!budgets || typeof budgets !== 'object') {
          return new Response(JSON.stringify({ error: 'Invalid budgets payload' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
        // Upsert each category, then delete removed ones
        const entries = Object.entries(budgets).map(([category, amount]) => ({ household_token: token, category, amount }));
        const { error: upsertErr } = await supabase.from('budgets').upsert(entries as BudgetRow[], { onConflict: 'household_token,category' });
        if (upsertErr) throw upsertErr;

        // Fetch existing categories to prune removed ones
        // For a narrowed select, avoid passing a single generic which causes TS2558 in supabase-js v2
        const { data: existing, error: selErr } = await supabase
          .from('budgets')
          .select('category')
          .eq('household_token', token);
        if (selErr) throw selErr;
        const keep = new Set(Object.keys(budgets));
        const toDelete = (existing || []).filter(b => !keep.has(b.category));
        if (toDelete.length > 0) {
          const { error: delErr } = await supabase
            .from('budgets')
            .delete()
            .eq('household_token', token)
            .in('category', toDelete.map(b => b.category));
          if (delErr) throw delErr;
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Internal error', detail: String(err?.message || err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}


