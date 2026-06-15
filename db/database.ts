import * as SQLite from 'expo-sqlite';

const DB_NAME = 'salary_app.db';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await initSchema(_db);
  return _db;
}

// ─────────────────────────────────────────────
//  Schema — create all tables if they don't exist
// ─────────────────────────────────────────────
async function initSchema(db: SQLite.SQLiteDatabase) {
  // Check if legacy tables exist. If yes, drop them to re-create clean relational tables.
  const tableCheck = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='expense_entries'"
  );
  if (tableCheck && tableCheck.count > 0) {
    // If the new table 'monthly_budgets' does NOT exist, it means we need to drop the old schema.
    const newTableCheck = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='monthly_budgets'"
    );
    if (!newTableCheck || newTableCheck.count === 0) {
      await db.execAsync(`
        DROP TABLE IF EXISTS vault_entries;
        DROP TABLE IF EXISTS expense_entries;
        DROP TABLE IF EXISTS expense_categories;
        DROP TABLE IF EXISTS salary;
        DROP TABLE IF EXISTS months;
      `);
    }
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS months (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      year       INTEGER NOT NULL,
      month      INTEGER NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'open',
      closed_at  TEXT,
      UNIQUE(year, month)
    );

    CREATE TABLE IF NOT EXISTS income_entries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id    INTEGER NOT NULL REFERENCES months(id) ON DELETE CASCADE,
      source_name TEXT    NOT NULL DEFAULT 'Salary',
      amount      REAL    NOT NULL,
      received_at TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT    NOT NULL UNIQUE,
      description    TEXT    NOT NULL DEFAULT '',
      icon           TEXT    NOT NULL DEFAULT 'category',
      color          TEXT    NOT NULL DEFAULT '{}',
      planned_amount REAL    NOT NULL DEFAULT 0,
      is_active      INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS monthly_budgets (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id       INTEGER NOT NULL REFERENCES months(id) ON DELETE CASCADE,
      category_id    INTEGER NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
      planned_amount REAL    NOT NULL DEFAULT 0,
      UNIQUE(month_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_id   INTEGER NOT NULL REFERENCES monthly_budgets(id) ON DELETE CASCADE,
      amount      REAL    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      spent_at    TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vault_transactions (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      month_id         INTEGER REFERENCES months(id) ON DELETE SET NULL,
      amount           REAL    NOT NULL,
      transaction_type TEXT    NOT NULL DEFAULT 'deposit',
      note             TEXT,
      created_at       TEXT    NOT NULL
    );
  `);

  await seedDefaultCategories(db);
}

// ─────────────────────────────────────────────
//  Seed default categories on first run
// ─────────────────────────────────────────────
async function seedDefaultCategories(db: SQLite.SQLiteDatabase) {
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM expense_categories'
  );
  if (existing && existing.count > 0) return;

  const defaults = [
    {
      name: 'Food',
      description: 'Groceries and dining out',
      icon: 'restaurant',
      color: JSON.stringify({ light: '#fbbf24', dark: '#facc15', bg: 'rgba(251,191,36,0.2)' }),
      planned_amount: 500,
    },
    {
      name: 'Transport',
      description: 'Fuel, bus, metro, taxi',
      icon: 'directions-bus',
      color: JSON.stringify({ light: '#3b82f6', dark: '#60a5fa', bg: 'rgba(59,130,246,0.2)' }),
      planned_amount: 200,
    },
    {
      name: 'Internet',
      description: 'Home internet & phone plan',
      icon: 'wifi',
      color: JSON.stringify({ light: '#a855f7', dark: '#c084fc', bg: 'rgba(168,85,247,0.2)' }),
      planned_amount: 60,
    },
    {
      name: 'Rent',
      description: 'Housing rent or mortgage',
      icon: 'home',
      color: JSON.stringify({ light: '#19e65e', dark: '#19e65e', bg: 'rgba(25,230,94,0.2)' }),
      planned_amount: 1200,
    },
    {
      name: 'Entertainment',
      description: 'Movies, games, subscriptions',
      icon: 'movie',
      color: JSON.stringify({ light: '#f472b6', dark: '#f472b6', bg: 'rgba(244,114,182,0.2)' }),
      planned_amount: 200,
    },
  ];

  for (const cat of defaults) {
    await db.runAsync(
      `INSERT OR IGNORE INTO expense_categories (name, description, icon, color, planned_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [cat.name, cat.description, cat.icon, cat.color, cat.planned_amount]
    );
  }
}
