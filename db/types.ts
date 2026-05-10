// ─────────────────────────────────────────────
//  Database Types & Interfaces
// ─────────────────────────────────────────────

export type MonthStatus = 'open' | 'closed';

export interface Month {
  id: number;
  year: number;
  month: number; // 1–12
  status: MonthStatus;
  closed_at: string | null;
}

export interface Salary {
  id: number;
  month_id: number;
  amount: number;
  entered_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;       // JSON: { light, dark, bg }
  planned_amount: number;
  is_active: number;   // 1 = true, 0 = false (SQLite has no boolean)
}

export interface ExpenseEntry {
  id: number;
  month_id: number;
  category_id: number;
  planned_amount: number; // snapshot at month creation
  spent_amount: number;
}

export interface VaultEntry {
  id: number;
  month_id: number;
  amount: number;
  note: string | null;
  created_at: string;
}

// ── Joined / View types used by screens ──────

export interface ExpenseEntryWithCategory extends ExpenseEntry {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface MonthSummary {
  month: Month;
  salary: number;
  totalSpent: number;
  totalPlanned: number;
  projectedSavings: number;
}
