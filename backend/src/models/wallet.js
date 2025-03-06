const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  // Create the UTXO table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS utxos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      publicKey TEXT,
      amount REAL,
      transactionId TEXT,
      outputIndex INTEGER
    )
  `);
});

const getUTXOs = (publicKey) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM utxos WHERE publicKey = ?', [publicKey], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const addUTXO = (publicKey, amount, transactionId, outputIndex) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO utxos (publicKey, amount, transactionId, outputIndex) VALUES (?, ?, ?, ?)', 
      [publicKey, amount, transactionId, outputIndex], 
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

const removeUTXO = (transactionId, outputIndex) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM utxos WHERE transactionId = ? AND outputIndex = ?', 
      [transactionId, outputIndex], 
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
};

class Wallet {
  constructor(publicKey) {
    this.publicKey = publicKey;
  }

  // Generate a new wallet
  static generate() {
    const keyPair = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    return new Wallet(keyPair.publicKey);
  }

  // Get the balance of the wallet
  async getBalance() {
    const utxos = await getUTXOs(this.publicKey);
    return utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
  }

  // Create a transaction
  async createTransaction(receiverPublicKey, amount, fee) {
    const utxos = await getUTXOs(this.publicKey);
    const balance = utxos.reduce((sum, utxo) => sum + utxo.amount, 0);

    if (balance < amount + fee) {
      throw new Error('Insufficient balance');
    }

    const inputs = [];
    let inputAmount = 0;

    for (const utxo of utxos) {
      inputs.push(utxo);
      inputAmount += utxo.amount;
      if (inputAmount >= amount + fee) {
        break;
      }
    }

    const outputs = [
      { publicKey: receiverPublicKey, amount },
      { publicKey: this.publicKey, amount: inputAmount - amount - fee }, // Change output
    ];

    const transaction = {
      inputs,
      outputs,
      timestamp: Date.now(),
    };

    // Sign the transaction
    const sign = crypto.createSign('SHA256');
    sign.update(JSON.stringify(transaction)).end();
    const signature = sign.sign(this.privateKey);

    transaction.signature = signature;

    return transaction;
  }
}

module.exports = Wallet;
