import { HOUSEHOLD_TOKEN } from '@/config';

export interface SyncExpenseItem {
  id: string;
  date: string; // ISO string
  amount: number;
  category: string;
  method: string;
  note: string;
}

export async function fetchAllFromServer(): Promise<
  | { ok: true; expenses: SyncExpenseItem[]; budgets: Record<string, number> }
  | { ok: false }
> {
  try {
    if (!HOUSEHOLD_TOKEN) return { ok: false };
    const resp = await fetch('/api/expenses', {
      method: 'GET',
      headers: { Authorization: `Bearer ${HOUSEHOLD_TOKEN}` },
    });
    if (!resp.ok) return { ok: false };
    const data = await resp.json();
    return { ok: true, expenses: data.expenses ?? [], budgets: data.budgets ?? {} };
  } catch {
    return { ok: false };
  }
}

export async function upsertExpenseToServer(expense: SyncExpenseItem): Promise<boolean> {
  try {
    if (!HOUSEHOLD_TOKEN) return false;
    const resp = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HOUSEHOLD_TOKEN}`,
      },
      body: JSON.stringify({ action: 'upsertExpense', expense }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function deleteExpenseFromServer(id: string): Promise<boolean> {
  try {
    if (!HOUSEHOLD_TOKEN) return false;
    const resp = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HOUSEHOLD_TOKEN}`,
      },
      body: JSON.stringify({ action: 'deleteExpense', id }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function setBudgetsOnServer(budgets: Record<string, number>): Promise<boolean> {
  try {
    if (!HOUSEHOLD_TOKEN) return false;
    const resp = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HOUSEHOLD_TOKEN}`,
      },
      body: JSON.stringify({ action: 'setBudgets', budgets }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}



