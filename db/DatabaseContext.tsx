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
  updateSpentAmount,
} from './queries';
import type {
  ExpenseCategory,
  ExpenseEntryWithCategory,
  Month,
  MonthSummary,
  VaultEntry,
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
  saveSpentAmount: (entryId: number, amount: number) => Promise<void>;
  confirmCloseMonth: () => Promise<void>;

  // Categories
  categories: ExpenseCategory[];
  refreshCategories: () => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
  editCategory: (id: number, name: string, description: string, amount: number) => Promise<void>;

  // Vault
  vaultEntries: (VaultEntry & { year: number; month: number })[];
  vaultBalance: number;
  refreshVault: () => Promise<void>;

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
  const [vaultEntries, setVaultEntries] = useState<(VaultEntry & { year: number; month: number })[]>([]);
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

  // ── Spent amount ──────────────────────────
  const saveSpentAmount = useCallback(async (entryId: number, amount: number) => {
    await updateSpentAmount(entryId, amount);
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

  // ── Categories ────────────────────────────
  const refreshCategories = useCallback(async () => {
    const cats = await getActiveCategories();
    setCategories(cats);
  }, []);

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
        categories,
        refreshCategories,
        removeCategory,
        editCategory,
        vaultEntries,
        vaultBalance,
        refreshVault,
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
