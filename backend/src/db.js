const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  console.log("serialize")
  // Create the chain table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS chain (
      "index" INT,
      "timestamp" INT,
      "data" TEXT,
      "previousHash" TEXT,
      "hash" TEXT,
      "nonce" INT
    )
  `);

  // Create the wallets table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS wallets (
      "publicKey" TEXT PRIMARY KEY,
      "balance" INT
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

  // Create the transactions table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "senderPublicKey" TEXT,
      "receiverPublicKey" TEXT,
      "amount" REAL,
      "timestamp" INT
    )
  `);

  // Initialize the market table with a default value
  db.run(`
    INSERT INTO market (id, price) VALUES (1, 0.0)
    ON CONFLICT(id) DO NOTHING
  `);

});

const getChain = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM chain ORDER BY "index"', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const addBlock = (block) => {
  console.log("addBlock", block)
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO chain ("index", "timestamp", "data", "previousHash", "hash", "nonce") VALUES (?, ?, ?, ?, ?, ?)', 
      [block.index, block.timestamp, JSON.stringify(block.data), block.previousHash, block.hash, block.nonce], 
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

const walletExists = (publicKey) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM wallets WHERE publicKey = ?', [publicKey], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(!!row);
    });
  });
};

const updateWalletBalance = (publicKey, amount) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE wallets SET balance = balance + ? WHERE publicKey = ?', [amount, publicKey], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const createWallet = (publicKey, balance) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO wallets (publicKey, balance) VALUES (?, ?)', [publicKey, balance], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const all = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      console.log(query, params, rows)
      resolve(rows);
    });
  });
};

class Block {
  constructor(previousHash, transaction, timestamp = Date.now(), nonce = 0) {
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transaction = transaction;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.previousHash + this.timestamp + JSON.stringify(this.transaction) + this.nonce)
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (!this.hash.startsWith('0'.repeat(difficulty))) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

module.exports = {
  getChain,
  addBlock,
  walletExists,
  updateWalletBalance,
  createWallet,
  all,
  addTransaction,
  getTransactions,
};
