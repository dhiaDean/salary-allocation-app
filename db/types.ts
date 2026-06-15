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

export interface IncomeEntry {
  id: number;
  month_id: number;
  source_name: string;
  amount: number;
  received_at: string;
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

export interface MonthlyBudget {
  id: number;
  month_id: number;
  category_id: number;
  planned_amount: number;
}

export interface Transaction {
  id: number;
  budget_id: number;
  amount: number;
  description: string;
  spent_at: string;
}

export interface VaultTransaction {
  id: number;
  month_id: number | null;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  note: string | null;
  created_at: string;
}

// ── Joined / View types used by screens ──────

export interface ExpenseEntryWithCategory {
  id: number;              // maps to monthly_budgets.id
  month_id: number;
  category_id: number;
  planned_amount: number;  // snapshots monthly_budgets.planned_amount
  spent_amount: number;    // computed sum of transactions for this budget_id
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface MonthSummary {
  month: Month;
  salary: number;          // computed sum of all income_entries
  totalSpent: number;      // computed sum of all transactions for this month
  totalPlanned: number;    // sum of all monthly_budgets.planned_amount
  projectedSavings: number; // salary - totalSpent
}
