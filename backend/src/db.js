const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      publicKey TEXT,
      privateKey TEXT,
      balance INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chain (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      previousHash TEXT,
      transaction_data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      nonce INTEGER,
      hash TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      amount REAL,
      price REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS mining_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      miningTime REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS market (
      id INTEGER PRIMARY KEY,
      price REAL
    )
  `);

  // Initialize the market table with a default value
  db.run(`
    INSERT INTO market (id, price) VALUES (1, 0.0)
    ON CONFLICT(id) DO NOTHING
  `);
});

module.exports = db;
