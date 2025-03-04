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
};
