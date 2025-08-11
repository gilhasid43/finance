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

export default async function handler(req: any, res: any) {
  // Authorization: Bearer <token> or ?token=<token>
  const authHeader: string | undefined = req.headers?.authorization || req.headers?.Authorization;
  const bearer = typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;
  const token: string | null = bearer || (req.query?.token as string | null) || null;
  const requiredToken = process.env.HOUSEHOLD_TOKEN || process.env.VITE_HOUSEHOLD_TOKEN;
  if (!token || (requiredToken && token !== requiredToken)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const supabase = getSupabase();

    if (req.method === 'GET') {
      const [exp, bud] = await Promise.all([
        createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } })
          .from<ExpenseRow>('expenses')
          .select('*')
          .eq('household_token', token)
          .order('date', { ascending: false }),
        createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } })
          .from<BudgetRow>('budgets')
          .select('*')
          .eq('household_token', token),
      ]);

      if (exp.error) throw exp.error;
      if (bud.error) throw bud.error;
      res.status(200).json({ expenses: exp.data ?? [], budgets: Object.fromEntries((bud.data ?? []).map(b => [b.category, b.amount])) });
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const action = String(body?.action || '');

      if (action === 'upsertExpense') {
        const e = body?.expense as Omit<ExpenseRow, 'household_token'> | undefined;
        if (!e || !e.id) {
          res.status(400).json({ error: 'Invalid expense payload' });
          return;
        }
        const payload: ExpenseRow = { ...e, household_token: token } as ExpenseRow;
        const { error } = await createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } })
          .from('expenses')
          .upsert(payload, { onConflict: 'id' });
        if (error) throw error;
        res.status(200).json({ ok: true });
        return;
      }

      if (action === 'deleteExpense') {
        const id = String(body?.id || '');
        if (!id) {
          res.status(400).json({ error: 'Missing id' });
          return;
        }
        const { error } = await createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } })
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('household_token', token);
        if (error) throw error;
        res.status(200).json({ ok: true });
        return;
      }

      if (action === 'setBudgets') {
        const budgets = body?.budgets as Record<string, number> | undefined;
        if (!budgets || typeof budgets !== 'object') {
          res.status(400).json({ error: 'Invalid budgets payload' });
          return;
        }
        const sb = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } });
        const entries = Object.entries(budgets).map(([category, amount]) => ({ household_token: token, category, amount }));
        const { error: upsertErr } = await sb.from('budgets').upsert(entries as BudgetRow[], { onConflict: 'household_token,category' });
        if (upsertErr) throw upsertErr;

        const { data: existing, error: selErr } = await sb
          .from('budgets')
          .select('category')
          .eq('household_token', token);
        if (selErr) throw selErr;
        const keep = new Set(Object.keys(budgets));
        const toDelete = (existing || []).filter((b: any) => !keep.has(b.category));
        if (toDelete.length > 0) {
          const { error: delErr } = await sb
            .from('budgets')
            .delete()
            .eq('household_token', token)
            .in('category', toDelete.map((b: any) => b.category));
          if (delErr) throw delErr;
        }
        res.status(200).json({ ok: true });
        return;
      }

      res.status(400).json({ error: 'Unknown action' });
      return;
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) });
  }
}


