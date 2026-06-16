import { getDb } from './database';
import type {
  ExpenseCategory,
  ExpenseEntryWithCategory,
  Month,
  MonthSummary,
  Transaction,
  VaultTransaction,
} from './types';

// ─────────────────────────────────────────────
//  MONTHS
// ─────────────────────────────────────────────

/** Helper to ensure all active template categories have budget snapshots for a given month */
async function ensureAllActiveCategoriesHaveBudgets(db: any, monthId: number): Promise<void> {
  const categories = await db.getAllAsync(
    'SELECT * FROM expense_categories WHERE is_active = 1'
  );
  for (const cat of categories) {
    await db.runAsync(
      `INSERT OR IGNORE INTO monthly_budgets (month_id, category_id, planned_amount)
       VALUES (?, ?, ?)`,
      [monthId, cat.id, cat.planned_amount]
    );
  }
}

/** Get or create a month record for the given year/month */
export async function getOrCreateMonth(year: number, month: number): Promise<Month> {
  const db = await getDb();
  let row = await db.getFirstAsync<Month>(
    'SELECT * FROM months WHERE year = ? AND month = ?',
    [year, month]
  );
  if (!row) {
    const result = await db.runAsync(
      `INSERT INTO months (year, month, status) VALUES (?, ?, 'open')`,
      [year, month]
    );
    const monthId = result.lastInsertRowId;
    row = await db.getFirstAsync<Month>('SELECT * FROM months WHERE id = ?', [monthId]);
  }
  if (row && row.status === 'open') {
    await ensureAllActiveCategoriesHaveBudgets(db, row.id);
  }
  return row!;
}

/** Get all months ordered most recent first */
export async function getAllMonths(): Promise<Month[]> {
  const db = await getDb();
  return db.getAllAsync<Month>(
    'SELECT * FROM months ORDER BY year DESC, month DESC'
  );
}

/** Close a month: set status to closed, create vault transaction */
export async function closeMonth(monthId: number, savingsAmount: number, note?: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE months SET status = 'closed', closed_at = ? WHERE id = ?`,
    [now, monthId]
  );
  await db.runAsync(
    `INSERT INTO vault_transactions (month_id, amount, transaction_type, note, created_at) VALUES (?, ?, 'deposit', ?, ?)`,
    [monthId, savingsAmount, note ?? 'Monthly Close Balance', now]
  );
}

// ─────────────────────────────────────────────
//  INCOME / SALARY
// ─────────────────────────────────────────────

/** Get salary (total income) for a month (returns 0 if not set) */
export async function getSalary(monthId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM income_entries WHERE month_id = ?',
    [monthId]
  );
  return row?.total ?? 0;
}

/** Set / update default primary salary for a month */
export async function setSalary(monthId: number, amount: number): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM income_entries WHERE month_id = ? AND source_name = 'Primary Salary'",
    [monthId]
  );
  if (existing) {
    await db.runAsync(
      "UPDATE income_entries SET amount = ?, received_at = ? WHERE id = ?",
      [amount, new Date().toISOString(), existing.id]
    );
  } else {
    await db.runAsync(
      "INSERT INTO income_entries (month_id, source_name, amount, received_at) VALUES (?, 'Primary Salary', ?, ?)",
      [monthId, amount, new Date().toISOString()]
    );
  }
}

// ─────────────────────────────────────────────
//  EXPENSE CATEGORIES (Templates)
// ─────────────────────────────────────────────

export async function getActiveCategories(): Promise<ExpenseCategory[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseCategory>(
    'SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY id ASC'
  );
}

export async function addCategory(
  name: string,
  description: string,
  icon: string,
  color: object,
  plannedAmount: number
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO expense_categories (name, description, icon, color, planned_amount)
     VALUES (?, ?, ?, ?, ?)`,
    [name, description, icon, JSON.stringify(color), plannedAmount]
  );
  return result.lastInsertRowId;
}

export async function updateCategory(
  id: number,
  name: string,
  description: string,
  icon: string,
  color: string,
  plannedAmount: number
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE expense_categories SET name = ?, description = ?, icon = ?, color = ?, planned_amount = ? WHERE id = ?',
    [name, description, icon, color, plannedAmount, id]
  );
  // Also update open monthly budgets
  await db.runAsync(
    `UPDATE monthly_budgets 
     SET planned_amount = ? 
     WHERE category_id = ? 
       AND month_id IN (SELECT id FROM months WHERE status = 'open')`,
    [plannedAmount, id]
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  // Soft delete — keeps historical data intact
  await db.runAsync('UPDATE expense_categories SET is_active = 0 WHERE id = ?', [id]);
  
  // For open months, delete monthly_budgets entry if it has no transactions
  const openBudgets = await db.getAllAsync<{ id: number }>(
    `SELECT mb.id 
     FROM monthly_budgets mb
     JOIN months m ON m.id = mb.month_id
     WHERE mb.category_id = ? AND m.status = 'open'`,
    [id]
  );
  
  for (const b of openBudgets) {
    const txCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM transactions WHERE budget_id = ?',
      [b.id]
    );
    if (txCount && txCount.count === 0) {
      await db.runAsync('DELETE FROM monthly_budgets WHERE id = ?', [b.id]);
    }
  }
}

// ─────────────────────────────────────────────
//  MONTHLY BUDGETS & TRANSACTION ENTRIES
// ─────────────────────────────────────────────

/** Get all monthly budgets with category info and computed spent amount */
export async function getExpenseEntries(monthId: number): Promise<ExpenseEntryWithCategory[]> {
  const db = await getDb();
  const month = await db.getFirstAsync<Month>('SELECT status FROM months WHERE id = ?', [monthId]);
  if (month && month.status === 'open') {
    await ensureAllActiveCategoriesHaveBudgets(db, monthId);
  }
  return db.getAllAsync<ExpenseEntryWithCategory>(
    `SELECT 
       mb.id,
       mb.month_id,
       mb.category_id,
       mb.planned_amount,
       COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.budget_id = mb.id), 0) AS spent_amount,
       ec.name,
       ec.description,
       ec.icon,
       ec.color
     FROM monthly_budgets mb
     JOIN expense_categories ec ON ec.id = mb.category_id
     WHERE mb.month_id = ?
     ORDER BY ec.id ASC`,
    [monthId]
  );
}

/** Get transactions for a specific monthly budget (category in month) */
export async function getTransactions(budgetId: number): Promise<Transaction[]> {
  const db = await getDb();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE budget_id = ? ORDER BY spent_at DESC',
    [budgetId]
  );
}

/** Add a new transaction (updates computed spent_amount) */
export async function addTransaction(
  budgetId: number,
  amount: number,
  description: string
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO transactions (budget_id, amount, description, spent_at) VALUES (?, ?, ?, ?)',
    [budgetId, amount, description, new Date().toISOString()]
  );
  return result.lastInsertRowId;
}

/** Delete a transaction */
export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// ─────────────────────────────────────────────
//  VAULT TRANSACTIONS
// ─────────────────────────────────────────────

export async function getVaultEntries(): Promise<(VaultTransaction & { year: number; month: number })[]> {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT vt.*, COALESCE(m.year, 0) as year, COALESCE(m.month, 0) as month
     FROM vault_transactions vt
     LEFT JOIN months m ON m.id = vt.month_id
     ORDER BY vt.created_at DESC`
  );
}

export async function addVaultTransaction(
  monthId: number | null,
  amount: number,
  transactionType: 'deposit' | 'withdrawal',
  note?: string
): Promise<number> {
  const db = await getDb();
  const factor = transactionType === 'withdrawal' ? -1 : 1;
  const signedAmount = Math.abs(amount) * factor;
  const result = await db.runAsync(
    `INSERT INTO vault_transactions (month_id, amount, transaction_type, note, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [monthId, signedAmount, transactionType, note ?? null, new Date().toISOString()]
  );
  return result.lastInsertRowId;
}

export async function getTotalVaultBalance(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM vault_transactions'
  );
  return row?.total ?? 0;
}

// ─────────────────────────────────────────────
//  SUMMARY HELPERS
// ─────────────────────────────────────────────

export async function getMonthSummary(monthId: number): Promise<MonthSummary> {
  const db = await getDb();
  const month = await db.getFirstAsync<Month>('SELECT * FROM months WHERE id = ?', [monthId]);
  if (month && month.status === 'open') {
    await ensureAllActiveCategoriesHaveBudgets(db, monthId);
  }
  const salary = await getSalary(monthId);

  // Sum planned amount from monthly_budgets
  const plannedRow = await db.getFirstAsync<{ totalPlanned: number }>(
    'SELECT COALESCE(SUM(planned_amount), 0) as totalPlanned FROM monthly_budgets WHERE month_id = ?',
    [monthId]
  );
  const totalPlanned = plannedRow?.totalPlanned ?? 0;

  // Sum spent amount from transactions related to this month's budgets
  const spentRow = await db.getFirstAsync<{ totalSpent: number }>(
    `SELECT COALESCE(SUM(t.amount), 0) as totalSpent
     FROM transactions t
     JOIN monthly_budgets mb ON mb.id = t.budget_id
     WHERE mb.month_id = ?`,
    [monthId]
  );
  const totalSpent = spentRow?.totalSpent ?? 0;

  return {
    month: month!,
    salary,
    totalSpent,
    totalPlanned,
    projectedSavings: salary - totalSpent,
  };
}
