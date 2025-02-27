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
      transaction TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      nonce INTEGER,
      hash TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      amount INTEGER,
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
});

module.exports = db;
