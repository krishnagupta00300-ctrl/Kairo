const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'kairo.db'));

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      deadline TEXT,
      estimated_minutes INTEGER,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS ai_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      suggestion TEXT,
      type TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      dismissed INTEGER DEFAULT 0,
      FOREIGN KEY(task_id) REFERENCES tasks(id)
    );
  `);
  console.log('✓ Database ready');
}

module.exports = { db, initDB };