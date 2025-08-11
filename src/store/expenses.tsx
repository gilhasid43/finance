import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deleteExpenseFromServer, fetchAllFromServer, setBudgetsOnServer, upsertExpenseToServer } from "@/lib/sync";

export type PaymentMethod = "מזומן" | "כרטיס אשראי" | "העברה" | "אחר";

export interface ExpenseItem {
  id: string;
  amount: number;
  category: string;
  method: PaymentMethod;
  note: string;
  date: string; // ISO string
}

export type BudgetsMap = Record<string, number>;

interface ExpensesContextValue {
  expenses: ExpenseItem[];
  lastMonthExpenses: ExpenseItem[];
  budgets: BudgetsMap;
  totalBudget: number;
  totalSpent: number;
  remainingAmount: number;
  spentByCategory: Record<string, number>;
  addExpense: (expense: Omit<ExpenseItem, "id" | "date"> & { date?: string }) => void;
  deleteExpense: (id: string) => void;
  updateExpenseCategory: (id: string, category: string) => void;
  setBudget: (category: string, value: number) => void;
  setBudgets: (budgets: BudgetsMap) => void;
  renameCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
  resetCurrentMonth: () => void;
}

const DEFAULT_BUDGETS: BudgetsMap = {
  "אוכל": 1000,
  "תחבורה": 400,
  "בילויים": 600,
  "קניות": 300,
  "קפה": 200,
};

const EXPENSES_KEY = "shekelSpeak.expenses.v1";
const BUDGETS_KEY = "shekelSpeak.budgets.v1";
const ARCHIVE_KEY = "shekelSpeak.archive.v1"; // Record<YYYY-MM, ExpenseItem[]>

const ExpensesContext = createContext<ExpensesContextValue | undefined>(undefined);

function loadExpenses(): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    return raw ? (JSON.parse(raw) as ExpenseItem[]) : [];
  } catch {
    return [];
  }
}

function loadBudgets(): BudgetsMap {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    return raw ? (JSON.parse(raw) as BudgetsMap) : { ...DEFAULT_BUDGETS };
  } catch {
    return { ...DEFAULT_BUDGETS };
  }
}

function saveExpenses(expenses: ExpenseItem[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

function saveBudgets(budgets: BudgetsMap) {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}

type MonthlyArchive = Record<string, ExpenseItem[]>;

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

function getLastMonthKey(ref: Date = new Date()): string {
  const y = ref.getFullYear();
  const m = ref.getMonth(); // 0-11 current month index
  const d = new Date(y, m - 1, 1);
  return getMonthKey(d);
}

function loadArchive(): MonthlyArchive {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? (JSON.parse(raw) as MonthlyArchive) : {};
  } catch {
    return {};
  }
}

function saveArchive(archive: MonthlyArchive) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

export const ExpensesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => loadExpenses());
  const [budgets, setBudgetsState] = useState<BudgetsMap>(() => loadBudgets());
  const [archive, setArchive] = useState<MonthlyArchive>(() => loadArchive());

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveArchive(archive);
  }, [archive]);

  // Initial sync from server on mount
  useEffect(() => {
    (async () => {
      const res = await fetchAllFromServer();
      if (res.ok) {
        setExpenses(res.expenses);
        setBudgetsState(res.budgets);
      }
    })();
  }, []);

  // Background polling to catch updates from the other device
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetchAllFromServer();
      if (res.ok) {
        setExpenses(res.expenses);
        setBudgetsState(res.budgets);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const addExpense = useCallback((expense: Omit<ExpenseItem, "id" | "date"> & { date?: string }) => {
    const newItem: ExpenseItem = {
      id: crypto.randomUUID(),
      date: expense.date ?? new Date().toISOString(),
      amount: expense.amount,
      category: expense.category,
      method: expense.method,
      note: expense.note,
    };
    setExpenses(prev => [newItem, ...prev]);
    // Fire-and-forget sync
    void upsertExpenseToServer(newItem as any);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    void deleteExpenseFromServer(id);
  }, []);

  const updateExpenseCategory = useCallback((id: string, category: string) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, category } : e)));
    const toSync = expenses.find(e => e.id === id);
    if (toSync) void upsertExpenseToServer({ ...toSync, category } as any);
  }, [expenses]);

  const setBudget = useCallback((category: string, value: number) => {
    setBudgetsState(prev => ({ ...prev, [category]: Math.max(0, Math.round(value)) }));
  }, []);

  const setBudgets = useCallback((newBudgets: BudgetsMap) => {
    setBudgetsState({ ...newBudgets });
    void setBudgetsOnServer(newBudgets);
  }, []);

  const renameCategory = useCallback((oldName: string, newName: string) => {
    if (!oldName || !newName || oldName === newName) return;
    setBudgetsState(prev => {
      const { [oldName]: oldVal, ...rest } = prev;
      const next: BudgetsMap = { ...rest };
      next[newName] = oldVal ?? 0;
      return next;
    });
    setExpenses(prev => prev.map(e => e.category === oldName ? { ...e, category: newName } : e));
  }, []);

  const deleteCategory = useCallback((name: string) => {
    if (!name) return;
    setBudgetsState(prev => {
      const { [name]: _removed, ...rest } = prev;
      return { ...rest };
    });
    // Reassign expenses in this category to 'כללי'
    setExpenses(prev => prev.map(e => e.category === name ? { ...e, category: 'כללי' } : e));
    setBudgetsState(prev => ({ 'כללי': prev['כללי'] ?? 0, ...prev }));
  }, []);

  const resetCurrentMonth = useCallback(() => {
    // Move current expenses to last month archive and clear current list
    setArchive(prev => {
      const key = getLastMonthKey(new Date());
      const existing = prev[key] ?? [];
      const merged = [...expenses, ...existing];
      return { ...prev, [key]: merged };
    });
    setExpenses([]);
  }, [expenses]);

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return map;
  }, [expenses]);

  const totalBudget = useMemo(() => Object.values(budgets).reduce((a, b) => a + (b || 0), 0), [budgets]);
  const totalSpent = useMemo(() => expenses.reduce((a, b) => a + (b.amount || 0), 0), [expenses]);
  const remainingAmount = Math.max(0, totalBudget - totalSpent);

  const lastMonthExpenses = useMemo(() => {
    const key = getLastMonthKey(new Date());
    return archive[key] ?? [];
  }, [archive]);

  const value: ExpensesContextValue = {
    expenses,
    lastMonthExpenses,
    budgets,
    totalBudget,
    totalSpent,
    remainingAmount,
    spentByCategory,
    addExpense,
    deleteExpense,
    updateExpenseCategory,
    setBudget,
    setBudgets,
    renameCategory,
    deleteCategory,
    resetCurrentMonth,
  };

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
};

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}


