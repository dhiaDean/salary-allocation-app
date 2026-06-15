import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getDb } from './database';
import {
  closeMonth,
  deleteCategory,
  getActiveCategories,
  getAllMonths,
  getExpenseEntries,
  getMonthSummary,
  getOrCreateMonth,
  getTotalVaultBalance,
  getVaultEntries,
  setSalary,
  updateCategory,
  // New transactional queries
  addTransaction,
  deleteTransaction as dbDeleteTransaction,
  getTransactions,
  addVaultTransaction,
} from './queries';
import type {
  ExpenseCategory,
  ExpenseEntryWithCategory,
  Month,
  MonthSummary,
  Transaction,
  VaultTransaction,
} from './types';

// ─────────────────────────────────────────────
//  Context shape
// ─────────────────────────────────────────────
interface DatabaseContextValue {
  isReady: boolean;

  // Current month
  currentMonth: Month | null;
  salary: number;
  expenses: ExpenseEntryWithCategory[];
  summary: MonthSummary | null;

  // Actions
  initCurrentMonth: () => Promise<void>;
  saveSalary: (amount: number) => Promise<void>;
  saveSpentAmount: (entryId: number, amount: number) => Promise<void>; // Backwards compatible
  confirmCloseMonth: () => Promise<void>;

  // Transaction-specific Actions
  addNewTransaction: (budgetId: number, amount: number, description: string) => Promise<void>;
  removeTransaction: (transactionId: number) => Promise<void>;
  getTransactionsForBudget: (budgetId: number) => Promise<Transaction[]>;

  // Categories
  categories: ExpenseCategory[];
  refreshCategories: () => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
  editCategory: (id: number, name: string, description: string, amount: number) => Promise<void>;

  // Vault
  vaultEntries: (VaultTransaction & { year: number; month: number })[];
  vaultBalance: number;
  refreshVault: () => Promise<void>;
  addManualVaultTx: (amount: number, type: 'deposit' | 'withdrawal', note?: string) => Promise<void>;

  // All months (for history)
  allMonths: Month[];
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

// ─────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Month | null>(null);
  const [salary, setSalaryState] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseEntryWithCategory[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [vaultEntries, setVaultEntries] = useState<(VaultTransaction & { year: number; month: number })[]>([]);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [allMonths, setAllMonths] = useState<Month[]>([]);

  // ── Boot: open DB ──────────────────────────
  useEffect(() => {
    (async () => {
      await getDb(); // initializes schema + seeds
      await initCurrentMonth();
      await refreshCategories();
      await refreshVault();
      setIsReady(true);
    })();
  }, []);

  // ── Load current (today's) month ───────────
  const initCurrentMonth = useCallback(async () => {
    const now = new Date();
    const month = await getOrCreateMonth(now.getFullYear(), now.getMonth() + 1);
    setCurrentMonth(month);

    const entries = await getExpenseEntries(month.id);
    setExpenses(entries);

    const s = await getMonthSummary(month.id);
    setSummary(s);
    setSalaryState(s.salary);

    const months = await getAllMonths();
    setAllMonths(months);
  }, []);

  // ── Salary ────────────────────────────────
  const saveSalary = useCallback(async (amount: number) => {
    if (!currentMonth) return;
    await setSalary(currentMonth.id, amount);
    setSalaryState(amount);
    const s = await getMonthSummary(currentMonth.id);
    setSummary(s);
  }, [currentMonth]);

  // ── Spent amount (Backwards Compatible single-transaction reset) ──
  const saveSpentAmount = useCallback(async (entryId: number, amount: number) => {
    const db = await getDb();
    await db.runAsync('DELETE FROM transactions WHERE budget_id = ?', [entryId]);
    if (amount > 0) {
      await db.runAsync(
        'INSERT INTO transactions (budget_id, amount, description, spent_at) VALUES (?, ?, ?, ?)',
        [entryId, amount, 'Manual Entry', new Date().toISOString()]
      );
    }
    if (!currentMonth) return;
    const entries = await getExpenseEntries(currentMonth.id);
    setExpenses(entries);
    const s = await getMonthSummary(currentMonth.id);
    setSummary(s);
  }, [currentMonth]);

  // ── Close month ───────────────────────────
  const confirmCloseMonth = useCallback(async () => {
    if (!currentMonth || !summary) return;
    await closeMonth(currentMonth.id, summary.projectedSavings);
    await initCurrentMonth();
    await refreshVault();
  }, [currentMonth, summary]);

  // ── Transaction Operations ─────────────────
  const addNewTransaction = useCallback(async (budgetId: number, amount: number, description: string) => {
    await addTransaction(budgetId, amount, description);
    if (!currentMonth) return;
    const entries = await getExpenseEntries(currentMonth.id);
    setExpenses(entries);
    const s = await getMonthSummary(currentMonth.id);
    setSummary(s);
  }, [currentMonth]);

  const removeTransaction = useCallback(async (transactionId: number) => {
    await dbDeleteTransaction(transactionId);
    if (!currentMonth) return;
    const entries = await getExpenseEntries(currentMonth.id);
    setExpenses(entries);
    const s = await getMonthSummary(currentMonth.id);
    setSummary(s);
  }, [currentMonth]);

  const getTransactionsForBudget = useCallback(async (budgetId: number) => {
    return getTransactions(budgetId);
  }, []);

  // ── Categories ────────────────────────────
  const refreshCategories = useCallback(async () => {
    const cats = await getActiveCategories();
    setCategories(cats);
    if (currentMonth) {
      const entries = await getExpenseEntries(currentMonth.id);
      setExpenses(entries);
      const s = await getMonthSummary(currentMonth.id);
      setSummary(s);
    }
  }, [currentMonth]);

  const removeCategory = useCallback(async (id: number) => {
    await deleteCategory(id);
    await refreshCategories();
  }, []);

  const editCategory = useCallback(async (
    id: number, name: string, description: string, amount: number
  ) => {
    await updateCategory(id, name, description, amount);
    await refreshCategories();
  }, []);

  // ── Vault ─────────────────────────────────
  const refreshVault = useCallback(async () => {
    const entries = await getVaultEntries();
    const balance = await getTotalVaultBalance();
    setVaultEntries(entries);
    setVaultBalance(balance);
  }, []);

  const addManualVaultTx = useCallback(async (amount: number, type: 'deposit' | 'withdrawal', note?: string) => {
    await addVaultTransaction(currentMonth?.id ?? null, amount, type, note);
    await refreshVault();
  }, [currentMonth]);

  return (
    <DatabaseContext.Provider
      value={{
        isReady,
        currentMonth,
        salary,
        expenses,
        summary,
        initCurrentMonth,
        saveSalary,
        saveSpentAmount,
        confirmCloseMonth,
        addNewTransaction,
        removeTransaction,
        getTransactionsForBudget,
        categories,
        refreshCategories,
        removeCategory,
        editCategory,
        vaultEntries,
        vaultBalance,
        refreshVault,
        addManualVaultTx,
        allMonths,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────
export function useDatabase(): DatabaseContextValue {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used inside <DatabaseProvider>');
  return ctx;
}
