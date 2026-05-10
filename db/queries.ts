import { getDb } from './database';
import type {
  ExpenseCategory,
  ExpenseEntry,
  ExpenseEntryWithCategory,
  Month,
  MonthSummary,
  VaultEntry,
} from './types';

// ─────────────────────────────────────────────
//  MONTHS
// ─────────────────────────────────────────────

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
    row = await db.getFirstAsync<Month>('SELECT * FROM months WHERE id = ?', [result.lastInsertRowId]);

    // Create expense entries from current active categories
    const categories = await getActiveCategories();
    for (const cat of categories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO expense_entries (month_id, category_id, planned_amount, spent_amount)
         VALUES (?, ?, ?, 0)`,
        [result.lastInsertRowId, cat.id, cat.planned_amount]
      );
    }
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

/** Close a month: set status to closed, create vault entry */
export async function closeMonth(monthId: number, savingsAmount: number, note?: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE months SET status = 'closed', closed_at = ? WHERE id = ?`,
    [now, monthId]
  );
  await db.runAsync(
    `INSERT INTO vault_entries (month_id, amount, note, created_at) VALUES (?, ?, ?, ?)`,
    [monthId, savingsAmount, note ?? null, now]
  );
}

// ─────────────────────────────────────────────
//  SALARY
// ─────────────────────────────────────────────

/** Get salary for a month (returns 0 if not set) */
export async function getSalary(monthId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ amount: number }>(
    'SELECT amount FROM salary WHERE month_id = ? ORDER BY id DESC LIMIT 1',
    [monthId]
  );
  return row?.amount ?? 0;
}

/** Set / update salary for a month */
export async function setSalary(monthId: number, amount: number): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM salary WHERE month_id = ?',
    [monthId]
  );
  if (existing) {
    await db.runAsync('UPDATE salary SET amount = ?, entered_at = ? WHERE month_id = ?', [
      amount,
      new Date().toISOString(),
      monthId,
    ]);
  } else {
    await db.runAsync(
      'INSERT INTO salary (month_id, amount, entered_at) VALUES (?, ?, ?)',
      [monthId, amount, new Date().toISOString()]
    );
  }
}

// ─────────────────────────────────────────────
//  EXPENSE CATEGORIES
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
  plannedAmount: number
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE expense_categories SET name = ?, description = ?, planned_amount = ? WHERE id = ?',
    [name, description, plannedAmount, id]
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  // Soft delete — keeps historical data intact
  await db.runAsync('UPDATE expense_categories SET is_active = 0 WHERE id = ?', [id]);
}

// ─────────────────────────────────────────────
//  EXPENSE ENTRIES (per month)
// ─────────────────────────────────────────────

/** Get all expense entries for a month, joined with category info */
export async function getExpenseEntries(monthId: number): Promise<ExpenseEntryWithCategory[]> {
  const db = await getDb();
  return db.getAllAsync<ExpenseEntryWithCategory>(
    `SELECT ee.*, ec.name, ec.description, ec.icon, ec.color
     FROM expense_entries ee
     JOIN expense_categories ec ON ec.id = ee.category_id
     WHERE ee.month_id = ?
     ORDER BY ec.id ASC`,
    [monthId]
  );
}

/** Update the spent amount for a specific entry */
export async function updateSpentAmount(entryId: number, spentAmount: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE expense_entries SET spent_amount = ? WHERE id = ?',
    [spentAmount, entryId]
  );
}

// ─────────────────────────────────────────────
//  VAULT ENTRIES
// ─────────────────────────────────────────────

export async function getVaultEntries(): Promise<(VaultEntry & { year: number; month: number })[]> {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT ve.*, m.year, m.month
     FROM vault_entries ve
     JOIN months m ON m.id = ve.month_id
     ORDER BY ve.created_at DESC`
  );
}

export async function getTotalVaultBalance(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount), 0) as total FROM vault_entries'
  );
  return row?.total ?? 0;
}

// ─────────────────────────────────────────────
//  SUMMARY helpers
// ─────────────────────────────────────────────

export async function getMonthSummary(monthId: number): Promise<MonthSummary> {
  const db = await getDb();
  const month = await db.getFirstAsync<Month>('SELECT * FROM months WHERE id = ?', [monthId]);
  const salary = await getSalary(monthId);
  const agg = await db.getFirstAsync<{ totalSpent: number; totalPlanned: number }>(
    `SELECT COALESCE(SUM(spent_amount), 0) as totalSpent,
            COALESCE(SUM(planned_amount), 0) as totalPlanned
     FROM expense_entries WHERE month_id = ?`,
    [monthId]
  );
  const totalSpent = agg?.totalSpent ?? 0;
  const totalPlanned = agg?.totalPlanned ?? 0;
  return {
    month: month!,
    salary,
    totalSpent,
    totalPlanned,
    projectedSavings: Math.max(salary - totalSpent, 0),
  };
}
