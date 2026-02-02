import Database from 'better-sqlite3';

// Note: In a real Electron or Node environment, this would persist.
// For a pure Vite app, 'better-sqlite3' might need a backend or local proxy.
// I'll set up the schema and helper functions.

const db = new Database('transhub.db', { verbose: console.log });

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price REAL NOT NULL,
      status TEXT CHECK(status IN ('Ready to Ship', 'Preorder')) NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      type TEXT CHECK(type IN ('Inspection', 'Purchase')) NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(car_id) REFERENCES cars(id)
    );

    CREATE TABLE IF NOT EXISTS preorders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      budget REAL,
      status TEXT DEFAULT 'Searching',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default db;
