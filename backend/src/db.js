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
      "balance" INT,
      "username" TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "type" TEXT,
      "item" TEXT,
      "amount" REAL,
      "price" REAL
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
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "item" TEXT,
      "price" REAL
    )
  `);

  // Create the transactions table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "senderPublicKey" TEXT,
      "receiverPublicKey" TEXT,
      "amount" REAL,
      "fee" REAL,
      "timestamp" INT
    )
  `);

  // Create the mempool table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS mempool (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "senderPublicKey" TEXT,
      "receiverPublicKey" TEXT,
      "amount" REAL,
      "fee" REAL,
      "signature" TEXT,
      "data" TEXT
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
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO chain ("index", "timestamp", "data", "previousHash", "hash", "nonce") VALUES (?, ?, ?, ?, ?, ?)', 
      [block.index, block.timestamp, JSON.stringify(block.transactions), block.previousHash, block.hash, block.nonce], 
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
      resolve(rows);
    });
  });
};

const addTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO transactions (senderPublicKey, receiverPublicKey, amount, timestamp) VALUES (?, ?, ?, ?, ?)', 
      [transaction.senderPublicKey, transaction.receiverPublicKey, transaction.amount, transaction.timestamp], 
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

const getTransactions = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM transactions ORDER BY "timestamp"', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const getWalletByPublicKey = (publicKey) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM wallets WHERE publicKey = ?', [publicKey], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

const getWalletByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM wallets WHERE username = ?', [username], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

const getWalletBalanceByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT balance FROM wallets WHERE username = ?', [username], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row ? row.balance : 0);
    });
  });
};

const addOrder = (order) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO orders (type, item, amount, price) VALUES (?, ?, ?, ?)', 
      [order.type, order.item, order.amount, order.price], 
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

const getAllOrders = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const updateMarketPrice = (price) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE market SET price = ? WHERE id = 1', [price], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const getMarketPrice = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT price FROM market WHERE id = 1', (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row ? row.price : null);
    });
  });
};

const addTransactionToMempool = (transaction) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO mempool (senderPublicKey, receiverPublicKey, amount, fee, signature, data) VALUES (?, ?, ?, ?, ?, ?)', 
      [transaction.senderPublicKey, transaction.receiverPublicKey, transaction.amount, transaction.fee, transaction.signature, transaction.data], 
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

const getMempoolTransactions = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM mempool ORDER BY fee DESC LIMIT 10', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const clearMempool = () => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM mempool', (err) => {
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
  all,
  addTransaction,
  getTransactions,
  getWalletByPublicKey,
  getWalletByUsername,
  getWalletBalanceByUsername,
  addOrder,
  getAllOrders,
  updateMarketPrice,
  getMarketPrice,
  addTransactionToMempool,
  getMempoolTransactions,
  clearMempool,
};
